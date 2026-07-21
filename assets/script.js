// ---------- NAV SCROLL STATE ----------
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ---------- MOBILE NAV TOGGLE ----------
const navToggle = document.getElementById('navToggle');
const navLinksMobile = document.getElementById('navLinks');
if (navToggle && navLinksMobile) {
  navToggle.addEventListener('click', () => {
    navLinksMobile.classList.toggle('open');
    navToggle.classList.toggle('active');
  });
}

// ---------- SCROLL REVEAL (site-wide) ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---------- HERO LOAD-IN SEQUENCE (staggers .reveal inside .hero on page load) ----------
window.addEventListener('DOMContentLoaded', () => {
  const heroEls = document.querySelectorAll('.hero .reveal, .page-hero .reveal, .founder-hero .reveal');
  heroEls.forEach((el, i) => {
    revealObserver.unobserve(el);
    setTimeout(() => {
      el.style.transition = 'opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1)';
      el.classList.add('in');
    }, 150 + i * 120);
  });
});

// ---------- FLOATING PARTICLES (call on any container id) ----------
function initParticles(containerId, count = 16) {
  const stage = document.getElementById(containerId);
  if (!stage) return;
  const colors = ['var(--brass-bright)', 'var(--signal)', 'var(--porcelain)'];
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'float-dot';
    const size = 2 + Math.random() * 4;
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    dot.style.left = (Math.random() * 100) + '%';
    dot.style.bottom = (Math.random() * 40) + 'px';
    dot.style.background = colors[Math.floor(Math.random() * colors.length)];
    dot.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
    dot.style.animationDuration = (7 + Math.random() * 8) + 's';
    dot.style.animationDelay = (Math.random() * 10) + 's';
    stage.appendChild(dot);
  }
}

// ---------- INFINITE MARQUEE (call on any track id) ----------
function initMarquee(trackId, speed = 0.4) {
  const track = document.getElementById(trackId);
  if (!track) return;
  track.innerHTML += track.innerHTML;
  let pos = 0;
  let paused = false;
  track.addEventListener('mouseenter', () => paused = true);
  track.addEventListener('mouseleave', () => paused = false);
  function tick() {
    if (!paused) {
      pos -= speed;
      if (Math.abs(pos) >= track.scrollWidth / 2) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ---------- ANIMATED COUNTER (call on any element id with data-target) ----------
function initCounters(selector = '.counter') {
  const els = document.querySelectorAll(selector);
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const decimals = (el.dataset.target.split('.')[1] || '').length;
        const suffix = el.dataset.suffix || '';
        let cur = 0;
        const step = target / 40;
        function tick() {
          cur += step;
          if (cur >= target) { el.textContent = target.toFixed(decimals) + suffix; return; }
          el.textContent = cur.toFixed(decimals) + suffix;
          requestAnimationFrame(tick);
        }
        tick();
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  els.forEach(el => counterObserver.observe(el));
}
