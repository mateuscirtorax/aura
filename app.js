/* ============================================================
   CLÍNICA AURA — interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initReveal();
  initActiveNav();
  initAboutCarousel();
  initTestimonialsCarousel();
  initFAQ();
  initDoctorModals();
  initCurrentYear();
});

/* ---------- Header scroll state ---------- */
function initHeader() {
  const header = document.querySelector('.aura-header');
  if (!header) return;
  // Use IntersectionObserver on a sentinel near the top, not scroll events
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:24px;left:0;width:1px;height:1px;pointer-events:none;';
  document.body.prepend(sentinel);
  const io = new IntersectionObserver(([entry]) => {
    header.classList.toggle('scrolled', !entry.isIntersecting);
  }, { rootMargin: '0px' });
  io.observe(sentinel);
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggle || !drawer) return;
  toggle.addEventListener('click', () => {
    const open = drawer.getAttribute('aria-hidden') === 'false';
    drawer.setAttribute('aria-hidden', String(open));
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.querySelector('i').className = !open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    drawer.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('i').className = 'fa-solid fa-bars';
  }));
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !items.length) {
    items.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
}

/* ---------- Nav active state ---------- */
function initActiveNav() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-main a[href^="#"]');
  if (!sections.length || !navLinks.length) return;
  const map = new Map();
  navLinks.forEach(a => map.set(a.getAttribute('href').slice(1), a));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const id = e.target.id;
      const link = map.get(id);
      if (!link) return;
      if (e.isIntersecting) {
        navLinks.forEach(a => a.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'true');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => io.observe(s));
}

/* ---------- About carousel ---------- */
function initAboutCarousel() {
  const root = document.querySelector('.about-carousel');
  if (!root) return;
  const slides = root.querySelectorAll('.slide');
  const dots = root.querySelectorAll('.dots button');
  const prev = root.querySelector('.nav-btn.prev');
  const next = root.querySelector('.nav-btn.next');
  let i = 0, timer;
  const go = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    dots.forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
  };
  const start = () => { stop(); timer = setInterval(() => go(i + 1), 4500); };
  const stop  = () => timer && clearInterval(timer);
  prev?.addEventListener('click', () => { go(i - 1); start(); });
  next?.addEventListener('click', () => { go(i + 1); start(); });
  dots.forEach((d, k) => d.addEventListener('click', () => { go(k); start(); }));

  // Touch swipe
  let startX = 0;
  root.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stop(); }, { passive: true });
  root.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
    start();
  });

  go(0);
  start();
}

/* ---------- Testimonials carousel ---------- */
function initTestimonialsCarousel() {
  const root = document.querySelector('.testi-wrap');
  if (!root) return;
  const track = root.querySelector('.testi-track');
  const cards = track.querySelectorAll('.testi-card');
  const prev = document.querySelector('.testi-controls .prev');
  const next = document.querySelector('.testi-controls .next');
  const dotsWrap = document.querySelector('.testi-controls .dots');

  let i = 0;
  let perView = perViewCount();
  function perViewCount() {
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 720) return 2;
    return 1;
  }
  function maxIndex() { return Math.max(0, cards.length - perView); }
  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const count = maxIndex() + 1;
    for (let k = 0; k < count; k++) {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Página ${k + 1}`);
      b.addEventListener('click', () => { i = k; render(); });
      dotsWrap.appendChild(b);
    }
  }
  function render() {
    i = Math.min(Math.max(i, 0), maxIndex());
    const cardW = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    track.style.transform = `translateX(${-i * (cardW + gap)}px)`;
    dotsWrap?.querySelectorAll('button').forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
  }
  prev?.addEventListener('click', () => { i--; render(); });
  next?.addEventListener('click', () => { i++; render(); });
  window.addEventListener('resize', () => {
    const np = perViewCount();
    if (np !== perView) { perView = np; buildDots(); }
    render();
  });

  // Touch swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (dx < -40) { i++; render(); }
    else if (dx > 40) { i--; render(); }
  });

  buildDots();
  render();
}

/* ---------- FAQ accordion ---------- */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-q');
    const ans = item.querySelector('.faq-a');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(other => {
        other.classList.remove('open');
        const a = other.querySelector('.faq-a');
        a.style.maxHeight = '0px';
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        ans.style.maxHeight = ans.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ---------- Doctor modals ---------- */
function initDoctorModals() {
  const triggers = document.querySelectorAll('[data-modal-open]');
  const modal = document.getElementById('doctor-modal');
  const backdrop = document.getElementById('doctor-modal-backdrop');
  if (!modal) return;
  const closes = modal.querySelectorAll('[data-modal-close]');

  let lastFocus = null;

  function openModal(slug) {
    const data = window.AURA_DOCTORS?.[slug];
    if (!data) return;
    fillModal(data);
    lastFocus = document.activeElement;
    modal.classList.add('open');
    backdrop.classList.add('open');
    document.body.classList.add('modal-open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => modal.querySelector('.modal-close')?.focus(), 50);
    document.addEventListener('keydown', escClose);
    modal.addEventListener('keydown', trapFocus);
  }
  function close() {
    modal.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.classList.remove('modal-open');
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', escClose);
    modal.removeEventListener('keydown', trapFocus);
    lastFocus?.focus();
  }
  function escClose(e) { if (e.key === 'Escape') close(); }
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function fillModal(d) {
    modal.querySelector('[data-fill="specialty"]').textContent = d.specialty;
    modal.querySelector('[data-fill="name"]').textContent = d.fullName;
    modal.querySelector('[data-fill="name"]').id = `modal-${d.slug}-name`;
    modal.setAttribute('aria-labelledby', `modal-${d.slug}-name`);
    modal.querySelector('[data-fill="crm"]').textContent = d.crm;
    modal.querySelector('[data-fill="bio"]').textContent = d.bio;

    const bullets = modal.querySelector('[data-fill="bullets"]');
    bullets.innerHTML = '';
    if (d.bullets && d.bullets.length) {
      d.bullets.forEach(b => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fa-solid fa-check"></i><span>${b}</span>`;
        bullets.appendChild(li);
      });
      bullets.style.display = '';
    } else {
      bullets.style.display = 'none';
    }

    const wa = modal.querySelector('[data-fill="wa"]');
    wa.href = `https://wa.me/5575988297588?text=${encodeURIComponent(d.waMessage)}`;

    const insta = modal.querySelector('[data-fill="instagram"]');
    if (d.instagram) {
      insta.style.display = '';
      insta.href = d.instagram;
      insta.querySelector('span').textContent = d.instagramHandle || 'Instagram';
    } else {
      insta.style.display = 'none';
    }

    // photo (real or placeholder)
    const ph = modal.querySelector('.modal-photo');
    if (d.photo) {
      ph.innerHTML = `<img src="${d.photo}" alt="${d.fullName}" loading="lazy" decoding="async">`;
    } else {
      ph.innerHTML = `
        <div class="placeholder">
          <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path d="M50 6 C 42 18, 42 28, 50 38 C 58 28, 58 18, 50 6 Z" fill="currentColor" opacity=".75"/>
            <path d="M50 94 C 42 82, 42 72, 50 62 C 58 72, 58 82, 50 94 Z" fill="currentColor" opacity=".75"/>
            <path d="M50 50 C 30 32, 6 38, 6 50 C 6 62, 30 68, 50 50 Z" fill="currentColor" opacity=".7"/>
            <path d="M50 50 C 70 32, 94 38, 94 50 C 94 62, 70 68, 50 50 Z" fill="currentColor" opacity=".7"/>
          </svg>
          <span>${d.fullName.toUpperCase()} — FOTO</span>
        </div>
      `;
    }
  }

  triggers.forEach(t => t.addEventListener('click', e => {
    e.preventDefault();
    openModal(t.dataset.modalOpen);
  }));
  closes.forEach(c => c.addEventListener('click', close));
  backdrop?.addEventListener('click', close);
}

/* ---------- Year ---------- */
function initCurrentYear() {
  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
}
