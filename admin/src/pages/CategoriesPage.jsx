import { useEffect, useState } from 'react'
import { categoriesAPI } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Plus, Edit, Trash2, Tags, X, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { slugify, imgUrl } from '../lib/utils'

const blank = { name: '', slug: '', description: '', image: '', sort_order: 0, is_active: true }

export default function CategoriesPage() {
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
      const data = await categoriesAPI.getAll()
      setItems(data || [])
    } catch (e) {
      toast.error('Không thể tải danh mục: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = items.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [c.name, c.slug, c.description].filter(Boolean).join(' ').toLowerCase().includes(q)
  })

  const onAdd = () => { setEditing(null); setModalOpen(true) }
  const onEdit = (c) => { setEditing(c); setModalOpen(true) }

  const onDelete = async (id) => {
    try {
      await categoriesAPI.delete(id)
      toast.success('Đã xóa danh mục')
      load()
    } catch (e) {
      toast.error('Xóa thất bại: ' + e.message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý danh mục"
        description={`${items.length} danh mục`}
        actions={
          <button onClick={onAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Thêm danh mục
          </button>
        }
      />

      <div className="card p-5">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên, slug, mô tả..."
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Tags}
            title={items.length === 0 ? 'Chưa có danh mục' : 'Không có kết quả'}
            description={items.length === 0 ? 'Bấm Thêm danh mục để tạo danh mục đầu tiên.' : 'Thử từ khoá khác.'}
            action={items.length === 0 ? (
              <button onClick={onAdd} className="btn-primary"><Plus className="w-4 h-4" /> Thêm danh mục</button>
            ) : null}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="table-header">Danh mục</th>
                  <th className="table-header">Slug</th>
                  <th className="table-header">Mô tả</th>
                  <th className="table-header text-right">Thứ tự</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="table-cell py-3">
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="w-11 h-11 rounded-lg bg-slate-100 overflow-hidden ring-1 ring-slate-200 shrink-0">
                          {c.image ? (
                            <img
                              src={(typeof c.image === 'string' && c.image.startsWith('http')) ? c.image : imgUrl(c.image)}
                              alt={c.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <p className="font-medium text-slate-900 truncate">{c.name}</p>
                      </div>
                    </td>
                    <td className="table-cell text-slate-600 font-mono text-xs">{c.slug}</td>
                    <td className="table-cell text-slate-600 max-w-xs">
                      <p className="line-clamp-2 text-sm">{c.description || '—'}</p>
                    </td>
                    <td className="table-cell text-right text-slate-700">{c.sort_order ?? 0}</td>
                    <td className="table-cell">
                      {c.is_active ? (
                        <span className="badge bg-emerald-100 text-emerald-700 ring-emerald-200">Hoạt động</span>
                      ) : (
                        <span className="badge bg-slate-100 text-slate-600 ring-slate-200">Tắt</span>
                      )}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onEdit(c)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirm(c)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          title="Xóa"
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
        <CategoryFormModal
          category={editing}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          onSaved={() => { setModalOpen(false); setEditing(null); load() }}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Xóa danh mục"
        message={`Bạn có chắc muốn xóa "${confirm?.name}"?`}
        confirmText="Xóa"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => { onDelete(confirm.id); setConfirm(null) }}
      />
    </div>
  )
}

function CategoryFormModal({ category, onClose, onSaved }) {
  const isEdit = !!category
  const [form, setForm] = useState(() => category ? { ...category, sort_order: category.sort_order ?? 0 } : blank)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.slug) {
      toast.warning('Vui lòng nhập tên và slug')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        sort_order: Number(form.sort_order) || 0,
      }
      if (isEdit) {
        await categoriesAPI.update(category.id, payload)
        toast.success('Đã cập nhật danh mục')
      } else {
        await categoriesAPI.create(payload)
        toast.success('Đã tạo danh mục')
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
      size="md"
      title={isEdit ? `Chỉnh sửa: ${category.name}` : 'Thêm danh mục'}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Hủy</button>
          <button form="cat-form" type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo')}
          </button>
        </>
      }
    >
      <form id="cat-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Tên danh mục *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value
                setForm((f) => ({ ...f, name, slug: f.slug && f.slug !== slugify(f.name) ? f.slug : slugify(name) }))
              }}
              required
            />
          </div>
          <div>
            <label className="label">Slug *</label>
            <input
              className="input"
              value={form.slug}
              onChange={(e) => set('slug', slugify(e.target.value))}
              required
            />
          </div>
        </div>
        <div>
          <label className="label">Mô tả</label>
          <textarea
            className="input min-h-[80px]"
            rows={2}
            value={form.description || ''}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">URL hình ảnh</label>
            <input
              className="input"
              value={form.image || ''}
              onChange={(e) => set('image', e.target.value)}
              placeholder="/uploads/categories/..."
            />
            {form.image && (
              <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200">
                <img
                  src={(typeof form.image === 'string' && form.image.startsWith('http')) ? form.image : imgUrl(form.image)}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>
            )}
          </div>
          <div>
            <label className="label">Thứ tự hiển thị</label>
            <input
              type="number" min="0"
              className="input"
              value={form.sort_order}
              onChange={(e) => set('sort_order', e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            id="active" type="checkbox"
            checked={!!form.is_active}
            onChange={(e) => set('is_active', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="active" className="text-sm text-slate-700 select-none">
            Đang hoạt động (hiển thị trên cửa hàng)
          </label>
        </div>
      </form>
    </Modal>
  )
}