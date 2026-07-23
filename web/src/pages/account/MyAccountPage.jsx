import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { ordersAPI, statsAPI, addressesAPI, measurementsAPI } from '@/lib/api.js';
import { getRealEmail } from '@/lib/userDisplay.js';
import OrderCard from '@/components/shop/OrderCard.jsx';
import {
  User,
  MapPin,
  Ruler,
  Package,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShoppingBag,
  ListOrdered,
  Tag,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const shortcuts = [
  { icon: User, label: 'Thông tin của tôi', desc: 'Cập nhật họ tên, ngày sinh', path: '/account/profile', color: 'amber' },
  { icon: MapPin, label: 'Số địa chỉ', desc: 'Quản lý địa chỉ giao hàng', path: '/account/address', color: 'rose' },
  { icon: Ruler, label: 'Đo lường của tôi', desc: 'Lưu số đo để chọn size dễ hơn', path: '/account/measurements', color: 'purple' },
  { icon: Shield, label: 'Đổi mật khẩu', desc: 'Bảo mật tài khoản của bạn', path: '/account/change-password', color: 'sky' },
];

const COLOR_CLASSES = {
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  purple: 'bg-purple-50 text-purple-600',
  sky: 'bg-sky-50 text-sky-600',
  green: 'bg-green-50 text-green-600',
};

function formatDOB(dob) {
  if (!dob) return null;
  try {
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('vi-VN');
  } catch {
    return null;
  }
}

export default function MyAccountPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [addressCount, setAddressCount] = useState(0);
  const [hasMeasurements, setHasMeasurements] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;
    const loadData = async () => {
      try {
        const [statsData, ordersData, addrData, measData] = await Promise.allSettled([
          statsAPI.getUserStats(currentUser.id),
          ordersAPI.getMyOrders(currentUser.id),
          addressesAPI.list(currentUser.id),
          measurementsAPI.get(currentUser.id),
        ]);
        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (ordersData.status === 'fulfilled') {
          setRecentOrders((ordersData.value || []).slice(0, 2));
        }
        if (addrData.status === 'fulfilled') {
          setAddressCount((addrData.value || []).length);
        }
        if (measData.status === 'fulfilled') {
          const m = measData.value || {};
          setHasMeasurements(!!(m.height || m.weight || m.chest));
        }
      } finally {
        setLoadingOrders(false);
      }
    };
    loadData();
  }, [currentUser?.id]);

  const dob = formatDOB(currentUser?.dob);

  return (
    <div>
      <h1 className="text-2xl font-bold text-center uppercase tracking-widest mb-8">
        Tài khoản của tôi
      </h1>

      {/* Profile card */}
      <div className="flex items-center gap-4 mb-6 p-5 bg-gradient-to-r from-amber-50/50 via-white to-white border border-amber-100 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 ring-4 ring-white shadow-md">
          {currentUser?.avatar
            ? <img
                src={currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:5000${currentUser.avatar}`}
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            : (currentUser?.name ? currentUser.name[0].toUpperCase() : 'U')
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-900 truncate">
            {currentUser?.name || 'Chưa cập nhật tên'}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
            {getRealEmail(currentUser) && (
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3 h-3" /> {getRealEmail(currentUser)}
              </span>
            )}
            {currentUser?.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3 h-3" /> {currentUser.phone}
              </span>
            )}
            {dob && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {dob}
              </span>
            )}
          </div>
        </div>
        <Link
          to="/account/profile"
          className="text-xs font-semibold text-amber-700 hover:text-amber-800 hidden sm:inline-flex items-center gap-1"
        >
          Chỉnh sửa <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile
          icon={ListOrdered}
          label="Tổng đơn"
          value={stats?.orders?.all ?? '—'}
          color="amber"
        />
        <StatTile
          icon={Package}
          label="Đang xử lý"
          value={(stats?.orders?.pending || 0) + (stats?.orders?.processing || 0) + (stats?.orders?.shipping || 0)}
          color="sky"
        />
        <StatTile
          icon={MapPin}
          label="Địa chỉ"
          value={addressCount}
          color="rose"
        />
        <StatTile
          icon={Ruler}
          label="Số đo"
          value={hasMeasurements ? '✓' : '—'}
          color="purple"
        />
      </div>

      {/* Quick shortcuts */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Truy cập nhanh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shortcuts.map(({ icon: Icon, label, desc, path, color }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-sm transition-all group"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${COLOR_CLASSES[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 truncate">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Đơn hàng gần đây
          </h2>
          <Link to="/account/orders" className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loadingOrders ? (
          <div className="space-y-3">
            <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="bg-gradient-to-br from-amber-50/50 to-white border border-dashed border-amber-200 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-7 h-7 text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Bạn chưa có đơn hàng nào</p>
            <p className="text-xs text-gray-500 mb-4">
              Hãy khám phá những sản phẩm mới nhất của LUXE và đặt đơn hàng đầu tiên
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Member perks */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl" />
        <Tag className="w-8 h-8 text-amber-400 mb-3" />
        <h3 className="font-bold text-lg mb-1">Ưu đãi thành viên LUXE</h3>
        <p className="text-sm text-gray-300 mb-4">
          Tích điểm sau mỗi đơn hàng và nhận ngay ưu đãi sinh nhật lên đến 20% cho mọi sản phẩm.
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-2xl font-bold text-amber-400">5%</p>
            <p className="text-[10px] text-gray-300 uppercase tracking-wider mt-0.5">Hoàn tiền</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-2xl font-bold text-amber-400">Freeship</p>
            <p className="text-[10px] text-gray-300 uppercase tracking-wider mt-0.5">Đơn từ 500K</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-2xl font-bold text-amber-400">20%</p>
            <p className="text-[10px] text-gray-300 uppercase tracking-wider mt-0.5">Sinh nhật</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-sm transition-all">
      <div className={`w-8 h-8 rounded-lg ${COLOR_CLASSES[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}