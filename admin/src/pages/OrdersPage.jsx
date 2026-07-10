import { useEffect, useMemo, useState } from 'react'
import { ordersAPI } from '../lib/api'
import {
  formatVND, formatDate, formatDateShort, getStatusInfo, getPaymentStatusInfo, STATUS_OPTIONS
} from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import StatusBadge from '../components/ui/StatusBadge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import {
  ShoppingCart, Eye, Truck, X, Filter, Package, MapPin, User, CreditCard, FileText
} from 'lucide-react'

const STATUS_DROPDOWN = STATUS_OPTIONS.filter((o) => o.value)

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const toast = useToast()

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await ordersAPI.getAll()
      setOrders(data || [])
    } catch (e) {
      toast.error('Không thể tải đơn hàng: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false
      if (!q) return true
      const addr = o.shippingAddress || o.shipping_address || {}
      const text = [
        o.id,
        addr.name, addr.phone,
        o.userId, o.user_id,
        o.trackingNumber, o.tracking_number,
        ...(Array.isArray(o.items) ? o.items.map((it) => it.name || '') : []),
      ].join(' ').toLowerCase()
      return text.includes(q)
    })
  }, [orders, search, statusFilter])

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipping: orders.filter((o) => o.status === 'shipping').length,
    completed: orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }), [orders])

  const openDetail = async (order) => {
    setDetail(order)
    setDetailLoading(true)
    try {
      const full = await ordersAPI.getById(order.id)
      setDetail(full)
    } catch (e) {
      // fallback: dùng data từ list
      console.warn('Order detail load failed', e)
    } finally {
      setDetailLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      await ordersAPI.updateStatus(id, status)
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
      if (detail?.id === id) setDetail((d) => ({ ...d, status }))
      toast.success('Đã cập nhật trạng thái')
    } catch (e) {
      toast.error('Cập nhật thất bại: ' + e.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quản lý đơn hàng"
        description={`${stats.total} đơn hàng • ${stats.pending} chờ xử lý • ${stats.shipping} đang giao`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Tổng',     value: stats.total,      color: 'bg-slate-100 text-slate-700' },
          { label: 'Chờ xử lý', value: stats.pending,   color: 'bg-amber-100 text-amber-700' },
          { label: 'Đang xử lý', value: stats.processing, color: 'bg-blue-100 text-blue-700' },
          { label: 'Đang giao',  value: stats.shipping,  color: 'bg-indigo-100 text-indigo-700' },
          { label: 'Hoàn thành', value: stats.completed, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Đã hủy',     value: stats.cancelled, color: 'bg-rose-100 text-rose-700' },
        ].map((s) => (
          <div key={s.label} className="card p-3">
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className="text-xl font-semibold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Tìm theo mã đơn, tên, SĐT, mã vận đơn..."
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input min-w-[160px]"
            >
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {(search || statusFilter) && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('') }}
                className="btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Không có đơn hàng"
            description={orders.length === 0 ? 'Chưa có đơn hàng nào trong hệ thống.' : 'Không tìm thấy đơn hàng phù hợp với bộ lọc.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="table-header">Mã đơn</th>
                  <th className="table-header">Khách hàng</th>
                  <th className="table-header">Sản phẩm</th>
                  <th className="table-header text-right">Tổng tiền</th>
                  <th className="table-header">Thanh toán</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header">Ngày đặt</th>
                  <th className="table-header text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((o) => {
                  const addr = o.shippingAddress || o.shipping_address || {}
                  const items = Array.isArray(o.items) ? o.items : []
                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="table-cell font-semibold text-slate-900">#{o.id}</td>
                      <td className="table-cell">
                        <p className="font-medium text-slate-900">{addr.name || `User #${o.userId || o.user_id}`}</p>
                        {addr.phone && <p className="text-xs text-slate-500">{addr.phone}</p>}
                      </td>
                      <td className="table-cell text-slate-600">
                        {items.length > 0 ? `${items.length} sản phẩm` : '—'}
                      </td>
                      <td className="table-cell text-right font-medium">
                        {formatVND(o.totalPrice ?? o.total_amount)}
                      </td>
                      <td className="table-cell">
                        <PaymentBadge status={o.paymentStatus || o.payment_status} />
                      </td>
                      <td className="table-cell">
                        <select
                          value={o.status}
                          disabled={updatingId === o.id}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="text-xs rounded-md border border-slate-200 px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                        >
                          {STATUS_DROPDOWN.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="table-cell text-slate-500">{formatDateShort(o.createdAt || o.created_at)}</td>
                      <td className="table-cell text-right">
                        <button
                          onClick={() => openDetail(o)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <OrderDetailModal
          order={detail}
          loading={detailLoading}
          onClose={() => setDetail(null)}
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  )
}

function PaymentBadge({ status }) {
  const info = getPaymentStatusInfo(status)
  return <span className={`badge ring-1 ring-inset ${info.color}`}>{info.label}</span>
}

function OrderDetailModal({ order, loading, onClose, onUpdateStatus }) {
  const [tracking, setTracking] = useState(order.trackingNumber || order.tracking_number || '')
  const [savingTracking, setSavingTracking] = useState(false)
  const toast = useToast()
  const addr = order.shippingAddress || order.shipping_address || {}
  const items = Array.isArray(order.items) ? order.items : []

  const saveTracking = async () => {
    setSavingTracking(true)
    try {
      await ordersAPI.updateStatus(order.id, order.status, tracking || null)
      toast.success('Đã lưu mã vận đơn')
    } catch (e) {
      toast.error('Lỗi: ' + e.message)
    } finally {
      setSavingTracking(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Đơn hàng #${order.id}`}
      footer={
        <button onClick={onClose} className="btn-secondary">Đóng</button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-slate-100">
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus || order.payment_status} />
            <span className="text-xs text-slate-500">
              Đặt lúc {formatDate(order.createdAt || order.created_at)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Section icon={User} title="Thông tin khách hàng">
              <p className="font-medium text-slate-900">{addr.name || '—'}</p>
              {addr.phone && <p className="text-sm text-slate-600 mt-0.5">{addr.phone}</p>}
              {addr.email && <p className="text-sm text-slate-600">{addr.email}</p>}
              <p className="text-xs text-slate-500 mt-2">User ID: #{order.userId || order.user_id}</p>
            </Section>

            <Section icon={MapPin} title="Địa chỉ giao hàng">
              <p className="text-sm text-slate-700">{addr.address || '—'}</p>
              {(addr.district || addr.city) && (
                <p className="text-sm text-slate-600 mt-0.5">
                  {[addr.district, addr.city].filter(Boolean).join(', ')}
                </p>
              )}
            </Section>

            <Section icon={CreditCard} title="Thanh toán">
              <p className="text-sm text-slate-700">
                Phương thức: <strong>{order.paymentMethod || order.payment_method || '—'}</strong>
              </p>
              <p className="text-sm text-slate-600 mt-0.5">
                Trạng thái: <PaymentBadge status={order.paymentStatus || order.payment_status} />
              </p>
            </Section>

            <Section icon={Truck} title="Vận chuyển">
              <label className="label">Mã vận đơn</label>
              <div className="flex gap-2">
                <input
                  className="input"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="VD: SPX123456789"
                />
                <button
                  onClick={saveTracking}
                  disabled={savingTracking}
                  className="btn-primary shrink-0"
                >
                  {savingTracking ? '...' : 'Lưu'}
                </button>
              </div>
            </Section>
          </div>

          <Section icon={Package} title={`Sản phẩm (${items.length})`}>
            {items.length === 0 ? (
              <p className="text-sm text-slate-500">Không có sản phẩm.</p>
            ) : (
              <ul className="divide-y divide-slate-100 -mx-1">
                {items.map((it, i) => (
                  <li key={i} className="flex items-center gap-3 py-2.5 px-1">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      {(it.image || (it.images && it.images[0])) ? (
                        <img
                          src={(() => {
                            const src = it.image || it.images[0]
                            return src.startsWith('http') ? src : `http://localhost:5000${src}`
                          })()}
                          alt={it.name}
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
                      <p className="text-sm font-medium text-slate-900 truncate">{it.name || `Sản phẩm #${it.productId || it.id}`}</p>
                      <p className="text-xs text-slate-500">
                        {it.size && `Size: ${it.size}`}
                        {it.color && ` • Màu: ${it.color}`}
                        {it.quantity && ` • SL: ${it.quantity}`}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {formatVND((it.price || 0) * (it.quantity || 1))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-600">Tổng cộng</span>
              <span className="text-lg font-semibold text-brand-700">
                {formatVND(order.totalPrice ?? order.total_amount)}
              </span>
            </div>
          </Section>

          {order.notes && (
            <Section icon={FileText} title="Ghi chú">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{order.notes}</p>
            </Section>
          )}
        </div>
      )}
    </Modal>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-slate-500" />
        <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
      </div>
      <div className="text-sm">{children}</div>
    </div>
  )
}