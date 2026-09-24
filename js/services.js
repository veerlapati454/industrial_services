/* STACKLY INDUSTRIAL — services.js (vanilla JS) */
(function () {
  'use strict';
  var d = document, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.documentElement.classList.add('sv');

  /* Progress bar + header shadow */
  var bar = d.createElement('div'); bar.id = 'bar'; d.body.appendChild(bar);
  var header = d.querySelector('header');
  function onScroll() {
    var max = d.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
    header.classList.toggle('scrolled', scrollY > 60);
    if (!reduced) parallax();
  }

  /* Image parallax inside each frame */
  var imgs = [].slice.call(d.querySelectorAll('.ph img'));
  function parallax() {
    var vh = innerHeight;
    imgs.forEach(function (im) {
      var r = im.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      im.style.transform = 'translateY(' + (((r.top + r.height / 2 - vh / 2) / vh) * -24) + 'px)';
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* Reveal each service when it scrolls into view */
  var svcs = [].slice.call(d.querySelectorAll('.svc'));
  svcs.forEach(function (s) {
    [].forEach.call(s.querySelector('.svc-body').children, function (el, i) { el.style.setProperty('--n', i); });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    svcs.forEach(function (s) { io.observe(s); });
  } else svcs.forEach(function (s) { s.classList.add('in'); });

  /* Scroll-spy tabs with a sliding indicator */
  var tabsIn = d.getElementById('tabs'), ind = d.getElementById('tabInd');
  var tabs = [].slice.call(tabsIn.querySelectorAll('a'));
  function activate(id) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('href') === '#' + id;
      t.classList.toggle('on', on);
      if (on) {
        ind.style.width = t.offsetWidth + 'px';
        ind.style.transform = 'translateX(' + t.offsetLeft + 'px)';
        tabsIn.scrollTo({ left: t.offsetLeft - (tabsIn.clientWidth - t.offsetWidth) / 2, behavior: 'smooth' });
      }
    });
  }
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) activate(e.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    svcs.forEach(function (s) { spy.observe(s); });
  }

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

  /* Mobile menu (same behaviour as the home page) */
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