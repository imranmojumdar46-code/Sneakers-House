const express = require('express');
const cookieSession = require('cookie-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL || !!process.env.NETLIFY || !!process.env.RENDER;

// Render / Vercel / Netlify all sit behind a proxy (HTTPS is terminated before Express)
app.set('trust proxy', 1);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Stateless cookie sessions: works on serverless hosts (Vercel/Netlify) where
// in-memory sessions are lost between requests.
app.use(cookieSession({
  name: 'sh_session',
  keys: [process.env.SESSION_SECRET || 'sneakers-house-secret-key-change-in-production'],
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  httpOnly: true,
  sameSite: 'lax',
  secure: isProd
}));

// Static frontend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/js', express.static(path.join(frontendPath, 'js')));
app.use('/images', express.static(path.join(frontendPath, 'images')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/profile', require('./routes/profile'));

// SPA-style fallback for HTML pages
const pages = [
  'index', 'about', 'contact', 'login', 'register',
  'products', 'product_detail', 'cart', 'checkout',
  'profile', 'order_detail', 'order_success'
];
pages.forEach(page => {
  app.get(`/${page === 'index' ? '' : page}`, (req, res) => {
    const file = page === 'index' ? 'index.html' : `${page}.html`;
    res.sendFile(path.join(frontendPath, file));
  });
  app.get(`/${page}.html`, (req, res) => {
    res.sendFile(path.join(frontendPath, `${page}.html`));
  });
});

// Product detail with slug
app.get('/product/:slug', (req, res) => {
  res.sendFile(path.join(frontendPath, 'product_detail.html'));
});

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Sneakers House' });
});

// Unknown API route -> JSON 404 (instead of returning the home page HTML)
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

// 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(frontendPath, 'index.html'));
});

// Local / Render / any normal Node host: start the server.
// Vercel & Netlify import this file as a function instead, so we only listen when run directly.
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n👟 Sneakers House is running!`);
    console.log(`   → http://localhost:${PORT}`);
    console.log(`   → API: http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app;
