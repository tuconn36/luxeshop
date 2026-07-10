import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { ordersAPI, statsAPI } from '@/lib/api.js';
import OrderCard from '@/components/shop/OrderCard.jsx';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const FILTERS = [
  { key: null, label: 'Tất cả', icon: Package, color: 'gray' },
  { key: 'pending', label: 'Chờ xác nhận', icon: Clock, color: 'yellow' },
  { key: 'processing', label: 'Đang xử lý', icon: Package, color: 'blue' },
  { key: 'shipping', label: 'Đang giao', icon: Truck, color: 'sky' },
  { key: 'delivered', label: 'Đã giao', icon: CheckCircle2, color: 'green' },
  { key: 'cancelled', label: 'Đã hủy', icon: XCircle, color: 'red' },
];

const COLOR_BADGE = {
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

// Mapping filter key → các giá trị status thực tế trong DB
// (DB có thể lưu tiếng Việt hoặc tiếng Anh)
const STATUS_MATCH = {
  pending: ['pending', 'chờ xác nhận'],
  processing: ['processing', 'đang xử lý', 'chờ lấy hàng', 'ready'],
  shipping: ['shipping', 'đang giao', 'shipped'],
  delivered: ['delivered', 'đã giao'],
  cancelled: ['cancelled', 'canceled', 'đã hủy'],
};

function matchesFilter(orderStatus, filterKey) {
  if (!filterKey) return true;
  const s = (orderStatus || '').toLowerCase();
  const allowed = STATUS_MATCH[filterKey] || [filterKey];
  return allowed.includes(s);
}

export default function AccountOrdersPage() {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = searchParams.get('status') || null;

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const [ordersData, statsData] = await Promise.allSettled([
          ordersAPI.getMyOrders(currentUser.id),
          statsAPI.getUserStats(currentUser.id),
        ]);

        if (ordersData.status === 'fulfilled') {
          setOrders(Array.isArray(ordersData.value) ? ordersData.value : []);
        }
        if (statsData.status === 'fulfilled') {
          setStats(statsData.value);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const handleFilterChange = (key) => {
    if (key) setSearchParams({ status: key });
    else setSearchParams({});
  };

  // Đếm số đơn theo filter key (để hiển thị badge trên tab)
  const filterCounts = useMemo(() => {
    const c = { all: orders.length };
    for (const k of Object.keys(STATUS_MATCH)) {
      c[k] = orders.filter((o) => matchesFilter(o.status, k)).length;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    let list = orders.filter((o) => matchesFilter(o.status, activeFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => {
        const idMatch = String(o.id).toLowerCase().includes(q);
        const items = Array.isArray(o.items) ? o.items : [];
        const nameMatch = items.some((it) => (it.name || '').toLowerCase().includes(q));
        return idMatch || nameMatch;
      });
    }
    return list;
  }, [orders, activeFilter, search]);

  const totalSpent = useMemo(
    () => orders.reduce((s, o) => s + Number(o.totalPrice || 0), 0),
    [orders]
  );

  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-bold text-center uppercase tracking-widest mb-8">
        Đơn hàng của tôi
      </h1>

      {/* Stats summary */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatBox
            label="Tổng đơn"
            value={stats?.orders?.all ?? orders.length}
            color="gray"
          />
          <StatBox
            label="Đang xử lý"
            value={(stats?.orders?.pending || 0) + (stats?.orders?.processing || 0)}
            color="blue"
          />
          <StatBox
            label="Đang giao"
            value={stats?.orders?.shipping || filterCounts.shipping}
            color="sky"
          />
          <StatBox
            label="Tổng chi tiêu"
            value={totalSpent.toLocaleString('vi-VN') + '₫'}
            color="amber"
            small
          />
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-4 -mx-1 px-1 overflow-x-auto scrollbar-thin">
        <div className="flex gap-2 min-w-max pb-2">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const isActive = activeFilter === f.key;
            const count = f.key ? filterCounts[f.key] : filterCounts.all;
            return (
              <button
                key={f.key || 'all'}
                onClick={() => handleFilterChange(f.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {f.label}
                <span
                  className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search bar */}
      {!loading && orders.length > 0 && (
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Orders list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          hasAnyOrders={orders.length > 0}
          activeFilter={activeFilter}
          onClearFilter={() => handleFilterChange(null)}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color, small = false }) {
  const accent = {
    gray: 'text-gray-900',
    blue: 'text-blue-600',
    sky: 'text-sky-600',
    amber: 'text-amber-600',
    green: 'text-green-600',
  }[color] || 'text-gray-900';

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-bold tracking-tight ${accent} ${small ? 'text-base' : 'text-xl'} mt-0.5 truncate`}>
        {value}
      </p>
    </div>
  );
}

function EmptyState({ hasAnyOrders, activeFilter, onClearFilter }) {
  return (
    <div className="text-center py-20 px-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-dashed border-gray-200">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <ShoppingBag className="w-10 h-10 text-gray-300" />
      </div>
      {hasAnyOrders ? (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không có đơn hàng nào ở trạng thái này
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Bạn có thể chọn tab khác để xem các đơn hàng khác.
          </p>
          <Button onClick={onClearFilter} variant="outline" className="rounded-full">
            Xem tất cả đơn hàng
          </Button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-sm text-gray-500 mb-5">
            Hãy khám phá các sản phẩm của chúng tôi và đặt đơn hàng đầu tiên của bạn!
          </p>
          <Link to="/products">
            <Button className="rounded-full">Khám phá sản phẩm</Button>
          </Link>
        </>
      )}
    </div>
  );
}