-- Sneakers House Database Schema (MySQL / SQLite compatible)
-- For MySQL: create database sneakers_house; USE sneakers_house;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(150) NOT NULL UNIQUE,
  email VARCHAR(254) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(150) DEFAULT '',
  last_name VARCHAR(150) DEFAULT '',
  is_admin INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  phone VARCHAR(20) DEFAULT '',
  address TEXT DEFAULT '',
  city VARCHAR(100) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT ''
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url VARCHAR(500) DEFAULT '',
  gender VARCHAR(10) DEFAULT 'unisex',
  brand VARCHAR(100) DEFAULT 'STRIDE',
  color VARCHAR(50) DEFAULT '',
  is_featured INTEGER DEFAULT 0,
  is_new INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  size VARCHAR(10) DEFAULT '',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Seed Categories
INSERT INTO categories (name, slug, description) VALUES
('Lifestyle', 'lifestyle', 'Everyday casual sneakers for street style'),
('Running', 'running', 'Performance running shoes for athletes'),
('Basketball', 'basketball', 'Court-ready basketball sneakers'),
('Training', 'training', 'Cross-training and gym footwear');

-- Seed Products (prices in BDT ৳)
INSERT INTO products (category_id, name, slug, description, price, stock, image_url, gender, brand, color, is_featured, is_new) VALUES
(1, 'Air Flex Max', 'air-flex-max', 'Ultra-comfortable lifestyle sneaker with responsive cushioning and breathable mesh upper. Perfect for all-day wear.', 20790.00, 45, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', 'unisex', 'STRIDE', 'Red/White', 1, 1),
(1, 'Urban Classic Low', 'urban-classic-low', 'Timeless low-top design with premium leather and rubber outsole. Clean silhouette for everyday style.', 12490.00, 60, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80', 'unisex', 'STRIDE', 'White', 1, 0),
(2, 'Velocity Runner Pro', 'velocity-runner-pro', 'Lightweight racing flat with carbon plate energy return. Built for speed and long-distance comfort.', 18990.00, 30, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80', 'men', 'STRIDE', 'Black/Neon', 1, 1),
(1, 'Cloud Walker', 'cloud-walker', 'Plush foam midsole and soft knit upper for cloud-like steps. Ideal for walking and casual outings.', 9990.00, 80, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80', 'women', 'STRIDE', 'Pink/Grey', 1, 0),
(3, 'Court Dominator', 'court-dominator', 'High-top basketball shoe with ankle support and sticky rubber sole for superior traction on the court.', 15990.00, 25, 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80', 'men', 'STRIDE', 'Black/Gold', 1, 0),
(2, 'Trail Blazer X', 'trail-blazer-x', 'Rugged trail running shoe with aggressive lugs and waterproof membrane for off-road adventures.', 17490.00, 35, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80', 'unisex', 'STRIDE', 'Olive/Black', 0, 1),
(4, 'Power Lift Trainer', 'power-lift-trainer', 'Stable training shoe with wide base and firm midsole for weightlifting and HIIT sessions.', 11490.00, 40, 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80', 'unisex', 'STRIDE', 'Grey/Orange', 0, 0),
(1, 'Retro Runner 90s', 'retro-runner-90s', 'Throwback 90s silhouette reimagined with modern materials and improved cushioning.', 13490.00, 50, 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=80', 'unisex', 'STRIDE', 'Blue/White', 1, 0),
(1, 'Minimalist Slip-On', 'minimalist-slip-on', 'Easy slip-on design with stretch fabric and soft footbed. Zero fuss, maximum comfort.', 8490.00, 70, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80', 'women', 'STRIDE', 'Beige', 0, 1),
(3, 'Sky High Dunk', 'sky-high-dunk', 'Elevated platform dunk-style sneaker with bold color blocking and durable construction.', 14990.00, 20, 'https://images.unsplash.com/photo-1605348532760-6753d2c43380?auto=format&fit=crop&w=800&q=80', 'unisex', 'STRIDE', 'Multi', 1, 1),
(2, 'Endurance Elite', 'endurance-elite', 'Marathon-ready shoe with dual-density foam and engineered mesh for breathability on long runs.', 19990.00, 28, 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80', 'men', 'STRIDE', 'Navy/Red', 0, 0),
(1, 'Kids Sparkle Glide', 'kids-sparkle-glide', 'Fun and colorful kids sneaker with easy velcro straps and soft cushioning for growing feet.', 6990.00, 55, 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80', 'kids', 'STRIDE', 'Rainbow', 0, 1);

-- Demo users (password hashes for: admin1234 and demo1234)
-- admin1234 bcrypt: $2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQbPvJqKzqKzqKzqKzqKzqKzqKzqKz (will be set by init script)
-- demo1234 will be set by init script
