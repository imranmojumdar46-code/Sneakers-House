const db = require('../config/db');
exports.submit = (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) return res.status(400).json({ success: false, message: 'All fields are required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Invalid email format.' });
    if (message.length < 10) return res.status(400).json({ success: false, message: 'Message must be at least 10 characters.' });
    db.insert('contact_messages', { name, email, subject, message, is_read: 0, created_at: new Date().toISOString() });
    res.status(201).json({ success: true, message: 'Thank you! Your message has been sent.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed to send message.' }); }
};
exports.list = (req, res) => {
  if (!req.session.isAdmin) return res.status(403).json({ success: false, message: 'Admin only.' });
  res.json({ success: true, messages: db.getAll('contact_messages').sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)) });
};
