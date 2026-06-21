/* ========================================================
   V-Premix Tea — Shop & Cart & Checkout JS
   ======================================================== */

const PRODUCTS = {
  masala: { name: 'Masala Tea Premix', icon: 'fa-pepper-hot', sizes: { '500g': 1, '1kg': 450, '5kg': 2000, '25kg': 9500 } },
  ginger: { name: 'Ginger Tea Premix', icon: 'fa-seedling', sizes: { '500g': 240, '1kg': 430, '5kg': 1900, '25kg': 9000 } },
  elaichi: { name: 'Elaichi Tea Premix', icon: 'fa-leaf', sizes: { '500g': 260, '1kg': 470, '5kg': 2100, '25kg': 9800 } },
  green: { name: 'Green Tea Premix', icon: 'fa-spa', sizes: { '500g': 280, '1kg': 490, '5kg': 2200, '25kg': 10200 } },
  lemon: { name: 'Lemon Tea Premix', icon: 'fa-lemon', sizes: { '500g': 235, '1kg': 425, '5kg': 1850, '25kg': 8800 } },
  sampler: { name: 'All 5 Variants Pack', icon: 'fa-gift', sizes: { '5×500g': 1199, '5×1kg': 2099 } },
};

/* ===== SELECTED SIZES & QTY STATE ===== */
const selectedSizes = {
  masala: '500g', ginger: '500g', elaichi: '500g', green: '500g', lemon: '500g', sampler: '5×500g'
};
const selectedQtys = {
  masala: 1, ginger: 1, elaichi: 1, green: 1, lemon: 1, sampler: 1
};

const UPI_ID = "vt2357044-1@okaxis";
const UPI_NAME = "V-Premix Tea";

let currentDeliveryCharge = 0;

function calculateDelivery(pincode) {

  const ranges = {

    "395001": 50,     // Surat
    "400001": 80,     // Mumbai
    "380001": 100,    // Ahmedabad
    "110001": 150,    // Delhi
    "560001": 180,    // Bangalore
    "600001": 220,    // Chennai
    "700001": 250,    // Kolkata

  };

  currentDeliveryCharge = ranges[pincode] || 299;

}

function selectSize(btn, product) {
  // Update active button
  const container = document.getElementById('size-' + product);
  if (!container) return;
  container.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Get price
  const price = parseInt(btn.getAttribute('data-price'));
  selectedSizes[product] = btn.childNodes[0].textContent.trim();

  // Update displayed price
  const priceEl = document.getElementById('price-' + product);
  if (priceEl) priceEl.textContent = '₹' + price.toLocaleString('en-IN');

  // Update MRP (approx 18% higher)
  const mrpEl = document.getElementById('mrp-' + product);
  if (mrpEl) mrpEl.textContent = '₹' + Math.round(price * 1.18).toLocaleString('en-IN');
}

function changeQty(product, delta) {
  const el = document.getElementById('qty-' + product);
  if (!el) return;
  let qty = parseInt(el.textContent) + delta;
  if (qty < 1) qty = 1;
  if (qty > 99) qty = 99;
  el.textContent = qty;
  selectedQtys[product] = qty;
}

/* ===== CART ===== */
function getCart() {
  try { return JSON.parse(localStorage.getItem('vpremix-cart') || '[]'); } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem('vpremix-cart', JSON.stringify(cart));
}
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}
function getCartSubtotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge, #cartBadge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
  // Sticky cart bar
  const bar = document.getElementById('stickyCartBar');
  if (bar) {
    if (count > 0) {
      bar.style.display = 'flex';
      const sub = getCartSubtotal();
      const total = Math.round(sub * 1.05) + (sub < 1000 ? 99 : 0);
      document.getElementById('stickyCartText').textContent = count + (count === 1 ? ' item' : ' items') + ' in cart';
      document.getElementById('stickyCartTotal').textContent = '₹' + total.toLocaleString('en-IN');
    } else {
      bar.style.display = 'none';
    }
  }
}

function addToCart(product, btn) {
  const prod = PRODUCTS[product];
  if (!prod) return;

  const sizeName = selectedSizes[product];
  const qty = selectedQtys[product] || 1;
  const price = prod.sizes[sizeName];

  if (!price) {
    console.error('Price not found for', product, sizeName);
    return;
  }

  const cart = getCart();
  const key = product + '-' + sizeName;

  const existing = cart.find(i => i.id === key);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: key,
      product,
      name: prod.name,
      size: sizeName,
      price,
      qty,
      icon: prod.icon
    });
  }

  saveCart(cart);
  updateCartBadge();

  if (typeof renderCartDrawer === 'function') {
    renderCartDrawer();
  }

  if (typeof openCartDrawer === 'function') {
    openCartDrawer();
  }

  if (btn) {
    const original = btn.innerHTML;

    btn.innerHTML =
      '<i class="fas fa-check me-2"></i>Added!';

    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
    }, 1500);
  }
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  updateCartBadge();
  renderCartDrawer();

  // ✅ Always refresh checkout
  renderCheckout();
}


function updateCartItemQty(id, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart(cart);
    updateCartBadge();
    renderCartDrawer();

    // ✅ Always refresh checkout
    renderCheckout();
  }
}

/* ===== CART DRAWER ===== */
function openCartDrawer() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartDrawerOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCartDrawer() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartDrawerOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

function renderCartDrawer() {
  const cart = getCart();
  const itemsEl = document.getElementById('cartDrawerItems');
  const emptyEl = document.getElementById('cartEmptyState');
  const footerEl = document.querySelector('.cart-drawer-footer');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  if (footerEl) footerEl.style.display = 'block';

  const subtotal = getCartSubtotal();
  const pin =
    document.getElementById('billPin')?.value || '';

  let delivery = pin.length === 6
    ? calculateDeliveryByPincode(pin)
    : 0;

  if (subtotal >= 5000) {
    delivery = 0;
  }
  const total = subtotal + delivery;

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-icon"><i class="fas ${item.icon}"></i></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="text-muted" style="font-size:.75rem">${item.size}</div>
        <div class="d-flex align-items-center gap-2 mt-1">
          <button class="qty-mini" onclick="updateCartItemQty('${item.id}', ${item.qty - 1})">−</button>
          <span class="small fw-bold">${item.qty}</span>
          <button class="qty-mini" onclick="updateCartItemQty('${item.id}', ${item.qty + 1})">+</button>
          <button class="remove-item-btn" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>
      <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
    </div>
  `).join('');

  if (document.getElementById('cartDrawerSubtotal')) {
    document.getElementById('cartDrawerSubtotal').textContent = '₹' + subtotal.toLocaleString('en-IN');
    document.getElementById('cartDrawerDelivery').textContent = delivery === 0 ? 'FREE' : '₹' + delivery;
    document.getElementById('cartDrawerTotal').textContent = '₹' + total.toLocaleString('en-IN');
  }
}

/* ===== SHOP PAGE: Filter & Sort ===== */
function shopFilter(btn, cat) {
  document.querySelectorAll('.shop-filter').forEach(b => {
    b.classList.remove('btn-gold', 'active');
    b.classList.add('btn-outline-secondary');
  });
  btn.classList.add('btn-gold', 'active');
  btn.classList.remove('btn-outline-secondary');

  document.querySelectorAll('.shop-item').forEach(item => {
    const itemCat = item.getAttribute('data-cat');
    item.style.display = (cat === 'all' || itemCat === cat || itemCat === 'all') ? '' : 'none';
  });
}

function sortShop(val) {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;
  const items = Array.from(grid.querySelectorAll('.shop-item'));
  items.sort((a, b) => {
    const pa = parseInt(a.getAttribute('data-base-price'));
    const pb = parseInt(b.getAttribute('data-base-price'));
    if (val === 'price-asc') return pa - pb;
    if (val === 'price-desc') return pb - pa;
    return 0;
  });
  items.forEach(item => grid.appendChild(item));
}

/* ===== CHECKOUT PAGE ===== */
function renderCheckout() {
  const cart = getCart();
  const emptyEl = document.getElementById('emptyCartNotice');
  const formEl = document.getElementById('checkoutForm');

  if (!formEl) return;

  if (cart.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    formEl.style.display = 'none';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  formEl.style.display = 'block';

  const subtotal = getCartSubtotal();
  let discount = 0;

  const discountedSub = subtotal - discount;
  const pin = document.getElementById('billPin')?.value || '';

  let delivery = 0;

  if (pin.length === 6) {
    delivery = calculateDeliveryByPincode(pin);
  }
  const total = discountedSub + delivery;

  // Render items
  // Render items
  const orderEl = document.getElementById('orderItems');
  if (orderEl) {
    orderEl.innerHTML = cart.map(item => `
    <div class="order-item mb-3 pb-3 border-bottom">
      <div class="d-flex align-items-start gap-3">
        <div class="order-item-icon"><i class="fas ${item.icon}"></i></div>
        <div class="flex-grow-1">
          <div class="fw-semibold small" style="color:var(--primary)">${item.name}</div>
          <div class="text-muted" style="font-size:.75rem">${item.size}</div>
          
          <!-- ✅ Add/Remove buttons -->
          <div class="d-flex align-items-center gap-2 mt-1">
            <button class="qty-mini" onclick="updateCartItemQty('${item.id}', ${item.qty - 1})">−</button>
            <span class="small fw-bold">${item.qty}</span>
            <button class="qty-mini" onclick="updateCartItemQty('${item.id}', ${item.qty + 1})">+</button>
            <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div class="fw-bold small">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>
    </div>
  `).join('');
  }


  // Update price breakdown
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('summarySubtotal', '₹' + subtotal.toLocaleString('en-IN'));
  if (pin.length !== 6) {
    set('summaryDelivery', 'Enter PIN');
  } else {
    set('summaryDelivery', '₹' + delivery);
  }
  if (pin.length !== 6) {
    set('summaryTotal', 'Enter PIN Code');
  } else {
    set('summaryTotal', '₹' + total.toLocaleString('en-IN'));
  }

  const discRow = document.getElementById('discountRow');
  if (discRow) {
    discRow.style.display = discount > 0 ? 'flex' : 'none';
    set('summaryDiscount', '-₹' + discount.toLocaleString('en-IN'));
  }

  // COD availability
  const codStatus = document.getElementById('codStatus');
  if (codStatus) {
    if (total > 9999999999) {
      codStatus.innerHTML = '<i class="fas fa-times-circle text-danger me-2"></i><span class="small fw-semibold">COD not available for orders above ₹5,000. Please choose another payment method.</span>';
      codStatus.style.background = 'rgba(220,53,69,0.08)';
      codStatus.style.border = '1px solid rgba(220,53,69,0.2)';
    }
  }

  // Update UPI QR
  updateUpiQr(total);
}

function updateUpiQr(amount) {
  const qrImg = document.getElementById('upiQrImg');

  if (!qrImg) return;

  qrImg.src =
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
    encodeURIComponent(
      `upi://pay?pa=vt2357044-1@okaxis&pn=V-Premix Tea&am=${amount}&cu=INR`
    );
}

/* ===== PAYMENT METHOD ===== */
let currentPaymentMethod = 'upi';

function selectPaymentMethod(method, btn) {
  currentPaymentMethod = method;
  document.querySelectorAll('.pm-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.pm-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById('pm-' + method);
  if (panel) panel.style.display = 'block';

  // Update place order button label
  const orderBtn = document.getElementById('placeOrderBtn');
  if (orderBtn) {
    const labels = {
      upi: '<i class="fas fa-mobile-alt me-2"></i>Pay via UPI & Place Order',
      card: '<i class="fas fa-credit-card me-2"></i>Pay by Card & Place Order',
      netbanking: '<i class="fas fa-university me-2"></i>Pay via Net Banking & Place Order',
      bank: '<i class="fas fa-building-columns me-2"></i>Confirm Bank Transfer Order',
      cod: '<i class="fas fa-money-bill-wave me-2"></i>Place COD Order',
    };
    orderBtn.innerHTML = labels[method] || '<i class="fas fa-lock me-2"></i>Place Order Securely';
  }
}

/* ===== UPI ACTIONS ===== */
function copyUpiId() {
  const id = document.getElementById('upiIdText')?.textContent || 'vpremix@ybl';
  navigator.clipboard?.writeText(id).then(() => {
    showToast('UPI ID copied to clipboard!');
  }).catch(() => {
    const inp = document.createElement('input');
    inp.value = id;
    document.body.appendChild(inp);
    inp.select();
    document.execCommand('copy');
    inp.remove();
    showToast('UPI ID copied!');
  });
}

function openUpiApp(app) {
  const subtotal = getCartSubtotal();
  const delivery = subtotal >= 1000 ? 0 : 99;
  const total = subtotal + delivery;

  const upiId = 'vpremix@ybl';
  const name = 'V-Premix Tea';
  const note = 'Tea Premix Order';
  const upiBase = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${total}&cu=INR&tn=${encodeURIComponent(note)}`;

  const urls = {
    gpay: `gpay://upi/pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${total}&cu=INR`,
    phonepe: `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${total}&cu=INR`,
    paytm: `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${total}&cu=INR`,
    bhim: upiBase,
  };
  window.location.href = urls[app] || upiBase;
}

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(() => { });
  showToast(text + ' copied!');
}

/* ===== CARD FORMATTING ===== */
function formatCardNum(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = val.replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 4);
  if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
  input.value = val;
}

/* ===== PLACE ORDER ===== */
function placeOrder(paymentId = "") {
  const name = document.getElementById('billName')?.value.trim();
  const phone = document.getElementById('billPhone')?.value.trim();
  const email = document.getElementById('billEmail')?.value.trim();
  const address = document.getElementById('billAddress')?.value.trim();
  const city = document.getElementById('billCity')?.value.trim();
  const state = document.getElementById('billState')?.value;
  const pin = document.getElementById('billPin')?.value.trim();

  if (pin.length !== 6) {
    showToast('Please enter valid PIN code first', 'error');
    return;
  }

  if (!name || !phone || !email || !address || !city || !state || !pin) {
    showToast('Please fill in all required billing details.', 'error');
    document.querySelector('.checkout-section-card')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (phone.length !== 10) {
    showToast('Please enter a valid 10-digit phone number.', 'error');
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }
  if (pin.length !== 6) {
    showToast('Please enter a valid 6-digit PIN code.', 'error');
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  if (currentPaymentMethod === 'card') {
    const num = document.getElementById('cardNum')?.value.replace(/\s/g, '');
    const exp = document.getElementById('cardExp')?.value;
    const cvv = document.getElementById('cardCvv')?.value;
    const cname = document.getElementById('cardName')?.value.trim();
    if (num.length < 16 || !exp || cvv.length < 3 || !cname) {
      showToast('Please enter valid card details.', 'error');
      return;
    }
  }
  if (currentPaymentMethod === 'bank') {
    const ref = document.getElementById('neftRef')?.value.trim();
    if (!ref) {
      showToast('Please enter the bank transfer reference number.', 'error');
      return;
    }
  }

  // Show loading on button
  const btn = document.getElementById('placeOrderBtn');
  const origText = btn.innerHTML;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
  btn.disabled = true;

  // Send WhatsApp notification
  const itemsSummary = cart.map(i => `${i.name} (${i.size} x${i.qty})`).join(', ');
  const delivery =
    calculateDeliveryByPincode(pin);

  const total =
    getCartSubtotal() + delivery;

  // Simulate order processing
  setTimeout(() => {
    const orderId = '#VPT' + Math.floor(100000 + Math.random() * 900000);
    const orderData = new URLSearchParams();
    orderData.append("orderId", orderId);
    orderData.append("name", name);
    orderData.append("business", document.getElementById('billBusiness')?.value || "");
    orderData.append("phone", phone);
    orderData.append("email", email);
    orderData.append("address", address);
    orderData.append("city", city);
    orderData.append("state", state);
    orderData.append("pin", pin);
    orderData.append("items", itemsSummary);
    orderData.append("total", total);
    orderData.append("payment", currentPaymentMethod);
    orderData.append("paymentId", paymentId || "COD");
    orderData.append(
      "paymentStatus",
      currentPaymentMethod === "cod" ? "Pending" : "Paid"
    );

    fetch("https://script.google.com/macros/s/AKfycbzkMKe7Xjf8wgu78IP7JpWIp5RoXxvbBUPE0K85_9_o1e8ktHn1k8tlrRBKNU2K4XA4/exec", {
      method: "POST",
      body: orderData   // 👈 ab JSON nahi, form data bhejna hai
    })
      .then(res => res.text())
      .then(data => console.log("Saved to Sheet", data))
      .catch(err => console.error(err));

    document.getElementById('successOrderId').textContent = orderId;

    const waMsg = `Hello V-Premix Tea! 🎉 I just placed an order ${orderId}.\n\nItems: ${itemsSummary}\nTotal: ₹${total.toLocaleString('en-IN')}\nPayment: ${currentPaymentMethod.toUpperCase()}\nName: ${name}\nPhone: ${phone}\nAddress: ${address}, ${city}, ${state} - ${pin}`;
    const waLink = 'https://wa.me/916352369851?text=' + encodeURIComponent(waMsg);

    // Clear cart
    saveCart([]);
    updateCartBadge();
    renderCheckout();
    sessionStorage.removeItem('vpremix-promo');

    // Show success modal
    const modal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
    modal.show();

    // Restore button
    btn.innerHTML = origText;
    btn.disabled = false;

    // Auto-open WhatsApp after 2s
    setTimeout(() => { window.open(waLink, '_blank'); }, 2000);

  }, 2200);
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {

  updateCartBadge();
  renderCartDrawer();
  renderCheckout();
  validateCheckoutForm();

  const pinField = document.getElementById('billPin');

  if (pinField) {

    pinField.addEventListener('input', () => {

      if (pinField.value.length === 6) {

        // Delivery charge calculate
        calculateDelivery(pinField.value);

        // Update totals
        renderCheckout();
        validateCheckoutForm();

      }

    });

  }

  const cart = getCart();

  if (cart.length === 0) {
    updateUpiQr(0);
  }

  [
    "billName",
    "billPhone",
    "billEmail",
    "billAddress",
    "billCity",
    "billState",
    "billPin"
  ].forEach(id => {

    document.getElementById(id)?.addEventListener(
      "input",
      validateCheckoutForm
    );

    document.getElementById(id)?.addEventListener(
      "change",
      validateCheckoutForm
    );

  });
});

function calculateDeliveryByPincode(pin) {

  pin = parseInt(pin);

  // Gujarat
  if (pin >= 360000 && pin <= 399999)
    return 0;

  // Maharashtra + Rajasthan
  if (
    (pin >= 400000 && pin <= 499999) ||
    (pin >= 300000 && pin <= 349999)
  )
    return 150;

  // Delhi NCR + MP + UP
  if (
    (pin >= 110000 && pin <= 149999) ||
    (pin >= 450000 && pin <= 499999) ||
    (pin >= 200000 && pin <= 299999)
  )
    return 300;

  // South India
  if (
    (pin >= 500000 && pin <= 699999)
  )
    return 250;

  // East India
  if (
    (pin >= 700000 && pin <= 899999)
  )
    return 300;

  // North East / Remote
  return 400;
}

const estimate = document.getElementById('deliveryEstimate');
const pinInput = document.getElementById('billPin');

if (estimate && pinInput) {
  const pinVal = pinInput.value || '';

  if (pinVal.length === 6) {
    const delivery = calculateDeliveryByPincode(pinVal);
    estimate.innerHTML = `🚚 Delivery Charge: ₹${delivery}`;
  } else {
    estimate.innerHTML = 'Enter PIN code to calculate delivery';
  }
}

function payNow() {

  validateCheckoutForm();

  const btn =
    document.getElementById("placeOrderBtn");

  if (btn.disabled) {
    alert("Please fill all required details.");
    return;
  }

  const subtotal = getCartSubtotal();

  const pin = document.getElementById('billPin').value;

  let delivery = 0;

  if (pin.length === 6) {
    delivery = calculateDeliveryByPincode(pin);
  }

  const total = subtotal + delivery;

  const options = {
    key: "rzp_live_T0IqyXamz3BEMW",
    amount: total * 100,
    currency: "INR",
    name: "V-Premix Tea",
    description: "Tea Premix Order",

    handler: function (response) {
      console.log("Payment success:", response);
      placeOrder(response.razorpay_payment_id);
    }

  };

  const rzp = new Razorpay(options);
  rzp.open();
}

function validateCheckoutForm() {

  const placeOrderBtn =
    document.getElementById("placeOrderBtn");

  if (!placeOrderBtn) return;

  const name = document.getElementById("billName").value.trim();
  const phone = document.getElementById("billPhone").value.trim();
  const email = document.getElementById("billEmail").value.trim();
  const address = document.getElementById("billAddress").value.trim();
  const city = document.getElementById("billCity").value.trim();
  const state = document.getElementById("billState").value;
  const pin = document.getElementById("billPin").value.trim();

  const valid =
    name &&
    phone.length === 10 &&
    /^\S+@\S+\.\S+$/.test(email) &&
    address &&
    city &&
    state &&
    pin.length === 6;

  placeOrderBtn.disabled = !valid;
  const codBtn = document.getElementById("codBtn");
  if (codBtn) {
    codBtn.disabled = !valid;
  }
}

function placeCODOrder() {

  const ok = confirm(
    "Confirm Cash on Delivery Order?"
  );

  if (!ok) return;

  currentPaymentMethod = "COD";

  placeOrder("COD");
}

function openCancelModal() {
  document.getElementById("cancelModal").style.display = "flex";
}

function closeCancelModal() {
  document.getElementById("cancelModal").style.display = "none";
}

const cancelReason = document.getElementById("cancelReason");

if (cancelReason) {
  cancelReason.addEventListener("change", function () {

    const otherBox = document.getElementById("otherReason");

    if (this.value === "Other") {
      otherBox.style.display = "block";
    } else {
      otherBox.style.display = "none";
    }

  });
}