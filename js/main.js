// ===== PAGE LOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.querySelector('.page-loader');
    if (loader) loader.classList.add('hidden');
  }, 1600);
});

// ===== NAVBAR =====
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

window.addEventListener('scroll', () => {
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
  const backTop = document.querySelector('.back-top');
  if (backTop) backTop.classList.toggle('show', window.scrollY > 400);
});

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (mobileMenu.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform=''; s.style.opacity=''; });
    }
  });
}

// Set active nav link
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === page);
  });
}
setActiveNav();

// ===== BACK TO TOP =====
const backTop = document.querySelector('.back-top');
if (backTop) {
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ===== TOAST =====
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== SLIDER =====
function initSlider(sliderEl) {
  if (!sliderEl) return;
  const track = sliderEl.querySelector('.slider-track');
  const dots = sliderEl.querySelectorAll('.dot');
  let current = 0;
  let autoInterval;
  const originalHTML = track.innerHTML;
  let mobileMode = false;
  let cards = [];
  let cardWidth = 0;

  function goToDesktop(idx) {
    const slides = sliderEl.querySelectorAll('.slide');
    current = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goToMobile(idx) {
    if (!cards.length) return;
    current = (idx + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    // map current card to slide index for dots
    const activeSlideIndex = Math.floor(current / 3) % Math.max(1, Math.ceil(cards.length / 3));
    dots.forEach((d, i) => d.classList.toggle('active', i === activeSlideIndex));
  }

  function enableMobileMode() {
    if (mobileMode) return;
    mobileMode = true;
    // collect all product cards across slides
    cards = Array.from(sliderEl.querySelectorAll('.product-card'));
    // flatten into track
    track.innerHTML = '';
    track.style.display = 'flex';
    track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    cards.forEach(c => {
      const clone = c.cloneNode(true);
      clone.style.boxSizing = 'border-box';
      track.appendChild(clone);
    });
    // compute pixel width for one visible card (66.666% of slider width)
    cardWidth = Math.round(sliderEl.clientWidth * 0.6666667);
    Array.from(track.children).forEach(ch => { ch.style.flex = `0 0 ${cardWidth}px`; ch.style.maxWidth = `${cardWidth}px`; });
    current = 0;
    goToMobile(0);
  }

  function disableMobileMode() {
    if (!mobileMode) return;
    mobileMode = false;
    track.style.display = '';
    track.innerHTML = originalHTML;
    current = Math.floor(current / 3) % Math.max(1, Math.ceil(sliderEl.querySelectorAll('.slide').length));
    goToDesktop(current);
  }

  function goTo(idx) {
    if (mobileMode) goToMobile(idx);
    else goToDesktop(idx);
  }

  sliderEl.querySelector('.prev-btn')?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  sliderEl.querySelector('.next-btn')?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetAuto(); }));

  function resetAuto() { clearInterval(autoInterval); autoInterval = setInterval(() => goTo(current + 1), 4000); }

  function handleResize() {
    const shouldMobile = window.innerWidth <= 600;
    if (shouldMobile && !mobileMode) enableMobileMode();
    else if (!shouldMobile && mobileMode) disableMobileMode();
    if (mobileMode) {
      cardWidth = Math.round(sliderEl.clientWidth * 0.6666667);
      Array.from(track.children).forEach(ch => { ch.style.flex = `0 0 ${cardWidth}px`; ch.style.maxWidth = `${cardWidth}px`; });
      goToMobile(current);
    }
  }

  window.addEventListener('resize', handleResize);
  handleResize();
  resetAuto();
}
document.querySelectorAll('.featured-slider').forEach(initSlider);

// ===== TESTIMONIALS SLIDER =====
function initTestimonialsSlider() {
  const sliderEl = document.querySelector('.testimonials-slider');
  if (!sliderEl) return;
  const track = sliderEl.querySelector('.slider-track');
  const slides = sliderEl.querySelectorAll('.slide');
  const dots = sliderEl.querySelectorAll('.dot');
  let current = 0;
  let autoInterval;

  function goTo(idx) {
    const total = slides.length;
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  sliderEl.querySelector('.prev-btn')?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  sliderEl.querySelector('.next-btn')?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetAuto(); }));

  function resetAuto() { clearInterval(autoInterval); autoInterval = setInterval(() => goTo(current + 1), 4500); }
  resetAuto();

  // allow adding new testimonial on the fly
  const form = document.getElementById('reviewForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const message = form.message.value.trim();
      const rating = form.querySelector('.stars-input .star.active') ? form.querySelectorAll('.stars-input .star.active').length : 5;
      if (!name || !message) { showToast('Please enter name and review.'); return; }
      // create new slide
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.innerHTML = `<div class="testimonial-card"><div class="stars">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div><p>"${escapeHtml(message)}"</p><div class="reviewer"><div class="reviewer-avatar">${escapeHtml(name.split(' ').map(n=>n[0]||'').slice(0,2).join('').toUpperCase())}</div><div><div class="reviewer-name">${escapeHtml(name)}</div></div></div></div>`;
      track.appendChild(slide);
      // add dot
      const dot = document.createElement('span'); dot.className = 'dot';
      sliderEl.querySelector('.slider-dots')?.appendChild(dot);
      // refresh slides NodeList
      const newSlides = sliderEl.querySelectorAll('.slide');
      // go to newly added slide
      goTo(newSlides.length - 1);
      form.reset();
      // reset star visuals
      form.querySelectorAll('.stars-input .star').forEach(s => s.classList.remove('active'));
      showToast('Thank you for your review!');
      resetAuto();
    });
  }
  // star rating buttons
  document.querySelectorAll('.stars-input .star').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.dataset.value, 10);
      const stars = btn.parentElement.querySelectorAll('.star');
      stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value,10) <= val));
    });
  });
}

function escapeHtml(unsafe) { return unsafe.replace(/[&<"'`=\/]/g, function(s) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','=':'&#x3D;','`':'&#x60;'})[s]; }); }

initTestimonialsSlider();

// ===== FILTER TABS =====
function initFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('[data-category]');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      items.forEach(item => {
        const show = cat === 'all' || item.dataset.category === cat;
        item.style.display = show ? '' : 'none';
        if (show) { item.style.animation = 'fadeIn 0.4s ease'; }
      });
    });
  });
}
initFilter();

// ===== FAQ =====
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const ans = item.querySelector('.faq-a');
    const isOpen = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('active');
      i.querySelector('.faq-a').classList.remove('open');
    });
    if (!isOpen) { item.classList.add('active'); ans.classList.add('open'); }
  });
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type=submit]');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.disabled = false;
      contactForm.reset();
      showToast('✅ Message sent! We will contact you soon.');
    }, 1800);
  });
}

// ===== INQUIRY BUTTONS =====
document.querySelectorAll('.btn-inquiry').forEach(btn => {
  btn.addEventListener('click', () => {
    const product = btn.closest('.product-card')?.querySelector('h3')?.textContent || 'product';
    window.location.href = `contact.html?service=${encodeURIComponent(product)}`;
  });
});

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target || el.textContent);
    const suffix = el.textContent.replace(/[0-9]/g, '');
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { el.textContent = target + suffix; clearInterval(timer); }
      else el.textContent = Math.floor(start) + suffix;
    }, 25);
  });
}
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounters(); statsObserver.disconnect(); } });
}, { threshold: 0.5 });
const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);

// ===== SMOOTH PAGE TRANSITIONS =====
document.querySelectorAll('a[href$=".html"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#')) {
      e.preventDefault();
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.3s ease';
      setTimeout(() => { window.location.href = href; }, 300);
    }
  });
});
document.body.style.opacity = '0';
requestAnimationFrame(() => {
  document.body.style.transition = 'opacity 0.4s ease';
  document.body.style.opacity = '1';
});
