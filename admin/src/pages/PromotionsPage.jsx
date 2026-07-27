import { useEffect, useState } from 'react'
import { promotionsAPI } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Plus, Edit, Trash2, Ticket, Copy, X, Calendar, Percent } from 'lucide-react'
import { formatDateShort, formatDateInput } from '../lib/utils'

const DISCOUNT_TYPES = [
  { value: 'percent', label: 'Giảm theo %' },
  { value: 'fixed',   label: 'Giảm tiền (VNĐ)' },
]

const blank = () => ({
  code: '',
  name: '',
  description: '',
  discount_type: 'percent',
  discount_value: '',
  min_order_amount: 0,
  max_discount_amount: '',
  usage_limit: '',
  starts_at: '',
  ends_at: '',
  is_active: true,
})

export default function PromotionsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const toast = useToast()

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await promotionsAPI.getAll()
      setItems(data || [])
    } catch (e) {
      toast.error('Không thể tải mã khuyến mãi: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = items.filter((p) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [p.code, p.name, p.description].filter(Boolean).join(' ').toLowerCase().includes(q)
  })

  const stats = {
    total: items.length,
    active: items.filter((p) => p.is_active && !isExpired(p.ends_at)).length,
    used: items.reduce((s, p) => s + Number(p.used_count || 0), 0),
  }

  const onAdd = () => { setEditing(null); setModalOpen(true) }
  const onEdit = (p) => { setEditing(p); setModalOpen(true) }

  const onDelete = async (id) => {
    try {
      await promotionsAPI.delete(id)
      toast.success('Đã xoá mã khuyến mãi')
      load()
    } catch (e) {
      toast.error('Xoá thất bại: ' + e.message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mã khuyến mãi"
        description={`${stats.total} mã • ${stats.active} đang hoạt động • ${stats.used} lượt dùng`}
        actions={
          <button onClick={onAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Tạo mã mới
          </button>
        }
      />

      <div className="card p-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo mã, tên, mô tả..." />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title={items.length === 0 ? 'Chưa có mã khuyến mãi' : 'Không tìm thấy'}
            description={items.length === 0 ? 'Tạo mã đầu tiên để khách hàng áp dụng khi thanh toán.' : 'Thử từ khoá khác.'}
            action={items.length === 0 ? (
              <button onClick={onAdd} className="btn-primary"><Plus className="w-4 h-4" /> Tạo mã</button>
            ) : null}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="table-header">Mã</th>
                  <th className="table-header">Tên chương trình</th>
                  <th className="table-header">Giảm giá</th>
                  <th className="table-header">Đơn tối thiểu</th>
                  <th className="table-header">Sử dụng</th>
                  <th className="table-header">Hiệu lực</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="table-cell py-3">
                      <button
                        onClick={() => copyToClipboard(p.code, toast)}
                        className="inline-flex items-center gap-1.5 font-mono font-semibold text-brand-700 hover:text-brand-800"
                        title="Sao chép mã"
                      >
                        {p.code} <Copy className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td className="table-cell">
                      <p className="font-medium text-slate-900">{p.name}</p>
                      {p.description && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.description}</p>}
                    </td>
                    <td className="table-cell">
                      <span className="badge bg-rose-50 text-rose-700 ring-rose-200 inline-flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        {p.discount_type === 'percent'
                          ? `-${Number(p.discount_value)}%`
                          : `-${Number(p.discount_value).toLocaleString('vi-VN')}₫`}
                      </span>
                      {p.max_discount_amount && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          Tối đa {Number(p.max_discount_amount).toLocaleString('vi-VN')}₫
                        </p>
                      )}
                    </td>
                    <td className="table-cell text-slate-700">
                      {Number(p.min_order_amount) > 0
                        ? `${Number(p.min_order_amount).toLocaleString('vi-VN')}₫`
                        : '—'}
                    </td>
                    <td className="table-cell text-slate-700">
                      {Number(p.used_count || 0)}
                      {p.usage_limit ? ` / ${p.usage_limit}` : ''}
                    </td>
                    <td className="table-cell text-xs text-slate-500">
                      {p.starts_at ? <div>Từ: {formatDateShort(p.starts_at)}</div> : <div className="italic">Vô thời hạn (bắt đầu)</div>}
                      {p.ends_at
                        ? <div>Đến: {formatDateShort(p.ends_at)}</div>
                        : <div className="italic">Không hết hạn</div>}
                    </td>
                    <td className="table-cell">
                      <StatusBadge promo={p} />
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onEdit(p)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirm(p)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          title="Xoá"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <PromotionFormModal
          promo={editing}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          onSaved={() => { setModalOpen(false); setEditing(null); load() }}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Xoá mã khuyến mãi"
        message={`Mã "${confirm?.code}" sẽ bị xoá và không thể hoàn tác.`}
        confirmText="Xoá"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => { onDelete(confirm.id); setConfirm(null) }}
      />
    </div>
  )
}

function StatusBadge({ promo }) {
  if (!promo.is_active) {
    return <span className="badge bg-slate-100 text-slate-600 ring-slate-200">Tắt</span>
  }
  if (isExpired(promo.ends_at)) {
    return <span className="badge bg-rose-100 text-rose-700 ring-rose-200">Hết hạn</span>
  }
  if (promo.starts_at && new Date(promo.starts_at) > new Date()) {
    return <span className="badge bg-amber-100 text-amber-700 ring-amber-200">Sắp diễn ra</span>
  }
  if (promo.usage_limit && Number(promo.used_count || 0) >= Number(promo.usage_limit)) {
    return <span className="badge bg-rose-100 text-rose-700 ring-rose-200">Hết lượt</span>
  }
  return <span className="badge bg-emerald-100 text-emerald-700 ring-emerald-200">Đang chạy</span>
}

function isExpired(end) {
  if (!end) return false
  return new Date(end) < new Date()
}

function copyToClipboard(text, toast) {
  try {
    navigator.clipboard.writeText(text)
    toast.success(`Đã sao chép mã: ${text}`)
  } catch {
    toast.warning('Không thể sao chép tự động')
  }
}

function PromotionFormModal({ promo, onClose, onSaved }) {
  const isEdit = !!promo
  const toast = useToast()
  const [form, setForm] = useState(() => {
    if (!promo) return blank()
    return {
      ...promo,
      discount_value: String(promo.discount_value ?? ''),
      min_order_amount: promo.min_order_amount ?? 0,
      max_discount_amount: promo.max_discount_amount ?? '',
      usage_limit: promo.usage_limit ?? '',
      starts_at: formatDateInput(promo.starts_at),
      ends_at: formatDateInput(promo.ends_at),
    }
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.code || !form.name || !form.discount_value) {
      toast.warning('Vui lòng nhập mã, tên và giá trị giảm')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount) || 0,
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        is_active: !!form.is_active,
      }
      if (isEdit) {
        await promotionsAPI.update(promo.id, payload)
        toast.success('Đã cập nhật mã khuyến mãi')
      } else {
        await promotionsAPI.create({ ...payload, code: form.code })
        toast.success('Đã tạo mã khuyến mãi')
      }
      onSaved()
    } catch (err) {
      toast.error('Lưu thất bại: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={isEdit ? `Chỉnh sửa: ${promo.code}` : 'Tạo mã khuyến mãi'}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Hủy</button>
          <button form="promo-form" type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mã')}
          </button>
        </>
      }
    >
      <form id="promo-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Mã khuyến mãi *</label>
            <input
              className="input uppercase font-mono"
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase().replace(/\s/g, ''))}
              placeholder="VD: SALE10"
              disabled={isEdit}
            />
          </div>
          <div>
            <label className="label">Tên chương trình *</label>
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="label">Mô tả</label>
          <textarea
            className="input min-h-[70px]"
            rows={2}
            value={form.description || ''}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Loại giảm</label>
            <select className="input" value={form.discount_type} onChange={(e) => set('discount_type', e.target.value)}>
              {DISCOUNT_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Giá trị *</label>
            <input
              type="number" min="0" step={form.discount_type === 'percent' ? '1' : '1000'}
              className="input"
              value={form.discount_value}
              onChange={(e) => set('discount_value', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Tối đa (nếu %)</label>
            <input
              type="number" min="0" step="1000"
              className="input"
              value={form.max_discount_amount}
              onChange={(e) => set('max_discount_amount', e.target.value)}
              placeholder="Không giới hạn"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Đơn tối thiểu</label>
            <input
              type="number" min="0" step="1000"
              className="input"
              value={form.min_order_amount}
              onChange={(e) => set('min_order_amount', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Giới hạn lượt dùng</label>
            <input
              type="number" min="0"
              className="input"
              value={form.usage_limit}
              onChange={(e) => set('usage_limit', e.target.value)}
              placeholder="Không giới hạn"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={!!form.is_active}
                onChange={(e) => set('is_active', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Đang hoạt động
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Bắt đầu</label>
            <input
              type="datetime-local"
              className="input"
              value={form.starts_at || ''}
              onChange={(e) => set('starts_at', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Kết thúc</label>
            <input
              type="datetime-local"
              className="input"
              value={form.ends_at || ''}
              onChange={(e) => set('ends_at', e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}