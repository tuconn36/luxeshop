import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-primary">LUXE</span>
            </h3>
            <p className="text-sm leading-relaxed opacity-80">
              Thời trang cao cấp cho phong cách sống hiện đại
            </p>
          </div>

          <div>
            <span className="font-semibold mb-4 block">Liên kết</span>
            <nav className="flex flex-col space-y-2">
              <Link to="/products" className="text-sm opacity-80 hover:opacity-100 transition-opacity duration-200">
                Sản phẩm
              </Link>
              <Link to="/products?category=Nam" className="text-sm opacity-80 hover:opacity-100 transition-opacity duration-200">
                Thời trang Nam
              </Link>
              <Link to="/products?category=Nữ" className="text-sm opacity-80 hover:opacity-100 transition-opacity duration-200">
                Thời trang Nữ
              </Link>
            </nav>
          </div>

          <div>
            <span className="font-semibold mb-4 block">Hỗ trợ</span>
            <nav className="flex flex-col space-y-2">
              <Link to="/account" className="text-sm opacity-80 hover:opacity-100 transition-opacity duration-200">
                Tài khoản
              </Link>
              <Link to="/orders" className="text-sm opacity-80 hover:opacity-100 transition-opacity duration-200">
                Đơn hàng
              </Link>
              <span className="text-sm opacity-80">Chính sách bảo mật</span>
              <span className="text-sm opacity-80">Điều khoản dịch vụ</span>
            </nav>
          </div>

          <div>
            <span className="font-semibold mb-4 block">Liên hệ</span>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2 text-sm opacity-80">
                <Phone className="w-4 h-4" />
                <span>0123 456 789</span>
              </div>
              <div className="flex items-center space-x-2 text-sm opacity-80">
                <Mail className="w-4 h-4" />
                <span>contact@luxe.vn</span>
              </div>
              <div className="flex items-center space-x-2 text-sm opacity-80">
                <MapPin className="w-4 h-4" />
                <span>Hà Nội, Việt Nam</span>
              </div>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="opacity-80 hover:opacity-100 transition-opacity duration-200">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="opacity-80 hover:opacity-100 transition-opacity duration-200">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-sm opacity-80">
            © 2026 LUXE. Bản quyền thuộc về LUXE Fashion Store.
          </p>
        </div>
      </div>
    </footer>
  );
}