import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
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
  Plus, Edit, Trash2, Package, Star, Filter, X, Copy,
  GripVertical, Image as ImageIcon, Upload, AlertCircle,
  CheckSquare, Square, Tag, Search
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

// Giới hạn upload ảnh (client-side, server có thể enforce riêng)
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// Helper: parse CSV → array đã trim + bỏ rỗng
const csvToArray = (csv) =>
  (csv || '').split(',').map((s) => s.trim()).filter(Boolean)

const arrayToCsv = (arr) => (Array.isArray(arr) ? arr.join(', ') : '')

// Tính % giảm giá
const discountPercent = (price, originalPrice) => {
  const p = Number(price) || 0
  const o = Number(originalPrice) || 0
  if (!o || o <= p) return 0
  return Math.round(((o - p) / o) * 100)
}

export default function ProductsPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [stockFilter, setStockFilter] = useState('all') // all | in | low | out
  const [sort, setSort] = useState('newest') // newest | price_asc | price_desc
  const [selected, setSelected] = useState(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [bulkConfirm, setBulkConfirm] = useState(false)
  const toast = useToast()
  const limit = 10

  // Debounce search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  // Reset selection khi đổi filter
  useEffect(() => { setSelected(new Set()) }, [page, category, search, stockFilter, sort])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await productsAPI.getAll({
        page, limit, category, search,
      })
      let list = data.items || []
      // Filter stock ở client (server có thể chưa hỗ trợ)
      if (stockFilter !== 'all') {
        list = list.filter((p) => {
          const s = Number(p.stock) || 0
          if (stockFilter === 'in') return s > 10
          if (stockFilter === 'low') return s > 0 && s <= 10
          if (stockFilter === 'out') return s === 0
          return true
        })
      }
      // Sort ở client (server có thể đã sort rồi)
      list = [...list].sort((a, b) => {
        if (sort === 'price_asc') return (Number(a.price) || 0) - (Number(b.price) || 0)
        if (sort === 'price_desc') return (Number(b.price) || 0) - (Number(a.price) || 0)
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      })
      setItems(list)
      setTotal(data.totalItems || 0)
      setTotalPages(data.totalPages || 1)
    } catch (e) {
      toast.error('Không thể tải sản phẩm: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [page, category, search, stockFilter, sort, toast])

  useEffect(() => { load() }, [load])

  const onAdd = () => { setEditing(null); setModalOpen(true) }
  const onEdit = (p) => { setEditing(p); setModalOpen(true) }

  const onDelete = async (id) => {
    try {
      await productsAPI.delete(id)
      toast.success('Đã xóa sản phẩm')
      load()
    } catch (e) {
      toast.error('Xóa thất bại: ' + e.message)
    }
  }

  const onBulkDelete = async () => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    setBulkConfirm(false)
    // Xóa tuần tự để đếm chính xác bao nhiêu thành công / lỗi
    let success = 0, fail = 0
    const failedNames = []
    for (const id of ids) {
      try {
        await productsAPI.delete(id)
        success++
      } catch (e) {
        fail++
        const p = items.find((it) => it.id === id)
        if (p) failedNames.push(p.name)
      }
    }
    setSelected(new Set())
    if (success > 0) {
      toast.success(
        `Đã xóa ${success} sản phẩm${fail ? `, ${fail} lỗi` : ''}`
      )
    } else {
      toast.error('Xóa hàng loạt thất bại')
    }
    if (failedNames.length > 0) {
      console.warn('Bulk delete failed for:', failedNames)
    }
    load()
  }

  const onSaved = () => {
    setModalOpen(false)
    setEditing(null)
    load()
  }

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    if (selected.size === items.length) setSelected(new Set())
    else setSelected(new Set(items.map((p) => p.id)))
  }
  const copyId = async (id) => {
    try {
      await navigator.clipboard.writeText(String(id))
      toast.success('Đã sao chép ID')
    } catch {
      toast.warning('Không thể sao chép')
    }
  }

  const stockSummary = useMemo(() => {
    let out = 0, low = 0, inStock = 0
    items.forEach((p) => {
      const s = Number(p.stock) || 0
      if (s === 0) out++
      else if (s <= 10) low++
      else inStock++
    })
    return { out, low, inStock, total: items.length }
  }, [items])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý sản phẩm"
        description={`${total} sản phẩm trong hệ thống`}
        actions={
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <>
                <span className="text-sm text-slate-600">
                  Đã chọn <b className="text-slate-900">{selected.size}</b>
                </span>
                <button
                  onClick={() => setBulkConfirm(true)}
                  className="btn-danger"
                >
                  <Trash2 className="w-4 h-4" /> Xóa {selected.size} mục
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="btn-ghost"
                  title="Bỏ chọn"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={onAdd} className="btn-primary">
              <Plus className="w-4 h-4" /> Thêm sản phẩm
            </button>
          </div>
        }
      />

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="Tổng" value={stockSummary.total} color="slate" />
        <StatChip label="Còn hàng (>10)" value={stockSummary.inStock} color="emerald" />
        <StatChip label="Sắp hết (1-10)" value={stockSummary.low} color="amber" />
        <StatChip label="Hết hàng" value={stockSummary.out} color="rose" />
      </div>

      <div className="card p-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <SearchInput
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Tìm theo tên hoặc mô tả..."
              />
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1) }}
                className="input min-w-[140px] h-10"
              >
                <option value="">Tất cả danh mục</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={stockFilter}
                onChange={(e) => { setStockFilter(e.target.value); setPage(1) }}
                className="input min-w-[140px] h-10"
                title="Lọc tồn kho"
              >
                <option value="all">Mọi mức tồn</option>
                <option value="in">Còn hàng</option>
                <option value="low">Sắp hết</option>
                <option value="out">Hết hàng</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input min-w-[140px] h-10"
                title="Sắp xếp"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
              {(search || category || stockFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput(''); setSearch(''); setCategory(''); setStockFilter('all'); setPage(1)
                  }}
                  className="btn-ghost h-10 px-3"
                  title="Xóa bộ lọc"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title={search || category ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm'}
            description={
              search || category
                ? 'Thử đổi từ khóa hoặc bỏ bộ lọc.'
                : 'Bấm Thêm sản phẩm để tạo sản phẩm đầu tiên.'
            }
            action={!search && !category ? (
              <button onClick={onAdd} className="btn-primary">
                <Plus className="w-4 h-4" /> Thêm sản phẩm
              </button>
            ) : null}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="table-header w-10">
                      <button
                        onClick={toggleSelectAll}
                        className="p-1 rounded hover:bg-slate-200 transition-colors"
                        title={selected.size === items.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      >
                        {selected.size === items.length && items.length > 0
                          ? <CheckSquare className="w-4 h-4 text-brand-600" />
                          : <Square className="w-4 h-4 text-slate-400" />}
                      </button>
                    </th>
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
                  {items.map((p) => {
                    const pct = discountPercent(p.price, p.original_price)
                    const isSelected = selected.has(p.id)
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-brand-50/40' : ''}`}
                      >
                        <td className="table-cell py-3.5">
                          <button
                            onClick={() => toggleSelect(p.id)}
                            className="p-1 rounded hover:bg-slate-200 transition-colors"
                          >
                            {isSelected
                              ? <CheckSquare className="w-4 h-4 text-brand-600" />
                              : <Square className="w-4 h-4 text-slate-400" />}
                          </button>
                        </td>
                        <td className="table-cell py-3.5">
                          <div className="flex items-center gap-3 min-w-[240px]">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 ring-1 ring-slate-200">
                              {p.images?.[0] ? (
                                <img
                                  src={(typeof p.images[0] === 'string' && p.images[0].startsWith('http')) ? p.images[0] : imgUrl(p.images[0])}
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
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-slate-900 truncate max-w-xs">{p.name}</p>
                                {pct > 0 && (
                                  <span className="badge bg-rose-100 text-rose-700 ring-rose-200 shrink-0">
                                    -{pct}%
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">{p.description || '—'}</p>
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
                        <td className="table-cell text-slate-500 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span>{formatDateShort(p.created_at)}</span>
                            <button
                              onClick={() => copyId(p.id)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title={`Sao chép ID: ${p.id}`}
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
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
                    )
                  })}
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

      <ConfirmDialog
        open={bulkConfirm}
        title={`Xóa ${selected.size} sản phẩm`}
        message={`Bạn có chắc muốn xóa ${selected.size} sản phẩm đã chọn? Hành động này không thể hoàn tác.`}
        confirmText="Xóa tất cả"
        danger
        onCancel={() => setBulkConfirm(false)}
        onConfirm={onBulkDelete}
      />
    </div>
  )
}

function StatChip({ label, value, color = 'slate' }) {
  const colorMap = {
    slate: 'bg-slate-50 text-slate-700 ring-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  }
  return (
    <div className={`card p-3.5 flex items-center justify-between ring-1 ${colorMap[color]}`}>
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
    </div>
  )
}

function StockBadge({ stock }) {
  const n = Number(stock) || 0
  if (n === 0) return <span className="badge bg-rose-100 text-rose-700 ring-rose-200">Hết hàng</span>
  if (n <= 10) return <span className="badge bg-amber-100 text-amber-700 ring-amber-200">{n} sản phẩm</span>
  return <span className="text-slate-700 tabular-nums">{n}</span>
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const canPrev = page > 1
  const canNext = page < totalPages
  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/60">
      <p className="text-sm text-slate-500">
        Trang <span className="font-semibold text-slate-700">{page}</span> / {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          disabled={!canPrev}
          onClick={() => onChange(page - 1)}
          className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >Trước</button>
        <button
          disabled={!canNext}
          onClick={() => onChange(page + 1)}
          className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >Sau</button>
      </div>
    </div>
  )
}

function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = !!product
  const toast = useToast()
  const initialRef = useRef(null)

  const [form, setForm] = useState(() => product
    ? {
        ...product,
        price: product.price ?? '',
        original_price: product.original_price ?? '',
        stock: product.stock ?? '',
        images: product.images || [],
        materials: product.materials || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        tags: product.tags || [],
      }
    : blankForm
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [imageInput, setImageInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)
  const fileInputRef = useRef(null)

  // Lưu snapshot để so sánh dirty
  useEffect(() => {
    initialRef.current = JSON.stringify(form)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Xác nhận trước khi đóng nếu có thay đổi
  const handleClose = () => {
    const isDirty = initialRef.current && initialRef.current !== JSON.stringify(form)
    if (isDirty && !window.confirm('Có thay đổi chưa lưu. Bạn có chắc muốn đóng?')) return
    onClose()
  }

  const validate = () => {
    const e = {}
    const name = (form.name || '').trim()
    if (!name) e.name = 'Tên sản phẩm là bắt buộc'
    else if (name.length > 200) e.name = 'Tên tối đa 200 ký tự'

    const price = Number(form.price)
    if (form.price === '' || form.price === null) e.price = 'Giá bán là bắt buộc'
    else if (Number.isNaN(price) || price < 0) e.price = 'Giá phải là số ≥ 0'
    else if (price === 0) e.price = 'Giá phải lớn hơn 0'

    if (form.original_price !== '' && form.original_price !== null) {
      const op = Number(form.original_price)
      if (Number.isNaN(op) || op < 0) e.original_price = 'Giá gốc phải là số ≥ 0'
      else if (op && op < price) e.original_price = 'Giá gốc phải ≥ giá bán'
    }

    if (form.stock !== '' && form.stock !== null) {
      const st = Number(form.stock)
      if (Number.isNaN(st) || st < 0) e.stock = 'Tồn kho phải là số ≥ 0'
    }

    if (!form.category) e.category = 'Chọn danh mục'

    if (!form.images || form.images.length === 0) e.images = 'Cần ít nhất 1 hình ảnh'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const uploadOne = async (file) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(`Định dạng không hỗ trợ: ${file.name}`)
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error(`${file.name} vượt quá 5MB`)
    }
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/upload/image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || error.message || 'Upload thất bại')
    }
    const data = await response.json()
    return data.url
  }

  const handleFiles = async (filesLike) => {
    const files = Array.from(filesLike || []).filter((f) => f.type?.startsWith('image/'))
    if (files.length === 0) return
    setUploading(true)
    const uploaded = []
    const failed = []
    for (const file of files) {
      try {
        const url = await uploadOne(file)
        uploaded.push(url)
      } catch (err) {
        failed.push(err.message)
      }
    }
    // Cập nhật form 1 lần với tất cả URL mới (tránh stale closure)
    if (uploaded.length > 0) {
      setForm((f) => ({ ...f, images: [...(f.images || []), ...uploaded] }))
    }
    if (uploaded.length) toast.success(`Đã upload ${uploaded.length} ảnh`)
    if (failed.length) toast.error(`${failed.length} ảnh lỗi: ${failed.slice(0, 2).join(', ')}`)
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (e) => handleFiles(e.target.files)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const addImage = () => {
    const v = imageInput.trim()
    if (!v) return
    setForm((f) => ({ ...f, images: [...(f.images || []), v] }))
    setImageInput('')
  }

  const removeImage = (i) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
  }

  const setPrimary = (i) => {
    setForm((f) => {
      const arr = [...(f.images || [])]
      if (i <= 0 || i >= arr.length) return f
      const [item] = arr.splice(i, 1)
      arr.unshift(item)
      return { ...f, images: arr }
    })
  }

  // Drag để sắp xếp lại ảnh
  const onItemDragStart = (e, idx) => {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onItemDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const onItemDrop = (e, targetIdx) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); return }
    setForm((f) => {
      const arr = [...(f.images || [])]
      const [moved] = arr.splice(dragIdx, 1)
      arr.splice(targetIdx, 0, moved)
      return { ...f, images: arr }
    })
    setDragIdx(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.warning('Vui lòng kiểm tra lại các trường được đánh dấu')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || '',
        price: Number(form.price),
        original_price: form.original_price === '' || form.original_price === null ? null : Number(form.original_price),
        category: form.category,
        stock: form.stock === '' || form.stock === null ? 0 : Number(form.stock),
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
      initialRef.current = JSON.stringify(form)
      onSaved()
    } catch (err) {
      toast.error('Lưu thất bại: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const pct = discountPercent(form.price, form.original_price)

  return (
    <Modal
      open
      onClose={handleClose}
      size="lg"
      title={isEdit ? `Chỉnh sửa: ${product.name}` : 'Thêm sản phẩm mới'}
      footer={
        <>
          <button type="button" onClick={handleClose} className="btn-secondary">Hủy</button>
          <button type="submit" form="product-form" disabled={saving} className="btn-primary">
            {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo sản phẩm')}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="label">Tên sản phẩm *</label>
          <input
            className={`input ${errors.name ? 'input-error' : ''}`}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="VD: Nhẫn vàng 18K đính kim cương"
            maxLength={200}
          />
          {errors.name && <FieldError msg={errors.name} />}
          <p className="text-xs text-slate-400 mt-1">{form.name.length}/200</p>
        </div>

        <div>
          <label className="label">Mô tả</label>
          <textarea
            className="input min-h-[96px] resize-y leading-relaxed"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Mô tả chi tiết về chất liệu, kích thước, xuất xứ..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Giá bán *</label>
            <input
              type="number" min="0" step="1000"
              className={`input ${errors.price ? 'input-error' : ''}`}
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="0"
            />
            {errors.price && <FieldError msg={errors.price} />}
          </div>
          <div>
            <label className="label">Giá gốc (nếu có)</label>
            <input
              type="number" min="0" step="1000"
              className={`input ${errors.original_price ? 'input-error' : ''}`}
              value={form.original_price}
              onChange={(e) => set('original_price', e.target.value)}
              placeholder="Để trống nếu không giảm giá"
            />
            {errors.original_price && <FieldError msg={errors.original_price} />}
            {pct > 0 && (
              <p className="text-xs text-rose-600 mt-1 font-medium">Giảm {pct}% so với giá gốc</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Danh mục *</label>
            <select
              className={`input ${errors.category ? 'input-error' : ''}`}
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <FieldError msg={errors.category} />}
          </div>
          <div>
            <label className="label">Tồn kho</label>
            <input
              type="number" min="0"
              className={`input ${errors.stock ? 'input-error' : ''}`}
              value={form.stock}
              onChange={(e) => set('stock', e.target.value)}
              placeholder="0"
            />
            {errors.stock && <FieldError msg={errors.stock} />}
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <input
            id="featured" type="checkbox"
            checked={!!form.featured}
            onChange={(e) => set('featured', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="featured" className="text-sm text-slate-700 select-none cursor-pointer">
            Đánh dấu là sản phẩm nổi bật (hiển thị trang chủ)
          </label>
        </div>

        <div>
          <label className="label">Hình ảnh sản phẩm *</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 transition-colors ${
              dragOver ? 'border-brand-400 bg-brand-50/50' :
              errors.images ? 'border-rose-300 bg-rose-50/30' :
              'border-slate-200 bg-slate-50/40'
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
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
                <Upload className="w-4 h-4" />
                {uploading ? 'Đang upload...' : 'Chọn ảnh từ máy'}
              </button>
              <div className="relative flex-1 flex gap-2">
                <input
                  className="input w-full"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="Hoặc dán URL ảnh..."
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
                />
                <button type="button" onClick={addImage} className="btn-secondary shrink-0">Thêm</button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              JPG, PNG, GIF, WebP (tối đa 5MB/ảnh). Kéo thả ảnh vào đây. Ảnh đầu tiên là ảnh chính.
            </p>
          </div>
          {errors.images && <FieldError msg={errors.images} />}

          {form.images?.length > 0 && (
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {form.images.map((img, i) => (
                <li
                  key={`${img}-${i}`}
                  draggable
                  onDragStart={(e) => onItemDragStart(e, i)}
                  onDragOver={onItemDragOver}
                  onDrop={(e) => onItemDrop(e, i)}
                  className={`flex items-center gap-2 text-sm bg-white border rounded-lg p-2 ${
                    dragIdx === i ? 'opacity-50' : ''
                  } ${i === 0 ? 'border-brand-300 ring-1 ring-brand-200' : 'border-slate-200'}`}
                >
                  <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                  <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden shrink-0 ring-1 ring-slate-200">
                    <img
                      src={(typeof img === 'string' && img.startsWith('http')) ? img : imgUrl(img)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {i === 0 ? (
                      <span className="badge bg-brand-100 text-brand-700 ring-brand-200 inline-flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Ảnh chính
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPrimary(i)}
                        className="text-xs text-slate-500 hover:text-brand-600"
                      >
                        Đặt làm ảnh chính
                      </button>
                    )}
                    <p className="text-xs text-slate-400 truncate mt-0.5">{img.split('/').pop()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors shrink-0"
                    title="Xóa"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-100 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Chất liệu</label>
            <input
              className="input"
              value={arrayToCsv(form.materials)}
              onChange={(e) => set('materials', csvToArray(e.target.value))}
              placeholder="Vàng 18K, Kim cương"
            />
          </div>
          <div>
            <label className="label">Sizes</label>
            <input
              className="input"
              value={arrayToCsv(form.sizes)}
              onChange={(e) => set('sizes', csvToArray(e.target.value))}
              placeholder="S, M, L"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Màu sắc</label>
            <input
              className="input"
              value={arrayToCsv(form.colors)}
              onChange={(e) => set('colors', csvToArray(e.target.value))}
              placeholder="Trắng, Vàng, Hồng"
            />
          </div>
          <div>
            <label className="label">
              <Tag className="w-3.5 h-3.5 inline mr-1" /> Tags
            </label>
            <input
              className="input"
              value={arrayToCsv(form.tags)}
              onChange={(e) => set('tags', csvToArray(e.target.value))}
              placeholder="Mới, Sale, Hot"
            />
          </div>
        </div>

        <p className="text-xs text-slate-400">* Bắt buộc</p>
      </form>
    </Modal>
  )
}

function FieldError({ msg }) {
  return (
    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" /> {msg}
    </p>
  )
}