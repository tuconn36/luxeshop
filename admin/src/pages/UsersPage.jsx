import { useEffect, useMemo, useState } from 'react'
import { usersAPI } from '../lib/api'
import { formatDate, formatDateShort } from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import {
  Users, Eye, Mail, Phone, Calendar, MapPin, X, ShieldCheck, ShieldOff
} from 'lucide-react'

const API_BASE = 'http://localhost:5000'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const toast = useToast()

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await usersAPI.getAll()
      setUsers(data || [])
    } catch (e) {
      toast.error('Không thể tải người dùng: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      const text = [u.id, u.email, u.name, u.phone].filter(Boolean).join(' ').toLowerCase()
      return text.includes(q)
    })
  }, [users, search])

  const openDetail = async (user) => {
    setDetail(user)
    setDetailLoading(true)
    try {
      const full = await usersAPI.getById(user.id)
      setDetail(full)
    } catch (e) {
      console.warn('User detail failed', e)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quản lý người dùng"
        description={`${users.length} tài khoản trong hệ thống`}
      />

      <div className="card p-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên, email, số điện thoại..."
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Không có người dùng"
            description={users.length === 0 ? 'Chưa có tài khoản nào.' : 'Không tìm thấy kết quả phù hợp.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="table-header">Người dùng</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Số điện thoại</th>
                  <th className="table-header">Xác thực</th>
                  <th className="table-header">Ngày đăng ký</th>
                  <th className="table-header text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{u.name || `User #${u.id}`}</p>
                          <p className="text-xs text-slate-500">ID: #{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-slate-600">{u.email}</td>
                    <td className="table-cell text-slate-600">{u.phone || '—'}</td>
                    <td className="table-cell">
                      {u.has_password ? (
                        <span className="badge bg-emerald-100 text-emerald-700 ring-emerald-200 inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Có MK
                        </span>
                      ) : (
                        <span className="badge bg-amber-100 text-amber-700 ring-amber-200 inline-flex items-center gap-1">
                          <ShieldOff className="w-3 h-3" /> OTP only
                        </span>
                      )}
                    </td>
                    <td className="table-cell text-slate-500">{formatDateShort(u.created_at)}</td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => openDetail(u)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <UserDetailModal
          user={detail}
          loading={detailLoading}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  )
}

function Avatar({ user }) {
  const src = user.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE}${user.avatar}`)
    : null
  if (src) {
    return (
      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 shrink-0">
        <img
          src={src}
          alt={user.name || user.email}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </div>
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
      {(user.name || user.email || '?').charAt(0).toUpperCase()}
    </div>
  )
}

function UserDetailModal({ user, loading, onClose }) {
  const addr = typeof user.address === 'string'
    ? safeParse(user.address)
    : user.address
  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title={`Hồ sơ: ${user.name || user.email}`}
      footer={<button onClick={onClose} className="btn-secondary">Đóng</button>}
    >
      {loading ? (
        <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `${API_BASE}${user.avatar}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-2xl font-semibold">
                  {(user.name || user.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{user.name || 'Chưa cập nhật'}</h3>
              <p className="text-sm text-slate-500">ID: #{user.id}</p>
              <div className="mt-1.5">
                {user.has_password ? (
                  <span className="badge bg-emerald-100 text-emerald-700 ring-emerald-200 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Có mật khẩu
                  </span>
                ) : (
                  <span className="badge bg-amber-100 text-amber-700 ring-amber-200 inline-flex items-center gap-1">
                    <ShieldOff className="w-3 h-3" /> Chỉ xác thực OTP
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Số điện thoại" value={user.phone || '—'} />
            <InfoRow icon={Calendar} label="Ngày sinh" value={user.dob || '—'} />
            <InfoRow icon={Calendar} label="Ngày đăng ký" value={formatDate(user.created_at)} />
          </div>

          {addr && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-700">Địa chỉ</h4>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                {typeof addr === 'string' ? addr : (
                  <>
                    {addr.address && <p>{addr.address}</p>}
                    {(addr.district || addr.city) && (
                      <p className="text-slate-500 text-xs mt-0.5">
                        {[addr.district, addr.city].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className="text-sm font-medium text-slate-900 break-all">{value}</p>
    </div>
  )
}

function safeParse(str) {
  try { return JSON.parse(str) } catch { return str }
}