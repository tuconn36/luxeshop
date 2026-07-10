import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { usersAPI, statsAPI } from '@/lib/api.js';
import { Camera, Upload, LogOut, User, MapPin, Ruler, Package, ListOrdered, Clock, Truck, CheckCircle2, XCircle, ChevronRight, ShoppingBag } from 'lucide-react';
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
  const { logout, currentUser, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [stats, setStats] = useState(null);

  // Load stats từ API
  useEffect(() => {
    if (!currentUser?.id) return;
    const loadStats = async () => {
      try {
        const data = await statsAPI.getUserStats(currentUser.id);
        setStats(data);
      } catch {
        setStats(null);
      }
    };
    loadStats();
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
    logout();
    navigate('/');
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

  return (
    <>
      <Helmet>
        <title>Tài khoản - LUXE</title>
      </Helmet>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[70vh]">
        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="w-64 shrink-0">
            {/* User card */}
            <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border border-amber-100 rounded-2xl p-5 mb-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative group mb-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-4 ring-white shadow-md">
                    {currentUser?.avatar
                      ? <img
                          src={currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:5000${currentUser.avatar}`}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      : (currentUser?.name ? currentUser.name[0].toUpperCase() : 'U')
                    }
                  </div>
                  <button
                    onClick={() => setShowAvatarPicker(true)}
                    className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Đổi ảnh đại diện"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
                <p className="font-semibold text-sm leading-tight">
                  {currentUser?.name || 'Chưa cập nhật'}
                </p>
                <p className="text-xs text-gray-500 truncate w-full mt-0.5">
                  {currentUser?.email || currentUser?.phone || ''}
                </p>
                {!currentUser?.has_password && (
                  <Link
                    to="/account/change-password"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-100 px-2 py-1 rounded-full hover:bg-amber-200 transition-colors"
                  >
                    <Shield className="w-3 h-3" />
                    Thêm mật khẩu
                  </Link>
                )}
              </div>
            </div>

            {/* Avatar Picker Popup */}
            {showAvatarPicker && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAvatarPicker(false)}>
                <div className="bg-white rounded-2xl p-5 w-80 shadow-xl" onClick={(e) => e.stopPropagation()}>
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
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">hoặc</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors"
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
              className="w-full mt-6 flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      <Footer />
    </>
  );
}

function SidebarGroup({ title, children }) {
  return (
    <div className="mb-5">
      <p className="font-bold text-xs uppercase tracking-[0.15em] text-gray-400 mb-2 px-2">
        {title}
      </p>
      <nav className="space-y-0.5">{children}</nav>
    </div>
  );
}

function SidebarItem({ item, active, count }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
        active
          ? 'bg-amber-50 text-amber-700 font-semibold'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span className="flex-1 truncate">{item.label}</span>
      {count != null && count > 0 && (
        <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
          active ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-500'
        }`}>
          {count}
        </span>
      )}
    </Link>
  );
}