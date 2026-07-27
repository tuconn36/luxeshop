import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsAPI, ordersAPI, usersAPI, analyticsAPI } from '../lib/api'
import {
  formatVND, formatDateShort, getStatusInfo, imgUrl, getVipTier, formatVNDShort
} from '../lib/utils'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import {
  Package, ShoppingCart, Users, TrendingUp, AlertTriangle,
  ArrowRight, Calendar, BarChart3, Crown, Star, Truck, MessageSquare
} from 'lucide-react'

export default function DashboardPage() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [p, o, u, a] = await Promise.all([
        productsAPI.getAll({ limit: 200 }),
        ordersAPI.getAll(),
        usersAPI.getAll(),
        analyticsAPI.dashboard().catch(() => null),
      ])
      setProducts(p.items || [])
      setOrders(o || [])
      setUsers(u || [])
      setAnalytics(a)
    } catch (e) {
      console.error('Failed to load dashboard:', e)
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((s, o) => s + Number(o.totalPrice || o.total_amount || 0), 0)
    const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'pending_payment').length
    const lowStock = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10).length
    const outOfStock = products.filter((p) => Number(p.stock) === 0).length

    return {
      totalRevenue,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      pendingOrders,
      lowStock,
      outOfStock,
    }
  }, [products, orders, users])

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders])
  const lowStockProducts = useMemo(
    () => (analytics?.lowStock?.length ? analytics.lowStock : products
      .filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5)
    ),
    [analytics, products]
  )

  const chartData = useMemo(
    () => buildChartData(analytics?.last7Days, orders),
    [analytics, orders]
  )

  // Top khách hàng theo tổng chi tiêu (tính nhanh phía client)
  const topCustomers = useMemo(() => {
    const spent = {}
    for (const o of orders) {
      if (o.status === 'cancelled') continue
      const uid = o.userId || o.user_id
      const amt = Number(o.totalPrice || o.total_amount || 0)
      if (!uid) continue
      spent[uid] = (spent[uid] || 0) + amt
    }
    return Object.entries(spent)
      .map(([uid, total]) => {
        const u = users.find((x) => String(x.id) === String(uid))
        return { uid: Number(uid), total, user: u }
      })
      .filter((x) => x.user)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [orders, users])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan"
        description={`Xin chào, hôm nay là ${new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())}`}
        actions={
          <Link to="/orders" className="btn-secondary">
            <Calendar className="w-4 h-4" /> Xem đơn hàng
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Doanh thu"
          value={formatVND(stats.totalRevenue)}
          icon={TrendingUp}
          color="brand"
          sublabel="Đã trừ đơn hủy"
        />
        <StatCard
          label="Đơn hàng"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="blue"
          sublabel={`${stats.pendingOrders} chờ xử lý`}
        />
        <StatCard
          label="Sản phẩm"
          value={stats.totalProducts}
          icon={Package}
          color="emerald"
          sublabel={`${stats.outOfStock} hết hàng • ${stats.lowStock} sắp hết`}
        />
        <StatCard
          label="Khách hàng"
          value={stats.totalUsers}
          icon={Users}
          color="purple"
          sublabel="Tổng tài khoản đã đăng ký"
        />
      </div>

      {/* Chart + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Đơn hàng 7 ngày qua</h3>
              <p className="text-xs text-slate-500 mt-0.5">Số đơn theo ngày (bao gồm mọi trạng thái)</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <BarChart data={chartData} />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Sản phẩm sắp hết</h3>
              <p className="text-xs text-slate-500 mt-0.5">Còn ≤ 10 sản phẩm trong kho</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          {lowStockProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Tồn kho ổn định"
              description="Không có sản phẩm nào sắp hết hàng."
            />
          ) : (
            <ul className="space-y-3">
              {lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    {p.images?.[0] ? (
                      <img
                        src={(typeof p.images[0] === 'string' && p.images[0].startsWith('http')) ? p.images[0] : imgUrl(p.images[0])}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.category}</p>
                  </div>
                  <span className={`badge ${
                    Number(p.stock) <= 3
                      ? 'bg-rose-100 text-rose-700 ring-rose-200'
                      : 'bg-amber-100 text-amber-700 ring-amber-200'
                  }`}>
                    Còn {p.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top customers + recent reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Khách hàng VIP</h3>
              <p className="text-xs text-slate-500 mt-0.5">Top chi tiêu</p>
            </div>
            <Link to="/users" className="text-xs font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {topCustomers.length === 0 ? (
            <EmptyState icon={Users} title="Chưa có khách mua" />
          ) : (
            <ul className="space-y-3">
              {topCustomers.map(({ uid, total, user: u }) => {
                const tier = getVipTier(total)
                return (
                  <li key={uid} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      {(u.name || u.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{u.name || u.email}</p>
                      <p className="text-xs text-slate-500">{formatVNDShort(total)} đã chi</p>
                    </div>
                    <span className="badge bg-amber-100 text-amber-700 ring-amber-200 inline-flex items-center gap-1">
                      <Crown className="w-3 h-3" /> {tier.name}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Đánh giá mới nhất</h3>
              <p className="text-xs text-slate-500 mt-0.5">5 đánh giá gần đây</p>
            </div>
            <Link to="/reviews" className="text-xs font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!analytics?.recentReviews?.length ? (
            <EmptyState icon={MessageSquare} title="Chưa có đánh giá" />
          ) : (
            <ul className="space-y-3">
              {analytics.recentReviews.map((r) => (
                <li key={r.id} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Number(r.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">{formatDateShort(r.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2">{r.comment || 'Không có nhận xét'}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {r.user_name} • <span className="text-slate-700">{r.product_name}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Đơn hàng gần đây</h3>
            <p className="text-xs text-slate-500 mt-0.5">6 đơn hàng mới nhất</p>
          </div>
          <Link
            to="/orders"
            className="text-sm font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Chưa có đơn hàng"
            description="Các đơn hàng mới sẽ hiển thị tại đây."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-header">Mã đơn</th>
                  <th className="table-header">Khách hàng</th>
                  <th className="table-header">Tổng tiền</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header">Ngày đặt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => {
                  const name = o.shippingAddress?.name || o.shipping_address?.name || `User #${o.userId || o.user_id}`
                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="table-cell font-semibold text-slate-900">#{o.id}</td>
                      <td className="table-cell">{name}</td>
                      <td className="table-cell font-medium">
                        {formatVND(o.totalPrice ?? o.total_amount)}
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="table-cell text-slate-500">
                        {formatDateShort(o.createdAt || o.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function buildChartData(apiDays, orders) {
  // Ưu tiên dữ liệu từ /admin/dashboard-stats (đã group theo DATE).
  if (Array.isArray(apiDays) && apiDays.length > 0) {
    return apiDays.map((d) => ({
      label: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date(d.day)),
      count: Number(d.orders || 0),
      revenue: Number(d.revenue || 0),
    }))
  }
  // Fallback: tính phía client
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    days.push({
      date: d,
      label: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(d),
      count: 0,
      revenue: 0,
    })
  }
  orders.forEach((o) => {
    const od = new Date(o.createdAt || o.created_at)
    if (Number.isNaN(od.getTime())) return
    od.setHours(0, 0, 0, 0)
    const slot = days.find((d) => d.date.getTime() === od.getTime())
    if (slot) {
      slot.count += 1
      if (o.status !== 'cancelled') slot.revenue += Number(o.totalPrice || o.total_amount || 0)
    }
  })
  return days
}

function BarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div>
      <div className="flex items-end gap-3 h-40">
        {data.map((d) => {
          const heightPct = (d.count / max) * 100
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="relative w-full flex items-end" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-500 relative group"
                  style={{ height: `${heightPct}%`, minHeight: d.count > 0 ? '6px' : '2px' }}
                >
                  {d.count > 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">{d.label}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Tổng 7 ngày: <strong className="text-slate-900">{data.reduce((s, d) => s + d.count, 0)} đơn</strong></span>
        <span>Doanh thu: <strong className="text-slate-900">{formatVND(data.reduce((s, d) => s + d.revenue, 0))}</strong></span>
      </div>
    </div>
  )
}