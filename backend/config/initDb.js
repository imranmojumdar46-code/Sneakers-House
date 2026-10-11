/**
 * Resets the database to the demo data (no native modules needed).
 * Usage: npm run init-db
 */
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '../../database/db.json');
if (fs.existsSync(target)) {
  fs.unlinkSync(target);
  console.log('Removed existing database.');
}

// Requiring db.js recreates db.json with the demo users and products
const db = require('./db');

console.log('Database initialized successfully!');
console.log('Demo accounts:');
console.log('  Admin → username: admin  | password: admin1234');
console.log('  User  → username: demo   | password: demo1234');
console.log('DB path:', db.path);
