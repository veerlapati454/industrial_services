// STACKLY INDUSTRIAL — signup.js
// Letters-only username / full name (filtered live), Gmail-only email, password
// strength meter, confirm-match check, terms gate, show/hide toggles, then redirect to login.
(function () {
  'use strict';
  var form = document.getElementById('signupForm');
  if (!form) return;

  var $ = function (id) { return document.getElementById(id); };
  var usernameEl = $('username'), fullNameEl = $('fullName'), emailEl = $('email');
  var passEl = $('password'), confirmEl = $('confirmPassword'), agreeEl = $('agreeTerms');
  var btn = $('signupBtn'), meter = $('meter'), meterText = $('meterText');

  var GMAIL = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

  /* ---------- Hints: remember default copy so it can be restored ---------- */
  var hints = {};
  [].forEach.call(form.querySelectorAll('.hint'), function (h) {
    hints[h.getAttribute('data-for')] = { el: h, text: h.textContent };
  });

  function wrapOf(el) { return el.closest('.field') || el.closest('.terms-wrap'); }

  function setState(el, message) {
    var wrap = wrapOf(el), h = hints[el.id], ok = !message;
    wrap.classList.toggle('invalid', !ok);
    wrap.classList.toggle('valid', ok && (el.type === 'checkbox' ? false : el.value !== ''));
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    h.el.textContent = ok ? h.text : message;
    return ok;
  }

  /* ---------- Rules ---------- */
  var rules = {
    username: function () {
      var v = usernameEl.value.trim();
      if (!v) return 'Please choose a username.';
      if (!/^[A-Za-z]{2,24}$/.test(v)) return 'Username must be 2\u201324 letters, no numbers or spaces.';
      return '';
    },
    fullName: function () {
      var v = fullNameEl.value.trim();
      if (!v) return 'Please enter your full name.';
      if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(v) || v.replace(/ /g, '').length < 2) return 'Use letters only (at least 2).';
      return '';
    },
    email: function () {
      var v = emailEl.value.trim();
      if (!v) return 'Please enter your email address.';
      if (!GMAIL.test(v)) return 'Please enter a valid @gmail.com address.';
      return '';
    },
    password: function () {
      if (!passEl.value) return 'Please create a password.';
      if (passEl.value.length < 6) return 'Password must be at least 6 characters.';
      return '';
    },
    confirmPassword: function () {
      if (!confirmEl.value) return 'Please re-enter your password.';
      if (confirmEl.value !== passEl.value) return 'Passwords do not match.';
      return '';
    },
    agreeTerms: function () { return agreeEl.checked ? '' : 'You must accept the Terms and Conditions to sign up.'; }
  };
  var els = { username: usernameEl, fullName: fullNameEl, email: emailEl, password: passEl, confirmPassword: confirmEl, agreeTerms: agreeEl };

  function check(name) { return setState(els[name], rules[name]()); }

  Object.keys(els).forEach(function (name) {
    var el = els[name];
    el.addEventListener('blur', function () { check(name); });
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', function () {
      var w = wrapOf(el);
      if (w.classList.contains('invalid')) check(name);
      if (name === 'password' && confirmEl.value) check('confirmPassword'); /* keep match state in sync */
    });
  });

  /* ---------- Live input filtering ---------- */
  var warnTimers = {};
  function flash(el) {
    var w = wrapOf(el); w.classList.add('invalid');
    clearTimeout(warnTimers[el.id]);
    warnTimers[el.id] = setTimeout(function () { if (!rules[el.id]()) w.classList.remove('invalid'); }, 1500);
  }
  function restrict(el, re, tidy) {
    el.addEventListener('input', function () {
      var before = el.value, clean = before.replace(re, '');
      if (tidy) clean = tidy(clean);
      if (clean !== before) { el.value = clean; flash(el); }
    });
  }
  restrict(usernameEl, /[^A-Za-z]/g);
  restrict(fullNameEl, /[^A-Za-z ]/g, function (s) { return s.replace(/^ +/, '').replace(/ {2,}/g, ' '); });
  fullNameEl.addEventListener('blur', function () {
    fullNameEl.value = fullNameEl.value.trim().toLowerCase().replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
    check('fullName');
  });
  emailEl.addEventListener('input', function () { emailEl.value = emailEl.value.replace(/\s/g, ''); });

  /* ---------- Password show / hide ---------- */
  [].forEach.call(form.querySelectorAll('.eye'), function (eye) {
    eye.addEventListener('click', function () {
      var input = $(eye.getAttribute('data-target')), show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eye.innerHTML = '<i class="fa-solid ' + (show ? 'fa-eye-slash' : 'fa-eye') + '"></i>';
      eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      input.focus();
    });
  });

  /* ---------- Strength meter ---------- */
  var labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  var colors = ['', '#e5484d', '#b9770e', '#4a9d55', '#2fae66'];
  function score(p) {
    if (!p) return 0;
    var s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
    return Math.max(1, s);
  }
  passEl.addEventListener('input', function () {
    var s = passEl.value ? score(passEl.value) : 0;
    meter.setAttribute('data-s', s);
    meterText.textContent = labels[s];
    meterText.style.color = colors[s];
  });

  /* ---------- Submit ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    Object.keys(els).forEach(function (name) {
      if (!check(name) && !firstBad) firstBad = els[name];
    });
    if (firstBad) {
      var w = wrapOf(firstBad);
      w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake');
      firstBad.focus();
      return;
    }

    btn.disabled = true;
    btn.classList.add('loading');

    /* No backend wired up yet: simulate the request, confirm, then send the user to login. */
    setTimeout(function () {
      btn.classList.remove('loading');
      btn.classList.add('success');
      setTimeout(function () { window.location.href = './login.html'; }, 900);
    }, 900);
  });

  /* ---------- Gear parallax (desktop, skipped for reduced motion) ---------- */
  var panel = $('brandPanel'), gears = panel && panel.querySelector('.gears');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (gears && !reduce) {
    panel.addEventListener('mousemove', function (e) {
      var r = panel.getBoundingClientRect();
      gears.style.transform = 'translate(' + (((e.clientX - r.left) / r.width - 0.5) * -22) + 'px,' + (((e.clientY - r.top) / r.height - 0.5) * -22) + 'px)';
    });
    panel.addEventListener('mouseleave', function () { gears.style.transform = ''; });
  }
})();