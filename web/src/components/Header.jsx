import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCart } from '@/hooks/useCart.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OTPLoginModal from './OTPLoginModal.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center">
              <h1 className="text-3xl font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                <span className="text-primary">LUXE</span>
              </h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors duration-200">
                Trang chủ
              </Link>
              <Link to="/products?category=Nam" className="text-sm font-medium hover:text-primary transition-colors duration-200">
                Nam
              </Link>
              <Link to="/products?category=Nữ" className="text-sm font-medium hover:text-primary transition-colors duration-200">
                Nữ
              </Link>
              <Link to="/products?category=Trẻ em" className="text-sm font-medium hover:text-primary transition-colors duration-200">
                Trẻ em
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 text-foreground"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </form>

              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </Button>
              </Link>

              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="cursor-pointer w-full">Tài khoản cá nhân</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="cursor-pointer w-full">Lịch sử đơn hàng</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  <User className="w-5 h-5" />
                </Button>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Trang chủ
                </Link>
                <Link to="/products?category=Nam" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Nam
                </Link>
                <Link to="/products?category=Nữ" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Nữ
                </Link>
                <Link to="/products?category=Trẻ em" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Trẻ em
                </Link>
                <Link to="/cart" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Giỏ hàng ({getItemCount()})
                </Link>
                <div className="border-t border-border pt-4 flex flex-col space-y-4">
                  {currentUser ? (
                    <>
                      <Link to="/account" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                        Tài khoản cá nhân
                      </Link>
                      <Link to="/orders" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                        Lịch sử đơn hàng
                      </Link>
                      <button className="text-sm font-medium text-left text-destructive" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <button 
                      className="text-sm font-medium text-left text-primary" 
                      onClick={() => { setIsLoginModalOpen(true); setMobileMenuOpen(false); }}
                    >
                      Đăng nhập / Đăng ký
                    </button>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <OTPLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}