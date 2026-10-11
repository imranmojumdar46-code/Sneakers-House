const db = require('../config/db');
exports.getProfile = (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, message: 'Login required.' });
  const user = db.getById('users', req.session.userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  const profile = db.find('profiles', p => p.user_id == user.id) || {};
  res.json({ success: true, profile: { id: user.id, username: user.username, email: user.email, first_name: user.first_name, last_name: user.last_name, created_at: user.created_at, phone: profile.phone||'', address: profile.address||'', city: profile.city||'' } });
};
exports.updateProfile = (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, message: 'Login required.' });
  const { first_name, last_name, phone, address, city } = req.body;
  db.update('users', req.session.userId, { first_name: first_name||'', last_name: last_name||'' });
  const existing = db.find('profiles', p => p.user_id == req.session.userId);
  if (existing) db.update('profiles', existing.id, { phone: phone||'', address: address||'', city: city||'' });
  else db.insert('profiles', { user_id: req.session.userId, phone: phone||'', address: address||'', city: city||'', created_at: new Date().toISOString() });
  res.json({ success: true, message: 'Profile updated successfully.' });
};
