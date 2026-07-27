import { useEffect, useMemo, useState } from 'react'
import { reviewsAdminAPI } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Star, Trash2, MessageSquare, CheckCircle2, X, Filter } from 'lucide-react'
import { formatDate, formatDateShort, imgUrl } from '../lib/utils'

const RATING_OPTIONS = [
  { value: '', label: 'Tất cả sao' },
  { value: '5', label: '★★★★★ (5)' },
  { value: '4', label: '★★★★ (4+)' },
  { value: '3', label: '★★★ (3+)' },
  { value: '2', label: '★★ (2+)' },
  { value: '1', label: '★ (1+)' },
]

export default function ReviewsPage() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rating, setRating] = useState('')
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState(null)
  const toast = useToast()

  useEffect(() => { load() }, [page, rating])

  const load = async () => {
    setLoading(true)
    try {
      const res = await reviewsAdminAPI.getAll({ page, limit: 20, rating })
      setData(res)
    } catch (e) {
      toast.error('Không thể tải đánh giá: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data.items
    return data.items.filter((r) =>
      [r.comment, r.user_name, r.user_email, r.product_name].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
  }, [data.items, search])

  const onDelete = async (id) => {
    try {
      await reviewsAdminAPI.delete(id)
      toast.success('Đã xoá đánh giá')
      load()
    } catch (e) {
      toast.error('Xoá thất bại: ' + e.message)
    }
  }

  const stats = useMemo(() => {
    const items = data.items
    if (items.length === 0) return { avg: 0, total: 0, verified: 0 }
    const sum = items.reduce((s, r) => s + Number(r.rating || 0), 0)
    return {
      avg: (sum / items.length).toFixed(1),
      total: data.total,
      verified: items.filter((r) => r.verified_purchase).length,
    }
  }, [data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý đánh giá"
        description={`${stats.total} đánh giá trong hệ thống • TB ${stats.avg}★`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Tổng đánh giá" value={stats.total} icon={MessageSquare} color="brand" />
        <Stat label="Trung bình sao" value={`${stats.avg}★`} icon={Star} color="amber" />
        <Stat label="Đã xác minh mua" value={stats.verified} icon={CheckCircle2} color="emerald" />
      </div>

      <div className="card p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo nội dung, tên, email, sản phẩm..." />
          </div>
          <div className="flex gap-2">
            <select
              value={rating}
              onChange={(e) => { setRating(e.target.value); setPage(1) }}
              className="input min-w-[150px]"
            >
              {RATING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {(search || rating) && (
              <button
                onClick={() => { setSearch(''); setRating(''); setPage(1) }}
                className="btn-ghost"
                title="Xoá bộ lọc"
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
            icon={MessageSquare}
            title="Chưa có đánh giá"
            description="Khi khách đánh giá sản phẩm, nội dung sẽ hiển thị tại đây."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <ReviewRow key={r.id} review={r} onDelete={() => setConfirm(r)} />
            ))}
          </div>
        )}
        {data.totalPages > 1 && (
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title="Xoá đánh giá"
        message="Đánh giá này sẽ bị xoá vĩnh viễn. Khách hàng sẽ không thấy nó nữa."
        confirmText="Xoá"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => { onDelete(confirm.id); setConfirm(null) }}
      />
    </div>
  )
}

function Stat({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="mt-1.5 text-xl font-semibold text-slate-900">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-50 text-${color}-600`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}

function ReviewRow({ review, onDelete }) {
  const images = Array.isArray(review.images)
    ? review.images
    : (typeof review.images === 'string' ? safeParse(review.images) : [])

  return (
    <div className="p-5 hover:bg-slate-50/60">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
          {(review.user_name || review.user_email || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-slate-900 truncate">{review.user_name || review.user_email || `User #${review.user_id}`}</p>
            <RatingStars rating={Number(review.rating || 0)} />
            {review.verified_purchase ? (
              <span className="badge bg-emerald-100 text-emerald-700 ring-emerald-200 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đã mua
              </span>
            ) : null}
            <span className="text-xs text-slate-500 ml-auto">{formatDate(review.created_at)}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sản phẩm: <span className="text-slate-700 font-medium">{review.product_name || `SP #${review.product_id}`}</span>
          </p>
          <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
            {review.comment || <em className="text-slate-400">Không có nhận xét</em>}
          </p>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {images.map((img, i) => (
                <a
                  key={i}
                  href={img.startsWith('http') ? img : imgUrl(img)}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-16 h-16 rounded-lg overflow-hidden ring-1 ring-slate-200 hover:ring-brand-400"
                >
                  <img
                    src={img.startsWith('http') ? img : imgUrl(img)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </a>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
          title="Xoá"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  )
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
      <p className="text-sm text-slate-500">Trang <span className="font-semibold text-slate-700">{page}</span> / {totalPages}</p>
      <div className="flex gap-2">
        <button disabled={page === 1} onClick={() => onChange(page - 1)} className="btn-secondary px-4 py-1.5 text-xs">Trước</button>
        <button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="btn-secondary px-4 py-1.5 text-xs">Sau</button>
      </div>
    </div>
  )
}

function safeParse(str) {
  try { return JSON.parse(str) } catch { return [] }
}