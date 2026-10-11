const db = require('../config/db');
function getCartItems(sessionCart) {
  if (!sessionCart || !sessionCart.length) return [];
  return sessionCart.map(entry => {
    const product = db.getById('products', entry.productId);
    if (!product) return null;
    return { productId: product.id, name: product.name, slug: product.slug, price: product.price, image_url: product.image_url, stock: product.stock, quantity: entry.quantity, size: entry.size||'', subtotal: product.price * entry.quantity };
  }).filter(Boolean);
}
exports.getCart = (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  const items = getCartItems(req.session.cart);
  res.json({ success: true, items, total: items.reduce((s,i)=>s+i.subtotal,0), count: items.reduce((s,i)=>s+i.quantity,0) });
};
exports.addToCart = (req, res) => {
  try {
    const { productId, quantity = 1, size = '' } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required.' });
    const product = db.getById('products', productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.stock < 1) return res.status(400).json({ success: false, message: 'Product is out of stock.' });
    if (!req.session.cart) req.session.cart = [];
    const existing = req.session.cart.find(i => i.productId == productId && i.size === size);
    if (existing) existing.quantity += Number(quantity);
    else req.session.cart.push({ productId: Number(productId), quantity: Number(quantity), size });
    const items = getCartItems(req.session.cart);
    res.json({ success: true, message: 'Added to cart!', count: items.reduce((s,i)=>s+i.quantity,0) });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed to add to cart.' }); }
};
exports.updateCart = (req, res) => {
  const { productId, quantity, size = '' } = req.body;
  if (!req.session.cart) req.session.cart = [];
  const idx = req.session.cart.findIndex(i => i.productId == productId && i.size === size);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Item not in cart.' });
  if (Number(quantity) <= 0) req.session.cart.splice(idx, 1);
  else req.session.cart[idx].quantity = Number(quantity);
  const items = getCartItems(req.session.cart);
  res.json({ success: true, items, total: items.reduce((s,i)=>s+i.subtotal,0), count: items.reduce((s,i)=>s+i.quantity,0) });
};
exports.removeFromCart = (req, res) => {
  const size = req.query.size || '';
  if (!req.session.cart) req.session.cart = [];
  req.session.cart = req.session.cart.filter(i => !(i.productId == req.params.productId && i.size === size));
  const items = getCartItems(req.session.cart);
  res.json({ success: true, items, total: items.reduce((s,i)=>s+i.subtotal,0), count: items.reduce((s,i)=>s+i.quantity,0), message: 'Item removed.' });
};
exports.clearCart = (req, res) => { req.session.cart = []; res.json({ success: true, message: 'Cart cleared.' }); };
