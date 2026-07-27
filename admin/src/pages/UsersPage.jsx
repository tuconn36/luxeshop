import { useEffect, useMemo, useState } from 'react'
import { usersAPI } from '../lib/api'
import {
  formatDate, formatDateShort, formatVNDShort, getVipTier
} from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import {
  Users, Eye, Mail, Phone, Calendar, MapPin, X, ShieldCheck, ShieldOff,
  ShoppingBag, Crown, BadgeCheck, Lock
} from 'lucide-react'

const API_BASE = (import.meta.env.VITE_ASSET_BASE
  || import.meta.env.VITE_API_URL
  || 'http://localhost:5001'
).replace(/\/api\/?$/, '')

const ROLE_OPTIONS = [
  { value: 'user',  label: 'Khách hàng', color: 'bg-slate-100 text-slate-700' },
  { value: 'staff', label: 'Nhân viên',  color: 'bg-blue-100 text-blue-700' },
  { value: 'admin', label: 'Quản trị',   color: 'bg-amber-100 text-amber-700' },
]

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
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
    return users.filter((u) => {
      if (roleFilter && (u.role || 'user') !== roleFilter) return false
      if (!q) return true
      return [u.id, u.email, u.name, u.phone].filter(Boolean).join(' ').toLowerCase().includes(q)
    })
  }, [users, search, roleFilter])

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

  const stats = useMemo(() => ({
    total: users.length,
    verified: users.filter((u) => u.has_password).length,
    admins: users.filter((u) => u.role === 'admin').length,
  }), [users])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quản lý khách hàng"
        description={`${stats.total} tài khoản • ${stats.admins} quản trị viên`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MiniStat icon={Users}       label="Tổng tài khoản" value={stats.total} color="bg-slate-100 text-slate-700" />
        <MiniStat icon={ShieldCheck} label="Có mật khẩu"   value={stats.verified} color="bg-emerald-100 text-emerald-700" />
        <MiniStat icon={Crown}       label="Quản trị viên"  value={stats.admins}  color="bg-amber-100 text-amber-700" />
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Tìm theo tên, email, số điện thoại..."
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input min-w-[150px]"
            >
              <option value="">Tất cả vai trò</option>
              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {(search || roleFilter) && (
              <button
                onClick={() => { setSearch(''); setRoleFilter('') }}
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
                  <th className="table-header">Vai trò</th>
                  <th className="table-header">Xác thực</th>
                  <th className="table-header">Ngày đăng ký</th>
                  <th className="table-header text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => {
                  const role = u.role || 'user'
                  const roleInfo = ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[0]
                  return (
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
                      <td className="table-cell text-slate-600">{u.email || '—'}</td>
                      <td className="table-cell text-slate-600">{u.phone || '—'}</td>
                      <td className="table-cell">
                        <span className={`badge ${roleInfo.color}`}>{roleInfo.label}</span>
                      </td>
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
                  )
                })}
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
          onRoleUpdated={(id, role) => {
            setDetail((d) => d && d.id === id ? { ...d, role } : d)
            setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u))
          }}
        />
      )}
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-xl font-semibold text-slate-900 mt-0.5">{value}</p>
      </div>
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

function UserDetailModal({ user, loading, onClose, onRoleUpdated }) {
  const toast = useToast()
  const [stats, setStats] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [updatingRole, setUpdatingRole] = useState(false)
  const role = user.role || 'user'

  useEffect(() => {
    let alive = true
    Promise.all([
      usersAPI.getStats(user.id).catch(() => null),
      usersAPI.getAddresses(user.id).catch(() => []),
    ]).then(([s, a]) => {
      if (!alive) return
      setStats(s)
      setAddresses(Array.isArray(a) ? a : [])
    })
    return () => { alive = false }
  }, [user.id])

  const changeRole = async (newRole) => {
    if (newRole === role) return
    setUpdatingRole(true)
    try {
      await usersAPI.updateRole(user.id, newRole)
      toast.success('Đã cập nhật vai trò')
      onRoleUpdated(user.id, newRole)
    } catch (e) {
      toast.error('Cập nhật thất bại: ' + e.message)
    } finally {
      setUpdatingRole(false)
    }
  }

  const addr = typeof user.address === 'string'
    ? safeParse(user.address)
    : user.address

  const tier = stats ? getVipTier(Number(stats.totalSpent || 0)) : null

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
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
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900">{user.name || 'Chưa cập nhật'}</h3>
              <p className="text-sm text-slate-500">ID: #{user.id}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <span className="badge bg-slate-100 text-slate-700 ring-slate-200">
                  {(ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[0]).label}
                </span>
                {user.has_password ? (
                  <span className="badge bg-emerald-100 text-emerald-700 ring-emerald-200 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Có mật khẩu
                  </span>
                ) : (
                  <span className="badge bg-amber-100 text-amber-700 ring-amber-200 inline-flex items-center gap-1">
                    <ShieldOff className="w-3 h-3" /> Chỉ xác thực OTP
                  </span>
                )}
                {tier && tier.id > 0 && (
                  <span className="badge bg-amber-100 text-amber-700 ring-amber-200 inline-flex items-center gap-1">
                    <Crown className="w-3 h-3" /> {tier.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Vai trò
            </h4>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  disabled={updatingRole}
                  onClick={() => changeRole(r.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    role === r.value
                      ? 'bg-brand-50 border-brand-300 text-brand-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {r.label}
                  {role === r.value && <BadgeCheck className="w-3.5 h-3.5 inline-block ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Tổng đơn" value={stats.orders?.all ?? 0} icon={ShoppingBag} />
              <StatBox label="Hoàn thành" value={stats.orders?.delivered ?? 0} icon={BadgeCheck} />
              <StatBox label="Chi tiêu" value={formatVNDShort(stats.totalSpent || 0)} icon={Crown} />
              <StatBox label="Địa chỉ" value={stats.addresses ?? 0} icon={MapPin} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={Mail} label="Email" value={user.email || '—'} />
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

          {addresses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-700">Sổ địa chỉ ({addresses.length})</h4>
              </div>
              <ul className="space-y-2">
                {addresses.map((a) => (
                  <li key={a.id} className="bg-slate-50 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{a.name}</span>
                      <span className="text-slate-500">· {a.phone}</span>
                      {a.is_default && (
                        <span className="badge bg-brand-50 text-brand-700 ring-brand-200">Mặc định</span>
                      )}
                    </div>
                    <p className="text-slate-700 mt-1">{a.address}</p>
                    {(a.district || a.city) && (
                      <p className="text-xs text-slate-500 mt-0.5">{[a.district, a.city].filter(Boolean).join(', ')}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

function StatBox({ label, value, icon: Icon }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-md bg-white text-brand-700 flex items-center justify-center ring-1 ring-slate-200">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900 truncate">{value}</p>
      </div>
    </div>
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