import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { usersAPI, statsAPI } from '@/lib/api.js';
import { getContactLabel } from '@/lib/userDisplay.js';
import { Camera, Upload, LogOut, User, MapPin, Ruler, Package, ListOrdered, Clock, Truck, CheckCircle2, XCircle, ChevronRight, ShoppingBag, Heart, Sparkles, Award, TrendingUp, Crown, Loader2 } from 'lucide-react';
import { getVipTier } from '@/lib/vip.js';
import VipAvatarFrame from '@/components/avatar/VipAvatarFrame.jsx';
import { toast } from 'sonner';

// 12 preset avatars dùng DiceBear
const PRESET_AVATARS = [
  'https://api.dicebear.com/8.x/avataaars/svg?seed=Luxe1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=Luxe2&backgroundColor=ffd5dc',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=Luxe3&backgroundColor=d1d4f9',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=Luxe4&backgroundColor=c0aede',
  'https://api.dicebear.com/8.x/fun-emoji/svg?seed=Luxe1',
  'https://api.dicebear.com/8.x/fun-emoji/svg?seed=Luxe2',
  'https://api.dicebear.com/8.x/fun-emoji/svg?seed=Luxe3',
  'https://api.dicebear.com/8.x/fun-emoji/svg?seed=Luxe4',
  'https://api.dicebear.com/8.x/pixel-art/svg?seed=Luxe1&backgroundColor=ffd5dc',
  'https://api.dicebear.com/8.x/pixel-art/svg?seed=Luxe2&backgroundColor=b6e3f4',
  'https://api.dicebear.com/8.x/bottts/svg?seed=Luxe1&backgroundColor=d1d4f9',
  'https://api.dicebear.com/8.x/bottts/svg?seed=Luxe2&backgroundColor=ffd5dc',
];

// Menu cấu trúc: 2 group — Trung tâm cá nhân & Trạng thái đơn hàng
const personalMenu = [
  { label: 'Tài khoản của tôi', path: '/account', icon: User },
  { label: 'Hạng VIP của tôi', path: '/account/vip', icon: Crown },
  { label: 'Thông tin của tôi', path: '/account/profile', icon: User },
  { label: 'Thêm & Đổi mật khẩu', path: '/account/change-password', icon: Shield },
  { label: 'Số địa chỉ', path: '/account/address', icon: MapPin },
  { label: 'Đo lường của tôi', path: '/account/measurements', icon: Ruler },
];

const orderMenu = [
  { label: 'Tất cả đơn hàng', path: '/account/orders', icon: ListOrdered, statusKey: 'all' },
  { label: 'Chờ xác nhận', path: '/account/orders?status=pending', icon: Clock, statusKey: 'pending' },
  { label: 'Đang xử lý', path: '/account/orders?status=processing', icon: Package, statusKey: 'processing' },
  { label: 'Đang giao', path: '/account/orders?status=shipping', icon: Truck, statusKey: 'shipping' },
  { label: 'Đã giao', path: '/account/orders?status=delivered', icon: CheckCircle2, statusKey: 'delivered' },
  { label: 'Đã hủy', path: '/account/orders?status=cancelled', icon: XCircle, statusKey: 'cancelled' },
];

// stub for Shield icon (declared here for menu)
function Shield(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

export default function AccountLayout() {
  const { logout, currentUser, updateUser, initialLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [stats, setStats] = useState(null);

  // Guard: nếu chưa đăng nhập → đẩy về login (chỉ chạy khi layout đã render, tức là ProtectedRoute đã cho qua)
  useEffect(() => {
    if (!initialLoading && !currentUser) {
      navigate(`/signup?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [initialLoading, currentUser, navigate, location.pathname]);

  // Load stats từ API
  useEffect(() => {
    if (!currentUser?.id) return;
    let cancelled = false;
    const loadStats = async () => {
      try {
        const data = await statsAPI.getUserStats(currentUser.id);
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setStats(null);
      }
    };
    loadStats();
    return () => { cancelled = true; };
    // Refresh khi chuyển trang trong account
  }, [currentUser?.id, location.pathname]);

  const handleSelectPreset = async (url) => {
    try {
      await usersAPI.update(currentUser.id, { name: currentUser.name, phone: currentUser.phone, avatar: url });
      updateUser({ avatar: url });
      toast.success('Cập nhật ảnh đại diện thành công');
      setShowAvatarPicker(false);
    } catch (err) {
      toast.error(err.message || 'Thất bại');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { avatar } = await usersAPI.uploadAvatar(currentUser.id, file);
      updateUser({ avatar });
      toast.success('Cập nhật ảnh đại diện thành công');
      setShowAvatarPicker(false);
    } catch (err) {
      toast.error(err.message || 'Upload thất bại');
    }
  };

  const handleLogout = () => {
    const ok = window.confirm('Bạn có chắc muốn đăng xuất?');
    if (!ok) return;
    logout();
    toast.success('Đã đăng xuất');
    setTimeout(() => navigate('/', { replace: true }), 0);
  };

  const isActive = (path) => {
    const [basePath, query] = path.split('?');
    if (query) {
      const params = new URLSearchParams(query);
      const wantStatus = params.get('status');
      const currentStatus = new URLSearchParams(location.search).get('status');
      if (wantStatus !== currentStatus) return false;
    }
    if (basePath === '/account' && (location.pathname === '/account' || location.pathname === '/account/')) {
      return !query;
    }
    if (basePath !== '/account') {
      return location.pathname.startsWith(basePath);
    }
    return false;
  };

  const orderCount = (key) => stats?.orders?.[key] ?? 0;
  const totalSpent = stats?.totalSpent ?? 0;
  const totalOrders = stats?.orders?.all ?? 0;
  const vipTier = getVipTier(totalSpent).current;

  // Loading state khi check auth ban đầu
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/30 via-white to-rose-50/20">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập → return null (useEffect sẽ redirect)
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/30 via-white to-rose-50/20">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto" />
          <p className="text-sm text-muted-foreground">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Tài khoản - LUXE</title>
      </Helmet>
      <Header />

      {/* Decorative background */}
      <div className="relative bg-gradient-to-br from-amber-50/40 via-white to-rose-50/30 dark:from-neutral-950 dark:via-neutral-950 dark:to-amber-950/20 min-h-[70vh] overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-rose-300/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Page hero banner */}
          <div className="relative mb-10 rounded-3xl overflow-hidden bg-gradient-to-r from-neutral-950 via-amber-950 to-neutral-950 p-8 md:p-10 shadow-2xl">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.4),transparent_50%)]" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_50%,rgba(244,114,182,0.4),transparent_50%)]" />
            <div className="absolute top-4 right-6 text-amber-400/40">
              <Sparkles className="w-16 h-16" strokeWidth={1} />
            </div>
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold tracking-[0.2em] uppercase mb-3">
                  <Award className="w-3 h-3" />
                  Thành viên LUXE
                </div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Xin chào, <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">{currentUser?.name || 'Khách hàng'}</span>
                </h1>
                <p className="text-white/70 mt-2 text-sm">
                  Quản lý thông tin cá nhân, đơn hàng và trải nghiệm mua sắm của bạn.
                </p>
              </div>

              {/* Mini stats */}
              <div className="flex gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 min-w-[110px]">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-white/60 font-semibold">Đơn hàng</p>
                  <p className="font-serif text-2xl font-bold text-white mt-0.5">{totalOrders}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 min-w-[130px]">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-white/60 font-semibold">Tổng chi</p>
                  <p className="font-serif text-2xl font-bold text-amber-300 mt-0.5">
                    {totalSpent > 0 ? `${(totalSpent / 1000).toFixed(0)}k` : '0₫'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 shrink-0">
            {/* User card - premium glassmorphism */}
            <div className="relative bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl border border-amber-200/60 dark:border-amber-500/20 rounded-2xl p-5 mb-6 shadow-lg shadow-amber-500/5 overflow-hidden">
              {/* Decorative gradient inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 via-transparent to-rose-100/30 dark:from-amber-900/20 dark:to-rose-900/10 pointer-events-none" />
              <div className="absolute top-2 right-2 text-amber-400/30">
                <Sparkles className="w-8 h-8" strokeWidth={1.5} />
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <VipAvatarFrame
                    user={currentUser ? { ...currentUser, totalSpent } : null}
                    size={88}
                    showLevel={vipTier.id > 0}
                    onClick={() => setShowAvatarPicker(true)}
                    hoverEdit={<Camera className="w-5 h-5 text-white" />}
                    name="avatar"
                  />
                </div>
                <p className="font-semibold text-sm leading-tight text-neutral-900 dark:text-white">
                  {currentUser?.name || 'Chưa cập nhật'}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate w-full mt-0.5">
                  {getContactLabel(currentUser) || ' '}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                  <Award className="w-3 h-3" />
                  {vipTier.name === 'Member' ? 'Member' : `${vipTier.name} · ${vipTier.label}`}
                </div>
                {!currentUser?.has_password && (
                  <Link
                    to="/account/change-password"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-1 rounded-full hover:bg-amber-200 transition-colors"
                  >
                    <Shield className="w-3 h-3" />
                    Thêm mật khẩu
                  </Link>
                )}
              </div>
            </div>

            {/* Avatar Picker Popup */}
            {showAvatarPicker && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAvatarPicker(false)}>
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 w-80 shadow-2xl border border-neutral-200 dark:border-neutral-800" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-bold text-base mb-3 text-center">Chọn ảnh đại diện</h3>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectPreset(url)}
                        className={`w-14 h-14 rounded-full overflow-hidden border-2 hover:border-amber-400 transition-colors ${currentUser?.avatar === url ? 'border-amber-500' : 'border-transparent'}`}
                      >
                        <img src={url} alt={`avatar ${i+1}`} className="w-full h-full object-cover bg-gray-100" />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
                    <span className="text-xs text-gray-400">hoặc</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 text-sm hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Tải ảnh từ máy
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

                  <button onClick={() => setShowAvatarPicker(false)} className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600">
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Menu: Trung tâm cá nhân */}
            <SidebarGroup title="Trung tâm cá nhân">
              {personalMenu.slice(1).map((item) => (
                <SidebarItem key={item.path} item={item} active={isActive(item.path)} />
              ))}
            </SidebarGroup>

            {/* Menu: Trạng thái đơn hàng */}
            <SidebarGroup title="Trạng thái đơn hàng">
              {orderMenu.map((item) => (
                <SidebarItem
                  key={item.path + (item.statusKey || '')}
                  item={item}
                  active={isActive(item.path)}
                  count={stats ? orderCount(item.statusKey) : null}
                />
              ))}
            </SidebarGroup>

            {/* Logout */}
            <button
              className="w-full mt-6 flex items-center gap-2 px-3 py-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </aside>

          {/* Page content */}
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function SidebarGroup({ title, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3 px-3">
        <p className="font-bold text-[10px] uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500">
          {title}
        </p>
        <div className="flex-1 h-px bg-gradient-to-r from-amber-300/50 to-transparent" />
      </div>
      <nav className="space-y-1">{children}</nav>
    </div>
  );
}

function SidebarItem({ item, active, count }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
        active
          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-md shadow-amber-500/30'
          : 'text-neutral-600 dark:text-neutral-300 hover:bg-white/60 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white hover:shadow-sm'
      }`}
    >
      {active && (
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-amber-700" />
      )}
      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
        active ? 'text-white' : 'text-neutral-400 group-hover:text-amber-500'
      }`} />
      <span className="flex-1 truncate">{item.label}</span>
      {count != null && count > 0 && (
        <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
          active ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'
        }`}>
          {count}
        </span>
      )}
    </Link>
  );
}