const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const { allProducts } = require('../data/productsData');

async function seedProductsIfEmpty(client) {
  const countResult = await client.query('SELECT COUNT(*)::int AS count FROM products');
  if (countResult.rows[0].count > 0) return 0;

  for (const product of allProducts) {
    await client.query(
      `INSERT INTO products
        (name, description, price, original_price, category, stock, featured, images, materials, sizes, colors, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb)`,
      [
        product.name,
        product.description || '',
        product.price,
        product.original_price || null,
        product.category,
        product.stock ?? 0,
        product.featured ?? false,
        JSON.stringify([`/uploads/products/${product.image}`]),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([product.brand, product.category].filter(Boolean)),
      ]
    );
  }

  return allProducts.length;
}

async function initDatabase() {
  let client;
  try {
    console.log('🔄 Initializing database...');
    client = await pool.connect();
    await client.query('BEGIN');

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);

    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS has_password BOOLEAN DEFAULT TRUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
      UPDATE users SET role = 'user' WHERE role IS NULL;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        otp_id VARCHAR(100) UNIQUE NOT NULL,
        code VARCHAR(8) NOT NULL,
        identifier VARCHAR(255) NOT NULL,
        method VARCHAR(10) NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_otp_codes_otp_id ON otp_codes(otp_id);
      CREATE INDEX IF NOT EXISTS idx_otp_codes_identifier ON otp_codes(identifier);
      CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
    `);

    const seededCount = await seedProductsIfEmpty(client);
    await client.query('COMMIT');
    console.log(`✅ Database initialized successfully${seededCount ? `; seeded ${seededCount} products` : ''}.`);
    console.log('📊 Tables: users, products, orders, reviews, otp_codes');
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }
    console.error('❌ Database initialization failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

initDatabase();
