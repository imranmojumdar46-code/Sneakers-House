const db = require('../config/db');
function enrich(p) {
  const cat = db.getById('categories', p.category_id);
  return { ...p, category_name: cat ? cat.name : '', category_slug: cat ? cat.slug : '' };
}
exports.getAll = (req, res) => {
  try {
    let products = db.getAll('products');
    if (req.query.category) {
      const cat = db.find('categories', c => c.slug === req.query.category);
      if (cat) products = products.filter(p => p.category_id === cat.id);
    }
    if (req.query.gender) products = products.filter(p => p.gender === req.query.gender);
    if (req.query.q) {
      const q = req.query.q.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.brand||'').toLowerCase().includes(q));
    }
    if (req.query.featured === '1') products = products.filter(p => p.is_featured);
    if (req.query.is_new === '1') products = products.filter(p => p.is_new);
    res.json({ success: true, products: products.map(enrich) });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed to fetch products.' }); }
};
exports.getOne = (req, res) => {
  try {
    const product = db.find('products', p => p.slug === req.params.slug || String(p.id) === req.params.slug);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const related = db.filter('products', p => p.category_id === product.category_id && p.id !== product.id).slice(0, 4).map(enrich);
    res.json({ success: true, product: enrich(product), related });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed to fetch product.' }); }
};
exports.getCategories = (req, res) => res.json({ success: true, categories: db.getAll('categories') });
exports.create = (req, res) => {
  if (!req.session.isAdmin) return res.status(403).json({ success: false, message: 'Admin only.' });
  const b = req.body;
  if (!b.name || !b.slug || !b.description || !b.price || !b.category_id) return res.status(400).json({ success: false, message: 'Missing required fields.' });
  const product = db.insert('products', { category_id: Number(b.category_id), name: b.name, slug: b.slug, description: b.description, price: Number(b.price), stock: Number(b.stock)||0, image_url: b.image_url||'', gender: b.gender||'unisex', brand: b.brand||'STRIDE', color: b.color||'', is_featured: b.is_featured?1:0, is_new: b.is_new?1:0, created_at: new Date().toISOString() });
  res.status(201).json({ success: true, id: product.id, message: 'Product created.' });
};
exports.update = (req, res) => {
  if (!req.session.isAdmin) return res.status(403).json({ success: false, message: 'Admin only.' });
  const updated = db.update('products', req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Not found.' });
  res.json({ success: true, message: 'Product updated.' });
};
exports.remove = (req, res) => {
  if (!req.session.isAdmin) return res.status(403).json({ success: false, message: 'Admin only.' });
  db.remove('products', req.params.id);
  res.json({ success: true, message: 'Product deleted.' });
};
