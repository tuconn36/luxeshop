-- Xóa sản phẩm cũ
DELETE FROM products;

-- Reset sequence
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- Sản phẩm Nam (15 sản phẩm)
INSERT INTO products (name, description, price, category, stock, featured, images, tags, created_at) VALUES
('Áo Sơ Mi Nam Oxford Trắng Premium', 'Áo sơ mi Oxford cao cấp, chất liệu cotton 100% nhập khẩu, form slim fit thanh lịch, phù hợp công sở và dự tiệc. Đường may tỉ mỉ, độ bền cao.', 399000, 'Nam', 45, true, '["/uploads/products/ao-som-mi-trang-nam.jpg"]', '["Routine", "Nam"]', NOW()),
('Quần Âu Nam Slim Fit Hàn Quốc', 'Quần âu nam form slim fit, vải Hàn cao cấp chống nhăn, thoáng mát. Thiết kế 2 túi sau nắp, 2 túi trước xéo. Phù hợp công sở và sự kiện.', 599000, 'Nam', 38, true, '["/uploads/products/quan-au-slim-nam.jpg"]', '["Owen", "Nam"]', NOW()),
('Áo Thun Nam Basic Coolmate', 'Áo thun basic cotton thoáng mát, form regular phù hợp mọi vóc dáng. Chất liệu cotton USA cao cấp, thấm hút mồ hôi tốt, không xù lông.', 199000, 'Nam', 60, false, '["/uploads/products/ao-thun-basic-nam.jpg"]', '["Coolmate", "Nam"]', NOW()),
('Áo Khoác Bomber Nam Streetwear', 'Áo khoác bomber thời trang, phong cách streetwear năng động. Chất liệu dù cao cấp chống nước nhẹ, lót bên trong mềm mại. Có nhiều màu sắc.', 899000, 'Nam', 25, true, '["/uploads/products/ao-khoac-bomber-nam.jpg"]', '["Local Brand", "Nam"]', NOW()),
('Quần Jean Nam Skinny Fit', 'Quần jean nam form skinny, vải denim co giãn thoải mái 98% cotton + 2% spandex. Bền màu, không phai. Thiết kế túi năm túi cơ bản.', 499000, 'Nam', 42, false, '["/uploads/products/quan-jean-skinny-nam.jpg"]', '["Yody", "Nam"]', NOW()),
('Áo Polo Nam Cao Cấp Pique', 'Áo polo nam chất liệu pique cao cấp, thoáng khí và lịch sự. Form regular fit thoải mái, cổ bo rib, có nút cài. Phù hợp đi chơi và công sở.', 349000, 'Nam', 50, false, '["/uploads/products/ao-polo-cao-cap-nam.jpg"]', '["Canifa", "Nam"]', NOW()),
('Áo Hoodie Nam Oversize Premium', 'Áo hoodie form oversize trendy, chất nỉ ngoại dày dặn ấm áp. Có mũ trùm đầu với dây rút, túi kangaroo phía trước. In logo độc đáo.', 599000, 'Nam', 35, true, '["/uploads/products/ao-hoodie-oversize-nam.jpg"]', '["Dirty Coins", "Nam"]', NOW()),
('Quần Short Nam Thể Thao Active', 'Quần short thể thao, vải thấm hút mồ hôi tốt, co giãn 4 chiều. Có túi khóa kéo an toàn, dây rút eo điều chỉnh. Phù hợp tập gym, chạy bộ.', 299000, 'Nam', 55, false, '["/uploads/products/quan-short-the-thao-nam.jpg"]', '["Yody", "Nam"]', NOW()),
('Áo Blazer Nam Formal Hàn Quốc', 'Áo blazer nam cao cấp, vải Hàn Quốc chống nhăn. Thiết kế 2 nút, có túi trong, lót lụa mềm mại. Phù hợp dự tiệc, công sở và sự kiện quan trọng.', 1299000, 'Nam', 18, true, '["/uploads/products/ao-blazer-formal-nam.jpg"]', '["Owen", "Nam"]', NOW()),
('Áo Phông Tay Dài Nam Basic', 'Áo phông tay dài basic, chất liệu cotton mềm mại thoáng mát. Form regular fit thoải mái, cổ tròn, may kỹ bo gấu. Dễ phối đồ mọi phong cách.', 249000, 'Nam', 48, false, '["/uploads/products/ao-phong-tay-dai-nam.jpg"]', '["The Blues", "Nam"]', NOW()),
('Áo Thun Polo Nam Xuất Khẩu', 'Áo polo nam xuất khẩu Châu Âu, chất pique cotton cao cấp. Thiết kế cổ bo có nút, tay áo bo rib. Hàng xuất dư xịn.', 329000, 'Nam', 40, false, '["/uploads/products/ao-polo-xuat-khau-nam.jpg"]', '["Routine", "Nam"]', NOW()),
('Quần Kaki Nam Túi Hộp', 'Quần kaki nam túi hộp phong cách cargo. Chất vải kaki cao cấp chống nhăn, nhiều túi tiện dụng. Form regular fit thoải mái.', 449000, 'Nam', 32, false, '["/uploads/products/quan-kaki-tui-hop-nam.jpg"]', '["The Blues", "Nam"]', NOW()),
('Áo Khoác Dù Nam Chống Nước', 'Áo khoác dù nam chống nước, chống gió. Chất liệu polyester cao cấp, có mũ trùm. Túi khóa kéo an toàn, lót bên trong mesh thoáng khí.', 599000, 'Nam', 28, false, '["/uploads/products/ao-khoac-du-chong-nuoc-nam.jpg"]', '["Yody", "Nam"]', NOW()),
('Áo Sweater Nam Len Cổ Tròn', 'Áo sweater len nam cổ tròn, chất len lông cừu pha acrylic. Ấm áp, mềm mại, không xù. Phù hợp mùa đông, dễ phối đồ.', 499000, 'Nam', 30, false, '["/uploads/products/ao-sweater-len-nam.jpg"]', '["Canifa", "Nam"]', NOW()),
('Quần Jogger Nam Thể Thao', 'Quần jogger nam thể thao co giãn 4 chiều. Chất liệu polyester thoáng mát, bo gấu chun. Có túi khóa kép, dây rút eo.', 399000, 'Nam', 36, false, '["/uploads/products/quan-jogger-the-thao-nam.jpg"]', '["Coolmate", "Nam"]', NOW());

-- Sản phẩm Nữ (15 sản phẩm)

INSERT INTO products (name, description, price, category, stock, featured, images, tags, created_at) VALUES
('Đầm Công Sở Thanh Lịch Premium', 'Đầm công sở thanh lịch, thiết kế tinh tế phù hợp môi trường văn phòng. Chất liệu vải Hàn cao cấp, form dáng ôm duyên dáng, có lót trong.', 699000, 'Nữ', 40, true, '["/uploads/products/dam-cong-so-thanh-lich.jpg"]', '["Elise", "Nữ"]', NOW()),
('Áo Sơ Mi Nữ Trắng Lụa', 'Áo sơ mi trắng basic, chất liệu lụa tơ tằm mềm mại sang trọng. Thiết kế cổ vest, tay dài có nút khuy. Dễ phối với chân váy, quần âu.', 449000, 'Nữ', 52, true, '["/uploads/products/ao-som-mi-trang-nu.jpg"]', '["Juno", "Nữ"]', NOW()),
('Chân Váy Midi Xòe Hàn Quốc', 'Chân váy midi xòe nhẹ nhàng, điệu đà và nữ tính. Chất vải voan cao cấp, có lót trong. Thiết kế xòe nhẹ tôn dáng, có khóa kéo sau.', 599000, 'Nữ', 35, false, '["/uploads/products/chan-vay-midi-xoe.jpg"]', '["IVY moda", "Nữ"]', NOW()),
('Áo Blazer Nữ Hàn Quốc Premium', 'Áo blazer nữ phong cách Hàn Quốc, form dáng thanh lịch hiện đại. Chất vải Hàn chống nhăn, có lót lụa. Thiết kế 1 nút, vai phom ngang.', 999000, 'Nữ', 22, true, '["/uploads/products/ao-blazer-han-quoc-nu.jpg"]', '["Elise", "Nữ"]', NOW()),
('Đầm Dự Tiệc Sang Trọng', 'Đầm dự tiệc cao cấp, thiết kế sang trọng phù hợp sự kiện quan trọng. Chất liệu vải lụa cao cấp, đính kết tinh tế, form dáng đuôi cá tôn dáng.', 1599000, 'Nữ', 15, true, '["/uploads/products/dam-du-tiec-sang-trong.jpg"]', '["Biluxury", "Nữ"]', NOW()),
('Quần Jean Nữ Ống Rộng Baggy', 'Quần jean ống rộng trendy, phong cách năng động trẻ trung. Chất vải denim cao cấp bền màu, thiết kế túi năm túi, có nhiều màu sắc.', 549000, 'Nữ', 44, false, '["/uploads/products/quan-jean-ong-rong-nu.jpg"]', '["Lime Orange", "Nữ"]', NOW()),
('Áo Len Nữ Cardigan Cao Cấp', 'Áo len cardigan mềm mại, ấm áp phù hợp mùa đông. Chất len lông cừu pha acrylic, không xù. Thiết kế dáng dài, có nút cài tiện lợi.', 499000, 'Nữ', 38, false, '["/uploads/products/ao-len-cardigan-nu.jpg"]', '["Kiza", "Nữ"]', NOW()),
('Set Đồ Nữ 2 Món Công Sở', 'Set đồ nữ 2 món phối hợp hoàn hảo, tiện lợi và thời trang. Bao gồm áo blazer và chân váy/quần đồng bộ. Chất liệu vải Hàn cao cấp.', 899000, 'Nữ', 26, true, '["/uploads/products/set-do-nu-2-mon.jpg"]', '["NEM", "Nữ"]', NOW()),
('Áo Kiểu Nữ Hoa Nhí Vintage', 'Áo kiểu hoa nhí nữ tính, chất vải voan mát mẻ phù hợp mùa hè. Thiết kế cổ tròn, tay bồng nhẹ. Họa tiết hoa nhí vintage nữ tính.', 379000, 'Nữ', 50, false, '["/uploads/products/ao-kieu-hoa-nhi-nu.jpg"]', '["May 10", "Nữ"]', NOW()),
('Đầm Maxi Dạo Phố Bohemian', 'Đầm maxi dài thanh lịch, thoải mái cho những chuyến dạo phố. Chất vải voan nhẹ nhàng, họa tiết bohemian, form dáng xòe bay bổng.', 799000, 'Nữ', 30, false, '["/uploads/products/dam-maxi-dao-pho.jpg"]', '["VietCharm", "Nữ"]', NOW()),
('Váy Denim Nữ Xòe', 'Váy denim xòe phong cách trẻ trung. Chất vải denim mềm mại, có túi trước, khóa kéo sau. Dễ phối với áo thun, áo kiểu.', 479000, 'Nữ', 42, false, '["/uploads/products/vay-denim-nu-xoe.jpg"]', '["IVY moda", "Nữ"]', NOW()),
('Áo Thun Nữ Form Rộng', 'Áo thun nữ form rộng oversize trendy. Chất cotton cao cấp, mềm mại thoáng mát. In logo độc đáo, nhiều màu sắc. Phù hợp phong cách streetwear.', 249000, 'Nữ', 58, false, '["/uploads/products/ao-thun-nu-form-rong.jpg"]', '["Local Brand", "Nữ"]', NOW()),
('Quần Tây Nữ Ống Đứng', 'Quần tây nữ ống đứng công sở. Chất vải Hàn cao cấp chống nhăn, form dáng thanh lịch. Có túi sau nắp, khóa kéo bên hông.', 599000, 'Nữ', 34, false, '["/uploads/products/quan-tay-nu-ong-dung.jpg"]', '["Elise", "Nữ"]', NOW()),
('Váy Caro Vintage Nữ', 'Váy caro phong cách vintage Pháp. Chất vải tweed cao cấp, họa tiết caro cổ điển. Form dáng chữ A tôn dáng, có lót trong.', 529000, 'Nữ', 28, false, '["/uploads/products/vay-caro-vintage-nu.jpg"]', '["NEM", "Nữ"]', NOW()),
('Áo Khoác Cardigan Dáng Dài Nữ', 'Áo khoác cardigan dáng dài thanh lịch. Chất len cao cấp mềm mại ấm áp. Thiết kế không cổ, có túi hai bên. Phù hợp mùa thu đông.', 649000, 'Nữ', 25, false, '["/uploads/products/ao-khoac-cardigan-dai-nu.jpg"]', '["Kiza", "Nữ"]', NOW());

-- Phụ kiện (12 sản phẩm)
INSERT INTO products (name, description, price, category, stock, featured, images, tags, created_at) VALUES
('Túi Xách Da Cao Cấp', 'Túi xách da thật cao cấp, thiết kế sang trọng đẳng cấp. Da bò thật 100%, đường chỉ may tỉ mỉ, khóa kéo YKK. Nhiều ngăn tiện dụng.', 899000, 'Phụ kiện', 30, true, '["/uploads/products/tui-xach-da-cao-cap.jpg"]', '["Juno", "Phụ kiện"]', NOW()),
('Ví Nam Da Bò Handmade', 'Ví nam da bò thật 100%, handmade bền đẹp theo thời gian. Có nhiều ngăn thẻ, ngăn tiền, ngăn khóa kéo. Đường chỉ thủ công chắc chắn.', 399000, 'Phụ kiện', 45, false, '["/uploads/products/vi-nam-da-bo.jpg"]', '["Lados", "Phụ kiện"]', NOW()),
('Thắt Lưng Da Nam Premium', 'Thắt lưng da nam cao cấp, khóa inox bền chắc không gỉ. Da thật 100%, có thể đảo chiều 2 màu. Chiều rộng 3.5cm phù hợp nam giới.', 299000, 'Phụ kiện', 50, false, '["/uploads/products/that-lung-da-nam.jpg"]', '["Owen", "Phụ kiện"]', NOW()),
('Mũ Lưỡi Trai Snapback Premium', 'Mũ lưỡi trai snapback thời trang, phong cách streetwear. Chất vải kaki cao cấp, vành phẳng cứng cáp. Logo thêu 3D nổi bật.', 199000, 'Phụ kiện', 60, false, '["/uploads/products/mu-luoi-trai-snapback.jpg"]', '["Local Brand", "Phụ kiện"]', NOW()),
('Kính Mát Polarized UV400', 'Kính mát chống tia UV 400, tròng Polarized chống chói. Gọng kim loại cao cấp, nhiều màu sắc. Phù hợp cả nam và nữ.', 499000, 'Phụ kiện', 38, true, '["/uploads/products/kinh-mat-nam-nu.jpg"]', '["Rayban Style", "Phụ kiện"]', NOW()),
('Balo Laptop 15.6 inch', 'Balo laptop thời trang chống nước, ngăn laptop riêng 15.6 inch. Nhiều ngăn tiện lợi, quai đeo đệm êm. Cổng sạc USB tiện dụng.', 599000, 'Phụ kiện', 42, true, '["/uploads/products/balo-thoi-trang.jpg"]', '["Arctic Hunter", "Phụ kiện"]', NOW()),
('Giày Sneaker Trắng Unisex', 'Giày sneaker trắng basic phong cách minimalist. Chất liệu canvas cao cấp, đế cao su chống trơn. Dễ phối đồ mọi trang phục.', 799000, 'Phụ kiện', 35, true, '["/uploads/products/giay-sneaker-trang.jpg"]', '["Ananas", "Phụ kiện"]', NOW()),
('Dép Sandal Nữ Êm Chân', 'Dép sandal nữ êm ái, đế êm chống trượt. Quai ngang thời trang, thiết kế tối giản. Phù hợp mùa hè, đi biển, dạo phố.', 249000, 'Phụ kiện', 55, false, '["/uploads/products/dep-sandal-nu.jpg"]', '["Juno", "Phụ kiện"]', NOW()),
('Tất Nam Cao Cổ Thể Thao', 'Tất nam cao cổ thể thao, chất cotton thoáng khí. Thun co giãn tốt, không bai. Combo 3 đôi đồng màu hoặc mix màu.', 49000, 'Phụ kiện', 100, false, '["/uploads/products/tat-nam-cao-co.jpg"]', '["Biti\'s", "Phụ kiện"]', NOW()),
('Khăn Choàng Cổ Nam Nữ', 'Khăn choàng cổ len ấm áp mùa đông. Chất len mềm mại không xù, nhiều màu sắc. Dài 180cm phù hợp cả nam và nữ.', 199000, 'Phụ kiện', 48, false, '["/uploads/products/khan-choang-co.jpg"]', '["Canifa", "Phụ kiện"]', NOW()),
('Găng Tay Len Cảm Ứng', 'Găng tay len mùa đông có khả năng cảm ứng điện thoại. Chất len ấm áp, bo cổ tay chặt. Có nhiều màu sắc trẻ trung.', 129000, 'Phụ kiện', 52, false, '["/uploads/products/gang-tay-len.jpg"]', '["Yody", "Phụ kiện"]', NOW()),
('Túi Đeo Chéo Nam Vải', 'Túi đeo chéo nam vải canvas cao cấp chống thấm nước. Nhiều ngăn tiện dụng, quai đeo chắc chắn. Phong cách năng động trẻ trung.', 299000, 'Phụ kiện', 40, false, '["/uploads/products/tui-deo-cheo-nam.jpg"]', '["The Blues", "Phụ kiện"]', NOW());

-- Sale items (5 sản phẩm giảm giá)
INSERT INTO products (name, description, price, category, stock, featured, images, tags, created_at) VALUES
('Áo Thun Basic Sale 99k', 'Áo thun basic giảm giá đặc biệt, chất lượng tốt giá ưu đãi. Cotton 100% mềm mại thoáng mát. Form regular fit. Hàng tồn kho giảm sâu.', 99000, 'Nam', 80, false, '["/uploads/products/ao-thun-basic-sale.jpg"]', '["Coolmate", "Nam", "Sale"]', NOW()),
('Áo Tank Top Nữ Sale', 'Áo tank top nữ mát mẻ, giá sale cực sốc chỉ 99k. Chất liệu cotton spandex co giãn. Form ôm dáng. Nhiều màu sắc trẻ trung.', 99000, 'Nữ', 75, false, '["/uploads/products/ao-tank-top-nu-sale.jpg"]', '["Xita", "Nữ", "Sale"]', NOW()),
('Combo 5 Đôi Tất/Vớ', 'Combo 5 đôi tất/vớ cotton cao cấp, giá ưu đãi. Chất cotton thoáng khí thấm mồ hôi. Co giãn tốt, bền màu. Mix nhiều màu.', 99000, 'Phụ kiện', 120, false, '["/uploads/products/tat-combo-5-doi.jpg"]', '["Canifa", "Phụ kiện", "Sale"]', NOW()),
('Quần Short Jean Nam Sale', 'Quần short jean nam giá sale 199k. Chất denim co giãn thoải mái. Túi năm túi cơ bản. Hàng sale cuối mùa.', 199000, 'Nam', 60, false, '["/uploads/products/quan-short-jean-sale.jpg"]', '["Yody", "Nam", "Sale"]', NOW()),
('Áo Sơ Mi Nữ Sale 199k', 'Áo sơ mi nữ giá sale 199k. Chất vải mềm mại thoáng mát. Thiết kế basic dễ phối đồ. Giảm giá từ 399k.', 199000, 'Nữ', 55, false, '["/uploads/products/ao-som-mi-nu-sale.jpg"]', '["IVY moda", "Nữ", "Sale"]', NOW());

-- Xem kết quả
SELECT 
    category, 
    COUNT(*) as total_products,
    MIN(price) as min_price,
    MAX(price) as max_price,
    AVG(price)::numeric(10,0) as avg_price
FROM products 
GROUP BY category
ORDER BY category;
