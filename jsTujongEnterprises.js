(function () {
  'use strict';

  const CONFIG = {
    navScrollThreshold: 50,
    scrollTopThreshold: 300,
    counterDuration: 2000,
    counterEasing: 'easeOutCubic',
    formSubmitDelay: 1500,
    intersectionThreshold: 0.1,
    intersectionRootMargin: '0px 0px -50px 0px',
  };

  const state = {
    navScrolled: false,
    scrollTopVisible: false,
    countersAnimated: false,
    formSubmitting: false,
  };

  const selectors = {
    nav: '#mainNav',
    scrollTop: '#scrollTop',
    heroCarousel: '#heroCarousel',
    testimonialCarousel: '#testimonialCarousel',
    motorcycleGrid: '#motorcycleGrid',
    contactForm: '#contactForm',
    formSuccess: '#formSuccess',
    formError: '#formError',
    submitBtn: '#submitBtn',
    currentYear: '#currentYear, #currentYear2',
    statNumbers: '.stat-number',
    bikeCards: '.bike-card',
    wishlistBtns: '.wishlist-btn',
    navbarToggler: '.navbar-toggler',
    navbarCollapse: '#navbarNav',
  };

  const elements = {};

  function cacheElements() {
    Object.entries(selectors).forEach(([key, selector]) => {
      elements[key] = document.querySelector(selector);
    });
    elements.statNumbers = document.querySelectorAll(selectors.statNumbers);
    elements.bikeCards = document.querySelectorAll(selectors.bikeCards);
    elements.wishlistBtns = document.querySelectorAll(selectors.wishlistBtns);
  }

  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50,
        delay: 0,
        anchorPlacement: 'top-bottom',
      });
    }
  }

  function setCurrentYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll('#currentYear, #currentYear2').forEach((el) => {
      el.textContent = year;
    });
  }

  function handleNavScroll() {
    const scrolled = window.scrollY > CONFIG.navScrollThreshold;
    if (scrolled !== state.navScrolled) {
      state.navScrolled = scrolled;
      if (elements.nav) {
        elements.nav.classList.toggle('scrolled', scrolled);
      }
    }
  }

  function handleScrollTop() {
    const visible = window.scrollY > CONFIG.scrollTopThreshold;
    if (visible !== state.scrollTopVisible) {
      state.scrollTopVisible = visible;
      if (elements.scrollTop) {
        elements.scrollTop.classList.toggle('visible', visible);
      }
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initHeroCarousel() {
    if (elements.heroCarousel && typeof bootstrap !== 'undefined') {
      const carousel = new bootstrap.Carousel(elements.heroCarousel, {
        interval: 4000,
        pause: 'hover',
        wrap: true,
        keyboard: true,
      });

      elements.heroCarousel.addEventListener('slide.bs.carousel', (e) => {
        const activeItem = elements.heroCarousel.querySelector('.carousel-item.active');
        const nextItem = e.relatedTarget;
        if (activeItem && nextItem) {
          const activeImg = activeItem.querySelector('img');
          const nextImg = nextItem.querySelector('img');
          if (activeImg) activeImg.style.transform = 'scale(1)';
          if (nextImg) nextImg.style.transform = 'scale(1.02)';
        }
      });
    }
  }

  function initTestimonialCarousel() {
    if (elements.testimonialCarousel && typeof bootstrap !== 'undefined') {
      new bootstrap.Carousel(elements.testimonialCarousel, {
        interval: 5000,
        pause: 'hover',
        wrap: true,
        keyboard: true,
      });
    }
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(element, target, duration) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current = Math.floor(start + (target - start) * easedProgress);
      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }

  function initCounterObserver() {
    if (elements.statNumbers.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !state.countersAnimated) {
          state.countersAnimated = true;
          elements.statNumbers.forEach((stat) => {
            const target = parseInt(stat.dataset.count, 10) || 0;
            animateCounter(stat, target, CONFIG.counterDuration);
          });
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: CONFIG.intersectionThreshold,
      rootMargin: CONFIG.intersectionRootMargin,
    });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
      observer.observe(heroStats);
    }
  }

  function initWishlistButtons() {
    elements.wishlistBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const icon = btn.querySelector('i');
        const isActive = btn.classList.toggle('active');

        if (isActive) {
          btn.classList.add('btn-danger');
          btn.classList.remove('btn-light');
          if (icon) {
            icon.classList.remove('bi-heart');
            icon.classList.add('bi-heart-fill');
          }
          btn.setAttribute('aria-label', 'Remove from wishlist');
          showToast('Added to wishlist!', 'success');
        } else {
          btn.classList.remove('btn-danger');
          btn.classList.add('btn-light');
          if (icon) {
            icon.classList.remove('bi-heart-fill');
            icon.classList.add('bi-heart');
          }
          btn.setAttribute('aria-label', 'Add to wishlist');
          showToast('Removed from wishlist', 'info');
        }

        btn.style.transform = 'scale(1.2)';
        setTimeout(() => { btn.style.transform = ''; }, 200);
      });

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  function initBikeCardInteractions() {
    elements.bikeCards.forEach((card) => {
      const overlay = card.querySelector('.bike-overlay');
      if (!overlay) return;

      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
      });

      card.addEventListener('mouseleave', () => {
        if (!card.matches(':hover')) {
          card.style.transform = '';
        }
      });

      card.addEventListener('focusin', () => {
        card.style.transform = 'translateY(-8px)';
      });

      card.addEventListener('focusout', (e) => {
        if (!card.contains(e.relatedTarget)) {
          card.style.transform = '';
        }
      });
    });
  }

  function closeNavbar() {
    const { navbarCollapse } = elements;
    if (navbarCollapse?.classList.contains('show')) {
      window.bootstrap?.Collapse.getInstance(navbarCollapse)?.hide();
    }
  }

  function initNavbar() {
    const { navbarCollapse, navbarToggler } = elements;
    if (!navbarCollapse) return;

    navbarCollapse.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-item').forEach((link) => {
      link.addEventListener('click', () => {
        navbarCollapse.querySelectorAll('.nav-link.active, .dropdown-item.active').forEach((activeLink) => {
          activeLink.classList.remove('active');
          activeLink.removeAttribute('aria-current');
        });

        link.classList.add('active');
        if (document.getElementById(link.hash.slice(1))) {
          link.setAttribute('aria-current', 'location');
        }
        link.closest('.dropdown')?.querySelector('.dropdown-toggle')?.classList.add('active');
        closeNavbar();
      });
    });

    document.addEventListener('click', (event) => {
      if (!navbarCollapse.contains(event.target) && !navbarToggler?.contains(event.target)) {
        closeNavbar();
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not(.dropdown-toggle)').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const navHeight = elements.nav?.offsetHeight || 80;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth',
          });

          target.focus({ preventScroll: true });
        }
      });
    });
  }

  async function hashDemoPassword(password, salt) {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const hash = await crypto.subtle.deriveBits({
      name: 'PBKDF2',
      salt: Uint8Array.from(salt),
      iterations: 600000,
      hash: 'SHA-256',
    }, key, 256);
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
  }

  function initDemoLogin() {
    const dialog = document.getElementById('demoLoginDialog');
    const trigger = document.getElementById('demoLoginButton');
    if (!dialog || !trigger) return;

    const triggerLabel = trigger.querySelector('span');
    const title = dialog.querySelector('#demoLoginTitle');
    const description = dialog.querySelector('#demoLoginDescription');
    const loginForm = dialog.querySelector('#demoLoginForm');
    const registrationForm = dialog.querySelector('#demoRegisterForm');
    const error = dialog.querySelector('#demoLoginError');
    const accountView = dialog.querySelector('#demoLoginAccount');
    const signOut = dialog.querySelector('#demoLoginSignOut');
    const demoAccount = { email: 'demo@tujong.example' };
    const demoPassword = 'DemoRide123!';
    const sessionKey = 'tujongDemoSignedIn';
    const accountKey = (email) => `tujongDemoAccount:${email}`;
    let currentAccount = null;
    let pendingSubmission = null;

    function readAccount(email) {
      const account = JSON.parse(localStorage.getItem(accountKey(email)));
      return account?.email === email && typeof account.name === 'string' ? account : null;
    }

    try {
      const savedEmail = sessionStorage.getItem(sessionKey);
      if (savedEmail === 'true' || savedEmail === demoAccount.email) {
        currentAccount = demoAccount;
      } else if (savedEmail) {
        currentAccount = readAccount(savedEmail);
      }
    } catch {
      // The dialog can still keep the sign-in state in memory.
    }

    function renderView(view) {
      triggerLabel.textContent = currentAccount?.name || (currentAccount ? 'Demo account' : 'Login');
      loginForm.hidden = view !== 'login';
      registrationForm.hidden = view !== 'register';
      accountView.hidden = view !== 'account';
      error.hidden = true;

      if (view === 'account') {
        title.textContent = currentAccount.name ? `Welcome, ${currentAccount.name}` : 'You’re signed in';
        description.textContent = currentAccount.email;
      } else if (view === 'register') {
        title.textContent = 'Create Account';
        description.textContent = 'This account is saved in this browser.';
      } else {
        title.textContent = 'Login';
        description.textContent = 'Sign in with a demo account saved in this browser, or use the built-in credentials.';
      }
    }

    function setSignedIn(account) {
      currentAccount = account;
      try {
        if (currentAccount) sessionStorage.setItem(sessionKey, currentAccount.email);
        else sessionStorage.removeItem(sessionKey);
      } catch {
        // The account view still updates when storage is unavailable.
      }
      renderView(currentAccount ? 'account' : 'login');
    }

    function showError(message) {
      error.textContent = message;
      error.hidden = false;
    }

    async function authenticate(email, password) {
      if (email === demoAccount.email) return password === demoPassword ? demoAccount : null;

      const account = readAccount(email);
      if (!account) return null;
      const hash = await hashDemoPassword(password, account.salt);
      return hash === account.passwordHash ? account : null;
    }

    trigger.addEventListener('click', () => {
      closeNavbar();
      dialog.showModal();
      (currentAccount ? signOut : loginForm.elements.email).focus();
    });

    dialog.querySelector('#demoLoginClose').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (pendingSubmission) pendingSubmission.fieldset.disabled = false;
      pendingSubmission = null;
      loginForm.reset();
      registrationForm.reset();
      renderView(currentAccount ? 'account' : 'login');
      const { navbarToggler } = elements;
      const focusTarget = navbarToggler?.getClientRects().length ? navbarToggler : trigger;
      focusTarget.focus();
    });

    loginForm.querySelector('#demoLoginFill').addEventListener('click', () => {
      loginForm.elements.email.value = demoAccount.email;
      loginForm.elements.password.value = demoPassword;
      error.hidden = true;
      loginForm.querySelector('[type="submit"]').focus();
    });

    loginForm.querySelector('#demoLoginRegister').addEventListener('click', () => {
      loginForm.reset();
      renderView('register');
      registrationForm.elements.name.focus();
    });

    registrationForm.querySelector('#demoRegisterBack').addEventListener('click', () => {
      registrationForm.reset();
      renderView('login');
      loginForm.elements.email.focus();
    });

    async function submitAccount(event) {
      event.preventDefault();
      const form = event.currentTarget;
      const fieldset = form.querySelector('fieldset');
      if (fieldset.disabled || pendingSubmission) return;

      const registering = form === registrationForm;
      const email = form.elements.email.value.trim().toLowerCase();
      const password = form.elements.password.value;
      const name = registering ? form.elements.name.value.trim() : '';
      if (registering && !name) {
        showError('Enter a name for your demo account.');
        form.elements.name.focus();
        return;
      }
      if (registering && password.length < 8) {
        showError('Use a demo password with at least 8 characters.');
        form.elements.password.focus();
        return;
      }
      if (registering && email === demoAccount.email) {
        showError('That email belongs to the built-in demo account. Choose another email.');
        form.elements.email.focus();
        return;
      }

      const submission = { fieldset };
      pendingSubmission = submission;
      fieldset.disabled = true;
      error.hidden = true;
      try {
        let account;
        if (registering) {
          const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)));
          account = { name, email, salt, passwordHash: await hashDemoPassword(password, salt) };
        } else {
          account = await authenticate(email, password);
        }

        if (pendingSubmission !== submission || !dialog.open) return;
        if (!account) {
          showError('The email or password doesn’t match a demo account.');
          return;
        }

        if (registering) {
          const key = accountKey(email);
          if (localStorage.getItem(key) !== null) {
            showError('An account with this email is already saved in this browser.');
            return;
          }
          localStorage.setItem(key, JSON.stringify(account));
        }

        form.reset();
        setSignedIn(account);
        signOut.focus();
      } catch {
        if (pendingSubmission === submission && dialog.open) {
          const message = window.crypto?.subtle
            ? 'This browser couldn’t access the demo account. Check that this site can use browser storage.'
            : 'Open the site over HTTPS or on localhost to use a saved demo account.';
          showError(message);
        }
      } finally {
        if (pendingSubmission === submission) {
          fieldset.disabled = false;
          pendingSubmission = null;
          if (dialog.open && !error.hidden) {
            (registering ? form.elements.email : form.elements.password).focus();
          }
        }
      }
    }

    [loginForm, registrationForm].forEach((form) => {
      const password = form.elements.password;
      const toggle = form.querySelector('.demo-password-toggle');

      function setPasswordVisible(visible) {
        password.type = visible ? 'text' : 'password';
        toggle.textContent = visible ? 'Hide' : 'Show';
        toggle.setAttribute('aria-label', `${toggle.textContent} password`);
      }

      toggle.addEventListener('click', () => setPasswordVisible(password.type === 'password'));
      form.addEventListener('reset', () => setPasswordVisible(false));
      form.addEventListener('input', () => { error.hidden = true; });
      form.addEventListener('submit', submitAccount);
    });

    signOut.addEventListener('click', () => {
      setSignedIn(null);
      loginForm.elements.email.focus();
    });

    renderView(currentAccount ? 'account' : 'login');
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validatePhone(phone) {
    if (!phone) return true;
    const re = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone);
  }

  function showFieldError(input, message) {
    input.classList.add('is-invalid');
    const feedback = input.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.textContent = message;
    }
  }

  function clearFieldError(input) {
    input.classList.remove('is-invalid');
  }

  function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        showFieldError(field, 'This field is required');
        isValid = false;
      } else if (field.type === 'email' && !validateEmail(field.value.trim())) {
        showFieldError(field, 'Please enter a valid email address');
        isValid = false;
      } else if (field.type === 'tel' && field.value.trim() && !validatePhone(field.value.trim())) {
        showFieldError(field, 'Please enter a valid phone number');
        isValid = false;
      } else {
        clearFieldError(field);
      }
    });

    return isValid;
  }

  function setFormSubmitting(submitting) {
    state.formSubmitting = submitting;
    if (elements.submitBtn) {
      const btnText = elements.submitBtn.querySelector('.btn-text');
      const btnLoading = elements.submitBtn.querySelector('.btn-loading');
      elements.submitBtn.disabled = submitting;
      if (btnText) btnText.classList.toggle('d-none', submitting);
      if (btnLoading) btnLoading.classList.toggle('d-none', !submitting);
    }
  }

  function showFormMessage(success, message) {
    const successEl = elements.formSuccess;
    const errorEl = elements.formError;

    if (successEl) successEl.classList.add('d-none');
    if (errorEl) errorEl.classList.add('d-none');

    if (success && successEl) {
      successEl.querySelector('strong')?.remove();
      successEl.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${message}`;
      successEl.classList.remove('d-none');
    } else if (!success && errorEl) {
      errorEl.querySelector('strong')?.remove();
      errorEl.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i>${message}`;
      errorEl.classList.remove('d-none');
    }

    const target = success ? successEl : errorEl;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function initContactForm() {
    if (!elements.contactForm) return;

    elements.contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (state.formSubmitting) return;

      if (!validateForm(elements.contactForm)) {
        showFormMessage(false, 'Please fix the errors above and try again.');
        return;
      }

      setFormSubmitting(true);
      showFormMessage(true, 'Sending your message...');

      const formData = new FormData(elements.contactForm);
      const data = Object.fromEntries(formData.entries());

      try {
        await simulateFormSubmit(data);
        showFormMessage(true, 'Thank you! Your message has been sent. We\'ll get back to you within 24 hours.');
        elements.contactForm.reset();
      } catch (error) {
        showFormMessage(false, 'Something went wrong. Please try again or call us directly.');
      } finally {
        setFormSubmitting(false);
      }
    });

    elements.contactForm.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) {
          clearFieldError(field);
        }
      });

      field.addEventListener('blur', () => {
        if (field.hasAttribute('required') && !field.value.trim()) {
          showFieldError(field, 'This field is required');
        } else if (field.type === 'email' && field.value.trim() && !validateEmail(field.value.trim())) {
          showFieldError(field, 'Please enter a valid email address');
        } else if (field.type === 'tel' && field.value.trim() && !validatePhone(field.value.trim())) {
          showFieldError(field, 'Please enter a valid phone number');
        }
      });
    });
  }

  function simulateFormSubmit(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Form submitted:', data);
        resolve({ success: true });
      }, CONFIG.formSubmitDelay);
    });
  }

  function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast-custom');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast-custom toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <div class="toast-content">
        <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-info-circle-fill'}"></i>
        <span>${message}</span>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .toast-custom {
        position: fixed;
        bottom: 100px;
        right: 20px;
        z-index: 9999;
        animation: toastIn 0.3s ease-out;
      }
      .toast-custom.removing { animation: toastOut 0.3s ease-in forwards; }
      .toast-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 1.5rem;
        background: var(--color-secondary);
        color: var(--color-white);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-xl);
        font-weight: 500;
      }
      .toast-success .toast-content { background: var(--color-success); }
      .toast-info .toast-content { background: var(--color-primary); }
      .toast-error .toast-content { background: var(--color-danger); }
      @keyframes toastIn {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes toastOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
      }
      @media (max-width: 575.98px) {
        .toast-custom { bottom: 80px; right: 10px; left: 10px; }
      }
    `;

    if (!document.querySelector('#toast-styles')) {
      style.id = 'toast-styles';
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        img.loading = 'lazy';
      });
      return;
    }

    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.removeAttribute('loading');
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => imageObserver.observe(img));
  }

  function initParallaxEffect() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    let ticking = false;

    function updateParallax() {
      const scrolled = window.scrollY;
      const rate = scrolled * 0.3;
      heroBg.style.transform = `translateY(${rate}px)`;
      ticking = false;
    }

    function requestParallax() {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    window.addEventListener('scroll', requestParallax, { passive: true });
  }

  function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });
  }

  function initPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              console.log('LCP:', entry.startTime);
            }
            if (entry.entryType === 'first-input') {
              console.log('FID:', entry.processingStart - entry.startTime);
            }
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              console.log('CLS:', entry.value);
            }
          });
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        observer.observe({ type: 'first-input', buffered: true });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        // Performance observer not supported
      }
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      document.title = 'Come back! 🏍️ | Tujong Enterprises';
    } else {
      document.title = 'Tujong Enterprises | Premium Motorcycles & Services';
    }
  }

  function init() {
    cacheElements();
    setCurrentYear();
    initAOS();
    initHeroCarousel();
    initTestimonialCarousel();
    initCounterObserver();
    initWishlistButtons();
    initBikeCardInteractions();
    initNavbar();
    initSmoothScroll();
    initDemoLogin();
    initContactForm();
    initLazyLoading();
    initParallaxEffect();
    initKeyboardNavigation();
    initPerformanceObserver();

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    window.addEventListener('scroll', handleScrollTop, { passive: true });
    window.addEventListener('scroll', () => { }, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (elements.scrollTop) {
      elements.scrollTop.addEventListener('click', scrollToTop);
    }

    document.addEventListener('DOMContentLoaded', () => {
      document.body.classList.add('loaded');
    });

    console.log('Tujong Enterprises - Initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
