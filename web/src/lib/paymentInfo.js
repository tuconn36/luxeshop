// Thông tin thanh toán - chỉnh sửa tại đây để cập nhật cho cả CheckoutPage và OrderCard
export const PAYMENT_INFO = {
  cod: {
    label: 'Thanh toán khi nhận hàng (COD)',
    shortLabel: 'COD',
    icon: 'Truck',
    description: 'Quý khách sẽ thanh toán bằng tiền mặt cho nhân viên giao hàng khi nhận được đơn hàng.',
    details: [
      'Kiểm tra kỹ sản phẩm trước khi thanh toán',
      'Phí COD: MIỄN PHÍ cho tất cả đơn hàng',
      'Áp dụng toàn quốc'
    ]
  },
  bank: {
    label: 'Chuyển khoản ngân hàng (thủ công)',
    shortLabel: 'Chuyển khoản',
    icon: 'Building2',
    description: 'Quý khách chuyển khoản qua ngân hàng. Đơn hàng sẽ được xử lý sau khi nhận được thanh toán.',
    bankName: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
    accountName: 'CONG TY TNHH LUXE JEWELRY',
    accountNumber: '1234 5678 9012',
    branch: 'Chi nhánh Hà Nội',
    swift: 'BFTVVNVX',
    transferNote: 'Vui lòng ghi rõ MÃ ĐƠN HÀNG trong nội dung chuyển khoản để được xử lý nhanh nhất.',
    details: [
      'Đơn hàng được xử lý trong 1-24h sau khi nhận được chuyển khoản',
      'Vui lòng giữ lại biên lai chuyển khoản để đối chiếu',
      'Hỗ trợ xác nhận nhanh qua Zalo/Hotline: 1900 6868'
    ]
  },
  momo: {
    label: 'Ví MoMo',
    shortLabel: 'MoMo',
    icon: 'Wallet',
    description: 'Quý khách thanh toán qua ví điện tử MoMo. Nhanh chóng và tiện lợi.',
    momoName: 'LUXE JEWELRY',
    momoPhone: '0865 577 745',
    partnerCode: 'LUXE JEWELRY',
    transferNote: 'Mở app MoMo > Quét mã QR hoặc chuyển tiền đến số điện thoại trên.',
    details: [
      'Hỗ trợ thanh toán qua app MoMo trên điện thoại',
      'Xử lý tự động trong vòng 1-5 phút',
      'Hoàn tiền nhanh chóng nếu có sự cố'
    ]
  },
  vietqr: {
    label: 'Thanh toán QR (VietQR)',
    shortLabel: 'QR ngân hàng',
    icon: 'QrCode',
    description: 'Quét mã QR bằng app ngân hàng để thanh toán. Hỗ trợ tất cả ngân hàng nội địa Việt Nam.',
    transferNote: 'Hệ thống tự động xác nhận khi chuyển khoản thành công (qua Sepay). Bạn cũng có thể bấm "Tôi đã CK xong" để đẩy nhanh xử lý.',
    details: [
      'Mở app ngân hàng bất kỳ (Vietcombank, MbBank, Techcombank, ...) → quét QR',
      'Số tiền và nội dung CK được điền sẵn — chỉ cần xác nhận',
      'Đơn hàng tự động cập nhật trạng thái trong vài giây',
      'Không cần nhập thủ công STK hay nội dung'
    ]
  }
};

export const PAYMENT_METHODS = Object.entries(PAYMENT_INFO).map(([value, info]) => ({
  value,
  label: info.label,
  shortLabel: info.shortLabel
}));

export function getPaymentInfo(method) {
  return PAYMENT_INFO[method] || PAYMENT_INFO.cod;
}
