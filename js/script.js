/* STACKLY INDUSTRIAL — script.js (vanilla JS, no libraries) */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');
  // Fresh visit or reload starts at the top; going Back from another page keeps the browser's saved position
  var navEntry = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
  if (navEntry.type !== 'back_forward') window.scrollTo(0, 0);

  /* Preloader: gauge counts to 100, then wipes up */
  var pre = document.getElementById('preloader');
  var num = document.getElementById('plNum');
  var fill = document.getElementById('plBar');
  var started = Date.now(), DURATION = reduced ? 0 : 1100, finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    pre.classList.add('done');
    document.body.classList.remove('loading');
    setTimeout(function () { pre.style.visibility = 'hidden'; }, 900);
  }
  function tick() {
    var p = DURATION ? Math.min(1, (Date.now() - started) / DURATION) : 1;
    num.textContent = Math.round(p * 100);
    fill.style.width = p * 100 + '%';
    if (p < 1) requestAnimationFrame(tick);
    else setTimeout(finish, 200);
  }
  tick();
  setTimeout(finish, 4000); // failsafe

  /* Reveal on scroll, staggered within each parent */
  var items = document.querySelectorAll('.rv');
  items.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('rv'); });
    el.style.setProperty('--d', (sibs.indexOf(el) * 0.08) + 's');
  });

  /* Count-up numbers (data-count + data-suf) */
  function countUp(el) {
    var end = parseFloat(el.dataset.count), suf = el.dataset.suf || '';
    if (reduced) return;
    var t0 = performance.now(), dur = 1600;
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e).toLocaleString('en-US') + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        en.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
    // Hero stats are not .rv, so observe them directly
    var heroStats = document.querySelector('.hero-stats');
    if (heroStats) new IntersectionObserver(function (e, o) {
      if (e[0].isIntersecting) { heroStats.querySelectorAll('[data-count]').forEach(countUp); o.disconnect(); }
    }).observe(heroStats);
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* Scroll progress bar + condensed header */
  var bar = document.createElement('div');
  bar.id = 'bar';
  document.body.appendChild(bar);
  var header = document.querySelector('header');
  window.addEventListener('scroll', function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* Hero: cursor-following spotlight on the blueprint grid */
  var hero = document.getElementById('hero');
  if (hero && !reduced && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  /* Mobile menu */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.innerHTML = '<i class="fa-solid ' + (open ? 'fa-xmark' : 'fa-bars') + '"></i>';
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1000) setMenu(false); });

  /* Any in-page link whose target section does not exist goes to the 404 page */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) {
      e.preventDefault();
      window.location.href = './html/404.html';
    }
  });
})();