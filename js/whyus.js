/* STACKLY INDUSTRIAL — whyus.js (vanilla JS) */
(function () {
  'use strict';
  var d = document, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.documentElement.classList.add('wy');

  /* Progress bar + header shadow */
  var bar = d.createElement('div'); bar.id = 'bar'; d.body.appendChild(bar);
  var header = d.querySelector('header');
  function onScroll() {
    var max = d.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
    header.classList.toggle('scrolled', scrollY > 60);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Reveal each pinned reason card once it's centred in view */
  var reasons = [].slice.call(d.querySelectorAll('.reason'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('in'); else e.target.classList.remove('in'); });
    }, { threshold: 0.35 });
    reasons.forEach(function (r) { io.observe(r); });
  } else reasons.forEach(function (r) { r.classList.add('in'); });

  /* Count-up stats */
  var counters = [].slice.call(d.querySelectorAll('.wy-stats-in b'));
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduced) { el.textContent = target + suffix; return; }
    var start = performance.now(), dur = 1200;
    function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else counters.forEach(function (c) { c.textContent = (c.getAttribute('data-count') || '0') + (c.getAttribute('data-suffix') || ''); });

  /* FAQ accordion: one open at a time */
  var items = [].slice.call(d.querySelectorAll('.faq-item'));
  items.forEach(function (it) {
    var q = it.querySelector('.faq-q');
    q.addEventListener('click', function () {
      var open = !it.classList.contains('open');
      items.forEach(function (o) { o.classList.remove('open'); o.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* Mobile menu (same behaviour as the rest of the site) */
  var toggle = d.querySelector('.menu-toggle'), nav = d.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    d.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.innerHTML = '<i class="fa-solid ' + (open ? 'fa-xmark' : 'fa-bars') + '"></i>';
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  [].forEach.call(nav.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  addEventListener('resize', function () { if (innerWidth > 1000) setMenu(false); });
})();