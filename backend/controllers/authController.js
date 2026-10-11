const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.register = (req, res) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email and password are required.' });
    }
    if (username.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }
    const existing = db.find('users', u => u.username === username || u.email === email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username or email already exists.' });
    }
    const hash = bcrypt.hashSync(password, 10);
    const user = db.insert('users', {
      username, email, password: hash,
      first_name: first_name || '', last_name: last_name || '',
      is_admin: 0, created_at: new Date().toISOString()
    });
    db.insert('profiles', { user_id: user.id, phone: '', address: '', city: '', created_at: new Date().toISOString() });
    req.session.userId = user.id;
    req.session.username = username;
    req.session.isAdmin = false;
    req.session.email = email;
    req.session.firstName = first_name || '';
    res.status(201).json({
      success: true,
      message: 'Welcome to Sneakers House, ' + (first_name || username) + '!',
      user: { id: user.id, username, email, first_name: first_name || '' }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

exports.login = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    const user = db.find('users', u => u.username === username || u.email === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.isAdmin = !!user.is_admin;
    req.session.email = user.email;
    req.session.firstName = user.first_name || '';
    res.json({
      success: true,
      message: 'Welcome back, ' + (user.first_name || user.username) + '!',
      user: { id: user.id, username: user.username, email: user.email, first_name: user.first_name, isAdmin: !!user.is_admin }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

exports.logout = (req, res) => {
  req.session = null; // clears the cookie session
  res.json({ success: true, message: 'You have been logged out.' });
};

exports.me = (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false, authenticated: false });
  }
  const user = db.getById('users', req.session.userId);
  if (!user) {
    // Serverless hosts can restart with a fresh data file; keep the login alive from the signed cookie.
    return res.json({
      success: true, authenticated: true,
      user: { id: req.session.userId, username: req.session.username, email: req.session.email || '',
              first_name: req.session.firstName || '', last_name: '', isAdmin: !!req.session.isAdmin }
    });
  }
  res.json({
    success: true,
    authenticated: true,
    user: {
      id: user.id, username: user.username, email: user.email,
      first_name: user.first_name, last_name: user.last_name, isAdmin: !!user.is_admin
    }
  });
};

// ---- Google Sign-In (Google Identity Services ID token) ----
exports.config = (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || '' });
};

exports.googleLogin = async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(503).json({ success: false, message: 'Google login is not set up yet.' });
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'Missing Google credential.' });

    // Google verifies the token signature for us
    const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential));
    const g = await r.json();
    if (!r.ok || g.aud !== clientId || !(g.email_verified === true || g.email_verified === 'true')) {
      return res.status(401).json({ success: false, message: 'Google sign-in could not be verified.' });
    }

    const email = String(g.email).toLowerCase();
    let user = db.find('users', u => (u.email || '').toLowerCase() === email);
    if (!user) {
      let base = email.split('@')[0].replace(/[^a-z0-9_.-]/gi, '').slice(0, 20) || 'user';
      let username = base, n = 1;
      while (db.find('users', u => u.username === username)) username = base + (++n);
      user = db.insert('users', {
        username, email, password: bcrypt.hashSync(require('crypto').randomBytes(24).toString('hex'), 10),
        first_name: g.given_name || '', last_name: g.family_name || '',
        is_admin: 0, created_at: new Date().toISOString()
      });
      db.insert('profiles', { user_id: user.id, phone: '', address: '', city: '', created_at: new Date().toISOString() });
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.isAdmin = !!user.is_admin;
    req.session.email = user.email;
    req.session.firstName = user.first_name || '';
    res.json({ success: true, message: 'Welcome, ' + (user.first_name || user.username) + '!' });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ success: false, message: 'Google login failed.' });
  }
};
