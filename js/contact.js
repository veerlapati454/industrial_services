/* STACKLY INDUSTRIAL — contact.js (vanilla JS) */
(function () {
  'use strict';
  var d = document;

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

  /* Mobile menu */
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

  /* FAQ: keep only one answer open at a time */
  var faqs = d.querySelectorAll('.faq details');
  [].forEach.call(faqs, function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      [].forEach.call(faqs, function (other) { if (other !== item) other.open = false; });
    });
  });

  /* ---- Contact form ---- */
  var form = d.getElementById('ctForm');
  if (!form) return;

  var submitBtn = d.getElementById('ctSubmit');
  var okBox = d.getElementById('ctOk');
  var urgAlert = d.getElementById('urgAlert');
  var msg = d.getElementById('message'), msgCount = d.getElementById('msgCount');

  function wrapOf(el) { return el.closest('.field') || el.closest('.consent'); }

  /* ---------- Validation rules: return '' when valid, otherwise the error text ---------- */
  var EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
  var rules = {
    name: function (v) {
      v = v.trim();
      if (!v) return 'Please enter your full name.';
      if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(v)) return 'Use letters only \u2014 no numbers or symbols.';
      if (v.replace(/ /g, '').length < 2) return 'Name must be at least 2 letters.';
      return '';
    },
    company: function (v) {
      v = v.trim();
      if (!v) return '';
      if (v.length < 2) return 'Company name is too short.';
      if (!/^[A-Za-z0-9&.,'()\- ]+$/.test(v)) return 'Company name has unsupported characters.';
      return '';
    },
    email: function (v) {
      v = v.trim();
      if (!v) return 'Please enter your work email.';
      if (!EMAIL_RE.test(v)) return 'Enter a valid email, e.g. name@company.com.';
      return '';
    },
    phone: function (v) {
      v = v.trim();
      if (!v) return 'Please enter your phone number.';
      if (!/^[0-9+\-\s()]+$/.test(v)) return 'Phone can contain digits only.';
      var digits = v.replace(/\D/g, '');
      if (/^(91)?[6-9]\d{9}$/.test(digits) || /^0[6-9]\d{9}$/.test(digits)) return '';
      return 'Enter a valid 10-digit mobile number (starts with 6\u20139).';
    },
    service: function (v) { return v ? '' : 'Choose the service closest to your job.'; },
    message: function (v) {
      v = v.trim();
      if (!v) return 'Tell us briefly what needs doing.';
      if (v.length < 20) return 'Add a little more detail (at least 20 characters).';
      return '';
    },
    consent: function (v, el) { return el.checked ? '' : 'Please confirm before sending.'; }
  };

  function validateField(el) {
    var wrap = wrapOf(el), rule = rules[el.name];
    if (!wrap || !rule) return true;
    var text = rule(el.value, el);
    var ok = text === '';
    var err = wrap.querySelector('.err');
    if (err) err.textContent = text;
    wrap.classList.toggle('invalid', !ok);
    wrap.classList.toggle('valid', ok && (el.type === 'checkbox' || el.value.trim() !== ''));
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }

  var fields = [].slice.call(form.querySelectorAll('input, select, textarea')).filter(function (el) {
    return el.name !== 'website' && rules[el.name];
  });

  fields.forEach(function (el) {
    el.addEventListener('blur', function () { validateField(el); });
    el.addEventListener('change', function () { validateField(el); });
    el.addEventListener('input', function () {
      var w = wrapOf(el);
      if (w && w.classList.contains('invalid')) validateField(el);
    });
  });

  /* ---------- Input filters ---------- */
  var nameEl = d.getElementById('name');
  var warnTimer;
  function flashWarn(el) {
    var w = wrapOf(el); w.classList.add('hinted-warn');
    clearTimeout(warnTimer);
    warnTimer = setTimeout(function () { w.classList.remove('hinted-warn'); }, 1800);
  }
  /* Name: letters and single spaces only */
  nameEl.addEventListener('input', function () {
    var before = nameEl.value;
    var clean = before.replace(/[^A-Za-z ]/g, '').replace(/^ +/, '').replace(/ {2,}/g, ' ');
    if (clean !== before) { nameEl.value = clean; flashWarn(nameEl); }
  });
  /* Tidy capitalisation: "ravi  kumar" -> "Ravi Kumar" */
  nameEl.addEventListener('blur', function () {
    nameEl.value = nameEl.value.trim().toLowerCase().replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
    validateField(nameEl);
  });
  /* Phone: digits, +, spaces, dashes, brackets only */
  var phoneEl = d.getElementById('phone');
  phoneEl.addEventListener('input', function () {
    var clean = phoneEl.value.replace(/[^0-9+\-\s()]/g, '');
    if (clean !== phoneEl.value) phoneEl.value = clean;
  });
  /* Email: no spaces */
  var emailEl = d.getElementById('email');
  emailEl.addEventListener('input', function () { emailEl.value = emailEl.value.replace(/\s/g, ''); });

  /* Selects: floating-label flag */
  [].forEach.call(form.querySelectorAll('select'), function (sel) {
    var sync = function () { sel.classList.toggle('has-value', sel.value !== ''); };
    sel.addEventListener('change', sync);
    sync();
  });

  /* Emergency banner */
  var urgency = d.getElementById('urgency');
  urgency.addEventListener('change', function () { urgAlert.hidden = urgency.value !== 'Emergency'; });

  /* Message counter */
  msg.addEventListener('input', function () { msgCount.textContent = msg.value.length; });

  /* Quick-add chips */
  [].forEach.call(form.querySelectorAll('.chip'), function (chip) {
    chip.addEventListener('click', function () {
      var add = chip.getAttribute('data-add');
      var cur = msg.value;
      var next = cur + (cur && !/\n$/.test(cur) ? '\n' : '') + add;
      if (next.length > msg.maxLength) return;
      msg.value = next;
      msg.focus();
      msg.setSelectionRange(next.length, next.length);
      msg.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  /* ---------- Submit ---------- */
  function validateAll() {
    var allOk = true, first = null;
    fields.forEach(function (el) {
      if (!validateField(el)) { allOk = false; if (!first) first = el; }
    });
    return { ok: allOk, first: first };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    okBox.hidden = true;

    var hp = form.querySelector('[name="website"]');
    if (hp && hp.value.trim() !== '') { form.reset(); return; }

    var result = validateAll();
    if (!result.ok) {
      var wrap = wrapOf(result.first);
      if (wrap) { wrap.classList.remove('shake'); void wrap.offsetWidth; wrap.classList.add('shake'); }
      result.first.focus();
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    /* No backend wired up yet: simulate the round trip. Replace with fetch() to your endpoint. */
    setTimeout(function () {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      okBox.hidden = false;
      form.reset();
      fields.forEach(function (el) {
        var w = wrapOf(el);
        if (w) w.classList.remove('invalid', 'valid');
        el.removeAttribute('aria-invalid');
      });
      [].forEach.call(form.querySelectorAll('select'), function (sel) { sel.classList.remove('has-value'); });
      urgAlert.hidden = true;
      msgCount.textContent = '0';
      okBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 900);
  });
})();