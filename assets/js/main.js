/**
 * AquaVanguard - Water Tanker Supply Service
 * Main Application Logic & Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme (Light / Dark)
  initTheme();

  // 2. Initialize RTL Direction
  initRTL();

  // 3. Initialize Sticky Navigation & Mobile Menu
  initNavigation();

  // 4. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 5. Initialize AOS Animations
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      offset: 60
    });
  }

  // 6. Initialize Animated Counters
  initCounters();

  // 7. Initialize FAQ Accordions
  initFaqAccordions();

  // 8. Initialize Forms & Toast System
  initInteractiveForms();

  // 9. Initialize Interactive Pincode Checker if present
  initPincodeChecker();

  // 10. Initialize Calculator if present
  initPricingCalculator();
});

/* -------------------------------------------------------------------------
 * Theme Management (Light / Dark)
 * ------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const savedTheme = localStorage.getItem('aquavanguard_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  applyTheme(savedTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      const newTheme = isDark ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('aquavanguard_theme', newTheme);
    });
  });
}

function applyTheme(theme) {
  const moonIcons = document.querySelectorAll('.theme-moon-icon');
  const sunIcons = document.querySelectorAll('.theme-sun-icon');

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    moonIcons.forEach(el => el.classList.add('hidden'));
    sunIcons.forEach(el => el.classList.remove('hidden'));
  } else {
    document.documentElement.classList.remove('dark');
    moonIcons.forEach(el => el.classList.remove('hidden'));
    sunIcons.forEach(el => el.classList.add('hidden'));
  }
}

/* -------------------------------------------------------------------------
 * RTL Direction Management
 * ------------------------------------------------------------------------- */
function initRTL() {
  const rtlToggleBtns = document.querySelectorAll('.rtl-toggle-btn');
  const savedDir = localStorage.getItem('aquavanguard_dir') || 'ltr';

  applyDirection(savedDir);

  rtlToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      applyDirection(newDir);
      localStorage.setItem('aquavanguard_dir', newDir);
    });
  });
}

function applyDirection(dir) {
  document.documentElement.setAttribute('dir', dir);
  const rtlBadges = document.querySelectorAll('.rtl-status-badge');
  rtlBadges.forEach(badge => {
    badge.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
  });
  const rtlBtns = document.querySelectorAll('.rtl-toggle-btn');
  rtlBtns.forEach(btn => {
    btn.setAttribute('title', dir === 'rtl' ? 'Switch to LTR Direction' : 'Switch to RTL Direction');
  });
}

/* -------------------------------------------------------------------------
 * Navigation & Header
 * ------------------------------------------------------------------------- */
function initNavigation() {
  const navbar = document.getElementById('main-header');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');

  // Sticky header background change on scroll
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('shadow-lg', 'bg-white/95', 'dark:bg-slate-950/95', 'backdrop-blur-md', 'py-3');
        navbar.classList.remove('py-5', 'bg-transparent');
      } else {
        navbar.classList.remove('shadow-lg', 'bg-white/95', 'dark:bg-slate-950/95', 'backdrop-blur-md', 'py-3');
        navbar.classList.add('py-5', 'bg-transparent');
      }
    });
  }

  // Mobile Menu Toggle
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('translate-x-full', '-translate-x-full', 'hidden');
    });
  }

  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener('click', () => {
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      mobileMenu.classList.add(isRtl ? 'translate-x-full' : '-translate-x-full');
      setTimeout(() => mobileMenu.classList.add('hidden'), 300);
    });
  }
}

/* -------------------------------------------------------------------------
 * Counter Statistics
 * ------------------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('.counter-val');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute('data-target');
        const duration = 2000;
        const step = Math.max(1, Math.floor(target / (duration / 20)));
        let current = 0;

        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            counter.textContent = target.toLocaleString();
            clearInterval(timer);
          } else {
            counter.textContent = current.toLocaleString();
          }
        }, 20);

        obs.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

/* -------------------------------------------------------------------------
 * FAQ Accordion
 * ------------------------------------------------------------------------- */
function initFaqAccordions() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (header && content) {
      header.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');
        
        // Close other items in the same container
        const parent = item.parentElement;
        parent.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
        parent.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotate-180'));

        if (!isOpen) {
          content.classList.remove('hidden');
          if (icon) icon.classList.add('rotate-180');
        }
      });
    }
  });
}

/* -------------------------------------------------------------------------
 * Interactive Form Submissions & Custom Toast
 * ------------------------------------------------------------------------- */
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const isDark = document.documentElement.classList.contains('dark');
  const bgClass = type === 'success' 
    ? 'bg-emerald-600 text-white' 
    : 'bg-rose-600 text-white';

  toast.className = `${bgClass} shadow-xl rounded-xl p-4 text-sm font-medium flex items-center gap-3 transition-all transform duration-300 translate-y-4 opacity-0 pointer-events-auto`;
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      ${type === 'success' 
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />' 
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />'}
    </svg>
    <div class="flex-1">${message}</div>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function initInteractiveForms() {
  // Quick booking form (e.g. Hero section)
  const quickBookingForms = document.querySelectorAll('.quick-booking-form');
  quickBookingForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const location = form.querySelector('[name="location"]')?.value || 'Your Area';
      const quantity = form.querySelector('[name="quantity"]')?.value || '5,000L';
      const date = form.querySelector('[name="date"]')?.value || 'Today';

      // Store in session storage so dashboard or booking page can pick it up
      sessionStorage.setItem('pending_booking', JSON.stringify({
        location, quantity, date, timestamp: new Date().toISOString()
      }));

      showToast(`Success! Tanker dispatch request for ${quantity} at ${location} registered. Redirecting to Customer Dashboard...`, 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html#book';
      }, 1500);
    });
  });

  // Contact form
  const contactForms = document.querySelectorAll('.contact-inquiry-form');
  contactForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const origText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending Dispatch Request...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = origText;
        submitBtn.disabled = false;
        form.reset();
        showToast('Thank you! Your water delivery enquiry has been assigned to our central dispatch unit. We will call you within 15 minutes.', 'success');
      }, 1000);
    });
  });

  // Newsletter form
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.reset();
      showToast('Thank you for subscribing to AquaVanguard Priority Delivery alerts!', 'success');
    });
  });
}

/* -------------------------------------------------------------------------
 * Pincode / Location Checker
 * ------------------------------------------------------------------------- */
function initPincodeChecker() {
  const checkerForm = document.getElementById('pincode-checker-form');
  const resultDiv = document.getElementById('pincode-check-result');
  if (!checkerForm || !resultDiv) return;

  checkerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('pincode-input');
    const val = input.value.trim();
    if (!val) return;

    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
      <div class="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="font-bold text-base">Direct Water Supply Available in "${val}"!</p>
          <p class="text-xs text-slate-600 dark:text-slate-300">Average tanker dispatch response time: <strong>45 - 60 minutes</strong>. 8 tankers active in this radius.</p>
        </div>
        <a href="dashboard.html#book" class="ml-auto inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition">
          Book Tanker Now
        </a>
      </div>
    `;
  });
}

/* -------------------------------------------------------------------------
 * Pricing & Quote Calculator
 * ------------------------------------------------------------------------- */
function initPricingCalculator() {
  const calcForm = document.getElementById('rate-calculator-form');
  if (!calcForm) return;

  const capacitySelect = document.getElementById('calc-capacity');
  const typeSelect = document.getElementById('calc-water-type');
  const distanceInput = document.getElementById('calc-distance');
  const priceDisplay = document.getElementById('calc-total-price');

  const calculate = () => {
    if (!capacitySelect || !typeSelect || !priceDisplay) return;
    const capacity = parseInt(capacitySelect.value) || 5000;
    const typeRateMultiplier = parseFloat(typeSelect.value) || 1.0;
    const distance = parseInt(distanceInput ? distanceInput.value : 5) || 5;

    // Base calculation:
    // 1000L = $35 base
    // 2000L = $55 base
    // 5000L = $95 base
    // 10000L = $160 base
    // 12000L = $195 base
    // 20000L = $290 base
    let basePrice = 35;
    if (capacity === 2000) basePrice = 55;
    else if (capacity === 5000) basePrice = 95;
    else if (capacity === 10000) basePrice = 160;
    else if (capacity === 12000) basePrice = 195;
    else if (capacity === 20000) basePrice = 290;

    const distanceFee = Math.max(0, (distance - 5) * 2.5);
    const total = Math.round((basePrice * typeRateMultiplier) + distanceFee);

    priceDisplay.textContent = `$${total}`;
  };

  if (capacitySelect) capacitySelect.addEventListener('change', calculate);
  if (typeSelect) typeSelect.addEventListener('change', calculate);
  if (distanceInput) distanceInput.addEventListener('input', calculate);

  calculate();
}

