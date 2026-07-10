import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, Twitter, Youtube, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Footer() {
  return (
    <>
      {/* Feature Banner */}
      <div className="bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-gray-700">
            {/* Miễn phí ship */}
            <div className="flex items-center space-x-3 pl-0">
              <div className="w-10 h-10 border-2 border-white rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-white">
                <div className="font-bold text-sm uppercase">Miễn phí ship</div>
                <div className="text-xs text-gray-400">Toàn quốc</div>
              </div>
            </div>

            {/* Bảo hành */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 border-2 border-white rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-white">
                <div className="font-bold text-sm uppercase">Bảo hành</div>
                <div className="text-xs text-gray-400">365 ngày</div>
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 border-2 border-white rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-white">
                <div className="font-bold text-sm uppercase">Địa chỉ</div>
                <div className="text-xs text-gray-400">Của hàng LUXE VN</div>
              </div>
            </div>

            {/* Tạp chí */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 border-2 border-white rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-white">
                <div className="font-bold text-sm uppercase">Tạp chí</div>
                <div className="text-xs text-gray-400">Thông tin thời trang</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div>
            <h3 className="text-3xl font-bold mb-6 text-white">
              LUXE
            </h3>
            <div className="w-8 h-0.5 bg-primary mb-6"></div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                <p>TP.HCM</p>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                <p>Hà Nội</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                <a href="tel:0123456789" className="hover:text-primary transition-colors">
                  0865 577 745
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 flex-shrink-0 text-primary" />
                <a href="mailto:contact@luxe.vn" className="hover:text-primary transition-colors">
                  contact@luxe.vn
                </a>
              </div>
            </div>
            <p className="text-xs mt-6 text-gray-400">
              THỜI TRANG LUXE
            </p>
          </div>

          {/* About Section */}
          <div>
            <h4 className="text-base font-bold mb-4 text-white uppercase tracking-wide">Về chúng tôi</h4>
            <div className="w-8 h-0.5 bg-primary mb-4"></div>
            <nav className="flex flex-col space-y-2.5 text-sm">
              <Link to="/about" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Giới thiệu
              </Link>
              <Link to="/brands" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Thương hiệu đối tác
              </Link>
              <Link to="/stores" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Hệ thống cửa hàng
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Liên hệ hợp tác
              </Link>
            </nav>
          </div>

          {/* Customer Service Section */}
          <div>
            <h4 className="text-base font-bold mb-4 text-white uppercase tracking-wide">Chăm sóc khách hàng</h4>
            <div className="w-8 h-0.5 bg-primary mb-4"></div>
            <nav className="flex flex-col space-y-2.5 text-sm">
              <Link to="/policy/customer" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Chính sách khách hàng
              </Link>
              <Link to="/policy/payment" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Chính sách thanh toán
              </Link>
              <Link to="/policy/shipping" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Chính sách giao nhận
              </Link>
              <Link to="/policy/return" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Chính sách đổi trả
              </Link>
              <Link to="/policy/warranty" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Chính sách bảo hành
              </Link>
              <Link to="/policy/privacy" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Chính sách bảo mật
              </Link>
              <Link to="/size-guide" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Hướng dẫn chọn size
              </Link>
            </nav>
          </div>

          {/* Newsletter Section */}
          <div>
            <h4 className="text-base font-bold mb-4 text-white uppercase tracking-wide">Đăng ký nhận tin</h4>
            <div className="w-8 h-0.5 bg-primary mb-4"></div>
            <p className="text-sm mb-4 text-gray-300">
              Nhận thông tin sản phẩm mới và ưu đãi đặc biệt
            </p>
            <div className="flex gap-2 mb-6">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button className="bg-primary hover:bg-primary/90 text-black px-6 font-semibold">
                Đăng ký
              </Button>
            </div>
            
            <h5 className="text-sm font-semibold mb-3 text-white">Kết nối với chúng tôi</h5>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 bg-sky-500 rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors">
                <Twitter className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                <Youtube className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors">
                <MessageCircle className="w-4 h-4 text-white" />
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <h5 className="text-sm font-semibold mb-3 text-white">Phương thức thanh toán</h5>
              <div className="flex flex-wrap gap-2">
                <div className="w-12 h-8 bg-white rounded flex items-center justify-center text-[10px] font-bold text-blue-600">
                  VISA
                </div>
                <div className="w-12 h-8 bg-gradient-to-r from-red-600 to-orange-500 rounded flex items-center justify-center text-[10px] font-bold text-white">
                  MC
                </div>
                <div className="w-12 h-8 bg-white rounded flex items-center justify-center text-[10px] font-bold text-pink-600">
                  Momo
                </div>
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-[10px] font-bold text-white">
                  ZaloPay
                </div>
                <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-[10px] font-bold text-white">
                  COD
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2026 LUXE Fashion. Bản quyền thuộc Thời trang LUXE.
          </p>
          <div className="flex items-center gap-3">
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2300a8e1' stroke='white' stroke-width='3'/%3E%3Cpath d='M35 50 L45 60 L65 40' fill='none' stroke='white' stroke-width='5' stroke-linecap='round'/%3E%3C/svg%3E"
              alt="Verified"
              className="w-14 h-14"
            />
            <div className="text-xs text-gray-400">
              <div className="font-semibold text-white">ĐÃ THÔNG BÁO</div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
