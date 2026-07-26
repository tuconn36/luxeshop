import { useEffect, useMemo, useState, useRef } from 'react'
import { productsAPI } from '../lib/api'
import { formatVND, formatDateShort, CATEGORIES, imgUrl } from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import StatusBadge from '../components/ui/StatusBadge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import {
  Plus, Edit, Trash2, Package, Star, Filter, X
} from 'lucide-react'

const blankForm = {
  name: '',
  description: '',
  price: '',
  original_price: '',
  category: 'Nam',
  stock: '',
  featured: false,
  images: [],
  materials: [],
  sizes: [],
  colors: [],
  tags: [],
}
export default function ProductsPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const toast = useToast()
  const limit = 10
  useEffect(() => { load() }, [page, category])
  const load = async () => {
    setLoading(true)
    try {
      const data = await productsAPI.getAll({ page, limit, category, search })
      setItems(data.items || [])
      setTotal(data.totalItems || 0)
      setTotalPages(data.totalPages || 1)
    } catch (e) {
      toast.error('Không thể tải sản phẩm: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e?.preventDefault?.()
    setPage(1)
    load()
  }

  const onAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const onEdit = (p) => {
    setEditing(p)
    setModalOpen(true)
  }

  const onDelete = async (id) => {
    try {
      await productsAPI.delete(id)
      toast.success('Đã xóa sản phẩm')
      load()
    } catch (e) {
      toast.error('Xóa thất bại: ' + e.message)
    }
  }

  const onSaved = () => {
    setModalOpen(false)
    setEditing(null)
    load()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý sản phẩm"
        description={`${total} sản phẩm trong hệ thống`}
        actions={
          <button onClick={onAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Thêm sản phẩm
          </button>
        }
      />

      <div className="card p-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Tìm theo tên hoặc mô tả..."
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1) }}
              className="input min-w-[150px] h-10"
            >
              <option value="">Tất cả danh mục</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="btn-primary h-10">
              <Filter className="w-4 h-4" /> Lọc
            </button>
            {(search || category) && (
              <button
                type="button"
                onClick={() => { setSearch(''); setCategory(''); setPage(1); setTimeout(load, 0) }}
                className="btn-ghost h-10 px-3"
                title="Xóa bộ lọc"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Chưa có sản phẩm"
            description="Bấm Thêm sản phẩm để tạo sản phẩm đầu tiên."
            action={
              <button onClick={onAdd} className="btn-primary">
                <Plus className="w-4 h-4" /> Thêm sản phẩm
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="table-header">Sản phẩm</th>
                    <th className="table-header">Danh mục</th>
                    <th className="table-header text-right">Giá</th>
                    <th className="table-header text-right">Tồn kho</th>
                    <th className="table-header">Nổi bật</th>
                    <th className="table-header">Ngày tạo</th>
                    <th className="table-header text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="table-cell py-3.5">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 ring-1 ring-slate-200">
                            {p.images?.[0] ? (
                              <img
                                src={p.images[0].startsWith('http') ? p.images[0] : imgUrl(p.images[0])}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate max-w-xs">{p.name}</p>
                            <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell py-3.5">
                        <span className="badge bg-slate-100 text-slate-700 ring-slate-200">
                          {p.category}
                        </span>
                      </td>
                      <td className="table-cell text-right font-medium py-3.5">
                        {formatVND(p.price)}
                        {p.original_price && Number(p.original_price) > Number(p.price) && (
                          <div className="text-xs text-slate-400 line-through mt-0.5">
                            {formatVND(p.original_price)}
                          </div>
                        )}
                      </td>
                      <td className="table-cell text-right py-3.5">
                        <StockBadge stock={p.stock} />
                      </td>
                      <td className="table-cell py-3.5">
                        {p.featured ? (
                          <span className="badge bg-amber-100 text-amber-700 ring-amber-200 inline-flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> Nổi bật
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="table-cell text-slate-500 py-3.5">{formatDateShort(p.created_at)}</td>
                      <td className="table-cell text-right py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(p)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirm(p)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>

      {modalOpen && (
        <ProductFormModal
          product={editing}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          onSaved={onSaved}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Xóa sản phẩm"
        message={`Bạn có chắc muốn xóa "${confirm?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => { onDelete(confirm.id); setConfirm(null) }}
      />
    </div>
  )
}

function StockBadge({ stock }) {
  const n = Number(stock) || 0
  if (n === 0) return <span className="badge bg-rose-100 text-rose-700 ring-rose-200">Hết hàng</span>
  if (n <= 10) return <span className="badge bg-amber-100 text-amber-700 ring-amber-200">{n} sản phẩm</span>
  return <span className="text-slate-700">{n}</span>
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/60">
      <p className="text-sm text-slate-500">Trang <span className="font-semibold text-slate-700">{page}</span> / {totalPages}</p>
      <div className="flex gap-2">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="btn-secondary px-4 py-1.5 text-xs"
        >Trước</button>
        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="btn-secondary px-4 py-1.5 text-xs"
        >Sau</button>
      </div>
    </div>
  )
}

function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = !!product
  const toast = useToast()
  const [form, setForm] = useState(() => product
    ? { ...product, images: product.images || [], materials: product.materials || [], sizes: product.sizes || [], colors: product.colors || [], tags: product.tags || [] }
    : blankForm
  )
  const [saving, setSaving] = useState(false)
  const [imageInput, setImageInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          },
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload thất bại')
        }

        const data = await response.json()
        set('images', [...(form.images || []), data.url])
      }
      toast.success('Đã upload ảnh thành công')
    } catch (err) {
      toast.error(err.message || 'Upload ảnh thất bại')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const addImage = () => {
    const v = imageInput.trim()
    if (!v) return
    set('images', [...(form.images || []), v])
    setImageInput('')
  }

  const removeImage = (i) => set('images', form.images.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) {
      toast.warning('Vui lòng nhập tên và giá sản phẩm')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description || '',
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        category: form.category,
        stock: Number(form.stock) || 0,
        featured: !!form.featured,
        images: form.images || [],
        materials: form.materials || [],
        sizes: form.sizes || [],
        colors: form.colors || [],
        tags: form.tags || [],
      }
      if (isEdit) {
        await productsAPI.update(product.id, payload)
        toast.success('Đã cập nhật sản phẩm')
      } else {
        await productsAPI.create(payload)
        toast.success('Đã tạo sản phẩm mới')
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
      title={isEdit ? `Chỉnh sửa: ${product.name}` : 'Thêm sản phẩm mới'}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
          <button type="submit" form="product-form" disabled={saving} className="btn-primary">
            {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo sản phẩm')}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Tên sản phẩm *</label>
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>

        <div>
          <label className="label">Mô tả</label>
          <textarea
            className="input min-h-[96px] resize-y leading-relaxed"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Giá bán *</label>
            <input
              type="number" min="0" step="1000"
              className="input"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Giá gốc (nếu có)</label>
            <input
              type="number" min="0" step="1000"
              className="input"
              value={form.original_price}
              onChange={(e) => set('original_price', e.target.value)}
              placeholder="Để trống nếu không giảm giá"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Danh mục *</label>
            <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tồn kho</label>
            <input
              type="number" min="0"
              className="input"
              value={form.stock}
              onChange={(e) => set('stock', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <input
            id="featured" type="checkbox"
            checked={!!form.featured}
            onChange={(e) => set('featured', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="featured" className="text-sm text-slate-700 select-none">
            Đánh dấu là sản phẩm nổi bật
          </label>
        </div>

        <div>
          <label className="label">Hình ảnh sản phẩm</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary whitespace-nowrap"
            >
              {uploading ? 'Đang upload...' : '📁 Chọn ảnh từ máy'}
            </button>
            <div className="relative flex-1">
              <input
                className="input w-full"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="Hoặc dán URL ảnh..."
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
              />
            </div>
            <button type="button" onClick={addImage} className="btn-secondary shrink-0">Thêm URL</button>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 5MB/ảnh)</p>
          {form.images?.length > 0 && (
            <ul className="mt-3 space-y-2">
              {form.images.map((img, i) => (
                <li key={i} className="flex items-center gap-2 text-sm bg-slate-50 rounded-lg p-2.5">
                  <div className="w-11 h-11 rounded bg-white overflow-hidden shrink-0 ring-1 ring-slate-200">
                    <img
                      src={img.startsWith('http') ? img : imgUrl(img)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  </div>
                  <span className="flex-1 truncate text-slate-600">{img}</span>
                  <button type="button" onClick={() => removeImage(i)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-100 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Chất liệu (phân cách dấu phẩy)</label>
            <input
              className="input"
              value={(form.materials || []).join(', ')}
              onChange={(e) => set('materials', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              placeholder="Cotton, Polyester"
            />
          </div>
          <div>
            <label className="label">Sizes (phân cách dấu phẩy)</label>
            <input
              className="input"
              value={(form.sizes || []).join(', ')}
              onChange={(e) => set('sizes', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              placeholder="S, M, L, XL"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Màu sắc (phân cách dấu phẩy)</label>
            <input
              className="input"
              value={(form.colors || []).join(', ')}
              onChange={(e) => set('colors', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              placeholder="Trắng, Đen, Xanh"
            />
          </div>
          <div>
            <label className="label">Tags (phân cách dấu phẩy)</label>
            <input
              className="input"
              value={(form.tags || []).join(', ')}
              onChange={(e) => set('tags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              placeholder="Owen, Sale"
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}