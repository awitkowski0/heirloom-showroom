function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function showTermsPopup() {
  const overlay = document.getElementById('terms-popup-overlay');
  const enabled = overlay?.dataset.enabled === 'true';
  
  if (!enabled) return;
  if (!overlay) return;
  
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideTermsPopup() {
  const overlay = document.getElementById('terms-popup-overlay');
  if (!overlay) return;
  
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function acceptTerms() {
  setCookie('terms_accepted', 'true', 365);
  document.cookie = 'terms_declined=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  hideTermsPopup();
}

function declineTerms() {
  setCookie('terms_declined', 'true', 30);
  document.cookie = 'terms_accepted=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  hideTermsPopup();
  showDeclinedMessage();
}

function showDeclinedMessage() {
  const message = document.createElement('div');
  message.id = 'terms-declined-message';
  message.className = 'terms-declined-message';
  message.innerHTML = `
    <p>You must accept our terms and conditions to make purchases.</p>
    <button onclick="this.parentElement.remove(); showTermsPopup();">Accept Terms</button>
  `;
  document.body.appendChild(message);
}

function checkTermsAccepted() {
  const declined = getCookie('terms_declined');
  return !declined;
}

document.addEventListener('DOMContentLoaded', function() {
  const accepted = getCookie('terms_accepted');
  const declined = getCookie('terms_declined');
  
  if (!accepted && !declined) {
    showTermsPopup();
  }
  
  if (declined) {
    blockAddToCart();
  }
});

function blockAddToCart() {
  document.body.classList.add('terms-declined');
  
  const cartForms = document.querySelectorAll('form[action*="/cart/add"], [data-shopify-edit-product], [data-product-form]');
  
  cartForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showDeclinedMessage();
      return false;
    });
  });
  
  const addToCartButtons = document.querySelectorAll('[name="add"], [data-shopify-buy-button]');
  addToCartButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (!checkTermsAccepted()) {
        e.preventDefault();
        showDeclinedMessage();
        return false;
      }
    });
  });
  
  const buyButtons = document.querySelectorAll('.shopify-payment-button__button');
  buyButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (!checkTermsAccepted()) {
        e.preventDefault();
        showDeclinedMessage();
        return false;
      }
    });
  });
}

document.addEventListener('shopify:section:load', function(event) {
  const overlay = document.getElementById('terms-popup-overlay');
  if (!overlay) return;
  
  const accepted = getCookie('terms_accepted');
  const declined = getCookie('terms_declined');
  const enabled = overlay.dataset.enabled === 'true';
  
  if (!enabled) return;
  
  if (!accepted && !declined) {
    showTermsPopup();
  }
  
  if (declined) {
    blockAddToCart();
  }
});

const acceptBtn = document.getElementById('terms-accept');
const declineBtn = document.getElementById('terms-decline');

if (acceptBtn) {
  acceptBtn.addEventListener('click', acceptTerms);
}

if (declineBtn) {
  declineBtn.addEventListener('click', declineTerms);
}
