/* =====================================================================
   SUPREME COMMERCE — RESPONSIVE BEHAVIOUR
   ---------------------------------------------------------------------
   Load AFTER script.js on every page:
     <script src="assets/script.js"></script>
     <script src="assets/responsive.js"></script>

   This file takes over the mobile nav from script.js (which only had a
   bare open/close toggle) and adds the behaviour a drawer needs:
   close on link tap, close on scrim tap, close on Escape, scroll lock,
   focus trap, and a CTA relocated into the drawer. It also adds swipe
   to the 3D carousel.
   ===================================================================== */

(function () {
  'use strict';

  var MOBILE_NAV_MAX = 980; // must match the breakpoint in responsive.css

  /* ------------------------------------------------------------------
     MOBILE NAV DRAWER
     ------------------------------------------------------------------ */

  var navLinks = document.getElementById('navLinks');
  var oldToggle = document.getElementById('navToggle');

  if (navLinks && oldToggle) {
    /* script.js already bound a click handler to #navToggle. If we just
       add a second one, both fire and the drawer opens then instantly
       closes. Cloning the node drops the original listener so this file
       is the single owner — no edit to script.js required. */
    var navToggle = oldToggle.cloneNode(true);
    oldToggle.parentNode.replaceChild(navToggle, oldToggle);

    navToggle.setAttribute('aria-label', 'Open menu');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-controls', 'navLinks');
    navToggle.setAttribute('type', 'button');

    /* Scrim: dims the page and gives a large tap-to-close area. */
    var scrim = document.createElement('div');
    scrim.className = 'nav-scrim';
    scrim.setAttribute('aria-hidden', 'true');
    document.body.appendChild(scrim);

    /* The "Start a project" button is hidden in the header below 600px
       (it couldn't share the row with the logo and the toggle). Clone it
       into the drawer so the primary CTA is never lost on a phone. */
    var headerCta = document.querySelector('nav .btn-brass');
    if (headerCta && !navLinks.querySelector('.nav-drawer-cta')) {
      var drawerCta = headerCta.cloneNode(true);
      drawerCta.classList.add('nav-drawer-cta');
      navLinks.appendChild(drawerCta);
    }

    /* Explicit close (X) control at the top of the panel — closing
       shouldn't require navigating to another page. */
    if (!navLinks.querySelector('.nav-drawer-close')) {
      var drawerClose = document.createElement('button');
      drawerClose.type = 'button';
      drawerClose.className = 'nav-drawer-close';
      drawerClose.setAttribute('aria-label', 'Close menu');
      drawerClose.innerHTML = '&#10005;';
      drawerClose.addEventListener('click', function () { closeNav(true); });
      navLinks.insertBefore(drawerClose, navLinks.firstChild);
    }

    var lastScrollY = 0;

    function openNav() {
      lastScrollY = window.scrollY;
      navLinks.classList.add('open');
      navToggle.classList.add('active');
      scrim.classList.add('open');
      document.body.classList.add('nav-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close menu');

      var first = navLinks.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    }

    function closeNav(returnFocus) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      scrim.classList.remove('open');
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      if (returnFocus) navToggle.focus({ preventScroll: true });
    }

    function isOpen() {
      return navLinks.classList.contains('open');
    }

    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      isOpen() ? closeNav(false) : openNav();
    });

    scrim.addEventListener('click', function () {
      closeNav(false);
    });

    /* Tapping a link left the drawer sitting open over the new content —
       same-page #anchors made this especially obvious. */
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) closeNav(true);
    });

    /* Keep Tab inside the open drawer. */
    navLinks.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !isOpen()) return;

      var items = navLinks.querySelectorAll('a, button');
      if (!items.length) return;

      var first = items[0];
      var last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    /* Rotating a phone to landscape can cross the breakpoint while the
       drawer is open, leaving the page scroll-locked with no visible
       drawer. Reset on resize. */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth > MOBILE_NAV_MAX && isOpen()) closeNav(false);
      }, 120);
    });
  }

  /* ------------------------------------------------------------------
     SWIPE FOR THE 3D CAROUSEL
     Arrows and dots only — there was no way to swipe it on a phone,
     which is the first thing anyone tries.
     ------------------------------------------------------------------ */

  var stage = document.querySelector('.carousel-3d-stage');
  if (stage) {
    var startX = 0;
    var startY = 0;
    var tracking = false;

    stage.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    stage.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;

      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;

      /* Ignore mostly-vertical drags so the page can still scroll. */
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;

      var arrows = document.querySelectorAll('.carousel-3d-arrow');
      if (arrows.length < 2) return;

      (dx < 0 ? arrows[1] : arrows[0]).click();
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     REAL VIEWPORT HEIGHT FALLBACK
     For browsers without svh support, expose a --vh unit so 100vh
     heroes don't run under the mobile address bar.
     ------------------------------------------------------------------ */

  if (!CSS.supports || !CSS.supports('height', '100svh')) {
    var setVh = function () {
      document.documentElement.style.setProperty(
        '--vh', window.innerHeight * 0.01 + 'px'
      );
    };
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
  }
})();
