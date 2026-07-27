import { useEffect, useRef, useState } from 'react'
import { bannersAPI } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Plus, Edit, Trash2, ImageIcon, ExternalLink, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'
import { formatDateInput, formatDateShort, imgUrl } from '../lib/utils'

const POSITIONS = [
  { value: 'home',          label: 'Trang chủ (Hero)' },
  { value: 'home_side',     label: 'Trang chủ - cột phải' },
  { value: 'category',      label: 'Trang danh mục' },
  { value: 'flash_sale',    label: 'Flash Sale banner' },
  { value: 'promotion',     label: 'Banner khuyến mãi' },
  { value: 'popup',         label: 'Popup' },
]

const blank = () => ({
  title: '',
  subtitle: '',
  image_url: '',
  link_url: '',
  button_text: '',
  position: 'home',
  sort_order: 0,
  is_active: true,
  starts_at: '',
  ends_at: '',
})

export default function BannersPage() {
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
      const data = await bannersAPI.getAll()
      setItems(data || [])
    } catch (e) {
      toast.error('Không thể tải banner: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = items.filter((b) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [b.title, b.subtitle, b.position].filter(Boolean).join(' ').toLowerCase().includes(q)
  })

  const onAdd = () => { setEditing(null); setModalOpen(true) }
  const onEdit = (b) => { setEditing(b); setModalOpen(true) }

  const onDelete = async (id) => {
    try {
      await bannersAPI.delete(id)
      toast.success('Đã xoá banner')
      load()
    } catch (e) {
      toast.error('Xoá thất bại: ' + e.message)
    }
  }

  const toggleActive = async (b) => {
    try {
      await bannersAPI.update(b.id, { is_active: !b.is_active })
      load()
      toast.success(b.is_active ? 'Đã tắt banner' : 'Đã bật banner')
    } catch (e) {
      toast.error('Cập nhật thất bại: ' + e.message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý banner"
        description={`${items.length} banner`}
        actions={
          <button onClick={onAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Thêm banner
          </button>
        }
      />

      <div className="card p-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tiêu đề, vị trí..." />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title={items.length === 0 ? 'Chưa có banner' : 'Không tìm thấy'}
            description={items.length === 0 ? 'Tạo banner đầu tiên cho trang chủ.' : 'Thử từ khoá khác.'}
            action={items.length === 0 ? (
              <button onClick={onAdd} className="btn-primary"><Plus className="w-4 h-4" /> Thêm banner</button>
            ) : null}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="table-header">Banner</th>
                  <th className="table-header">Vị trí</th>
                  <th className="table-header">Liên kết</th>
                  <th className="table-header text-right">Thứ tự</th>
                  <th className="table-header">Hiệu lực</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="table-cell py-3">
                      <div className="flex items-center gap-3 min-w-[280px]">
                        <div className="w-24 h-14 rounded-lg bg-slate-100 overflow-hidden ring-1 ring-slate-200 shrink-0">
                          {b.image_url ? (
                            <img
                              src={(typeof b.image_url === 'string' && b.image_url.startsWith('http')) ? b.image_url : imgUrl(b.image_url)}
                              alt={b.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{b.title}</p>
                          {b.subtitle && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{b.subtitle}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge bg-slate-100 text-slate-700 ring-slate-200">
                        {POSITIONS.find((p) => p.value === b.position)?.label || b.position}
                      </span>
                    </td>
                    <td className="table-cell">
                      {b.link_url ? (
                        <a
                          href={b.link_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline truncate max-w-[200px]"
                        >
                          <ExternalLink className="w-3 h-3" /> {b.link_url}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="table-cell text-right text-slate-700">{b.sort_order ?? 0}</td>
                    <td className="table-cell text-xs text-slate-500">
                      {b.starts_at ? <div>Từ: {formatDateShort(b.starts_at)}</div> : <div className="italic">Ngay</div>}
                      {b.ends_at
                        ? <div>Đến: {formatDateShort(b.ends_at)}</div>
                        : <div className="italic">Không hết hạn</div>}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => toggleActive(b)}
                        className={`badge inline-flex items-center gap-1 cursor-pointer ${
                          b.is_active
                            ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                            : 'bg-slate-100 text-slate-600 ring-slate-200'
                        }`}
                        title={b.is_active ? 'Tắt banner' : 'Bật banner'}
                      >
                        {b.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {b.is_active ? 'Hiển thị' : 'Đã ẩn'}
                      </button>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onEdit(b)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirm(b)}
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
        <BannerFormModal
          banner={editing}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          onSaved={() => { setModalOpen(false); setEditing(null); load() }}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Xoá banner"
        message={`Banner "${confirm?.title}" sẽ bị xoá.`}
        confirmText="Xoá"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => { onDelete(confirm.id); setConfirm(null) }}
      />
    </div>
  )
}

function BannerFormModal({ banner, onClose, onSaved }) {
  const isEdit = !!banner
  const toast = useToast()
  const fileInputRef = useRef(null)
  const [form, setForm] = useState(() => {
    if (!banner) return blank()
    return {
      ...banner,
      starts_at: formatDateInput(banner.starts_at),
      ends_at: formatDateInput(banner.ends_at),
    }
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('image', file)
        const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:5001/api')}/upload/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
          body: fd,
        })
        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(err.error || err.message || 'Upload thất bại')
        }
        const data = await response.json()
        set('image_url', data.url)
      }
      toast.success('Đã upload ảnh')
    } catch (err) {
      toast.error(err.message || 'Upload thất bại')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.image_url) {
      toast.warning('Vui lòng nhập tiêu đề và ảnh banner')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        image_url: form.image_url,
        link_url: form.link_url || null,
        button_text: form.button_text || null,
        position: form.position,
        sort_order: Number(form.sort_order) || 0,
        is_active: !!form.is_active,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      }
      if (isEdit) {
        await bannersAPI.update(banner.id, payload)
        toast.success('Đã cập nhật banner')
      } else {
        await bannersAPI.create(payload)
        toast.success('Đã tạo banner')
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
      title={isEdit ? `Chỉnh sửa: ${banner.title}` : 'Thêm banner'}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Hủy</button>
          <button form="banner-form" type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo banner')}
          </button>
        </>
      }
    >
      <form id="banner-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Tiêu đề *</label>
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div>
            <label className="label">Vị trí</label>
            <select className="input" value={form.position} onChange={(e) => set('position', e.target.value)}>
              {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Phụ đề</label>
          <input
            className="input"
            value={form.subtitle || ''}
            onChange={(e) => set('subtitle', e.target.value)}
            placeholder="Mô tả ngắn hiển thị trên banner"
          />
        </div>

        <div>
          <label className="label">Hình ảnh *</label>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file" accept="image/*" className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary whitespace-nowrap"
            >
              {uploading ? 'Đang upload...' : '📁 Chọn ảnh'}
            </button>
            <input
              className="input"
              value={form.image_url}
              onChange={(e) => set('image_url', e.target.value)}
              placeholder="/uploads/banners/..."
              required
            />
          </div>
          {form.image_url && (
            <div className="mt-2 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200 max-w-md aspect-[21/9]">
              <img
                src={(typeof form.image_url === 'string' && form.image_url.startsWith('http')) ? form.image_url : imgUrl(form.image_url)}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Liên kết (URL)</label>
            <input
              className="input"
              value={form.link_url || ''}
              onChange={(e) => set('link_url', e.target.value)}
              placeholder="/products hoặc https://..."
            />
          </div>
          <div>
            <label className="label">Chữ trên nút bấm</label>
            <input
              className="input"
              value={form.button_text || ''}
              onChange={(e) => set('button_text', e.target.value)}
              placeholder="Mua ngay"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label">Thứ tự</label>
            <input
              type="number" min="0"
              className="input"
              value={form.sort_order}
              onChange={(e) => set('sort_order', e.target.value)}
            />
          </div>
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

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={!!form.is_active}
            onChange={(e) => set('is_active', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Hiển thị banner trên cửa hàng
        </label>
      </form>
    </Modal>
  )
}