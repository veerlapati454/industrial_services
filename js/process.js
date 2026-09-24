/* STACKLY INDUSTRIAL — process.js (vanilla JS) */
(function () {
  'use strict';
  var d = document, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.documentElement.classList.add('pr');

  /* Progress bar + header shadow */
  var bar = d.createElement('div'); bar.id = 'bar'; d.body.appendChild(bar);
  var header = d.querySelector('header');
  function onScroll() {
    var max = d.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
    header.classList.toggle('scrolled', scrollY > 60);
    if (!reduced) fillRail();
  }

  /* Fill each timeline segment as its step scrolls past the anchor line */
  var steps = [].slice.call(d.querySelectorAll('.step'));
  var segs = steps.map(function (s) { return s.querySelector('[data-seg]'); });
  function fillRail() {
    var anchor = innerHeight * 0.55;
    steps.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      var p = (anchor - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      if (segs[i]) segs[i].style.setProperty('--fill', p);
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* Reveal each step + light its node when it enters view */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
    }, { threshold: 0.28 });
    steps.forEach(function (s) { io.observe(s); });
  } else steps.forEach(function (s) { s.classList.add('on'); });

  /* Scroll-spy jump nav with a sliding indicator */
  var jumpIn = d.getElementById('jump'), ind = d.getElementById('jumpInd');
  var jumps = [].slice.call(jumpIn.querySelectorAll('a'));
  function activate(id) {
    jumps.forEach(function (t) {
      var on = t.getAttribute('href') === '#' + id;
      t.classList.toggle('on', on);
      if (on) {
        ind.style.width = t.offsetWidth + 'px';
        ind.style.transform = 'translateX(' + t.offsetLeft + 'px)';
        jumpIn.scrollTo({ left: t.offsetLeft - (jumpIn.clientWidth - t.offsetWidth) / 2, behavior: 'smooth' });
      }
    });
  }
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) activate(e.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    steps.forEach(function (s) { spy.observe(s); });
  }

  /* Count-up hero stats */
  var counters = [].slice.call(d.querySelectorAll('.pr-hero-stats b'));
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