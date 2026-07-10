require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'luxe_jewelry',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || '1'),
  client_encoding: 'UTF8'
});

async function checkAndFixEncoding() {
  const client = await pool.connect();
  try {
    // Set encoding
    await client.query("SET client_encoding = 'UTF8'");
    
    // Test query with Vietnamese text
    const result = await client.query('SELECT name FROM products LIMIT 1');
    console.log('Sample product name:', result.rows[0]?.name);
    
    // If encoding is broken, re-seed the data
    const testName = result.rows[0]?.name || '';
    if (testName.includes('�') || testName.includes('?') || testName.length === 0) {
      console.log('⚠️  Encoding issue detected! Re-seeding products...\n');
      await seedProducts(client);
    } else {
      console.log('✅ Database encoding is correct!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

async function seedProducts(client) {
  const products = [
    // Nam
    { name: 'Áo Sơ Mi Nam Oxford Trắng Premium', description: 'Áo sơ mi Oxford cao cấp, chất liệu cotton 100% nhập khẩu, form slim fit thanh lịch, phù hợp công sở và dự tiệc. Đường may tỉ mỉ, độ bền cao.', price: 399000, category: 'Nam', stock: 45, featured: true, image: 'ao-som-mi-trang-nam.jpg', brand: 'Routine' },
    { name: 'Quần Âu Nam Slim Fit Hàn Quốc', description: 'Quần âu nam form slim fit, vải Hàn cao cấp chống nhăn, thoáng mát. Thiết kế 2 túi sau nắp, 2 túi trước xéo. Phù hợp công sở và sự kiện.', price: 599000, category: 'Nam', stock: 38, featured: true, image: 'quan-au-slim-nam.jpg', brand: 'Owen' },
    { name: 'Áo Thun Nam Basic Coolmate', description: 'Áo thun basic cotton thoáng mát, form regular phù hợp mọi vóc dáng. Chất liệu cotton USA cao cấp, thấm hút mồ hôi tốt, không xù lông.', price: 199000, category: 'Nam', stock: 60, featured: false, image: 'ao-thun-basic-nam.jpg', brand: 'Coolmate' },
    { name: 'Áo Khoác Bomber Nam Streetwear', description: 'Áo khoác bomber thời trang, phong cách streetwear năng động. Chất liệu dù cao cấp chống nước nhẹ, lót bên trong mềm mại. Có nhiều màu sắc.', price: 899000, category: 'Nam', stock: 25, featured: true, image: 'ao-khoac-bomber-nam.jpg', brand: 'Local Brand' },
    { name: 'Quần Jean Nam Skinny Fit', description: 'Quần jean nam form skinny, vải denim co giãn thoải mái 98% cotton + 2% spandex. Bền màu, không phai. Thiết kế túi năm túi cơ bản.', price: 499000, category: 'Nam', stock: 42, featured: false, image: 'quan-jean-skinny-nam.jpg', brand: 'Yody' },
    { name: 'Áo Polo Nam Cao Cấp Pique', description: 'Áo polo nam chất liệu pique cao cấp, thoáng khí và lịch sự. Form regular fit thoải mái, cổ bo rib, có nút cài. Phù hợp đi chơi và công sở.', price: 349000, category: 'Nam', stock: 50, featured: false, image: 'ao-polo-cao-cap-nam.jpg', brand: 'Canifa' },
    { name: 'Áo Hoodie Nam Oversize Premium', description: 'Áo hoodie form oversize trendy, chất nỉ ngoại dày dặn ấm áp. Có mũ trùm đầu với dây rút, túi kangaroo phía trước. In logo độc đáo.', price: 599000, category: 'Nam', stock: 35, featured: true, image: 'ao-hoodie-oversize-nam.jpg', brand: 'Dirty Coins' },
    { name: 'Quần Short Nam Thể Thao Active', description: 'Quần short thể thao, vải thấm hút mồ hôi tốt, co giãn 4 chiều. Có túi khóa kéo an toàn, dây rút eo điều chỉnh. Phù hợp tập gym, chạy bộ.', price: 299000, category: 'Nam', stock: 55, featured: false, image: 'quan-short-the-thao-nam.jpg', brand: 'Yody' },
    { name: 'Áo Blazer Nam Formal Hàn Quốc', description: 'Áo blazer nam cao cấp, vải Hàn Quốc chống nhăn. Thiết kế 2 nút, có túi trong, lót lụa mềm mại. Phù hợp dự tiệc, công sở và sự kiện quan trọng.', price: 1299000, category: 'Nam', stock: 18, featured: true, image: 'ao-blazer-formal-nam.jpg', brand: 'Owen' },
    { name: 'Áo Phông Tay Dài Nam Basic', description: 'Áo phông tay dài basic, chất liệu cotton mềm mại thoáng mát. Form regular fit thoải mái, cổ tròn, may kỹ bo gấu. Dễ phối đồ mọi phong cách.', price: 249000, category: 'Nam', stock: 48, featured: false, image: 'ao-phong-tay-dai-nam.jpg', brand: 'The Blues' },
    // Nữ
    { name: 'Đầm Công Sở Thanh Lịch Premium', description: 'Đầm công sở thanh lịch, thiết kế tinh tế phù hợp môi trường văn phòng. Chất liệu vải Hàn cao cấp, form dáng ôm duyên dáng, có lót trong.', price: 699000, category: 'Nữ', stock: 40, featured: true, image: 'dam-cong-so-thanh-lich.jpg', brand: 'Elise' },
    { name: 'Áo Sơ Mi Nữ Trắng Lụa', description: 'Áo sơ mi trắng basic, chất liệu lụa tơ tằm mềm mại sang trọng. Thiết kế cổ vest, tay dài có nút khuy. Dễ phối với chân váy, quần âu.', price: 449000, category: 'Nữ', stock: 52, featured: true, image: 'ao-som-mi-trang-nu.jpg', brand: 'Juno' },
    { name: 'Chân Váy Midi Xòe Hàn Quốc', description: 'Chân váy midi xòe nhẹ nhàng, điệu đà và nữ tính. Chất vải voan cao cấp, có lót trong. Thiết kế xòe nhẹ tôn dáng, có khóa kéo sau.', price: 599000, category: 'Nữ', stock: 35, featured: false, image: 'chan-vay-midi-xoe.jpg', brand: 'IVY moda' },
    { name: 'Áo Blazer Nữ Hàn Quốc Premium', description: 'Áo blazer nữ phong cách Hàn Quốc, form dáng thanh lịch hiện đại. Chất vải Hàn chống nhăn, có lót lụa. Thiết kế 1 nút, vai phom ngang.', price: 999000, category: 'Nữ', stock: 22, featured: true, image: 'ao-blazer-han-quoc-nu.jpg', brand: 'Elise' },
    { name: 'Đầm Dự Tiệc Sang Trọng', description: 'Đầm dự tiệc cao cấp, thiết kế sang trọng phù hợp sự kiện quan trọng. Chất liệu vải lụa cao cấp, đính kết tinh tế, form dáng đuôi cá tôn dáng.', price: 1599000, category: 'Nữ', stock: 15, featured: true, image: 'dam-du-tiec-sang-trong.jpg', brand: 'Biluxury' },
    { name: 'Quần Jean Nữ Ống Rộng Baggy', description: 'Quần jean ống rộng trendy, phong cách năng động trẻ trung. Chất vải denim cao cấp bền màu, thiết kế túi năm túi, có nhiều màu sắc.', price: 549000, category: 'Nữ', stock: 44, featured: false, image: 'quan-jean-ong-rong-nu.jpg', brand: 'Lime Orange' },
    { name: 'Áo Thun Nữ Form Rộng', description: 'Áo thun nữ form rộng oversize trendy. Chất cotton cao cấp, mềm mại thoáng mát. In logo độc đáo, nhiều màu sắc. Phù hợp phong cách streetwear.', price: 249000, category: 'Nữ', stock: 58, featured: false, image: 'ao-thun-nu-form-rong.jpg', brand: 'Local Brand' },
    { name: 'Set Đồ Nữ 2 Món Công Sở', description: 'Set đồ nữ 2 món phối hợp hoàn hảo, tiện lợi và thời trang. Bao gồm áo blazer và chân váy/quần đồng bộ. Chất liệu vải Hàn cao cấp.', price: 899000, category: 'Nữ', stock: 26, featured: true, image: 'set-do-nu-2-mon.jpg', brand: 'NEM' },
    // Phụ kiện
    { name: 'Túi Xách Da Cao Cấp', description: 'Túi xách da thật cao cấp, thiết kế sang trọng đẳng cấp. Da bò thật 100%, đường chỉ may tỉ mỉ, khóa kéo YKK. Nhiều ngăn tiện dụng.', price: 899000, category: 'Phụ kiện', stock: 30, featured: true, image: 'tui-xach-da-cao-cap.jpg', brand: 'Juno' },
    { name: 'Ví Nam Da Bò Handmade', description: 'Ví nam da bò thật 100%, handmade bền đẹp theo thời gian. Có nhiều ngăn thẻ, ngăn tiền, ngăn khóa kéo. Đường chỉ thủ công chắc chắn.', price: 399000, category: 'Phụ kiện', stock: 45, featured: false, image: 'vi-nam-da-bo.jpg', brand: 'Lados' },
    { name: 'Thắt Lưng Da Nam Premium', description: 'Thắt lưng da nam cao cấp, khóa inox bền chắc không gỉ. Da thật 100%, có thể đảo chiều 2 màu. Chiều rộng 3.5cm phù hợp nam giới.', price: 299000, category: 'Phụ kiện', stock: 50, featured: false, image: 'that-lung-da-nam.jpg', brand: 'Owen' },
    { name: 'Kính Mát Polarized UV400', description: 'Kính mát chống tia UV 400, tròng Polarized chống chói. Gọng kim loại cao cấp, nhiều màu sắc. Phù hợp cả nam và nữ.', price: 499000, category: 'Phụ kiện', stock: 38, featured: true, image: 'kinh-mat-nam-nu.jpg', brand: 'Rayban Style' },
    { name: 'Balo Laptop 15.6 inch', description: 'Balo laptop thời trang chống nước, ngăn laptop riêng 15.6 inch. Nhiều ngăn tiện lợi, quai đeo đệm êm. Cổng sạc USB tiện dụng.', price: 599000, category: 'Phụ kiện', stock: 42, featured: true, image: 'balo-thoi-trang.jpg', brand: 'Arctic Hunter' },
    // Sale
    { name: 'Áo Thun Basic Sale 99k', description: 'Áo thun basic giảm giá đặc biệt, chất lượng tốt giá ưu đãi. Cotton 100% mềm mại thoáng mát. Form regular fit. Hàng tồn kho giảm sâu.', price: 99000, category: 'Nam', stock: 80, featured: false, image: 'ao-thun-basic-sale.jpg', brand: 'Coolmate' },
    { name: 'Combo 5 Đôi Tất/Vớ', description: 'Combo 5 đôi tất/vớ cotton cao cấp, giá ưu đãi. Chất cotton thoáng khí thấm mồ hôi. Co giãn tốt, bền màu. Mix nhiều màu.', price: 99000, category: 'Phụ kiện', stock: 120, featured: false, image: 'tat-combo-5-doi.jpg', brand: 'Canifa' },
  ];

  // Clear old products
  await client.query('DELETE FROM products');
  await client.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');
  
  // Insert products with explicit text encoding
  for (const product of products) {
    await client.query(
      `INSERT INTO products (name, description, price, category, stock, featured, images, tags, created_at) 
       VALUES ($1::text, $2::text, $3, $4::text, $5, $6, $7::jsonb, $8::jsonb, NOW())`,
      [
        product.name,
        product.description,
        product.price,
        product.category,
        product.stock,
        product.featured,
        JSON.stringify([`/uploads/products/${product.image}`]),
        JSON.stringify([product.brand, product.category])
      ]
    );
  }
  
  console.log(`✅ Đã seed ${products.length} sản phẩm thành công!`);
  
  // Verify encoding
  const test = await client.query('SELECT name FROM products LIMIT 1');
  console.log('Test name:', test.rows[0]?.name);
}

checkAndFixEncoding();
