// Danh sách tỉnh/thành phố và quận/huyện của Việt Nam
export const VIETNAM_LOCATIONS = {
  'Hà Nội': ['Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Long Biên', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Hoàng Mai', 'Thanh Xuân', 'Sóc Sơn', 'Đông Anh', 'Gia Lâm', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Thanh Trì', 'Hà Đông', 'Sơn Tây'],
  'TP. Hồ Chí Minh': ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Tân Phú', 'Bình Tân', 'Thủ Đức', 'Nhà Bè', 'Cần Giờ', 'Củ Chi', 'Hóc Môn', 'Bình Chánh'],
  'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang', 'Hoàng Sa'],
  'Hải Phòng': ['Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An', 'Kiến An', 'Đồ Sơn', 'Dương Kinh', 'Thuỷ Nguyên', 'An Dương', 'An Lão', 'Kiến Thuỵ', 'Tiên Lãng', 'Vĩnh Bảo', 'Cát Hải', 'Bạch Long Vĩ'],
  'Cần Thơ': ['Ninh Kiều', 'Ô Môn', 'Bình Thuỷ', 'Cái Răng', 'Thốt Nốt', 'Vĩnh Thạnh', 'Cờ Đỏ', 'Phong Điền', 'Thới Lai'],
  'Bình Dương': ['Thủ Dầu Một', 'Dĩ An', 'Thuận An', 'Tân Uyên', 'Bến Cát', 'Bàu Bàng', 'Dầu Tiếng', 'Phú Giáo', 'Bắc Tân Uyên'],
  'Đồng Nai': ['Biên Hòa', 'Long Khánh', 'Long Thành', 'Nhơn Trạch', 'Vĩnh Cửu', 'Trảng Bom', 'Thống Nhất', 'Cẩm Mỹ', 'Tân Phú', 'Xuân Lộc', 'Định Quán'],
};

export const CITIES = Object.keys(VIETNAM_LOCATIONS).sort();

export const getDistricts = (city) => {
  return VIETNAM_LOCATIONS[city] || [];
};
