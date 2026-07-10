import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Phone, Globe, Tag, MapPin, Moon, Sun, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCart } from '@/hooks/useCart.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OTPLoginModal from '@/components/auth/OTPLoginModal.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function Header() {
  const { currentUser, logout } = useAuth();
  const { items, getItemCount, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showMenMegaMenu, setShowMenMegaMenu] = useState(false);
  const [showWomenMegaMenu, setShowWomenMegaMenu] = useState(false);
  const [showAccessoriesMegaMenu, setShowAccessoriesMegaMenu] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuTimeoutRef = React.useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      setShowTopBar(currentScrollY <= 50);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnterMen = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setShowMenMegaMenu(true);
    setShowWomenMegaMenu(false);
    setShowAccessoriesMegaMenu(false);
  };

  const handleMouseLeaveMen = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setShowMenMegaMenu(false);
    }, 200); // Increase timeout to 200ms
  };

  const handleMouseEnterWomen = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setShowWomenMegaMenu(true);
    setShowMenMegaMenu(false);
    setShowAccessoriesMegaMenu(false);
  };

  const handleMouseLeaveWomen = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setShowWomenMegaMenu(false);
    }, 200); // Increase timeout to 200ms
  };

  const handleMouseEnterAccessories = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setShowAccessoriesMegaMenu(true);
    setShowMenMegaMenu(false);
    setShowWomenMegaMenu(false);
  };

  const handleMouseLeaveAccessories = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setShowAccessoriesMegaMenu(false);
    }, 200); // Increase timeout to 200ms
  };

  const menCategories = {
    col1: [
      'Áo Thun',
      'Áo Polo',
      'Áo Sơ mi',
      'Áo Khoác',
      'Áo Nỉ Và Len',
      'Hoodie',
      'Tank Top - Áo Ba Lỗ',
      'Set đồ'
    ],
    col2: [
      'Quần Jean',
      'Quần Short',
      'Quần Kaki & Chino',
      'Quần Jogger - Quần Dài',
      'Quần Tây',
      'Quần Boxer',
      'Set Đồ'
    ],
    col3: [
      'Giày & Dép',
      'Balo, Túi & Ví',
      'Nón',
      'Thắt Lưng',
      'Vớ',
      'Mắt Kính'
    ]
  };

  const womenCategories = {
    col1: [
      'Áo Thun',
      'Áo Kiểu',
      'Áo Sơ mi',
      'Áo Khoác',
      'Áo Len & Cardigan',
      'Áo Hai Dây',
      'Áo Croptop',
      'Set đồ'
    ],
    col2: [
      'Váy',
      'Quần Jean',
      'Quần Short',
      'Quần Dài',
      'Quần Legging',
      'Đầm',
      'Jumpsuit & Yếm'
    ],
    col3: [
      'Giày & Dép',
      'Túi Xách',
      'Balo & Ví',
      'Nón',
      'Thắt Lưng',
      'Trang Sức',
      'Mắt Kính'
    ]
  };

  const accessoriesCategories = {
    col1: [
      'Nón & Mũ',
      'Mũ Lưỡi Trai',
      'Mũ Bucket',
      'Khăn Choàng',
      'Khẩu Trang'
    ],
    col2: [
      'Túi Xách',
      'Balo',
      'Ví',
      'Thắt Lưng',
      'Cà Vạt'
    ],
    col3: [
      'Giày Sneaker',
      'Dép',
      'Tất/Vớ',
      'Mắt Kính',
      'Trang Sức',
      'Đồng Hồ'
    ]
  };

  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'vi');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const dark = html.classList.contains('dark');
    setIsDark(dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  // Khởi tạo theme từ localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

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

  // Shop pages also use overlay style
  const isShopPage = ['/men', '/women', '/accessories', '/sale', '/new-arrivals'].includes(location.pathname);
  const isOverlay = (isHome || isShopPage) && !isScrolled;

  // Page-specific accent colors
  const getPageAccent = () => {
    switch (location.pathname) {
      case '/men': return { bg: 'bg-slate-900/90', border: 'border-slate-700/30', text: 'text-blue-400' };
      case '/women': return { bg: 'bg-rose-950/90', border: 'border-pink-500/30', text: 'text-pink-400' };
      case '/accessories': return { bg: 'bg-amber-950/90', border: 'border-amber-500/30', text: 'text-amber-400' };
      case '/sale': return { bg: 'bg-red-950/90', border: 'border-red-500/30', text: 'text-red-400' };
      case '/new-arrivals': return { bg: 'bg-orange-950/90', border: 'border-orange-500/30', text: 'text-orange-400' };
      default: return { bg: 'bg-neutral-950/90', border: 'border-white/10', text: 'text-primary' };
    }
  };
  const pageAccent = getPageAccent();

  const headerTop = 'sticky';
  const megaMenuTop = showTopBar ? '112px' : '72px';

  const navLinkClass = (path, isSale = false) => {
    const isActive = location.pathname === path;
    const baseClass = `text-[13px] font-medium tracking-[0.08em] uppercase transition-colors duration-300 relative group py-2`;
    const colorClass = isSale
      ? isActive ? pageAccent.text : isOverlay ? 'text-amber-300 hover:text-amber-200' : 'text-red-600/80 hover:text-red-600'
      : isActive ? (isOverlay ? pageAccent.text : 'text-foreground') : isOverlay ? 'text-white/80 hover:text-white' : 'text-foreground/80 hover:text-foreground';
    return `${baseClass} ${colorClass}`;
  };

  const iconBtnClass = isOverlay
    ? 'text-white hover:text-white hover:bg-white/10'
    : 'text-foreground hover:text-primary hover:bg-primary/10';

  return (
    <>
      {/* Top Bar */}
      <div
        className={`${headerTop} top-0 left-0 right-0 z-50 transition-all duration-500 ${
          showTopBar ? 'h-10 opacity-100' : 'h-0 opacity-0 overflow-hidden pointer-events-none'
        } ${
          isOverlay
            ? `${pageAccent.bg} backdrop-blur-md ${pageAccent.border} border-b`
            : 'bg-neutral-950 border-b border-neutral-800'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full overflow-hidden">
          <div className="flex items-center justify-between h-full text-[11px] tracking-wide text-white/90">
            <div className="flex items-center min-w-0 flex-1 md:flex-none">
              <div className="hidden md:flex items-center gap-2 shrink-0 mr-6">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold tracking-wider uppercase">
                  <Tag className="w-3 h-3" />
                  Sale
                </span>
                <span className="text-white/70">Miễn phí vận chuyển đơn từ 500.000₫</span>
              </div>
              <div className="md:hidden flex-1 overflow-hidden relative">
                <div className="flex animate-marquee whitespace-nowrap gap-8">
                  <span className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-primary" />
                    Miễn phí vận chuyển đơn từ 500.000₫
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-primary" />
                    Hotline: 0865 577 745
                  </span>
                  <span className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-primary" />
                    Miễn phí vận chuyển đơn từ 500.000₫
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-primary" />
                    Hotline: 0865 577 745
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0 mr-6">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <a href="tel:0865577745" className="hover:text-primary transition-colors">
                0865 577 745
              </a>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={toggleDark}
                className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 hover:text-primary transition-colors"
                title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <div className="relative group">
                <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{lang === 'vi' ? 'VI' : 'EN'}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                <div className="absolute right-0 top-full mt-2 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[140px] overflow-hidden">
                  <button
                    onClick={() => { setLang('vi'); localStorage.setItem('lang', 'vi'); }}
                    className={`w-full text-left px-4 py-2.5 text-xs hover:bg-white/5 transition-colors flex items-center gap-2 ${lang === 'vi' ? 'text-primary' : 'text-white/80'}`}
                  >
                    🇻🇳 Tiếng Việt {lang === 'vi' && '✓'}
                  </button>
                  <button
                    onClick={() => { setLang('en'); localStorage.setItem('lang', 'en'); }}
                    className={`w-full text-left px-4 py-2.5 text-xs hover:bg-white/5 transition-colors flex items-center gap-2 ${lang === 'en' ? 'text-primary' : 'text-white/80'}`}
                  >
                    🇬🇧 English {lang === 'en' && '✓'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`${headerTop} ${showTopBar ? 'top-10' : 'top-0'} left-0 right-0 z-50 transition-all duration-500 ${
          isOverlay
            ? `${pageAccent.bg} backdrop-blur-md ${pageAccent.border} border-b shadow-[0_4px_30px_rgb(0,0,0,0.15)]`
            : 'bg-background/95 backdrop-blur-xl border-b border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link to="/" className="group flex items-center gap-3 shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                isOverlay
                  ? `bg-white/10 border ${pageAccent.border} group-hover:${pageAccent.bg}`
                  : 'bg-primary/10 border border-primary/20 group-hover:bg-primary/20'
              }`}>
                <span className={`font-serif text-sm font-bold ${isOverlay ? pageAccent.text : 'text-primary'}`}>L</span>
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-serif text-2xl font-bold leading-none tracking-[0.12em] transition-colors ${
                    isOverlay ? 'text-white group-hover:text-white/80' : 'text-foreground group-hover:text-primary'
                  }`}
                >
                  LUXE
                </span>
                <span className={`text-[9px] tracking-[0.25em] uppercase mt-0.5 ${
                  isOverlay ? 'text-white/50' : 'text-muted-foreground'
                }`}>
                  Fashion House
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7">
              <Link to="/" className={navLinkClass('/')}>
                Trang chủ
                <span className={`absolute -bottom-0.5 left-0 h-px transition-all duration-300 ${
                  location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'
                } ${isOverlay ? (location.pathname === '/' ? pageAccent.text.replace('text-', 'bg-') : 'bg-white') : 'bg-primary'}`} />
              </Link>

              <Link to="/new-arrivals" className={navLinkClass('/new-arrivals')}>
                Hàng mới
                <span className={`absolute -bottom-0.5 left-0 h-px transition-all duration-300 ${
                  location.pathname === '/new-arrivals' ? 'w-full' : 'w-0 group-hover:w-full'
                } ${isOverlay ? (location.pathname === '/new-arrivals' ? pageAccent.text.replace('text-', 'bg-') : 'bg-white') : 'bg-primary'}`} />
              </Link>

              <Link to="/sale" className={navLinkClass('/sale', true)}>
                Ưu đãi 99k
                <span className={`absolute -bottom-0.5 left-0 h-px transition-all duration-300 ${
                  location.pathname === '/sale' ? 'w-full' : 'w-0 group-hover:w-full'
                } ${isOverlay ? (location.pathname === '/sale' ? 'bg-amber-300' : 'bg-white') : 'bg-red-600'}`} />
              </Link>

              {/* Nam Menu */}
              <div
                className="relative group"
                onMouseEnter={handleMouseEnterMen}
                onMouseLeave={handleMouseLeaveMen}
              >
                <Link to="/men" className={`${navLinkClass('/men')} inline-flex items-center gap-1`}>
                  Nam
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Link>
                <span className={`absolute -bottom-0.5 left-0 h-px transition-all duration-300 ${
                  location.pathname === '/men' ? 'w-full' : 'w-0 group-hover:w-full'
                } ${isOverlay ? (location.pathname === '/men' ? pageAccent.text.replace('text-', 'bg-') : 'bg-white') : 'bg-primary'}`} />
              </div>

              {/* Nữ Menu */}
              <div
                className="relative group"
                onMouseEnter={handleMouseEnterWomen}
                onMouseLeave={handleMouseLeaveWomen}
              >
                <Link to="/women" className={`${navLinkClass('/women')} inline-flex items-center gap-1`}>
                  Nữ
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Link>
                <span className={`absolute -bottom-0.5 left-0 h-px transition-all duration-300 ${
                  location.pathname === '/women' ? 'w-full' : 'w-0 group-hover:w-full'
                } ${isOverlay ? (location.pathname === '/women' ? pageAccent.text.replace('text-', 'bg-') : 'bg-white') : 'bg-primary'}`} />
              </div>

              {/* Phụ kiện Menu */}
              <div
                className="relative group"
                onMouseEnter={handleMouseEnterAccessories}
                onMouseLeave={handleMouseLeaveAccessories}
              >
                <Link to="/accessories" className={`${navLinkClass('/accessories')} inline-flex items-center gap-1`}>
                  Phụ kiện
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Link>
                <span className={`absolute -bottom-0.5 left-0 h-px transition-all duration-300 ${
                  location.pathname === '/accessories' ? 'w-full' : 'w-0 group-hover:w-full'
                } ${isOverlay ? (location.pathname === '/accessories' ? pageAccent.text.replace('text-', 'bg-') : 'bg-white') : 'bg-primary'}`} />
              </div>
            </nav>

            <div className="hidden md:flex items-center gap-1">
              <form onSubmit={handleSearch} className="relative hidden xl:block">
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-52 h-9 pl-10 pr-4 rounded-full text-sm transition-all duration-300 ${
                    isOverlay
                      ? 'bg-white/15 border-white/25 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40'
                      : 'bg-muted/50 border-transparent focus:bg-background focus:border-border'
                  }`}
                />
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isOverlay ? 'text-white/50' : 'text-muted-foreground'
                }`} />
              </form>

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="ghost" size="icon" className={`rounded-full ${iconBtnClass}`}>
                      <MapPin className="w-[18px] h-[18px]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8}>
                    <p className="font-medium">Cửa hàng LUXE</p>
                    <p className="text-xs opacity-75">Tìm cửa hàng gần bạn</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative group">
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            navigate('/login?redirect=/cart');
                          } else {
                            navigate('/cart');
                          }
                        }}
                      >
                        <Button variant="ghost" size="icon" className={`rounded-full ${iconBtnClass}`}>
                          <ShoppingCart className="w-[18px] h-[18px]" />
                          {getItemCount() > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                              {getItemCount()}
                            </span>
                          )}
                        </Button>
                      </button>

                      {getItemCount() > 0 && (
                        <div className="absolute right-0 top-full mt-3 w-80 bg-background/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] overflow-hidden animate-fade-in-down">
                          <div className="px-5 py-4 border-b border-border/60 bg-muted/30">
                            <p className="text-sm font-semibold">Giỏ hàng</p>
                            <p className="text-xs text-muted-foreground">{getItemCount()} sản phẩm</p>
                          </div>
                          <div className="max-h-[280px] overflow-y-auto">
                            {items.slice(0, 3).map((item) => (
                              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3 px-5 py-3 border-b border-border/40 hover:bg-muted/30 transition-colors">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-14 h-14 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.selectedSize && `Size: ${item.selectedSize}`}
                                    {item.selectedSize && item.selectedColor && ' · '}
                                    {item.selectedColor && `${item.selectedColor}`}
                                  </p>
                                  <p className="text-sm font-semibold text-primary mt-0.5">
                                    {item.price.toLocaleString('vi-VN')}₫ × {item.quantity}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="px-5 py-4 bg-muted/20">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm text-muted-foreground">Tổng cộng</span>
                              <span className="text-lg font-bold text-primary">
                                {getTotalPrice().toLocaleString('vi-VN')}₫
                              </span>
                            </div>
                            <Button 
                              className="w-full rounded-full"
                              onClick={() => navigate('/cart')}
                            >
                              Xem giỏ hàng
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8}>Giỏ hàng</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    {currentUser ? (
                      <Link to="/account">
                        <Button
                          variant="ghost"
                          className={`flex items-center gap-2 rounded-full px-2 ${iconBtnClass}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white font-semibold overflow-hidden ring-2 ring-primary/20">
                            {currentUser.avatar
                              ? <img src={currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:5000${currentUser.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                              : (currentUser.name ? currentUser.name[0].toUpperCase() : 'U')
                            }
                          </div>
                          <span className={`text-sm font-medium hidden xl:inline-block max-w-[100px] truncate ${
                            isOverlay ? 'text-white/90' : ''
                          }`}>
                            {currentUser.name || currentUser.email || currentUser.phone}
                          </span>
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full ${iconBtnClass}`}
                        onClick={() => setIsLoginModalOpen(true)}
                      >
                        <User className="w-[18px] h-[18px]" />
                      </Button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8}>
                    {currentUser ? (
                      <>
                        <p className="font-medium">Tài khoản</p>
                        <p className="text-xs opacity-75">{currentUser.name || currentUser.email || currentUser.phone}</p>
                      </>
                    ) : (
                      <p>Đăng nhập</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isOverlay ? 'text-white hover:bg-white/10' : 'hover:bg-muted'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className={`md:hidden py-5 border-t animate-fade-in-down ${
              isOverlay ? 'border-white/10' : 'border-border'
            }`}>
              <form onSubmit={handleSearch} className="relative mb-5">
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 rounded-full"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </form>
              <nav className="flex flex-col gap-1">
                {[
                  { to: '/', label: 'Trang chủ' },
                  { to: '/new-arrivals', label: 'Hàng mới về' },
                  { to: '/sale', label: 'Ưu đãi 99k', sale: true },
                  { to: '/men', label: 'Nam' },
                  { to: '/women', label: 'Nữ' },
                  { to: '/accessories', label: 'Phụ kiện' },
                  { to: '/cart', label: `Giỏ hàng (${getItemCount()})`, requiresAuth: true },
                ].map((item) => {
                  const handleClick = () => {
                    setMobileMenuOpen(false);
                    if (item.requiresAuth && !currentUser) {
                      navigate('/login?redirect=/cart');
                    } else {
                      navigate(item.to);
                    }
                  };
                  return (
                    <button
                      key={item.to}
                      onClick={handleClick}
                      className={`text-sm font-medium px-3 py-2.5 rounded-lg transition-colors text-left ${
                        item.sale
                          ? 'text-red-500'
                          : isOverlay
                            ? 'text-white/90 hover:bg-white/10'
                            : 'hover:bg-muted'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
                <div className={`border-t mt-3 pt-3 flex flex-col gap-1 ${isOverlay ? 'border-white/10' : 'border-border'}`}>
                  {currentUser ? (
                    <>
                      <Link to="/account" className={`text-sm font-medium px-3 py-2.5 rounded-lg ${isOverlay ? 'text-white/90 hover:bg-white/10' : 'hover:bg-muted'}`} onClick={() => setMobileMenuOpen(false)}>
                        Tài khoản cá nhân
                      </Link>
                      <Link to="/orders" className={`text-sm font-medium px-3 py-2.5 rounded-lg ${isOverlay ? 'text-white/90 hover:bg-white/10' : 'hover:bg-muted'}`} onClick={() => setMobileMenuOpen(false)}>
                        Lịch sử đơn hàng
                      </Link>
                      <button className="text-sm font-medium text-left px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <button
                      className="text-sm font-medium text-left px-3 py-2.5 rounded-lg text-primary hover:bg-primary/10"
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


      {/* Nam Menu */}
      {showMenMegaMenu && (
        <div
          className="fixed left-0 right-0 z-40"
          style={{ top: megaMenuTop }}
          onMouseEnter={handleMouseEnterMen}
          onMouseLeave={handleMouseLeaveMen}
        >
          <div className="bg-background/95 backdrop-blur-xl border-b border-border/60 shadow-2xl">
            <div className="max-w-7xl mx-auto px-8 py-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-bold tracking-wide">Thời trang Nam</h3>
                <Link
                  to="/men"
                  className="text-xs font-medium tracking-widest uppercase text-primary hover:underline"
                  onClick={() => setShowMenMegaMenu(false)}
                >
                  Xem tất cả →
                </Link>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 mb-8">
                {['Routine', 'Coolmate', 'Owen', 'Canifa', 'Yody', 'Ninomaxx', 'Dirty Coins', 'Local Brand', 'The Blues', 'Lados'].map((brand) => (
                  <Link
                    key={brand}
                    to={`/men?brand=${brand}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                    onClick={() => setShowMenMegaMenu(false)}
                  >
                    {brand}
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-border/60">
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">Áo</h4>
                  {menCategories.col1.map((category) => (
                    <Link
                      key={category}
                      to={`/men?category=${encodeURIComponent(category)}`}
                      className="block py-1.5 text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all"
                      onClick={() => setShowMenMegaMenu(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">Quần</h4>
                  {menCategories.col2.map((category) => (
                    <Link
                      key={category}
                      to={`/men?category=${encodeURIComponent(category)}`}
                      className="block py-1.5 text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all"
                      onClick={() => setShowMenMegaMenu(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">Giày & Phụ kiện</h4>
                  {menCategories.col3.map((category) => (
                    <Link
                      key={category}
                      to={`/men?category=${encodeURIComponent(category)}`}
                      className="block py-1.5 text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all"
                      onClick={() => setShowMenMegaMenu(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nữ Menu */}
      {showWomenMegaMenu && (
        <div
          className="fixed left-0 right-0 z-40"
          style={{ top: megaMenuTop }}
          onMouseEnter={handleMouseEnterWomen}
          onMouseLeave={handleMouseLeaveWomen}
        >
          <div className="bg-background/95 backdrop-blur-xl border-b border-border/60 shadow-2xl">
            <div className="max-w-7xl mx-auto px-8 py-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-bold tracking-wide">Thời trang Nữ</h3>
                <Link
                  to="/women"
                  className="text-xs font-medium tracking-widest uppercase text-primary hover:underline"
                  onClick={() => setShowWomenMegaMenu(false)}
                >
                  Xem tất cả →
                </Link>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 mb-8">
                {['Elise', 'Juno', 'Biluxury', 'IVY moda', 'Kiza', 'NEM', 'Xita', 'VietCharm', 'Lime Orange', 'May 10'].map((brand) => (
                  <Link
                    key={brand}
                    to={`/women?brand=${brand}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                    onClick={() => setShowWomenMegaMenu(false)}
                  >
                    {brand}
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-border/60">
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">Áo</h4>
                  {womenCategories.col1.map((category) => (
                    <Link
                      key={category}
                      to={`/women?category=${encodeURIComponent(category)}`}
                      className="block py-1.5 text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all"
                      onClick={() => setShowWomenMegaMenu(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">Quần & Váy</h4>
                  {womenCategories.col2.map((category) => (
                    <Link
                      key={category}
                      to={`/women?category=${encodeURIComponent(category)}`}
                      className="block py-1.5 text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all"
                      onClick={() => setShowWomenMegaMenu(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">Giày & Phụ kiện</h4>
                  {womenCategories.col3.map((category) => (
                    <Link
                      key={category}
                      to={`/women?category=${encodeURIComponent(category)}`}
                      className="block py-1.5 text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all"
                      onClick={() => setShowWomenMegaMenu(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phụ kiện Menu */}
      {showAccessoriesMegaMenu && (
        <div
          className="fixed left-0 right-0 z-40"
          style={{ top: megaMenuTop }}
          onMouseEnter={handleMouseEnterAccessories}
          onMouseLeave={handleMouseLeaveAccessories}
        >
          <div className="bg-background/95 backdrop-blur-xl border-b border-border/60 shadow-2xl">
            <div className="max-w-7xl mx-auto px-8 py-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-bold tracking-wide">Phụ kiện thời trang</h3>
                <Link
                  to="/accessories"
                  className="text-xs font-medium tracking-widest uppercase text-primary hover:underline"
                  onClick={() => setShowAccessoriesMegaMenu(false)}
                >
                  Xem tất cả →
                </Link>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 mb-8">
                {['MLB', 'Adidas', 'Nike', 'Puma', 'Gucci', 'LV', 'Chanel', 'Hermès', 'Coach', 'Michael Kors', 'Fossil', 'Daniel Wellington'].map((brand) => (
                  <Link
                    key={brand}
                    to={`/accessories?brand=${brand}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                    onClick={() => setShowAccessoriesMegaMenu(false)}
                  >
                    {brand}
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-border/60">
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">Mũ & Khăn</h4>
                  {accessoriesCategories.col1.map((category) => (
                    <Link
                      key={category}
                      to={`/accessories?category=${encodeURIComponent(category)}`}
                      className="block py-1.5 text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all"
                      onClick={() => setShowAccessoriesMegaMenu(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">Túi & Ví</h4>
                  {accessoriesCategories.col2.map((category) => (
                    <Link
                      key={category}
                      to={`/accessories?category=${encodeURIComponent(category)}`}
                      className="block py-1.5 text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all"
                      onClick={() => setShowAccessoriesMegaMenu(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">Giày & Khác</h4>
                  {accessoriesCategories.col3.map((category) => (
                    <Link
                      key={category}
                      to={`/accessories?category=${encodeURIComponent(category)}`}
                      className="block py-1.5 text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all"
                      onClick={() => setShowAccessoriesMegaMenu(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <OTPLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}
