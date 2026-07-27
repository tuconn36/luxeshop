import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatVND = (amount) => {
  const value = Number(amount) || 0
  return new Intl.NumberFormat('vi-VN').format(value) + '₫'
}

export const formatVNDShort = (amount) => {
  const value = Number(amount) || 0
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}tỷ`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}tr`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return `${value}`
}

export const formatDate = (input) => {
  if (!input) return '—'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export const formatDateShort = (input) => {
  if (!input) return '—'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export const formatDateInput = (input) => {
  if (!input) return ''
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  // Trả về chuỗi phù hợp với input[type=datetime-local]
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const ORDER_STATUS = {
  pending:           { label: 'Chờ xử lý',     color: 'bg-amber-100 text-amber-700 ring-amber-200' },
  pending_payment:   { label: 'Chờ thanh toán', color: 'bg-amber-100 text-amber-700 ring-amber-200' },
  processing:        { label: 'Đang xử lý',    color: 'bg-blue-100 text-blue-700 ring-blue-200' },
  ready:             { label: 'Sẵn sàng',      color: 'bg-cyan-100 text-cyan-700 ring-cyan-200' },
  shipping:          { label: 'Đang giao',     color: 'bg-indigo-100 text-indigo-700 ring-indigo-200' },
  shipped:           { label: 'Đã gửi hàng',   color: 'bg-indigo-100 text-indigo-700 ring-indigo-200' },
  completed:         { label: 'Hoàn thành',    color: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  delivered:         { label: 'Đã giao',       color: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  cancelled:         { label: 'Đã hủy',        color: 'bg-rose-100 text-rose-700 ring-rose-200' },
  canceled:          { label: 'Đã hủy',        color: 'bg-rose-100 text-rose-700 ring-rose-200' },
}

export const getStatusInfo = (status) =>
  ORDER_STATUS[status] || { label: status || 'Không rõ', color: 'bg-gray-100 text-gray-700 ring-gray-200' }

export const PAYMENT_STATUS = {
  pending:  { label: 'Chờ thanh toán', color: 'bg-amber-100 text-amber-700' },
  paid:     { label: 'Đã thanh toán',  color: 'bg-emerald-100 text-emerald-700' },
  failed:   { label: 'Thất bại',       color: 'bg-rose-100 text-rose-700' },
  refunded: { label: 'Đã hoàn tiền',   color: 'bg-blue-100 text-blue-700' },
}

export const getPaymentStatusInfo = (status) =>
  PAYMENT_STATUS[status] || { label: status || 'Không rõ', color: 'bg-gray-100 text-gray-700' }

export const CATEGORIES = ['Nam', 'Nữ', 'Phụ kiện']

export const STATUS_OPTIONS = [
  { value: '',          label: 'Tất cả trạng thái' },
  { value: 'pending',   label: 'Chờ xử lý' },
  { value: 'pending_payment', label: 'Chờ thanh toán' },
  { value: 'processing',label: 'Đang xử lý' },
  { value: 'shipping',  label: 'Đang giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
]

// VIP tier metadata — dùng cho hiển thị và thống kê khách hàng.
export const VIP_TIERS = [
  { id: 0,  key: 'member',  name: 'Member',        minSpent: 0 },
  { id: 1,  key: 'vip1',    name: 'VIP 1',         minSpent: 1_000_000 },
  { id: 2,  key: 'vip2',    name: 'VIP 2',         minSpent: 3_000_000 },
  { id: 3,  key: 'vip3',    name: 'VIP 3',         minSpent: 7_000_000 },
  { id: 4,  key: 'vip4',    name: 'VIP 4',         minSpent: 15_000_000 },
  { id: 5,  key: 'vip5',    name: 'VIP 5',         minSpent: 30_000_000 },
  { id: 6,  key: 'vip6',    name: 'VIP 6',         minSpent: 60_000_000 },
  { id: 7,  key: 'vip7',    name: 'VIP 7',         minSpent: 120_000_000 },
  { id: 8,  key: 'vip8',    name: 'VIP 8',         minSpent: 250_000_000 },
  { id: 9,  key: 'vip9',    name: 'VIP 9',         minSpent: 500_000_000 },
  { id: 10, key: 'vip10',   name: 'VIP 10',        minSpent: 1_000_000_000 },
]

export function getVipTier(totalSpent = 0) {
  let current = VIP_TIERS[0]
  for (const t of VIP_TIERS) {
    if (totalSpent >= t.minSpent) current = t
  }
  return current
}

// Resolves a stored image path (e.g. "/uploads/x.jpg") to a full URL
// pointing at the API host. Uses VITE_API_URL when available so dev/prod
// always stay in sync.
export function imgUrl(path) {
  if (!path) return ''
  if (typeof path !== 'string') return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '')
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${apiBase}${clean}`
}

export function slugify(text) {
  if (!text) return ''
  return String(text)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}