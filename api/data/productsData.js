// Danh sách sản phẩm - Tách riêng để dễ quản lý
// Ảnh sẽ được đặt trong web/public/uploads/products/

// Sản phẩm Nam
const menProducts = [
  { 
    name: 'Áo Sơ Mi Nam Oxford Trắng Premium', 
    brand: 'Routine', 
    price: 399000, 
    category: 'Nam', 
    image: 'ao-som-mi-trang-nam.jpg',
    description: 'Áo sơ mi Oxford cao cấp, chất liệu cotton 100% nhập khẩu, form slim fit thanh lịch, phù hợp công sở và dự tiệc. Đường may tỉ mỉ, độ bền cao.'
  },
  { 
    name: 'Quần Âu Nam Slim Fit Hàn Quốc', 
    brand: 'Owen', 
    price: 599000, 
    category: 'Nam', 
    image: 'quan-au-slim-nam.jpg',
    description: 'Quần âu nam form slim fit, vải Hàn cao cấp chống nhăn, thoáng mát. Thiết kế 2 túi sau nắp, 2 túi trước xéo. Phù hợp công sở và sự kiện.'
  },
  { 
    name: 'Áo Thun Nam Basic Coolmate', 
    brand: 'Coolmate', 
    price: 199000, 
    category: 'Nam', 
    image: 'ao-thun-basic-nam.jpg',
    description: 'Áo thun basic cotton thoáng mát, form regular phù hợp mọi vóc dáng. Chất liệu cotton USA cao cấp, thấm hút mồ hôi tốt, không xù lông.'
  },
  { 
    name: 'Áo Khoác Bomber Nam Streetwear', 
    brand: 'Local Brand', 
    price: 899000, 
    category: 'Nam', 
    image: 'ao-khoac-bomber-nam.jpg',
    description: 'Áo khoác bomber thời trang, phong cách streetwear năng động. Chất liệu dù cao cấp chống nước nhẹ, lót bên trong mềm mại. Có nhiều màu sắc.'
  },
  { 
    name: 'Quần Jean Nam Skinny Fit', 
    brand: 'Yody', 
    price: 499000, 
    category: 'Nam', 
    image: 'quan-jean-skinny-nam.jpg',
    description: 'Quần jean nam form skinny, vải denim co giãn thoải mái 98% cotton + 2% spandex. Bền màu, không phai. Thiết kế túi năm túi cơ bản.'
  },
  { 
    name: 'Áo Polo Nam Cao Cấp Pique', 
    brand: 'Canifa', 
    price: 349000, 
    category: 'Nam', 
    image: 'ao-polo-cao-cap-nam.jpg',
    description: 'Áo polo nam chất liệu pique cao cấp, thoáng khí và lịch sự. Form regular fit thoải mái, cổ bo rib, có nút cài. Phù hợp đi chơi và công sở.'
  },
  { 
    name: 'Áo Hoodie Nam Oversize Premium', 
    brand: 'Dirty Coins', 
    price: 599000, 
    category: 'Nam', 
    image: 'ao-hoodie-oversize-nam.jpg',
    description: 'Áo hoodie form oversize trendy, chất nỉ ngoại dày dặn ấm áp. Có mũ trùm đầu với dây rút, túi kangaroo phía trước. In logo độc đáo.'
  },
  { 
    name: 'Quần Short Nam Thể Thao Active', 
    brand: 'Yody', 
    price: 299000, 
    category: 'Nam', 
    image: 'quan-short-the-thao-nam.jpg',
    description: 'Quần short thể thao, vải thấm hút mồ hôi tốt, co giãn 4 chiều. Có túi khóa kéo an toàn, dây rút eo điều chỉnh. Phù hợp tập gym, chạy bộ.'
  },
  { 
    name: 'Áo Blazer Nam Formal Hàn Quốc', 
    brand: 'Owen', 
    price: 1299000, 
    category: 'Nam', 
    image: 'ao-blazer-formal-nam.jpg',
    description: 'Áo blazer nam cao cấp, vải Hàn Quốc chống nhăn. Thiết kế 2 nút, có túi trong, lót lụa mềm mại. Phù hợp dự tiệc, công sở và sự kiện quan trọng.'
  },
  { 
    name: 'Áo Phông Tay Dài Nam Basic', 
    brand: 'The Blues', 
    price: 249000, 
    category: 'Nam', 
    image: 'ao-phong-tay-dai-nam.jpg',
    description: 'Áo phông tay dài basic, chất liệu cotton mềm mại thoáng mát. Form regular fit thoải mái, cổ tròn, may kỹ bo gấu. Dễ phối đồ mọi phong cách.'
  },
  { 
    name: 'Áo Thun Polo Nam Xuất Khẩu', 
    brand: 'Routine', 
    price: 329000, 
    category: 'Nam', 
    image: 'ao-polo-xuat-khau-nam.jpg',
    description: 'Áo polo nam xuất khẩu Châu Âu, chất pique cotton cao cấp. Thiết kế cổ bo có nút, tay áo bo rib. Hàng xuất dư xịn.'
  },
  { 
    name: 'Quần Kaki Nam Túi Hộp', 
    brand: 'The Blues', 
    price: 449000, 
    category: 'Nam', 
    image: 'quan-kaki-tui-hop-nam.jpg',
    description: 'Quần kaki nam túi hộp phong cách cargo. Chất vải kaki cao cấp chống nhăn, nhiều túi tiện dụng. Form regular fit thoải mái.'
  },
  { 
    name: 'Áo Khoác Dù Nam Chống Nước', 
    brand: 'Yody', 
    price: 599000, 
    category: 'Nam', 
    image: 'ao-khoac-du-chong-nuoc-nam.jpg',
    description: 'Áo khoác dù nam chống nước, chống gió. Chất liệu polyester cao cấp, có mũ trùm. Túi khóa kéo an toàn, lót bên trong mesh thoáng khí.'
  },
  { 
    name: 'Áo Sweater Nam Len Cổ Tròn', 
    brand: 'Canifa', 
    price: 499000, 
    category: 'Nam', 
    image: 'ao-sweater-len-nam.jpg',
    description: 'Áo sweater len nam cổ tròn, chất len lông cừu pha acrylic. Ấm áp, mềm mại, không xù. Phù hợp mùa đông, dễ phối đồ.'
  },
  { 
    name: 'Quần Jogger Nam Thể Thao', 
    brand: 'Coolmate', 
    price: 399000, 
    category: 'Nam', 
    image: 'quan-jogger-the-thao-nam.jpg',
    description: 'Quần jogger nam thể thao co giãn 4 chiều. Chất liệu polyester thoáng mát, bo gấu chun. Có túi khóa kéo, dây rút eo.'
  },
];

// Sản phẩm Nữ
const womenProducts = [
  { 
    name: 'Đầm Công Sở Thanh Lịch Premium', 
    brand: 'Elise', 
    price: 699000, 
    category: 'Nữ', 
    image: 'dam-cong-so-thanh-lich.jpg',
    description: 'Đầm công sở thanh lịch, thiết kế tinh tế phù hợp môi trường văn phòng. Chất liệu vải Hàn cao cấp, form dáng ôm duyên dáng, có lót trong.'
  },
  { 
    name: 'Áo Sơ Mi Nữ Trắng Lụa', 
    brand: 'Juno', 
    price: 449000, 
    category: 'Nữ', 
    image: 'ao-som-mi-trang-nu.jpg',
    description: 'Áo sơ mi trắng basic, chất liệu lụa tơ tằm mềm mại sang trọng. Thiết kế cổ vest, tay dài có nút khuy. Dễ phối với chân váy, quần âu.'
  },
  { 
    name: 'Chân Váy Midi Xòe Hàn Quốc', 
    brand: 'IVY moda', 
    price: 599000, 
    category: 'Nữ', 
    image: 'chan-vay-midi-xoe.jpg',
    description: 'Chân váy midi xòe nhẹ nhàng, điệu đà và nữ tính. Chất vải voan cao cấp, có lót trong. Thiết kế xòe nhẹ tôn dáng, có khóa kéo sau.'
  },
  { 
    name: 'Áo Blazer Nữ Hàn Quốc Premium', 
    brand: 'Elise', 
    price: 999000, 
    category: 'Nữ', 
    image: 'ao-blazer-han-quoc-nu.jpg',
    description: 'Áo blazer nữ phong cách Hàn Quốc, form dáng thanh lịch hiện đại. Chất vải Hàn chống nhăn, có lót lụa. Thiết kế 1 nút, vai phom ngang.'
  },
  { 
    name: 'Đầm Dự Tiệc Sang Trọng', 
    brand: 'Biluxury', 
    price: 1599000, 
    category: 'Nữ', 
    image: 'dam-du-tiec-sang-trong.jpg',
    description: 'Đầm dự tiệc cao cấp, thiết kế sang trọng phù hợp sự kiện quan trọng. Chất liệu vải lụa cao cấp, đính kết tinh tế, form dáng đuôi cá tôn dáng.'
  },
  { 
    name: 'Quần Jean Nữ Ống Rộng Baggy', 
    brand: 'Lime Orange', 
    price: 549000, 
    category: 'Nữ', 
    image: 'quan-jean-ong-rong-nu.jpg',
    description: 'Quần jean ống rộng trendy, phong cách năng động trẻ trung. Chất vải denim cao cấp bền màu, thiết kế túi năm túi, có nhiều màu sắc.'
  },
  { 
    name: 'Áo Len Nữ Cardigan Cao Cấp', 
    brand: 'Kiza', 
    price: 499000, 
    category: 'Nữ', 
    image: 'ao-len-cardigan-nu.jpg',
    description: 'Áo len cardigan mềm mại, ấm áp phù hợp mùa đông. Chất len lông cừu pha acrylic, không xù. Thiết kế dáng dài, có nút cài tiện lợi.'
  },
  { 
    name: 'Set Đồ Nữ 2 Món Công Sở', 
    brand: 'NEM', 
    price: 899000, 
    category: 'Nữ', 
    image: 'set-do-nu-2-mon.jpg',
    description: 'Set đồ nữ 2 món phối hợp hoàn hảo, tiện lợi và thời trang. Bao gồm áo blazer và chân váy/quần đồng bộ. Chất liệu vải Hàn cao cấp.'
  },
  { 
    name: 'Áo Kiểu Nữ Hoa Nhí Vintage', 
    brand: 'May 10', 
    price: 379000, 
    category: 'Nữ', 
    image: 'ao-kieu-hoa-nhi-nu.jpg',
    description: 'Áo kiểu hoa nhí nữ tính, chất vải voan mát mẻ phù hợp mùa hè. Thiết kế cổ tròn, tay bồng nhẹ. Họa tiết hoa nhí vintage nữ tính.'
  },
  { 
    name: 'Đầm Maxi Dạo Phố Bohemian', 
    brand: 'VietCharm', 
    price: 799000, 
    category: 'Nữ', 
    image: 'dam-maxi-dao-pho.jpg',
    description: 'Đầm maxi dài thanh lịch, thoải mái cho những chuyến dạo phố. Chất vải voan nhẹ nhàng, họa tiết bohemian, form dáng xòe bay bổng.'
  },
  { 
    name: 'Váy Denim Nữ Xòe', 
    brand: 'IVY moda', 
    price: 479000, 
    category: 'Nữ', 
    image: 'vay-denim-nu-xoe.jpg',
    description: 'Váy denim xòe phong cách trẻ trung. Chất vải denim mềm mại, có túi trước, khóa kéo sau. Dễ phối với áo thun, áo kiểu.'
  },
  { 
    name: 'Áo Thun Nữ Form Rộng', 
    brand: 'Local Brand', 
    price: 249000, 
    category: 'Nữ', 
    image: 'ao-thun-nu-form-rong.jpg',
    description: 'Áo thun nữ form rộng oversize trendy. Chất cotton cao cấp, mềm mại thoáng mát. In logo độc đáo, nhiều màu sắc. Phù hợp phong cách streetwear.'
  },
  { 
    name: 'Quần Tây Nữ Ống Đứng', 
    brand: 'Elise', 
    price: 599000, 
    category: 'Nữ', 
    image: 'quan-tay-nu-ong-dung.jpg',
    description: 'Quần tây nữ ống đứng công sở. Chất vải Hàn cao cấp chống nhăn, form dáng thanh lịch. Có túi sau nắp, khóa kéo bên hông.'
  },
  { 
    name: 'Váy Caro Vintage Nữ', 
    brand: 'NEM', 
    price: 529000, 
    category: 'Nữ', 
    image: 'vay-caro-vintage-nu.jpg',
    description: 'Váy caro phong cách vintage Pháp. Chất vải tweed cao cấp, họa tiết caro cổ điển. Form dáng chữ A tôn dáng, có lót trong.'
  },
  { 
    name: 'Áo Khoác Cardigan Dáng Dài Nữ', 
    brand: 'Kiza', 
    price: 649000, 
    category: 'Nữ', 
    image: 'ao-khoac-cardigan-dai-nu.jpg',
    description: 'Áo khoác cardigan dáng dài thanh lịch. Chất len cao cấp mềm mại ấm áp. Thiết kế không cổ, có túi hai bên. Phù hợp mùa thu đông.'
  },
];

// Phụ kiện
const accessories = [
  { 
    name: 'Túi Xách Da Cao Cấp', 
    brand: 'Juno', 
    price: 899000, 
    category: 'Phụ kiện', 
    image: 'tui-xach-da-cao-cap.jpg',
    description: 'Túi xách da thật cao cấp, thiết kế sang trọng đẳng cấp. Da bò thật 100%, đường chỉ may tỉ mỉ, khóa kéo YKK. Nhiều ngăn tiện dụng.'
  },
  { 
    name: 'Ví Nam Da Bò Handmade', 
    brand: 'Lados', 
    price: 399000, 
    category: 'Phụ kiện', 
    image: 'vi-nam-da-bo.jpg',
    description: 'Ví nam da bò thật 100%, handmade bền đẹp theo thời gian. Có nhiều ngăn thẻ, ngăn tiền, ngăn khóa kéo. Đường chỉ thủ công chắc chắn.'
  },
  { 
    name: 'Thắt Lưng Da Nam Premium', 
    brand: 'Owen', 
    price: 299000, 
    category: 'Phụ kiện', 
    image: 'that-lung-da-nam.jpg',
    description: 'Thắt lưng da nam cao cấp, khóa inox bền chắc không gỉ. Da thật 100%, có thể đảo chiều 2 màu. Chiều rộng 3.5cm phù hợp nam giới.'
  },
  { 
    name: 'Mũ Lưỡi Trai Snapback Premium', 
    brand: 'Local Brand', 
    price: 199000, 
    category: 'Phụ kiện', 
    image: 'mu-luoi-trai-snapback.jpg',
    description: 'Mũ lưỡi trai snapback thời trang, phong cách streetwear. Chất vải kaki cao cấp, vành phẳng cứng cáp. Logo thêu 3D nổi bật.'
  },
  { 
    name: 'Kính Mát Polarized UV400', 
    brand: 'Rayban Style', 
    price: 499000, 
    category: 'Phụ kiện', 
    image: 'kinh-mat-nam-nu.jpg',
    description: 'Kính mát chống tia UV 400, tròng Polarized chống chói. Gọng kim loại cao cấp, nhiều màu sắc. Phù hợp cả nam và nữ.'
  },
  { 
    name: 'Balo Laptop 15.6 inch', 
    brand: 'Arctic Hunter', 
    price: 599000, 
    category: 'Phụ kiện', 
    image: 'balo-thoi-trang.jpg',
    description: 'Balo laptop thời trang chống nước, ngăn laptop riêng 15.6 inch. Nhiều ngăn tiện lợi, quai đeo đệm êm. Cổng sạc USB tiện dụng.'
  },
  { 
    name: 'Giày Sneaker Trắng Unisex', 
    brand: 'Ananas', 
    price: 799000, 
    category: 'Phụ kiện', 
    image: 'giay-sneaker-trang.jpg',
    description: 'Giày sneaker trắng basic phong cách minimalist. Chất liệu canvas cao cấp, đế cao su chống trơn. Dễ phối đồ mọi trang phục.'
  },
  { 
    name: 'Dép Sandal Nữ Êm Chân', 
    brand: 'Juno', 
    price: 249000, 
    category: 'Phụ kiện', 
    image: 'dep-sandal-nu.jpg',
    description: 'Dép sandal nữ êm ái, đế êm chống trượt. Quai ngang thời trang, thiết kế tối giản. Phù hợp mùa hè, đi biển, dạo phố.'
  },
  { 
    name: 'Tất Nam Cao Cổ Thể Thao', 
    brand: 'Biti\'s', 
    price: 49000, 
    category: 'Phụ kiện', 
    image: 'tat-nam-cao-co.jpg',
    description: 'Tất nam cao cổ thể thao, chất cotton thoáng khí. Thun co giãn tốt, không bai. Combo 3 đôi đồng màu hoặc mix màu.'
  },
  { 
    name: 'Khăn Choàng Cổ Nam Nữ', 
    brand: 'Canifa', 
    price: 199000, 
    category: 'Phụ kiện', 
    image: 'khan-choang-co.jpg',
    description: 'Khăn choàng cổ len ấm áp mùa đông. Chất len mềm mại không xù, nhiều màu sắc. Dài 180cm phù hợp cả nam và nữ.'
  },
  { 
    name: 'Găng Tay Len Cảm Ứng', 
    brand: 'Yody', 
    price: 129000, 
    category: 'Phụ kiện', 
    image: 'gang-tay-len.jpg',
    description: 'Găng tay len mùa đông có khả năng cảm ứng điện thoại. Chất len ấm áp, bo cổ tay chặt. Có nhiều màu sắc trẻ trung.'
  },
  { 
    name: 'Túi Đeo Chéo Nam Vải', 
    brand: 'The Blues', 
    price: 299000, 
    category: 'Phụ kiện', 
    image: 'tui-deo-cheo-nam.jpg',
    description: 'Túi đeo chéo nam vải canvas cao cấp chống thấm nước. Nhiều ngăn tiện dụng, quai đeo chắc chắn. Phong cách năng động trẻ trung.'
  },
];

// Sale items (99k - 199k)
const saleProducts = [
  { 
    name: 'Áo Thun Basic Sale 99k', 
    brand: 'Coolmate', 
    price: 99000, 
    category: 'Nam', 
    image: 'ao-thun-basic-sale.jpg',
    description: 'Áo thun basic giảm giá đặc biệt, chất lượng tốt giá ưu đãi. Cotton 100% mềm mại thoáng mát. Form regular fit. Hàng tồn kho giảm sâu.'
  },
  { 
    name: 'Áo Tank Top Nữ Sale', 
    brand: 'Xita', 
    price: 99000, 
    category: 'Nữ', 
    image: 'ao-tank-top-nu-sale.jpg',
    description: 'Áo tank top nữ mát mẻ, giá sale cực sốc chỉ 99k. Chất liệu cotton spandex co giãn. Form ôm dáng. Nhiều màu sắc trẻ trung.'
  },
  { 
    name: 'Combo 5 Đôi Tất/Vớ', 
    brand: 'Canifa', 
    price: 99000, 
    category: 'Phụ kiện', 
    image: 'tat-combo-5-doi.jpg',
    description: 'Combo 5 đôi tất/vớ cotton cao cấp, giá ưu đãi. Chất cotton thoáng khí thấm mồ hôi. Co giãn tốt, bền màu. Mix nhiều màu.'
  },
  { 
    name: 'Quần Short Jean Nam Sale', 
    brand: 'Yody', 
    price: 199000, 
    category: 'Nam', 
    image: 'quan-short-jean-sale.jpg',
    description: 'Quần short jean nam giá sale 199k. Chất denim co giãn thoải mái. Túi năm túi cơ bản. Hàng sale cuối mùa.'
  },
  { 
    name: 'Áo Sơ Mi Nữ Sale 199k', 
    brand: 'IVY moda', 
    price: 199000, 
    category: 'Nữ', 
    image: 'ao-som-mi-nu-sale.jpg',
    description: 'Áo sơ mi nữ giá sale 199k. Chất vải mềm mại thoáng mát. Thiết kế basic dễ phối đồ. Giảm giá từ 399k.'
  },
];

module.exports = {
  menProducts,
  womenProducts,
  accessories,
  saleProducts,
  allProducts: [...menProducts, ...womenProducts, ...accessories, ...saleProducts]
};
