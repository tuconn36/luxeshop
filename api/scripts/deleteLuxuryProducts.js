require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'luxe_jewelry',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || '1')
});

async function deleteLuxury() {
  // Xoa nuoc hoa va san pham luxury
  const luxuryNames = [
    "Nước Hoa Dior Sauvage",
    "Nước Hoa Chanel",
    "Nước Hoa Hermès",
    "Túi Chanel Classic",
    "Túi Saddle Dior",
    "Túi Hermès Birkin",
    "Túi Gucci Marmont",
    "Túi Louis Vuitton",
    "Túi Prada",
    "Giày Sneaker Dior",
    "Giày Loafer Hermès",
    "Giày Sneaker Gucci",
    "Giày Búp Bê Chanel",
    "Đồng Hồ Cartier",
    "Vòng Tay Cartier",
    "Áo Sơ Mi Dior Oblique"
  ];
  
  let deleted = 0;
  for (const name of luxuryNames) {
    const sql = `DELETE FROM products WHERE name LIKE $1`;
    const res = await pool.query(sql, [`%${name}%`]);
    if (res.rowCount > 0) {
      console.log(`Da xoa: ${name}`);
      deleted += res.rowCount;
    }
  }
  
  console.log(`\nTong: Da xoa ${deleted} san pham luxury`);
  
  const remaining = await pool.query('SELECT COUNT(*) as count FROM products');
  console.log(`Con lai ${remaining.rows[0].count} san pham trong database`);
  
  await pool.end();
}

deleteLuxury().catch(e => { console.error('Loi:', e.message); pool.end(); });
