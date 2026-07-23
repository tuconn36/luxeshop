const pool = require('../config/database');

async function createWishlistTable() {
  try {
    console.log('Creating wishlist table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);
    `);

    console.log('✅ Successfully created wishlist table and indexes');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating wishlist table:', error);
    process.exit(1);
  }
}

createWishlistTable();
