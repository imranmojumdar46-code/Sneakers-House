/* Sneakers House — Client-side JS */

const API = '/api';

// ---------- Site contact settings ----------
const SITE = {
  phone: '01611755093',            // bKash / call number
  whatsapp: '8801611755093',       // international format for wa.me
  email: 'emranmojumder22@gmail.com'
};

function isMobile() { return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent); }

function whatsappLink(text) {
  return `https://wa.me/${SITE.whatsapp}` + (text ? `?text=${encodeURIComponent(text)}` : '');
}

function gmailLink(subject, body) {
  const s = encodeURIComponent(subject || 'Sneakers House inquiry');
  const b = encodeURIComponent(body || '');
  // Mobile: mailto opens the Gmail app. Desktop: open Gmail compose in the browser.
  return isMobile()
    ? `mailto:${SITE.email}?subject=${s}&body=${b}`
    : `https://mail.google.com/mail/?view=cm&fs=1&to=${SITE.email}&su=${s}&body=${b}`;
}

function initContactButtons() {
  // Footer / any element with these classes becomes a direct link
  document.querySelectorAll('.js-whatsapp').forEach(a => { a.href = whatsappLink('Hello Sneakers House, I want to know about your sneakers.'); a.target = '_blank'; a.rel = 'noopener'; });
  document.querySelectorAll('.js-gmail').forEach(a => { a.href = gmailLink('Sneakers House inquiry', 'Hello Sneakers House,\n\n'); a.target = '_blank'; a.rel = 'noopener'; });
  document.querySelectorAll('.js-call').forEach(a => { a.href = `tel:+88${SITE.phone}`; });

  // Floating buttons on every page
  if (!document.getElementById('floatContact')) {
    const box = document.createElement('div');
    box.id = 'floatContact';
    box.innerHTML = `
      <a class="fc-btn fc-wa" href="${whatsappLink('Hello Sneakers House, I want to know about your sneakers.')}" target="_blank" rel="noopener" title="Chat on WhatsApp" aria-label="WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.2A8.5 8.5 0 1 1 21 11.5z"/></svg>
      </a>
      <a class="fc-btn fc-mail" href="${gmailLink('Sneakers House inquiry', 'Hello Sneakers House,\n\n')}" target="_blank" rel="noopener" title="Email us on Gmail" aria-label="Gmail">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
      </a>`;
    document.body.appendChild(box);
  }
}

// ---------- Auth helpers ----------
async function getMe() {
  try {
    const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
    return await res.json();
  } catch {
    return { authenticated: false };
  }
}

async function updateHeaderAuth() {
  const data = await getMe();
  const actions = document.getElementById('headerActions');
  if (!actions) return;

  // Cart badge
  try {
    const cartRes = await fetch(`${API}/cart`, { credentials: 'include' });
    const cart = await cartRes.json();
    const badge = document.getElementById('cartBadge');
    if (badge) {
      if (cart.count > 0) {
        badge.textContent = cart.count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch {}

  if (data.authenticated && data.user) {
    const name = data.user.first_name || data.user.username;
    actions.innerHTML = `
      <a href="/cart.html" class="icon-btn" title="Cart">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span class="cart-badge" id="cartBadge" style="display:none"></span>
      </a>
      <div class="user-menu">
        <button class="user-btn" id="userBtn">${name} ▾</button>
        <div class="user-dropdown" id="userDropdown">
          <a href="/profile.html">My Profile</a>
          <a href="#" id="logoutBtn">Logout</a>
        </div>
      </div>
    `;
    // Re-fetch cart badge
    try {
      const cartRes = await fetch(`${API}/cart`, { credentials: 'include' });
      const cart = await cartRes.json();
      const badge = document.getElementById('cartBadge');
      if (badge && cart.count > 0) {
        badge.textContent = cart.count;
        badge.style.display = 'flex';
      }
    } catch {}

    document.getElementById('userBtn')?.addEventListener('click', () => {
      document.getElementById('userDropdown')?.classList.toggle('open');
    });
    document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
      window.location.href = '/';
    });
  } else {
    actions.innerHTML = `
      <a href="/cart.html" class="icon-btn" title="Cart">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span class="cart-badge" id="cartBadge" style="display:none"></span>
      </a>
      <a href="/login.html" class="btn btn-outline btn-sm">Login</a>
      <a href="/register.html" class="btn btn-primary btn-sm">Sign Up</a>
    `;
    try {
      const cartRes = await fetch(`${API}/cart`, { credentials: 'include' });
      const cart = await cartRes.json();
      const badge = document.getElementById('cartBadge');
      if (badge && cart.count > 0) {
        badge.textContent = cart.count;
        badge.style.display = 'flex';
      }
    } catch {}
  }
}

// ---------- Nav toggle ----------
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
  }
  updateHeaderAuth();
  initContactButtons();
});

// ---------- Toast / Alert helper ----------
function showAlert(message, type = 'success') {
  let container = document.querySelector('.messages-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'messages-container';
    document.body.insertBefore(container, document.querySelector('main'));
  }
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `${message}<button class="alert-close" onclick="this.parentElement.remove()">&times;</button>`;
  container.appendChild(alert);
  setTimeout(() => alert.remove(), 5000);
}

// ---------- Format price ----------
function formatPrice(price) {
  return '৳' + Number(price).toLocaleString('en-BD', { minimumFractionDigits: 0 });
}

// ---------- Form validation helpers ----------
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setFieldError(input, msg) {
  const group = input.closest('.form-group') || input.parentElement;
  let err = group.querySelector('.field-error');
  if (!err) {
    err = document.createElement('span');
    err.className = 'field-error';
    group.appendChild(err);
  }
  err.textContent = msg;
  input.classList.add('invalid');
}

function clearFieldError(input) {
  const group = input.closest('.form-group') || input.parentElement;
  const err = group.querySelector('.field-error');
  if (err) err.remove();
  input.classList.remove('invalid');
}


// ---------- Google Sign-In ----------
async function initGoogleButton(containerId) {
  const box = document.getElementById(containerId);
  if (!box) return;
  let clientId = '';
  try { clientId = (await (await fetch(`${API}/auth/config`)).json()).googleClientId; } catch {}
  if (!clientId) { box.style.display = 'none'; return; } // hidden until GOOGLE_CLIENT_ID is set
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true;
  s.onload = () => {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp) => {
        const res = await fetch(`${API}/auth/google`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ credential: resp.credential })
        });
        const data = await res.json();
        showAlert(data.message, data.success ? 'success' : 'error');
        if (data.success) setTimeout(() => { window.location.href = '/'; }, 700);
      }
    });
    google.accounts.id.renderButton(box.querySelector('.g-slot'), { theme: 'outline', size: 'large', text: 'continue_with', width: 320 });
  };
  document.head.appendChild(s);
}

// ---------- Open the bKash app ----------
function openBkashApp() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) {
    // Opens the bKash app if installed, otherwise the Play Store page
    window.location.href = 'intent://#Intent;scheme=bkash;package=com.bKash.customerapp;S.browser_fallback_url=' +
      encodeURIComponent('https://play.google.com/store/apps/details?id=com.bKash.customerapp') + ';end';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    window.location.href = 'bkash://';
    setTimeout(() => { if (!document.hidden) window.location.href = 'https://www.bkash.com/'; }, 1500);
  } else {
    showAlert('Open the bKash app on your phone and use Send Money to ' + SITE.phone, 'success');
  }
}
