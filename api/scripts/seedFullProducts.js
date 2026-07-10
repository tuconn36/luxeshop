require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'luxe_jewelry',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || '1'),
});

// Danh sách sản phẩm đầy đủ
const allProducts = [
  // Nam (15 sản phẩm)
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
  { name: 'Áo Thun Polo Nam Xuất Khẩu', description: 'Áo polo nam xuất khẩu Châu Âu, chất pique cotton cao cấp. Thiết kế cổ bo có nút, tay áo bo rib. Hàng xuất dư xịn.', price: 329000, category: 'Nam', stock: 40, featured: false, image: 'ao-polo-xuat-khau-nam.jpg', brand: 'Routine' },
  { name: 'Quần Kaki Nam Túi Hộp', description: 'Quần kaki nam túi hộp phong cách cargo. Chất vải kaki cao cấp chống nhăn, nhiều túi tiện dụng. Form regular fit thoải mái.', price: 449000, category: 'Nam', stock: 32, featured: false, image: 'quan-kaki-tui-hop-nam.jpg', brand: 'The Blues' },
  { name: 'Áo Khoác Dù Nam Chống Nước', description: 'Áo khoác dù nam chống nước, chống gió. Chất liệu polyester cao cấp, có mũ trùm. Túi khóa kéo an toàn, lót bên trong mesh thoáng khí.', price: 599000, category: 'Nam', stock: 28, featured: false, image: 'ao-khoac-du-chong-nuoc-nam.jpg', brand: 'Yody' },
  { name: 'Áo Sweater Nam Len Cổ Tròn', description: 'Áo sweater len nam cổ tròn, chất len lông cừu pha acrylic. Ấm áp, mềm mại, không xù. Phù hợp mùa đông, dễ phối đồ.', price: 499000, category: 'Nam', stock: 30, featured: false, image: 'ao-sweater-len-nam.jpg', brand: 'Canifa' },
  { name: 'Quần Jogger Nam Thể Thao', description: 'Quần jogger nam thể thao co giãn 4 chiều. Chất liệu polyester thoáng mát, bo gấu chun. Có túi khóa kéo, dây rút eo.', price: 399000, category: 'Nam', stock: 36, featured: false, image: 'quan-jogger-the-thao-nam.jpg', brand: 'Coolmate' },

  // Nữ (15 sản phẩm)
  { name: 'Đầm Công Sở Thanh Lịch Premium', description: 'Đầm công sở thanh lịch, thiết kế tinh tế phù hợp môi trường văn phòng. Chất liệu vải Hàn cao cấp, form dáng ôm duyên dáng, có lót trong.', price: 699000, category: 'Nữ', stock: 40, featured: true, image: 'dam-cong-so-thanh-lich.jpg', brand: 'Elise' },
  { name: 'Áo Sơ Mi Nữ Trắng Lụa', description: 'Áo sơ mi trắng basic, chất liệu lụa tơ tằm mềm mại sang trọng. Thiết kế cổ vest, tay dài có nút khuy. Dễ phối với chân váy, quần âu.', price: 449000, category: 'Nữ', stock: 52, featured: true, image: 'ao-som-mi-trang-nu.jpg', brand: 'Juno' },
  { name: 'Chân Váy Midi Xòe Hàn Quốc', description: 'Chân váy midi xòe nhẹ nhàng, điệu đà và nữ tính. Chất vải voan cao cấp, có lót trong. Thiết kế xòe nhẹ tôn dáng, có khóa kéo sau.', price: 599000, category: 'Nữ', stock: 35, featured: false, image: 'chan-vay-midi-xoe.jpg', brand: 'IVY moda' },
  { name: 'Áo Blazer Nữ Hàn Quốc Premium', description: 'Áo blazer nữ phong cách Hàn Quốc, form dáng thanh lịch hiện đại. Chất vải Hàn chống nhăn, có lót lụa. Thiết kế 1 nút, vai phom ngang.', price: 999000, category: 'Nữ', stock: 22, featured: true, image: 'ao-blazer-han-quoc-nu.jpg', brand: 'Elise' },
  { name: 'Đầm Dự Tiệc Sang Trọng', description: 'Đầm dự tiệc cao cấp, thiết kế sang trọng phù hợp sự kiện quan trọng. Chất liệu vải lụa cao cấp, đính kết tinh tế, form dáng đuôi cá tôn dáng.', price: 1599000, category: 'Nữ', stock: 15, featured: true, image: 'dam-du-tiec-sang-trong.jpg', brand: 'Biluxury' },
  { name: 'Quần Jean Nữ Ống Rộng Baggy', description: 'Quần jean ống rộng trendy, phong cách năng động trẻ trung. Chất vải denim cao cấp bền màu, thiết kế túi năm túi, có nhiều màu sắc.', price: 549000, category: 'Nữ', stock: 44, featured: false, image: 'quan-jean-ong-rong-nu.jpg', brand: 'Lime Orange' },
  { name: 'Áo Len Nữ Cardigan Cao Cấp', description: 'Áo len cardigan mềm mại, ấm áp phù hợp mùa đông. Chất len lông cừu pha acrylic, không xù. Thiết kế dáng dài, có nút cài tiện lợi.', price: 499000, category: 'Nữ', stock: 38, featured: false, image: 'ao-len-cardigan-nu.jpg', brand: 'Kiza' },
  { name: 'Set Đồ Nữ 2 Món Công Sở', description: 'Set đồ nữ 2 món phối hợp hoàn hảo, tiện lợi và thời trang. Bao gồm áo blazer và chân váy/quần đồng bộ. Chất liệu vải Hàn cao cấp.', price: 899000, category: 'Nữ', stock: 26, featured: true, image: 'set-do-nu-2-mon.jpg', brand: 'NEM' },
  { name: 'Áo Kiểu Nữ Hoa Nhí Vintage', description: 'Áo kiểu hoa nhí nữ tính, chất vải voan mát mẻ phù hợp mùa hè. Thiết kế cổ tròn, tay bồng nhẹ. Họa tiết hoa nhí vintage nữ tính.', price: 379000, category: 'Nữ', stock: 50, featured: false, image: 'ao-kieu-hoa-nhi-nu.jpg', brand: 'May 10' },
  { name: 'Đầm Maxi Dạo Phố Bohemian', description: 'Đầm maxi dài thanh lịch, thoải mái cho những chuyến dạo phố. Chất vải voan nhẹ nhàng, họa tiết bohemian, form dáng xòe bay bổng.', price: 799000, category: 'Nữ', stock: 30, featured: false, image: 'dam-maxi-dao-pho.jpg', brand: 'VietCharm' },
  { name: 'Váy Denim Nữ Xòe', description: 'Váy denim xòe phong cách trẻ trung. Chất vải denim mềm mại, có túi trước, khóa kéo sau. Dễ phối với áo thun, áo kiểu.', price: 479000, category: 'Nữ', stock: 42, featured: false, image: 'vay-denim-nu-xoe.jpg', brand: 'IVY moda' },
  { name: 'Áo Thun Nữ Form Rộng', description: 'Áo thun nữ form rộng oversize trendy. Chất cotton cao cấp, mềm mại thoáng mát. In logo độc đáo, nhiều màu sắc. Phù hợp phong cách streetwear.', price: 249000, category: 'Nữ', stock: 58, featured: false, image: 'ao-thun-nu-form-rong.jpg', brand: 'Local Brand' },
  { name: 'Quần Tây Nữ Ống Đứng', description: 'Quần tây nữ ống đứng công sở. Chất vải Hàn cao cấp chống nhăn, form dáng thanh lịch. Có túi sau nắp, khóa kéo bên hông.', price: 599000, category: 'Nữ', stock: 34, featured: false, image: 'quan-tay-nu-ong-dung.jpg', brand: 'Elise' },
  { name: 'Váy Caro Vintage Nữ', description: 'Váy caro phong cách vintage Pháp. Chất vải tweed cao cấp, họa tiết caro cổ điển. Form dáng chữ A tôn dáng, có lót trong.', price: 529000, category: 'Nữ', stock: 28, featured: false, image: 'vay-caro-vintage-nu.jpg', brand: 'NEM' },
  { name: 'Áo Khoác Cardigan Dáng Dài Nữ', description: 'Áo khoác cardigan dáng dài thanh lịch. Chất len cao cấp mềm mại ấm áp. Thiết kế không cổ, có túi hai bên. Phù hợp mùa thu đông.', price: 649000, category: 'Nữ', stock: 25, featured: false, image: 'ao-khoac-cardigan-dai-nu.jpg', brand: 'Kiza' },

  // Phụ kiện (12 sản phẩm)
  { name: 'Túi Xách Da Cao Cấp', description: 'Túi xách da thật cao cấp, thiết kế sang trọng đẳng cấp. Da bò thật 100%, đường chỉ may tỉ mỉ, khóa kéo YKK. Nhiều ngăn tiện dụng.', price: 899000, category: 'Phụ kiện', stock: 30, featured: true, image: 'tui-xach-da-cao-cap.jpg', brand: 'Juno' },
  { name: 'Ví Nam Da Bò Handmade', description: 'Ví nam da bò thật 100%, handmade bền đẹp theo thời gian. Có nhiều ngăn thẻ, ngăn tiền, ngăn khóa kéo. Đường chỉ thủ công chắc chắn.', price: 399000, category: 'Phụ kiện', stock: 45, featured: false, image: 'vi-nam-da-bo.jpg', brand: 'Lados' },
  { name: 'Thắt Lưng Da Nam Premium', description: 'Thắt lưng da nam cao cấp, khóa inox bền chắc không gỉ. Da thật 100%, có thể đảo chiều 2 màu. Chiều rộng 3.5cm phù hợp nam giới.', price: 299000, category: 'Phụ kiện', stock: 50, featured: false, image: 'that-lung-da-nam.jpg', brand: 'Owen' },
  { name: 'Mũ Lưỡi Trai Snapback Premium', description: 'Mũ lưỡi trai snapback thời trang, phong cách streetwear. Chất vải kaki cao cấp, vành phẳng cứng cáp. Logo thêu 3D nổi bật.', price: 199000, category: 'Phụ kiện', stock: 60, featured: false, image: 'mu-luoi-trai-snapback.jpg', brand: 'Local Brand' },
  { name: 'Kính Mát Polarized UV400', description: 'Kính mát chống tia UV 400, tròng Polarized chống chói. Gọng kim loại cao cấp, nhiều màu sắc. Phù hợp cả nam và nữ.', price: 499000, category: 'Phụ kiện', stock: 38, featured: true, image: 'kinh-mat-nam-nu.jpg', brand: 'Rayban Style' },
  { name: 'Balo Laptop 15.6 inch', description: 'Balo laptop thời trang chống nước, ngăn laptop riêng 15.6 inch. Nhiều ngăn tiện lợi, quai đeo đệm êm. Cổng sạc USB tiện dụng.', price: 599000, category: 'Phụ kiện', stock: 42, featured: true, image: 'balo-thoi-trang.jpg', brand: 'Arctic Hunter' },
  { name: 'Giày Sneaker Trắng Unisex', description: 'Giày sneaker trắng basic phong cách minimalist. Chất liệu canvas cao cấp, đế cao su chống trơn. Dễ phối đồ mọi trang phục.', price: 799000, category: 'Phụ kiện', stock: 35, featured: true, image: 'giay-sneaker-trang.jpg', brand: 'Ananas' },
  { name: 'Dép Sandal Nữ Êm Chân', description: 'Dép sandal nữ êm ái, đế êm chống trượt. Quai ngang thời trang, thiết kế tối giản. Phù hợp mùa hè, đi biển, dạo phố.', price: 249000, category: 'Phụ kiện', stock: 55, featured: false, image: 'dep-sandal-nu.jpg', brand: 'Juno' },
  { name: 'Tất Nam Cao Cổ Thể Thao', description: 'Tất nam cao cổ thể thao, chất cotton thoáng khí. Thun co giãn tốt, không bai. Combo 3 đôi đồng màu hoặc mix màu.', price: 49000, category: 'Phụ kiện', stock: 100, featured: false, image: 'tat-nam-cao-co.jpg', brand: 'Biti\'s' },
  { name: 'Khăn Choàng Cổ Nam Nữ', description: 'Khăn choàng cổ len ấm áp mùa đông. Chất len mềm mại không xù, nhiều màu sắc. Dài 180cm phù hợp cả nam và nữ.', price: 199000, category: 'Phụ kiện', stock: 48, featured: false, image: 'khan-choang-co.jpg', brand: 'Canifa' },
  { name: 'Găng Tay Len Cảm Ứng', description: 'Găng tay len mùa đông có khả năng cảm ứng điện thoại. Chất len ấm áp, bo cổ tay chặt. Có nhiều màu sắc trẻ trung.', price: 129000, category: 'Phụ kiện', stock: 52, featured: false, image: 'gang-tay-len.jpg', brand: 'Yody' },
  { name: 'Túi Đeo Chéo Nam Vải', description: 'Túi đeo chéo nam vải canvas cao cấp chống thấm nước. Nhiều ngăn tiện dụng, quai đeo chắc chắn. Phong cách năng động trẻ trung.', price: 299000, category: 'Phụ kiện', stock: 40, featured: false, image: 'tui-deo-cheo-nam.jpg', brand: 'The Blues' },

  // Sale (5 sản phẩm)
  { name: 'Áo Thun Basic Sale 99k', description: 'Áo thun basic giảm giá đặc biệt, chất lượng tốt giá ưu đãi. Cotton 100% mềm mại thoáng mát. Form regular fit. Hàng tồn kho giảm sâu.', price: 99000, category: 'Nam', stock: 80, featured: false, image: 'ao-thun-basic-sale.jpg', brand: 'Coolmate' },
  { name: 'Áo Tank Top Nữ Sale', description: 'Áo tank top nữ mát mẻ, giá sale cực sốc chỉ 99k. Chất liệu cotton spandex co giãn. Form ôm dáng. Nhiều màu sắc trẻ trung.', price: 99000, category: 'Nữ', stock: 75, featured: false, image: 'ao-tank-top-nu-sale.jpg', brand: 'Xita' },
  { name: 'Combo 5 Đôi Tất/Vớ', description: 'Combo 5 đôi tất/vớ cotton cao cấp, giá ưu đãi. Chất cotton thoáng khí thấm mồ hôi. Co giãn tốt, bền màu. Mix nhiều màu.', price: 99000, category: 'Phụ kiện', stock: 120, featured: false, image: 'tat-combo-5-doi.jpg', brand: 'Canifa' },
  { name: 'Quần Short Jean Nam Sale', description: 'Quần short jean nam giá sale 199k. Chất denim co giãn thoải mái. Túi năm túi cơ bản. Hàng sale cuối mùa.', price: 199000, category: 'Nam', stock: 60, featured: false, image: 'quan-short-jean-sale.jpg', brand: 'Yody' },
  { name: 'Áo Sơ Mi Nữ Sale 199k', description: 'Áo sơ mi nữ giá sale 199k. Chất vải mềm mại thoáng mát. Thiết kế basic dễ phối đồ. Giảm giá từ 399k.', price: 199000, category: 'Nữ', stock: 55, featured: false, image: 'ao-som-mi-nu-sale.jpg', brand: 'IVY moda' }
];

async function seedFullProducts() {
  let client;
  try {
    console.log('🌱 Bắt đầu seed sản phẩm...\n');
    
    client = await pool.connect();
    
    // Xóa sản phẩm cũ
    await client.query('DELETE FROM products');
    await client.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');
    console.log('✓ Đã xóa sản phẩm cũ\n');

    // Thêm sản phẩm
    let count = 0;
    for (const product of allProducts) {
      await client.query(
        `INSERT INTO products (name, description, price, category, stock, featured, images, tags, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
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
      count++;
      if (count % 10 === 0) {
        console.log(`   ✓ Đã thêm ${count}/${allProducts.length} sản phẩm`);
      }
    }

    console.log(`\n✅ Hoàn thành! Đã thêm ${allProducts.length} sản phẩm\n`);

    // Thống kê
    const stats = await client.query(`
      SELECT category, COUNT(*) as count, MIN(price) as min_price, MAX(price) as max_price
      FROM products GROUP BY category ORDER BY category
    `);
    
    console.log('📊 Thống kê:');
    stats.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count} sản phẩm (${row.min_price.toLocaleString('vi-VN')}đ - ${row.max_price.toLocaleString('vi-VN')}đ)`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

seedFullProducts();
