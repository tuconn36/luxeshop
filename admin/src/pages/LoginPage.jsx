import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'
import { Gem, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      toast.success('Đăng nhập thành công')
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err.message || 'Đăng nhập thất bại'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-stretch bg-slate-50">
      {/* Brand panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white">
        <div className="absolute inset-0 opacity-20"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0, transparent 50%)' }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/login" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-display font-bold leading-none">LUXE</p>
              <p className="text-[10px] text-white/70 tracking-widest uppercase mt-1">Admin Panel</p>
            </div>
          </Link>

          <div>
            <p className="text-3xl font-display font-semibold leading-snug max-w-md">
              Nơi quản lý toàn bộ cửa hàng thời trang của bạn.
            </p>
            <p className="text-white/70 text-sm mt-3 max-w-sm">
              Theo dõi đơn hàng, sản phẩm, khách hàng và doanh thu — tất cả trong một bảng điều khiển trực quan.
            </p>
            <div className="mt-8 flex items-center gap-2 text-xs text-white/70">
              <ShieldCheck className="w-4 h-4" />
              <span>Bảo mật với JWT • Mã hóa bcrypt</span>
            </div>
          </div>

          <p className="text-xs text-white/50">© {new Date().getFullYear()} LUXE. All rights reserved.</p>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
              <Gem className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-display font-bold text-slate-900 leading-none">LUXE</p>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase mt-1">Admin Panel</p>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-display font-semibold text-slate-900">Chào mừng trở lại</h1>
            <p className="text-sm text-slate-500 mt-2">Đăng nhập để tiếp tục quản lý cửa hàng của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                <span className="font-semibold">Lỗi:</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="admin@luxe.vn"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-xs text-center text-slate-500 pt-2">
              Tài khoản được tạo bởi quản trị viên cấp cao qua script <code className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px]">createAdmin</code>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}