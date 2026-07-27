import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/utils'
import {
  LayoutDashboard, Package, ShoppingCart, Users, LogOut, ChevronDown,
  Menu, X, Gem, ExternalLink, UserCircle, BarChart3, Tags, Ticket,
  ImageIcon, MessageSquare, Settings, Star
} from 'lucide-react'

const navGroups = [
  {
    label: 'Tổng quan',
    items: [
      { to: '/',           icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/analytics',  icon: BarChart3,       label: 'Phân tích' },
    ],
  },
  {
    label: 'Quản lý',
    items: [
      { to: '/products',   icon: Package,    label: 'Sản phẩm' },
      { to: '/categories', icon: Tags,       label: 'Danh mục' },
      { to: '/orders',     icon: ShoppingCart, label: 'Đơn hàng' },
      { to: '/users',      icon: Users,      label: 'Khách hàng' },
      { to: '/reviews',    icon: Star,       label: 'Đánh giá' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { to: '/promotions', icon: Ticket,     label: 'Mã khuyến mãi' },
      { to: '/banners',    icon: ImageIcon,  label: 'Banner' },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { to: '/settings',   icon: Settings,   label: 'Cấu hình' },
    ],
  },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const getCurrentTitle = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        const active = item.end
          ? location.pathname === item.to
          : location.pathname === item.to || location.pathname.startsWith(item.to + '/')
        if (active) return item.label
      }
    }
    return 'Admin'
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 fixed inset-y-0 left-0 z-30">
        <SidebarContent currentPath={location.pathname} />
        <LogoutSection onLogout={handleLogout} user={user} />
      </aside>

      {/* Sidebar - mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white flex flex-col animate-slide-up">
            <SidebarContent
              currentPath={location.pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 leading-tight">
                  {getCurrentTitle()}
                </h2>
                <p className="text-xs text-slate-500 hidden sm:block">Quản lý cửa hàng LUXE</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-slate-50"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Xem cửa hàng
              </a>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((s) => !s)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-sm font-semibold">
                    {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user?.name || user?.email}
                  </span>
                  <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-20 animate-fade-in overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'Quản trị viên'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-screen-2xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ currentPath, onNavigate }) {
  return (
    <>
      <div className="h-16 px-5 flex items-center gap-2 border-b border-slate-100">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-soft">
          <Gem className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-base font-display font-bold text-slate-900 leading-none">LUXE</p>
          <p className="text-[10px] text-slate-500 tracking-widest uppercase mt-0.5">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ to, icon: Icon, label, end }) => {
                const active = end
                  ? currentPath === to
                  : currentPath === to || currentPath.startsWith(to + '/')
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={cn('nav-link', active && 'nav-link-active')}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    <span>{label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  )
}

function LogoutSection({ user, onLogout }) {
  return (
    <div className="p-3 border-t border-slate-100">
      <div className="rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 p-3 mb-2">
        <div className="flex items-center gap-2 mb-1">
          <UserCircle className="w-4 h-4 text-brand-700" />
          <p className="text-xs font-semibold text-brand-800">Đang đăng nhập</p>
        </div>
        <p className="text-xs text-brand-700/80 truncate">{user?.email}</p>
      </div>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Đăng xuất
      </button>
    </div>
  )
}