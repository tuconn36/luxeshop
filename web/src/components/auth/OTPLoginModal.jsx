import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/lib/api.js';

const FB_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const APPLE_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

function SocialButtons() {
  return (
    <>
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">hoặc tiếp tục với</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => toast.info('Tính năng đang phát triển')}
          className="flex items-center justify-center gap-2 border rounded-lg py-2.5 text-sm font-medium hover:bg-muted transition-colors">
          {FB_ICON} Facebook
        </button>
        <button type="button" onClick={() => toast.info('Tính năng đang phát triển')}
          className="flex items-center justify-center gap-2 border rounded-lg py-2.5 text-sm font-medium hover:bg-muted transition-colors">
          {APPLE_ICON} Apple
        </button>
      </div>
    </>
  );
}

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 flex items-center gap-1 mt-1">⚠ {msg}</p>;
}

export default function OTPLoginModal({ isOpen, onClose }) {
  const { login, requestOTP, verifyOTP } = useAuth();

  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot'

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Register
  const [regMethod, setRegMethod] = useState('email');
  const [regId, setRegId] = useState('');
  const [regStep, setRegStep] = useState(1);
  const [regOtpId, setRegOtpId] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regTimer, setRegTimer] = useState(0);
  const [regNewPw, setRegNewPw] = useState('');
  const [regConfirmPw, setRegConfirmPw] = useState('');

  // Forgot
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotOtpId, setForgotOtpId] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotTimer, setForgotTimer] = useState(0);
  const [forgotNewPw, setForgotNewPw] = useState('');
  const [forgotConfirmPw, setForgotConfirmPw] = useState('');
  const [showForgotPw, setShowForgotPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const triggerError = (msg) => {
    setError(msg); setShake(true);
    toast.error(msg);
    setTimeout(() => setShake(false), 600);
  };

  React.useEffect(() => {
    if (regTimer > 0) { const t = setTimeout(() => setRegTimer(r => r - 1), 1000); return () => clearTimeout(t); }
  }, [regTimer]);

  React.useEffect(() => {
    if (forgotTimer > 0) { const t = setTimeout(() => setForgotTimer(r => r - 1), 1000); return () => clearTimeout(t); }
  }, [forgotTimer]);

  const resetAll = () => {
    setTab('login');
    setLoginEmail(''); setLoginPw('');
    setRegId(''); setRegStep(1); setRegCode(''); setRegNewPw(''); setRegConfirmPw('');
    setForgotEmail(''); setForgotStep(1); setForgotCode(''); setForgotNewPw(''); setForgotConfirmPw('');
    setError('');
  };

  const handleClose = () => { if (!loading) { resetAll(); onClose(); } };
  const switchTab = (t) => { setTab(t); setError(''); };

  // ── Đăng nhập ──
  const handleLogin = async (e) => {
    e.preventDefault(); setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPw);
      toast.success('Đăng nhập thành công');
      handleClose();
    } catch { triggerError('Email hoặc mật khẩu không đúng'); }
    finally { setLoading(false); }
  };

  // ── Tạo tài khoản ──
  const handleRegSendOTP = async (e) => {
    e.preventDefault(); setError('');
    if (regMethod === 'phone' && !/^(0|\+84)[0-9]{9,10}$/.test(regId)) {
      triggerError('Số điện thoại không hợp lệ'); return;
    }
    setLoading(true);
    try {
      const r = await requestOTP(regId, regMethod);
      setRegOtpId(r.otpId); setRegTimer(60); setRegStep(2);
      toast.success('Mã OTP đã được gửi');
    } catch { triggerError('Không thể gửi OTP. Vui lòng thử lại.'); }
    finally { setLoading(false); }
  };

  const handleRegVerifyOTP = async (e) => {
    e.preventDefault(); setError('');
    if (regCode.length !== 8) { triggerError('Mã OTP phải gồm 8 chữ số'); return; }
    setLoading(true);
    try {
      const { needsPassword } = await verifyOTP(regOtpId, regCode);
      if (needsPassword) { setRegStep(3); toast.success('Xác thực thành công!'); }
      else { toast.success('Đăng nhập thành công'); handleClose(); }
    } catch { triggerError('Mã OTP không đúng hoặc đã hết hạn'); setRegCode(''); }
    finally { setLoading(false); }
  };

  const handleRegResend = async () => {
    setLoading(true);
    try {
      const r = await requestOTP(regId, regMethod);
      setRegOtpId(r.otpId); setRegCode(''); setRegTimer(60);
      toast.success('Đã gửi lại mã OTP');
    } catch { toast.error('Không thể gửi lại mã'); }
    finally { setLoading(false); }
  };

  const handleRegSetPw = async (e) => {
    e.preventDefault();
    if (regNewPw.length < 6) { triggerError('Mật khẩu ít nhất 6 ký tự'); return; }
    if (regNewPw !== regConfirmPw) { triggerError('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true);
    try {
      await authAPI.setPassword(regNewPw);
      toast.success('Tạo tài khoản thành công! Chào mừng đến LUXE 🎉');
      handleClose();
    } catch (err) { triggerError(err.message || 'Thất bại'); }
    finally { setLoading(false); }
  };

  // ── Quên mật khẩu ──
  const handleForgotSendOTP = async (e) => {
    e.preventDefault(); setError('');
    if (!forgotEmail) { triggerError('Vui lòng nhập email'); return; }
    setLoading(true);
    try {
      const r = await requestOTP(forgotEmail, 'email');
      setForgotOtpId(r.otpId); setForgotTimer(60); setForgotStep(2);
      toast.success('Mã OTP đã gửi đến ' + forgotEmail);
    } catch { triggerError('Email không tồn tại hoặc không thể gửi OTP'); }
    finally { setLoading(false); }
  };

  const handleForgotVerifyOTP = async (e) => {
    e.preventDefault(); setError('');
    if (forgotCode.length !== 8) { triggerError('Mã OTP phải gồm 8 chữ số'); return; }
    setLoading(true);
    try {
      await verifyOTP(forgotOtpId, forgotCode);
      setForgotStep(3); toast.success('Xác thực thành công! Đặt mật khẩu mới.');
    } catch { triggerError('Mã OTP không đúng hoặc đã hết hạn'); setForgotCode(''); }
    finally { setLoading(false); }
  };

  const handleForgotResend = async () => {
    setLoading(true);
    try {
      const r = await requestOTP(forgotEmail, 'email');
      setForgotOtpId(r.otpId); setForgotCode(''); setForgotTimer(60);
      toast.success('Đã gửi lại mã OTP');
    } catch { toast.error('Không thể gửi lại mã'); }
    finally { setLoading(false); }
  };

  const handleForgotSetPw = async (e) => {
    e.preventDefault();
    if (forgotNewPw.length < 6) { triggerError('Mật khẩu ít nhất 6 ký tự'); return; }
    if (forgotNewPw !== forgotConfirmPw) { triggerError('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true);
    try {
      await authAPI.setPassword(forgotNewPw);
      toast.success('Đặt lại mật khẩu thành công!');
      handleClose();
    } catch (err) { triggerError(err.message || 'Thất bại'); }
    finally { setLoading(false); }
  };

  const shakeClass = shake ? 'animate-shake border-red-500' : '';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">

        {/* Tabs — ẩn khi đang ở forgot */}
        {tab !== 'forgot' && (
          <div className="grid grid-cols-2 border-b">
            {['login', 'register'].map((t) => (
              <button key={t} onClick={() => switchTab(t)}
                className={`py-4 text-sm font-semibold transition-colors ${tab === t ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {t === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
              </button>
            ))}
          </div>
        )}

        <div className="p-6 space-y-4">

          {/* ── ĐĂNG NHẬP ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <DialogHeader className="pb-0">
                <DialogTitle className="text-xl font-bold text-center">Chào mừng trở lại</DialogTitle>
              </DialogHeader>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="ten@email.com" value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setError(''); }}
                  disabled={loading} required autoFocus className={shakeClass} />
              </div>

              <div className="space-y-2">
                <Label>Mật khẩu</Label>
                <div className="relative">
                  <Input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={loginPw}
                    onChange={(e) => { setLoginPw(e.target.value); setError(''); }}
                    disabled={loading} required className={`pr-10 ${shakeClass}`} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <ErrorMsg msg={error} />
                  <button type="button" onClick={() => { switchTab('forgot'); }}
                    className="text-xs text-primary hover:underline ml-auto">
                    Quên mật khẩu?
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang đăng nhập...</> : 'Đăng nhập'}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Chưa có tài khoản?{' '}
                <button type="button" onClick={() => switchTab('register')} className="font-semibold text-primary hover:underline">
                  Tạo ngay
                </button>
              </div>

              <SocialButtons />
            </form>
          )}

          {/* ── TẠO TÀI KHOẢN ── */}
          {tab === 'register' && (
            <>
              {regStep === 1 && (
                <form onSubmit={handleRegSendOTP} className="space-y-4">
                  <DialogHeader className="pb-0">
                    <DialogTitle className="text-xl font-bold text-center">Tạo tài khoản</DialogTitle>
                  </DialogHeader>
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    {['email', 'phone'].map((m) => (
                      <button key={m} type="button" onClick={() => { setRegMethod(m); setRegId(''); setError(''); }}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${regMethod === m ? 'bg-white shadow-sm' : 'text-muted-foreground'}`}>
                        {m === 'email' ? 'Email' : 'Số điện thoại'}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <Label>{regMethod === 'email' ? 'Email' : 'Số điện thoại'}</Label>
                    <Input type={regMethod === 'email' ? 'email' : 'tel'} placeholder={regMethod === 'email' ? 'ten@email.com' : '0912345678'}
                      value={regId} onChange={(e) => { setRegId(regMethod === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value); setError(''); }}
                      disabled={loading} required maxLength={regMethod === 'phone' ? 11 : undefined} className={shakeClass} />
                    <ErrorMsg msg={error} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang gửi...</> : 'Gửi mã OTP'}
                  </Button>
                  <div className="text-center text-xs text-muted-foreground">
                    Đã có tài khoản?{' '}
                    <button type="button" onClick={() => switchTab('login')} className="font-semibold text-primary hover:underline">Đăng nhập</button>
                  </div>
                  <SocialButtons />
                </form>
              )}

              {regStep === 2 && (
                <form onSubmit={handleRegVerifyOTP} className="space-y-4">
                  <DialogHeader className="pb-0">
                    <DialogTitle className="text-xl font-bold text-center">Nhập mã xác thực</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-center text-muted-foreground">Mã 8 chữ số đã gửi đến <strong>{regId}</strong></p>
                  <div className="space-y-1">
                    <Input type="text" maxLength={8} placeholder="• • • • • • • •"
                      value={regCode} onChange={(e) => { setRegCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                      disabled={loading} required autoFocus autoComplete="off"
                      className={`text-center text-2xl tracking-[0.5em] font-mono ${shakeClass}`} />
                    <ErrorMsg msg={error} />
                    <p className="text-xs text-center text-muted-foreground">Mã có hiệu lực trong 10 phút</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || regCode.length !== 8}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xác thực...</> : 'Xác thực'}
                  </Button>
                  <div className="flex justify-between text-sm">
                    <button type="button" onClick={() => { setRegStep(1); setRegCode(''); }} className="text-muted-foreground hover:text-foreground">← Quay lại</button>
                    <button type="button" onClick={handleRegResend} disabled={loading || regTimer > 0} className="text-primary hover:underline disabled:opacity-50">
                      {regTimer > 0 ? `Gửi lại sau ${regTimer}s` : 'Gửi lại mã'}
                    </button>
                  </div>
                </form>
              )}

              {regStep === 3 && (
                <form onSubmit={handleRegSetPw} className="space-y-4">
                  <DialogHeader className="pb-0">
                    <DialogTitle className="text-xl font-bold text-center">Đặt mật khẩu</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-center text-muted-foreground">Tạo mật khẩu để đăng nhập nhanh hơn</p>
                  <div className="space-y-1">
                    <Label>Mật khẩu</Label>
                    <Input type="password" placeholder="Ít nhất 6 ký tự" value={regNewPw}
                      onChange={(e) => setRegNewPw(e.target.value)} disabled={loading} required autoFocus />
                  </div>
                  <div className="space-y-1">
                    <Label>Xác nhận mật khẩu</Label>
                    <Input type="password" placeholder="••••••••" value={regConfirmPw}
                      onChange={(e) => setRegConfirmPw(e.target.value)} disabled={loading} required />
                    <ErrorMsg msg={error} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</> : 'Hoàn tất đăng ký'}
                  </Button>
                  <button type="button" onClick={handleClose} className="w-full text-xs text-muted-foreground hover:text-foreground text-center">
                    Bỏ qua, đặt sau
                  </button>
                </form>
              )}
            </>
          )}

          {/* ── QUÊN MẬT KHẨU ── */}
          {tab === 'forgot' && (
            <>
              {forgotStep === 1 && (
                <form onSubmit={handleForgotSendOTP} className="space-y-4">
                  <DialogHeader className="pb-0">
                    <DialogTitle className="text-xl font-bold text-center">Quên mật khẩu</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-center text-muted-foreground">Nhập email để nhận mã xác thực</p>
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input type="email" placeholder="ten@email.com" value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setError(''); }}
                      disabled={loading} required autoFocus className={shakeClass} />
                    <ErrorMsg msg={error} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang gửi...</> : 'Gửi mã OTP'}
                  </Button>
                  <button type="button" onClick={() => switchTab('login')} className="w-full text-sm text-muted-foreground hover:text-foreground text-center">
                    ← Quay lại đăng nhập
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleForgotVerifyOTP} className="space-y-4">
                  <DialogHeader className="pb-0">
                    <DialogTitle className="text-xl font-bold text-center">Nhập mã xác thực</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-center text-muted-foreground">Mã 8 chữ số đã gửi đến <strong>{forgotEmail}</strong></p>
                  <div className="space-y-1">
                    <Input type="text" maxLength={8} placeholder="• • • • • • • •"
                      value={forgotCode} onChange={(e) => { setForgotCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                      disabled={loading} required autoFocus autoComplete="off"
                      className={`text-center text-2xl tracking-[0.5em] font-mono ${shakeClass}`} />
                    <ErrorMsg msg={error} />
                    <p className="text-xs text-center text-muted-foreground">Mã có hiệu lực trong 10 phút</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || forgotCode.length !== 8}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xác thực...</> : 'Xác thực'}
                  </Button>
                  <div className="flex justify-between text-sm">
                    <button type="button" onClick={() => { setForgotStep(1); setForgotCode(''); }} className="text-muted-foreground hover:text-foreground">← Quay lại</button>
                    <button type="button" onClick={handleForgotResend} disabled={loading || forgotTimer > 0} className="text-primary hover:underline disabled:opacity-50">
                      {forgotTimer > 0 ? `Gửi lại sau ${forgotTimer}s` : 'Gửi lại mã'}
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleForgotSetPw} className="space-y-4">
                  <DialogHeader className="pb-0">
                    <DialogTitle className="text-xl font-bold text-center">Đặt mật khẩu mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-1">
                    <Label>Mật khẩu mới</Label>
                    <div className="relative">
                      <Input type={showForgotPw ? 'text' : 'password'} placeholder="Ít nhất 6 ký tự"
                        value={forgotNewPw} onChange={(e) => setForgotNewPw(e.target.value)}
                        disabled={loading} required autoFocus className="pr-10" />
                      <button type="button" onClick={() => setShowForgotPw(!showForgotPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showForgotPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Xác nhận mật khẩu</Label>
                    <Input type="password" placeholder="••••••••" value={forgotConfirmPw}
                      onChange={(e) => setForgotConfirmPw(e.target.value)} disabled={loading} required />
                    <ErrorMsg msg={error} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</> : 'Đặt lại mật khẩu'}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
