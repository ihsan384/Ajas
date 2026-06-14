/* ============================================================
   CINEMAPREMIS — script.js
   Premium Cinematic JavaScript
   ============================================================ */

'use strict';

/* ============================================================
   PAGE LOADER
   ============================================================ */
(function initLoader() {
  const loader = document.getElementById('page-loader');
  const body = document.body;
  const HIDE_DELAY = 2000;

  const hideLoader = () => {
    loader.classList.add('hidden');
    body.classList.remove('loading');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 700);
  };

  if (document.readyState === 'complete') {
    setTimeout(hideLoader, HIDE_DELAY);
  } else {
    window.addEventListener('load', () => {
      setTimeout(hideLoader, HIDE_DELAY);
    });
  }
})();


/* ============================================================
   FLOATING PARTICLES (Canvas)
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouseX = 0, mouseY = 0;

  const PARTICLE_COUNT = window.innerWidth < 768 ? 30 : 60;
  const PRIMARY = '#0047FF';
  const PRIMARY_DIM = 'rgba(0,71,255,';

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.opacityDelta = (Math.random() - 0.5) * 0.005;
      this.life = 0;
      this.maxLife = Math.random() * 400 + 200;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      this.opacity += this.opacityDelta;

      // Mouse repulsion
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        this.x += dx * force * 0.02;
        this.y += dy * force * 0.02;
      }

      if (this.opacity <= 0.05 || this.opacity >= 0.65) this.opacityDelta *= -1;
      if (this.x < 0 || this.x > W) this.speedX *= -1;
      if (this.y < 0 || this.y > H) this.speedY *= -1;
      if (this.life >= this.maxLife) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = PRIMARY;
      ctx.shadowBlur = 8;
      ctx.shadowColor = PRIMARY_DIM + '0.8)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.12;
          ctx.save();
          ctx.strokeStyle = PRIMARY_DIM + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    animate();
  }

  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  init();
})();

/* ============================================================
   NAVIGATION — Scroll & Mobile
   ============================================================ */
(function initNavigation() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenuLinks = document.querySelectorAll('[data-close-menu]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');
  const sections = document.querySelectorAll('section[id]');

  let menuOpen = false;

  // Scroll effect
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNav();
  };

  // Active nav detection
  const updateActiveNav = () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  };

  // Mobile menu toggle
  const toggleMenu = () => {
    menuOpen = !menuOpen;
    hamburger.classList.toggle('open', menuOpen);
    hamburger.setAttribute('aria-expanded', menuOpen);
    if (menuOpen) {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  const closeMenu = () => {
    if (!menuOpen) return;
    menuOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', toggleMenu);
  closeMenuLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
})();

/* ============================================================
   SCROLL REVEAL (Intersection Observer)
   ============================================================ */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();

/* ============================================================
   HERO PARALLAX & MOUSE TRACKING
   ============================================================ */
(function initHeroEffects() {
  const hero = document.getElementById('hero');
  const heroContent = hero ? hero.querySelector('.hero-content') : null;
  const heroLight1 = hero ? hero.querySelector('.hero-light-1') : null;
  const heroLight2 = hero ? hero.querySelector('.hero-light-2') : null;
  if (!heroContent) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  const handleMouseMove = (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetX = (e.clientX - cx) / cx;
    targetY = (e.clientY - cy) / cy;
  };

  const animateParallax = () => {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    heroContent.style.transform = `translate(${currentX * 8}px, ${currentY * 6}px)`;
    if (heroLight1) heroLight1.style.transform = `translate(${currentX * 20}px, ${currentY * 15}px)`;
    if (heroLight2) heroLight2.style.transform = `translate(${currentX * -15}px, ${currentY * -10}px)`;
    requestAnimationFrame(animateParallax);
  };

  // Scroll parallax
  const handleScrollParallax = () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.7));
      heroContent.style.transform = `translateY(${scrolled * 0.25}px)`;
    }
  };

  document.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('scroll', handleScrollParallax, { passive: true });
  animateParallax();
})();

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
(function initMagneticButtons() {
  const magnetics = document.querySelectorAll('.magnetic');

  magnetics.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.35;
      const dy = (e.clientY - cy) * 0.35;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
})();

/* ============================================================
   COUNTER ANIMATION (Stats Section)
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const DURATION = 2000;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = easeOutCubic(progress);
      const value = Math.round(eased * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
})();

/* ============================================================
   INSTAGRAM MODAL
   ============================================================ */
(function initInstagramModal() {
  const modal = document.getElementById('insta-modal');
  const modalInner = document.getElementById('modal-inner');
  const modalTitle = document.getElementById('modal-title');
  const closeBtn = document.getElementById('modal-close-btn');
  const instaItems = document.querySelectorAll('.insta-item');
  if (!modal) return;

  const openModal = (content, title) => {
    modalInner.innerHTML = `<span style="font-size: 4rem;">${content}</span>`;
    if (modalTitle) modalTitle.textContent = title;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.setAttribute('aria-hidden', 'false');
    closeBtn && closeBtn.focus();
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    modal.setAttribute('aria-hidden', 'true');
  };

  instaItems.forEach(item => {
    const handleOpen = () => {
      openModal(item.dataset.modalContent || '🎬', item.dataset.modalTitle || 'Post');
    };
    item.addEventListener('click', handleOpen);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
    });
  });

  closeBtn && closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
})();

/* ============================================================
   CONTACT FORM VALIDATION
   ============================================================ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit-btn');
  const formFields = document.getElementById('form-fields');
  const formSuccess = document.getElementById('form-success');
  if (!form) return;

  const fields = {
    name: {
      el: document.getElementById('contact-name'),
      error: document.getElementById('name-error'),
      validate: v => v.trim().length >= 2,
      msg: 'Please enter your full name (at least 2 characters).'
    },
    email: {
      el: document.getElementById('contact-email'),
      error: document.getElementById('email-error'),
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      msg: 'Please enter a valid email address.'
    },
    phone: {
      el: document.getElementById('contact-phone'),
      error: document.getElementById('phone-error'),
      validate: v => v.trim().length >= 6,
      msg: 'Please enter a valid phone number.'
    },
    project: {
      el: document.getElementById('contact-project'),
      error: document.getElementById('project-error'),
      validate: v => v !== '' && v !== null,
      msg: 'Please select a project type.'
    },
    budget: {
      el: document.getElementById('contact-budget'),
      error: document.getElementById('budget-error'),
      validate: v => v !== '' && v !== null,
      msg: 'Please select a budget range.'
    },
    message: {
      el: document.getElementById('contact-message'),
      error: document.getElementById('message-error'),
      validate: v => v.trim().length >= 10,
      msg: 'Please enter a message (at least 10 characters).'
    }
  };

  const setError = (field, show) => {
    if (!field.el || !field.error) return;
    field.el.classList.toggle('error', show);
    field.error.classList.toggle('show', show);
    if (show && field.msg) field.error.textContent = field.msg;
  };

  const validateField = (key) => {
    const field = fields[key];
    if (!field.el) return true;
    const value = field.el.value;
    const isValid = field.validate(value);
    setError(field, !isValid);
    return isValid;
  };

  // Live validation on blur
  Object.keys(fields).forEach(key => {
    const field = fields[key];
    if (!field.el) return;
    field.el.addEventListener('blur', () => validateField(key));
    field.el.addEventListener('input', () => {
      if (field.el.classList.contains('error')) validateField(key);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let allValid = true;
    Object.keys(fields).forEach(key => {
      if (!validateField(key)) allValid = false;
    });

    if (!allValid) return;

    // Show loading state
    submitBtn.classList.add('loading');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Show success
    submitBtn.classList.remove('loading');
    formFields.style.display = 'none';
    formSuccess.classList.add('show');
    formSuccess.style.display = 'flex';
  });
})();

/* ============================================================
   BACK TO TOP BUTTON
   ============================================================ */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   CARD HOVER EFFECTS (3D Tilt)
   ============================================================ */
(function initCardEffects() {
  const cards = document.querySelectorAll('.about-pillar, .why-feature, .case-study-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * 3;
      const rotateY = ((x - cx) / cx) * -3;
      card.style.transform = `translateY(-6px) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ============================================================
   CAMPAIGN CARD TILT
   ============================================================ */
(function initCampaignTilt() {
  const cards = document.querySelectorAll('.campaign-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * 5;
      const rotateY = ((x - cx) / cx) * -5;
      card.style.transform = `translateY(-8px) scale(1.02) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ============================================================
   LAZY LOAD — Insta Items Fade-In
   ============================================================ */
(function initLazyLoad() {
  const items = document.querySelectorAll('.insta-item');
  if (!items.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'scale(1)';
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'scale(0.95)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(item);
  });
})();

/* ============================================================
   SECTION VISIBILITY GLOW
   ============================================================ */
(function initSectionGlow() {
  const sections = document.querySelectorAll('section');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.setProperty('--section-opacity', '1');
      } else {
        entry.target.style.setProperty('--section-opacity', '0');
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(s => observer.observe(s));
})();

/* ============================================================
   CINEMATIC SCAN LINE (decorative, hero only)
   ============================================================ */
(function initScanLine() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const scanLine = document.createElement('div');
  scanLine.style.cssText = `
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0,71,255,0.4), transparent);
    pointer-events: none;
    z-index: 3;
    animation: heroScan 6s linear infinite;
  `;
  hero.appendChild(scanLine);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes heroScan {
      0% { top: -2px; opacity: 0; }
      5% { opacity: 1; }
      95% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

/* ============================================================
   CAMPAIGN IMAGES FADE-IN
   ============================================================ */
(function initCampaignImages() {
  const images = document.querySelectorAll('.campaign-img');
  images.forEach(img => {
    img.addEventListener('load', () => {
      img.classList.add('loaded');
    });
    // Fallback if image was cached/already loaded before script executed
    if (img.complete) {
      img.classList.add('loaded');
    }
  });
})();

/* ============================================================
   INIT LOG
   ============================================================ */
console.log(
  '%cCINEMAPREMIS\n%cMovie Promotion & PR Agency\n%c✦ Powered by Cinemapremis',
  'font-family: monospace; font-size: 22px; font-weight: bold; color: #0047FF;',
  'font-family: monospace; font-size: 12px; color: #60a5fa;',
  'font-family: monospace; font-size: 10px; color: #555;'
);
