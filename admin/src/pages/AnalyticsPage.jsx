import { useEffect, useMemo, useState } from 'react'
import { analyticsAPI } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Spinner from '../components/ui/Spinner'
import { formatVND, formatVNDShort, formatDateShort, getStatusInfo, getVipTier } from '../lib/utils'
import {
  TrendingUp, ShoppingCart, Users, Star, Crown, Package, BarChart3, Trophy, Award
} from 'lucide-react'

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await analyticsAPI.overview()
      setData(res)
    } catch (e) {
      toast.error('Không thể tải phân tích: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phân tích kinh doanh"
        description="Báo cáo doanh thu và hành vi khách hàng 30 ngày qua"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Doanh thu 30 ngày"
          value={formatVND(data.revenue30d)}
          icon={TrendingUp}
          color="brand"
          sublabel="Đã trừ đơn huỷ"
        />
        <StatCard
          label="Số đơn 30 ngày"
          value={data.orders30d}
          icon={ShoppingCart}
          color="blue"
          sublabel="Đơn đã thanh toán"
        />
        <StatCard
          label="Khách đã mua"
          value={data.paidCustomers}
          icon={Users}
          color="emerald"
          sublabel="Khách có đơn không huỷ"
        />
        <StatCard
          label="Hạng TB khách"
          value={avgVipTier(data.topCustomers)}
          icon={Crown}
          color="amber"
          sublabel="Theo top chi tiêu"
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Doanh thu 30 ngày qua</h3>
            <p className="text-xs text-slate-500 mt-0.5">Theo ngày (bao gồm tất cả đơn không huỷ)</p>
          </div>
          <BarChart3 className="w-5 h-5 text-slate-400" />
        </div>
        <RevenueChart data={data.revenueByDay} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Sản phẩm bán chạy</h3>
              <p className="text-xs text-slate-500 mt-0.5">30 ngày qua, sắp xếp theo số lượng</p>
            </div>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">Chưa có dữ liệu bán hàng.</p>
          ) : (
            <ol className="space-y-3">
              {data.topProducts.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-slate-200 text-slate-700' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-50 text-slate-500'
                  }`}>
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.sold} sản phẩm đã bán</p>
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {formatVNDShort(p.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Khách hàng VIP</h3>
              <p className="text-xs text-slate-500 mt-0.5">Top chi tiêu</p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          {data.topCustomers.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">Chưa có dữ liệu.</p>
          ) : (
            <ul className="space-y-3">
              {data.topCustomers.map((u) => {
                const tier = getVipTier(Number(u.total_spent || 0))
                return (
                  <li key={u.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      {(u.name || u.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{u.name || u.email}</p>
                      <p className="text-xs text-slate-500">
                        {u.orders} đơn • {formatVNDShort(u.total_spent)}
                      </p>
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
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Phân bố trạng thái đơn hàng</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tất cả đơn trong hệ thống</p>
          </div>
          <Package className="w-5 h-5 text-slate-400" />
        </div>
        <StatusBreakdown data={data.orderStats} />
      </div>
    </div>
  )
}

function avgVipTier(list) {
  if (!list || list.length === 0) return '—'
  const ids = list.map((u) => getVipTier(Number(u.total_spent || 0)).id)
  const avg = ids.reduce((a, b) => a + b, 0) / ids.length
  // Trả về tên tier tương ứng với ID làm tròn
  const tiers = ['Member', 'VIP 1', 'VIP 2', 'VIP 3', 'VIP 4', 'VIP 5', 'VIP 6', 'VIP 7', 'VIP 8', 'VIP 9', 'VIP 10']
  return tiers[Math.min(Math.round(avg), 10)] || 'Member'
}

function RevenueChart({ data }) {
  // data = [{ day: 'YYYY-MM-DD', revenue, orders }]
  const max = Math.max(1, ...data.map((d) => Number(d.revenue || 0)))
  return (
    <div>
      <div className="flex items-end gap-1.5 h-44">
        {data.map((d) => {
          const revenue = Number(d.revenue || 0)
          const orders = Number(d.orders || 0)
          const heightPct = (revenue / max) * 100
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="relative w-full flex items-end" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-700 to-brand-400 transition-all duration-500 relative group"
                  style={{ height: `${heightPct}%`, minHeight: revenue > 0 ? '6px' : '2px' }}
                  title={`${formatDateShort(d.day)}: ${formatVND(revenue)} (${orders} đơn)`}
                >
                  {revenue > 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatVNDShort(revenue)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          Tổng: <strong className="text-slate-900">{formatVND(data.reduce((s, d) => s + Number(d.revenue || 0), 0))}</strong>
        </span>
        <span>
          Đơn: <strong className="text-slate-900">{data.reduce((s, d) => s + Number(d.orders || 0), 0)}</strong>
        </span>
        <span>
          Ngày cao nhất: <strong className="text-slate-900">{formatVNDShort(max)}</strong>
        </span>
      </div>
    </div>
  )
}

function StatusBreakdown({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-500 py-8 text-center">Chưa có đơn hàng.</p>
  }
  const total = data.reduce((s, d) => s + Number(d.count || 0), 0) || 1
  return (
    <div className="space-y-2.5">
      {data.map((d) => {
        const info = getStatusInfo(d.status)
        const pct = (Number(d.count) / total) * 100
        return (
          <div key={d.status}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className={`badge ${info.color}`}>{info.label}</span>
              <span className="text-slate-700 font-medium">
                {d.count} <span className="text-slate-400 font-normal">({pct.toFixed(1)}%)</span>
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}