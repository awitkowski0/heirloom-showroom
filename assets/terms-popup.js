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
  hideTermsPopup();
}

function declineTerms() {
  setCookie('terms_declined', 'true', 30);
  hideTermsPopup();
  window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', function() {
  const accepted = getCookie('terms_accepted');
  const declined = getCookie('terms_declined');
  
  if (!accepted && !declined) {
    showTermsPopup();
  }
});

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
});

const acceptBtn = document.getElementById('terms-accept');
const declineBtn = document.getElementById('terms-decline');

if (acceptBtn) {
  acceptBtn.addEventListener('click', acceptTerms);
}

if (declineBtn) {
  declineBtn.addEventListener('click', declineTerms);
}
