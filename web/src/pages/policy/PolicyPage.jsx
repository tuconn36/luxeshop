import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';

const policies = {
  customer: {
    title: 'Chính sách khách hàng',
    sections: [
      {
        heading: 'Quyền lợi khách hàng',
        content: 'Mọi khách hàng đều được hưởng chương trình tích điểm khi mua hàng. Điểm tích lũy có thể quy đổi thành voucher giảm giá cho các đơn hàng tiếp theo.',
      },
      {
        heading: 'Phân loại thành viên',
        content: 'Silver: Chi tiêu từ 1 triệu/năm — giảm 5%. Gold: Chi tiêu từ 5 triệu/năm — giảm 10%. Platinum: Chi tiêu từ 15 triệu/năm — giảm 15% và ưu tiên hỗ trợ.',
      },
      {
        heading: 'Bảo vệ quyền lợi',
        content: 'LUXE cam kết bảo vệ thông tin cá nhân khách hàng và không chia sẻ với bên thứ ba khi chưa có sự đồng ý.',
      },
    ],
  },
  payment: {
    title: 'Chính sách thanh toán',
    sections: [
      {
        heading: 'Phương thức thanh toán',
        content: 'Chúng tôi chấp nhận: Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng, Ví điện tử MoMo, ZaloPay, Thẻ VISA/Mastercard.',
      },
      {
        heading: 'Xác nhận đơn hàng',
        content: 'Đơn hàng sẽ được xác nhận qua email/SMS sau khi thanh toán thành công. Với COD, đơn hàng xác nhận sau khi nhân viên liên hệ.',
      },
      {
        heading: 'Hoàn tiền',
        content: 'Trường hợp hủy đơn sau khi thanh toán online, tiền sẽ được hoàn lại trong 3-5 ngày làm việc.',
      },
    ],
  },
  shipping: {
    title: 'Chính sách giao nhận',
    sections: [
      {
        heading: 'Thời gian giao hàng',
        content: 'Nội thành TP.HCM và Hà Nội: 1-2 ngày làm việc. Các tỉnh thành khác: 3-5 ngày làm việc.',
      },
      {
        heading: 'Phí vận chuyển',
        content: 'Miễn phí ship cho đơn hàng từ 500.000₫. Đơn dưới 500.000₫ phí ship từ 25.000₫ tùy khu vực.',
      },
      {
        heading: 'Theo dõi đơn hàng',
        content: 'Sau khi giao hàng cho đơn vị vận chuyển, bạn sẽ nhận mã theo dõi qua email/SMS.',
      },
    ],
  },
  return: {
    title: 'Chính sách đổi trả',
    sections: [
      {
        heading: 'Điều kiện đổi trả',
        content: 'Sản phẩm được đổi trả trong 7 ngày kể từ ngày nhận hàng. Sản phẩm còn nguyên tem, nhãn, chưa qua sử dụng, không giặt.',
      },
      {
        heading: 'Quy trình đổi trả',
        content: '1. Liên hệ hotline hoặc email để được hỗ trợ. 2. Gửi ảnh sản phẩm cần đổi trả. 3. Gửi hàng về kho LUXE. 4. Nhận sản phẩm mới hoặc hoàn tiền.',
      },
      {
        heading: 'Trường hợp không áp dụng',
        content: 'Sản phẩm sale trên 50%, đồ lót, đồ bơi không được áp dụng đổi trả vì lý do vệ sinh.',
      },
    ],
  },
  warranty: {
    title: 'Chính sách bảo hành',
    sections: [
      {
        heading: 'Thời hạn bảo hành',
        content: 'LUXE bảo hành 365 ngày cho các lỗi kỹ thuật từ nhà sản xuất như: đứt chỉ, bung keo, phai màu bất thường.',
      },
      {
        heading: 'Quy trình bảo hành',
        content: 'Mang sản phẩm kèm hóa đơn mua hàng đến bất kỳ cửa hàng LUXE hoặc liên hệ hotline để được hỗ trợ.',
      },
      {
        heading: 'Không áp dụng bảo hành',
        content: 'Hư hỏng do sử dụng sai cách, tai nạn, giặt không đúng hướng dẫn trên nhãn mác.',
      },
    ],
  },
  privacy: {
    title: 'Chính sách bảo mật',
    sections: [
      {
        heading: 'Thu thập thông tin',
        content: 'Chúng tôi chỉ thu thập thông tin cần thiết để xử lý đơn hàng: họ tên, địa chỉ giao hàng, số điện thoại, email.',
      },
      {
        heading: 'Sử dụng thông tin',
        content: 'Thông tin được sử dụng để: xử lý đơn hàng, gửi thông báo trạng thái, hỗ trợ chăm sóc khách hàng.',
      },
      {
        heading: 'Bảo vệ thông tin',
        content: 'Dữ liệu được mã hóa SSL. Chúng tôi không bán hoặc cho thuê thông tin khách hàng cho bên thứ ba.',
      },
    ],
  },
};

export default function PolicyPage() {
  const { type } = useParams();
  const policy = policies[type];

  if (!policy) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Không tìm thấy trang này.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{policy.title} - LUXE</title>
      </Helmet>
      <Header />
      <div className="min-h-screen">
        <div className="bg-black text-white py-16 text-center">
          <h1 className="text-4xl font-bold mb-3">{policy.title}</h1>
          <p className="text-gray-300">Cập nhật lần cuối: 01/01/2026</p>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
          {policy.sections.map((section, i) => (
            <div key={i} className="border-b pb-8 last:border-0">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                {section.heading}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
