// ── Navigation scroll effect ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Scroll reveal ──
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => observer.observe(el));

// ── Mobile menu ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
});
mobileClose.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Dropdown menu ──
const dropdownItems = document.querySelectorAll('.nav-dropdown');
dropdownItems.forEach(item => {
  const trigger = item.querySelector('.nav-dropdown-trigger');
  if (!trigger) return;

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = item.classList.contains('open');
    // close all dropdowns first
    dropdownItems.forEach(d => d.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-dropdown')) {
    dropdownItems.forEach(d => d.classList.remove('open'));
  }
});

// close dropdown when a link inside it is clicked
document.querySelectorAll('.nav-dropdown-menu a').forEach(link => {
  link.addEventListener('click', () => {
    dropdownItems.forEach(d => d.classList.remove('open'));
  });
});

// ── Smooth parallax on hero bg ──
const heroBg = document.querySelector('.hero-bg');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y < window.innerHeight && heroBg) {
    heroBg.style.transform = `scale(1.0) translateY(${y * 0.25}px)`;
  }
}, { passive: true });

// ── Counter animation ──
function animateCount(el, target, suffix = '') {
  let start = 0;
  const duration = 1800;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const nums = e.target.querySelectorAll('.stat-number');
      nums.forEach(n => {
        const txt = n.textContent;
        if (txt.includes('+')) animateCount(n, parseInt(txt), '+');
        else if (txt.includes('th')) animateCount(n, parseInt(txt), 'th');
      });
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
const statsEl = document.querySelector('.intro-stats');
if (statsEl) statObserver.observe(statsEl);
