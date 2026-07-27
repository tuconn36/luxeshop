require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'luxe_jewelry',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || '1')
});

async function updateProducts() {
  console.log('Bat dau cap nhat ten san pham...\n');

  const updates = [
    ["Nước Hoa Dior Sauvage 100ml", "%Dior Sauvage%"],
    ["Giày Sneaker Dior B30 Trắng", "%Dior B30%"],
    ["Túi Saddle Dior Đen Cao Cấp", "%Dior Saddle%"],
    ["Áo Sơ Mi Dior Oblique Nam", "%Dior Oblique%"],
    ["Nước Hoa Chanel N°5 100ml", "%Chanel N%5%"],
    ["Túi Chanel Classic Flap Đen", "%Chanel Classic Flap%"],
    ["Giày Búp Bê Chanel Beige", "%Chanel Ballerina%"],
    ["Nước Hoa Chanel Coco Mademoiselle 100ml", "%Chanel Coco Mademoiselle%"],
    ["Túi Hermès Birkin 25 Da Cam", "%Birkin%"],
    ["Nước Hoa Hermès Twilly 85ml", "%Hermès Twilly%"],
    ["Giày Loafer Hermès Kelly Đen", "%Kelly Loafer%"],
    ["Túi Gucci Marmont Đen Cao Cấp", "%Gucci Marmont%"],
    ["Giày Sneaker Gucci Ace Trắng", "%Gucci Ace%"],
    ["Túi Louis Vuitton Neverfull MM", "%Neverfull%"],
    ["Túi Louis Vuitton Speedy 25 Nâu", "%Speedy 25%"],
    ["Túi Prada Re-Edition 2005 Nylon", "%Prada Re-Edition%"],
    ["Kính Mát Prada Linea Rossa", "%Prada Linea%"],
    ["Đồng Hồ Cartier Panthère Cao Cấp", "%Cartier Panthère%"],
    ["Vòng Tay Cartier Love Vàng Hồng", "%Cartier Love%"],
  ];

  let updated = 0;
  for (const [newName, pattern] of updates) {
    const sql = `UPDATE products SET name = $1 WHERE name ILIKE $2`;
    const res = await pool.query(sql, [newName, pattern]);
    if (res.rowCount > 0) {
      console.log(`✓ Da cap nhat: ${newName}`);
      updated += res.rowCount;
    }
  }

  console.log(`\n✅ Hoan tat! Da cap nhat ${updated} san pham`);
  await pool.end();
}

updateProducts().catch(e => {
  console.error('Loi:', e.message);
  pool.end();
});
