import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatVND = (amount) => {
  const value = Number(amount) || 0
  return new Intl.NumberFormat('vi-VN').format(value) + '₫'
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

export const ORDER_STATUS = {
  pending:    { label: 'Chờ xử lý',    color: 'bg-amber-100 text-amber-700 ring-amber-200' },
  processing: { label: 'Đang xử lý',   color: 'bg-blue-100 text-blue-700 ring-blue-200' },
  shipping:   { label: 'Đang giao',    color: 'bg-indigo-100 text-indigo-700 ring-indigo-200' },
  completed:  { label: 'Hoàn thành',   color: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  delivered:  { label: 'Đã giao',      color: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  cancelled:  { label: 'Đã hủy',       color: 'bg-rose-100 text-rose-700 ring-rose-200' },
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
  { value: 'processing',label: 'Đang xử lý' },
  { value: 'shipping',  label: 'Đang giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
]