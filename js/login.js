// STACKLY INDUSTRIAL — login.js
// Gmail-only email, min-length password, show/hide toggle, caps-lock warning,
// loading state, and role-based redirect (Admin -> admin-dashboard, User -> user-dashboard).
(function () {
  'use strict';
  var form = document.getElementById('loginForm');
  if (!form) return;

  var emailInput = document.getElementById('email');
  var passwordInput = document.getElementById('password');
  var btn = document.getElementById('loginBtn');
  var caps = document.getElementById('capsWarn');
  var GMAIL = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

  /* Prefill remembered email */
  try {
    var saved = localStorage.getItem('rememberedEmail');
    if (saved) {
      emailInput.value = saved;
      document.getElementById('rememberMe').checked = true;
    }
  } catch (e) {}

  /* Password show / hide */
  var eye = form.querySelector('.eye');
  eye.addEventListener('click', function () {
    var show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';
    eye.innerHTML = '<i class="fa-solid ' + (show ? 'fa-eye-slash' : 'fa-eye') + '"></i>';
    eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    passwordInput.focus();
  });

  /* Caps Lock warning */
  function checkCaps(e) {
    if (e.getModifierState) caps.hidden = !e.getModifierState('CapsLock');
  }
  passwordInput.addEventListener('keyup', checkCaps);
  passwordInput.addEventListener('keydown', checkCaps);
  passwordInput.addEventListener('blur', function () { caps.hidden = true; });

  /* Validation with inline hints */
  var hints = {};
  [].forEach.call(form.querySelectorAll('.hint'), function (h) {
    hints[h.getAttribute('data-for')] = { el: h, text: h.textContent };
  });

  function setState(input, message) {
    var wrap = input.closest('.field'), h = hints[input.id];
    var ok = !message;
    wrap.classList.toggle('invalid', !ok);
    wrap.classList.toggle('valid', ok && input.value !== '');
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    h.el.textContent = ok ? h.text : message;
    return ok;
  }
  function checkEmail() {
    var v = emailInput.value.trim();
    if (!v) return setState(emailInput, 'Please enter your email address.');
    if (!GMAIL.test(v)) return setState(emailInput, 'Please enter a valid @gmail.com address.');
    return setState(emailInput, '');
  }
  function checkPassword() {
    var v = passwordInput.value;
    if (!v) return setState(passwordInput, 'Please enter your password.');
    if (v.length < 6) return setState(passwordInput, 'Password must be at least 6 characters.');
    return setState(passwordInput, '');
  }
  emailInput.addEventListener('blur', checkEmail);
  passwordInput.addEventListener('blur', checkPassword);
  emailInput.addEventListener('input', function () { if (emailInput.closest('.field').classList.contains('invalid')) checkEmail(); });
  passwordInput.addEventListener('input', function () { if (passwordInput.closest('.field').classList.contains('invalid')) checkPassword(); });

  function shake(input) {
    var w = input.closest('.field');
    w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake');
  }

  /* Submit */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var okE = checkEmail(), okP = checkPassword();
    if (!okE || !okP) {
      var first = !okE ? emailInput : passwordInput;
      shake(first); first.focus();
      return;
    }

    var role = form.querySelector('input[name="role"]:checked').value;
    var email = emailInput.value.trim();

    btn.classList.add('loading');
    btn.disabled = true;

    try {
      localStorage.setItem('user', JSON.stringify({ email: email, role: role }));
      localStorage.setItem('isAuthenticated', 'true');
      if (document.getElementById('rememberMe').checked) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');
    } catch (err) {}

    /* Brief loading state so the transition feels deliberate */
    setTimeout(function () {
      window.location.href = role === 'admin' ? './admin-dashboard.html' : './user-dashboard.html';
    }, 800);
  });

  /* Subtle parallax on the gear graphics (desktop only, skipped for reduced motion) */
  var panel = document.getElementById('brandPanel');
  var gears = panel && panel.querySelector('.gears');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (gears && !reduce) {
    panel.addEventListener('mousemove', function (e) {
      var r = panel.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      gears.style.transform = 'translate(' + (x * -22) + 'px,' + (y * -22) + 'px)';
    });
    panel.addEventListener('mouseleave', function () { gears.style.transform = ''; });
  }
})();