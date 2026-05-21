// Mobile nav toggle
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });
}

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Quantity selector
const qtyInput = document.querySelector('.qty-input');
if (qtyInput) {
  document.querySelector('.qty-btn.minus')?.addEventListener('click', () => {
    const v = parseInt(qtyInput.value);
    if (v > 1) qtyInput.value = v - 1;
  });
  document.querySelector('.qty-btn.plus')?.addEventListener('click', () => {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  });
}

// Add to cart
const addCartBtn = document.querySelector('.add-to-cart');
if (addCartBtn) {
  addCartBtn.addEventListener('click', () => {
    const qty = qtyInput ? parseInt(qtyInput.value) : 1;
    showCartNotification(qty);
  });
}

function showCartNotification(qty) {
  let notif = document.querySelector('.cart-notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.className = 'cart-notification';
    notif.innerHTML = '<span class="cart-notification-icon">🛒</span> <span>' + qty + ' item' + (qty > 1 ? 's' : '') + ' added to cart!</span>';
    document.body.appendChild(notif);
  } else {
    notif.innerHTML = '<span class="cart-notification-icon">🛒</span> <span>' + qty + ' item' + (qty > 1 ? 's' : '') + ' added to cart!</span>';
  }
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 3200);
}

// Contact form
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const success = document.querySelector('.form-success');
    if (success) {
      success.style.display = 'block';
      contactForm.reset();
      setTimeout(() => { success.style.display = 'none'; }, 6000);
    }
  });
}

// Product thumbnail switcher
document.querySelectorAll('.thumb').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.thumb').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
  });
});

// Mark active nav link
const path = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === path || (path === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      if (mobileNav) mobileNav.classList.remove('open');
    }
  });
});
