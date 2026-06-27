/* ========================================================
   V-Premix Tea — Main JavaScript
   Pure Vanilla JS + Bootstrap 5
   ======================================================== */

/* ======================== LOADING ======================== */
window.addEventListener("load", () => {

  const preloader = document.getElementById("preloader");

  setTimeout(() => {

    preloader.style.opacity = "0";
    preloader.style.transition = ".8s";
    preloader.style.visibility = "hidden";

    setTimeout(() => {

      preloader.remove();

    }, 800);

  }, 2500);

});

/* ======================== SCROLL PROGRESS BAR ======================== */
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
})();

/* ======================== ANNOUNCEMENT BAR ======================== */
function dismissAnnouncement() {
  const bar = document.getElementById('announcementBar');
  if (bar) {
    bar.classList.add('dismissing');
    setTimeout(() => {
      bar.remove();
      document.body.style.paddingTop = '0';
    }, 350);
    sessionStorage.setItem('vpremix-announcement-dismissed', '1');
  }
}

(function initAnnouncement() {
  document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('vpremix-announcement-dismissed')) {
      const bar = document.getElementById('announcementBar');
      if (bar) bar.remove();
    }
  });
})();

/* ======================== NAVBAR ======================== */
(function initNavbar() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 65);
    const btn = document.getElementById('backToTop');
    if (btn) btn.classList.toggle('visible', window.scrollY > 300);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Active link highlight
  const links = nav.querySelectorAll('.nav-link[href]');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
      link.style.color = 'var(--secondary)';
    }
  });

  // Auto-close mobile menu on nav link click
  document.addEventListener('DOMContentLoaded', () => {
    const navLinks = nav.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    const navCollapse = document.getElementById('navMenu');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navCollapse && navCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navCollapse);
          bsCollapse.hide();
        }
      });
    });
  });
})();

/* ======================== BACK TO TOP ======================== */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ======================== COUNTER ANIMATION ======================== */
function animateCounter(el) {
  const raw = el.getAttribute('data-count');
  const suffix = el.getAttribute('data-suffix') || '';
  const prefix = el.getAttribute('data-prefix') || '';
  const isText = isNaN(parseInt(raw));
  if (isText) { el.textContent = prefix + raw + suffix; return; }
  const target = parseInt(raw);
  const duration = 1800;
  const steps = 60;
  const stepTime = duration / steps;
  let current = 0;
  const increment = Math.ceil(target / steps);
  const timer = setInterval(() => {
    current = Math.min(current + increment, target);
    el.textContent = prefix + current.toLocaleString('en-IN') + suffix;
    if (current >= target) clearInterval(timer);
  }, stepTime);
}

(function initCounters() {
  const statsSection = document.getElementById('statsSection');
  if (!statsSection) return;
  const counters = statsSection.querySelectorAll('[data-count]');
  if (!counters.length) return;
  let animated = false;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !animated) {
      animated = true;
      counters.forEach(el => animateCounter(el));
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  obs.observe(statsSection);
})();

/* ======================== SCROLL REVEAL ======================== */
(function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => obs.observe(el));
})();

/* ======================== HERO TYPING ANIMATION ======================== */
(function initTyping() {
  const el = document.getElementById('heroTypingText');
  if (!el) return;
  const words = ['For Your Café', 'For Your Hotel', 'For Your Restaurant', 'For Your Office', 'For Your Business'];
  let wIdx = 0, cIdx = 0, deleting = false;

  function type() {
    const word = words[wIdx];
    if (!deleting) {
      el.textContent = word.substring(0, cIdx + 1);
      cIdx++;
      if (cIdx === word.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      el.textContent = word.substring(0, cIdx - 1);
      cIdx--;
      if (cIdx === 0) {
        deleting = false;
        wIdx = (wIdx + 1) % words.length;
      }
    }
    setTimeout(type, deleting ? 60 : 100);
  }
  setTimeout(type, 1200);
})();

/* ======================== TOAST ======================== */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.custom-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'custom-toast' + (type === 'error' ? ' toast-error' : '');
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(120%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

/* ======================== FORMS ======================== */
function handleContactForm(e) {
  e.preventDefault();
  showToast('Message sent! We will get back to you within 24 hours.');
  e.target.reset();
}
function handleInquiryForm(e) {
  e.preventDefault();
  showToast('Inquiry submitted! Our sales team will reach you with a quote.');
  e.target.reset();
}
function handleDealerForm(e) {
  e.preventDefault();
  showToast('Application submitted! Our partnership team will contact you within 48 hours.');
  e.target.reset();
}
function subscribeNewsletter(e) {
  e.preventDefault();

  window.open(
    'https://whatsapp.com/channel/0029Va4K0PZ5a245NkngBA2M',
    '_blank'
  );

  showToast('Thanks for subscribing!');
  e.target.reset();
}
function downloadBrochure() {
  const link = document.createElement("a");
  link.href = "assets/pdf/Packaging Sticker.pdf"; // PDF ka path
  link.download = "Packaging Sticker.pdf"; // Download hone wali file ka naam
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ======================== FAQ SEARCH ======================== */
function filterFAQ(query) {
  const q = query.trim().toLowerCase();
  document.querySelectorAll('.faq-item').forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = q === '' || text.includes(q) ? '' : 'none';
  });
}

/* ======================== PRODUCT SEARCH ======================== */
function filterProducts(query) {
  const q = query.trim().toLowerCase();
  document.querySelectorAll('.product-card-wrap').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = q === '' || text.includes(q) ? '' : 'none';
  });
}

/* ======================== GALLERY FILTER ======================== */
function filterGallery(btn, category) {
  document.querySelectorAll('.gallery-filter-btn').forEach(b => {
    b.classList.remove('btn-gold');
    b.classList.add('btn-outline-secondary');
  });
  btn.classList.remove('btn-outline-secondary');
  btn.classList.add('btn-gold');
  document.querySelectorAll('.gallery-item-wrap').forEach(item => {
    const cat = item.getAttribute('data-cat');
    item.style.display = category === 'all' || cat === category ? '' : 'none';
  });
}

/* ======================== LIGHTBOX ======================== */
const galleryItems = document.querySelectorAll(".gallery-item-wrap");
let currentIndex = 0;

function openLightbox(index) {

  currentIndex = index;

  const item = galleryItems[index];

  const img = item.dataset.img;
  const title = item.dataset.title;

  document.querySelector(".lightbox-content").innerHTML = `
        <img src="${img}" alt="${title}"
        style="width:100%;height:100%;object-fit:contain;border-radius:15px;">
    `;

  document.querySelector(".lightbox-title").innerText = title;

  document.getElementById("lightbox").classList.add("active");

}

function closeLightbox(){

    document.getElementById("lightbox").classList.remove("active");

}

function lightboxNext(){

    currentIndex++;

    if(currentIndex >= galleryItems.length){

        currentIndex = 0;

    }

    openLightbox(currentIndex);

}

function lightboxPrev(){

    currentIndex--;

    if(currentIndex < 0){

        currentIndex = galleryItems.length - 1;

    }

    openLightbox(currentIndex);

}

/* ======================== TESTIMONIAL AUTO ======================== */
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('testimonialCarousel');
  if (carousel) {
    new bootstrap.Carousel(carousel, { interval: 4500, ride: 'carousel', wrap: true });
  }
});

/* ======================== WHATSAPP POPUP ======================== */
let waPopupOpen = false;

function toggleWaPopup() {
  const popup = document.getElementById('waPopup');
  if (!popup) return;
  waPopupOpen = !waPopupOpen;
  popup.classList.toggle('open', waPopupOpen);
  // Hide notification dot once opened
  const dot = document.querySelector('.wa-notif-dot');
  if (dot && waPopupOpen) dot.style.display = 'none';
}

function closeWaPopup() {
  const popup = document.getElementById('waPopup');
  if (popup && waPopupOpen) {
    waPopupOpen = false;
    popup.classList.remove('open');
  }
}

function waQuickMessage(msg) {
  const encoded = encodeURIComponent(msg);
  window.location.href = 'https://wa.me/916352369851?text=' + encoded;
}

function waSendCustom() {
  const inp = document.getElementById('waCustomInput');
  if (!inp) return;
  const msg = inp.value.trim();
  if (!msg) return;
  waQuickMessage(msg);
  inp.value = '';
}

document.addEventListener('DOMContentLoaded', () => {
  // Close popup when clicking outside
  document.addEventListener('click', (e) => {
    const popup = document.getElementById('waPopup');
    const floatBtn = document.getElementById('waFloatBtn');
    if (waPopupOpen && popup && !popup.contains(e.target) && floatBtn && !floatBtn.contains(e.target)) {
      closeWaPopup();
    }
  });

  // Enter key on WA input
  const inp = document.getElementById('waCustomInput');
  if (inp) {
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') waSendCustom();
    });
  }

  // Show notification dot after 3s (first time visitor)
  if (!sessionStorage.getItem('wa-popup-seen')) {
    setTimeout(() => {
      const dot = document.querySelector('.wa-notif-dot');
      if (dot) dot.style.display = 'block';
      sessionStorage.setItem('wa-popup-seen', '1');
    }, 3000);
  }
});

/* ======================== COOKIE BANNER ======================== */
function initCookieBanner() {
  if (localStorage.getItem('vpremix-cookie-consent')) return;
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    setTimeout(() => { banner.style.display = 'flex'; }, 1800);
  }
}
function acceptCookies() {
  localStorage.setItem('vpremix-cookie-consent', 'accepted');
  hideCookieBanner();
}
function declineCookies() {
  localStorage.setItem('vpremix-cookie-consent', 'declined');
  hideCookieBanner();
}
function hideCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    banner.style.transition = 'transform 0.35s ease, opacity 0.25s ease';
    banner.style.transform = 'translateY(100%)';
    banner.style.opacity = '0';
    setTimeout(() => banner.remove(), 400);
  }
}

/* ======================== PAGE TRANSITION ======================== */
document.addEventListener('DOMContentLoaded', () => {
  // Fade in page
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  // Smooth exit on internal link clicks
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || link.hasAttribute('target')) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 280);
    });
  });
});
