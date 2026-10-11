const db = require('../config/db');

// ---- Payment settings (bKash personal number; override with env vars if needed) ----
const BKASH_NUMBER = process.env.BKASH_NUMBER || '01611755093';
const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;
const TRX_RE = /^[A-Za-z0-9]{8,14}$/;
const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAY_STATUSES = ['awaiting_verification', 'paid', 'rejected', 'cod_pending'];

exports.paymentInfo = (req, res) => {
  res.json({ success: true, bkash_number: BKASH_NUMBER, methods: ['bkash', 'cod'] });
};

exports.checkout = (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ success: false, message: 'Please login to checkout.' });
    const { full_name, email, address, city, postal_code, phone } = req.body;
    if (!full_name || !email || !address || !city || !postal_code || !phone) return res.status(400).json({ success: false, message: 'All checkout fields are required.' });

    const payment_method = req.body.payment_method === 'cod' ? 'cod' : 'bkash';
    let bkash_number = '', bkash_trx_id = '';
    if (payment_method === 'bkash') {
      bkash_number = String(req.body.bkash_number || '').trim();
      bkash_trx_id = String(req.body.bkash_trx_id || '').trim().toUpperCase();
      if (!PHONE_RE.test(bkash_number)) return res.status(400).json({ success: false, message: 'Enter the bKash number you paid from (01XXXXXXXXX).' });
      if (!TRX_RE.test(bkash_trx_id)) return res.status(400).json({ success: false, message: 'Enter a valid bKash Transaction ID (TrxID).' });
      if (db.find('orders', o => o.bkash_trx_id === bkash_trx_id)) return res.status(400).json({ success: false, message: 'This bKash TrxID was already used for another order.' });
    }

    const cart = req.session.cart || [];
    if (!cart.length) return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    let total = 0; const items = [];
    for (const entry of cart) {
      const product = db.getById('products', entry.productId);
      if (!product || product.stock < entry.quantity) return res.status(400).json({ success: false, message: 'Insufficient stock for ' + (product?.name || 'item') + '.' });
      items.push({ product, quantity: entry.quantity, size: entry.size || '', price: product.price });
      total += product.price * entry.quantity;
    }
    const now = new Date().toISOString();
    const order = db.insert('orders', {
      user_id: req.session.userId, full_name, email, address, city, postal_code, phone,
      total_amount: total, status: 'pending',
      payment_method, payment_status: payment_method === 'bkash' ? 'awaiting_verification' : 'cod_pending',
      bkash_number, bkash_trx_id,
      created_at: now, updated_at: now
    });
    for (const item of items) {
      db.insert('order_items', { order_id: order.id, product_id: item.product.id, quantity: item.quantity, price: item.price, size: item.size });
      db.update('products', item.product.id, { stock: item.product.stock - item.quantity });
    }
    req.session.cart = [];
    res.status(201).json({
      success: true, message: 'Order placed successfully!', orderId: order.id,
      total, payment_method, payment_status: order.payment_status
    });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed to place order.' }); }
};

exports.myOrders = (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, message: 'Login required.' });
  const orders = db.filter('orders', o => o.user_id == req.session.userId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ success: true, orders });
};

exports.orderDetail = (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, message: 'Login required.' });
  const order = db.find('orders', o => o.id == req.params.id && (o.user_id == req.session.userId || req.session.isAdmin));
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  const items = db.filter('order_items', i => i.order_id == order.id).map(i => {
    const p = db.getById('products', i.product_id);
    return { ...i, name: p?.name || '', slug: p?.slug || '', image_url: p?.image_url || '' };
  });
  res.json({ success: true, order, items });
};

// ---- Admin: see every order live and verify bKash payments ----
exports.adminAll = (req, res) => {
  if (!req.session.isAdmin) return res.status(403).json({ success: false, message: 'Admin only.' });
  const orders = db.getAll('orders').slice().sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).map(o => ({
    ...o,
    items: db.filter('order_items', i => i.order_id == o.id).map(i => ({ ...i, name: db.getById('products', i.product_id)?.name || '' }))
  }));
  res.json({ success: true, orders });
};

exports.adminUpdate = (req, res) => {
  if (!req.session.isAdmin) return res.status(403).json({ success: false, message: 'Admin only.' });
  const updates = { updated_at: new Date().toISOString() };
  if (req.body.status) {
    if (!STATUSES.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid status.' });
    updates.status = req.body.status;
  }
  if (req.body.payment_status) {
    if (!PAY_STATUSES.includes(req.body.payment_status)) return res.status(400).json({ success: false, message: 'Invalid payment status.' });
    updates.payment_status = req.body.payment_status;
  }
  const updated = db.update('orders', req.params.id, updates);
  if (!updated) return res.status(404).json({ success: false, message: 'Order not found.' });
  res.json({ success: true, order: updated });
};
