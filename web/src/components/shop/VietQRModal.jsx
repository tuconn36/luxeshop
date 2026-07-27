import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { paymentAPI, ordersAPI } from '@/lib/api.js';
import { formatVND } from '@/lib/utils';
import {
  QrCode, Copy, Check, Loader2, Building2, AlertCircle,
  CheckCircle2, Clock, Zap, Shield, X, Smartphone,
  Wallet, User, Hash, Lock, Sparkles, PartyPopper,
  BadgeCheck, ScanLine, ArrowRight, Info,
} from 'lucide-react';
import { toast } from 'sonner';

/* ───────────────────────────────────────────────────────────────
   Small helpers
   ─────────────────────────────────────────────────────────────── */

function CopyButton({ value, label = 'Sao chép' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Không thể sao chép');
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 transition-colors"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Đã chép' : label}
    </button>
  );
}

// formatVND được import từ @/lib/utils.

/* ───────────────────────────────────────────────────────────────
   QR Code Box  — auto-scan animation + glow
   ─────────────────────────────────────────────────────────────── */

function QRBox({ qrData, loading, banksError }) {
  return (
    <div className="relative">
      {/* Ambient glow */}
      <div className="absolute -inset-6 bg-gradient-to-br from-amber-300/40 via-orange-200/30 to-amber-300/40 rounded-[2rem] blur-2xl opacity-70" />

      {/* Card */}
      <div className="relative rounded-2xl bg-white p-5 shadow-[0_10px_40px_-10px_rgba(180,83,9,0.25)] border border-amber-100/80">
        {/* Corner ornaments */}
        <CornerOrnament className="top-2 left-2" />
        <CornerOrnament className="top-2 right-2 rotate-90" />
        <CornerOrnament className="bottom-2 left-2 -rotate-90" />
        <CornerOrnament className="bottom-2 right-2 rotate-180" />

        {loading ? (
          <div className="w-[230px] h-[230px] flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-stone-50 to-amber-50/30 rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <span className="text-xs text-muted-foreground">Đang tạo mã QR...</span>
          </div>
        ) : banksError ? (
          <div className="w-[230px] h-[230px] flex flex-col items-center justify-center gap-2 bg-red-50 rounded-xl text-center p-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="text-xs text-red-700">{banksError}</span>
          </div>
        ) : qrData ? (
          <div className="relative">
            <img
              src={qrData.qrUrl}
              alt="VietQR"
              className="relative w-[230px] h-[230px] rounded-lg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            {/* Scan line animation */}
            <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
              <div className="qr-scan-line" />
            </div>
          </div>
        ) : (
          <div className="w-[230px] h-[230px] flex flex-col items-center justify-center gap-2 bg-stone-50 rounded-xl text-center p-4">
            <QrCode className="w-8 h-8 text-stone-400" />
            <span className="text-xs text-muted-foreground">Không thể tạo mã QR</span>
          </div>
        )}

        {/* Footer hint */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-stone-600">
          <ScanLine className="w-3.5 h-3.5 text-amber-600" />
          <span>Mở app ngân hàng → quét QR</span>
        </div>
      </div>
    </div>
  );
}

function CornerOrnament({ className = '' }) {
  return (
    <svg className={`absolute w-5 h-5 text-amber-600/70 ${className}`} viewBox="0 0 24 24" fill="none">
      <path d="M3 8V3h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ───────────────────────────────────────────────────────────────
   Bank Selector  — premium card style
   ─────────────────────────────────────────────────────────────── */

function BankSelector({ banks, selectedBankId, onSelect }) {
  if (banks.length === 0) {
    return (
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800">
          Hiện chưa có ngân hàng nào được cấu hình. Liên hệ LUXE để được hỗ trợ.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
          Chọn ngân hàng
        </label>
        <span className="text-[10px] text-stone-400">{banks.length} ngân hàng</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {banks.map((b) => {
          const selected = selectedBankId === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelect(b.id)}
              className={`group relative shrink-0 w-[88px] p-2.5 rounded-xl border-2 transition-all duration-200 ${
                selected
                  ? 'border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md shadow-amber-600/10'
                  : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/30'
              }`}
            >
              {/* Check badge */}
              {selected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </div>
              )}

              <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-colors ${
                selected ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-500 group-hover:bg-amber-100 group-hover:text-amber-700'
              }`}>
                <Building2 className="w-5 h-5" />
              </div>
              <p className={`mt-1.5 text-[11px] font-bold text-center truncate ${
                selected ? 'text-amber-900' : 'text-stone-700'
              }`}>
                {b.shortName}
              </p>
              <p className={`text-[9px] text-center truncate ${selected ? 'text-amber-700/70' : 'text-stone-400'}`}>
                {b.name?.split(' ')[0]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Bank Info Card
   ─────────────────────────────────────────────────────────────── */

function InfoRow({ icon: Icon, label, value, copyable, mono, accent }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-stone-100 last:border-0">
      <div className="flex items-center gap-2 shrink-0">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
          accent ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'
        }`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs text-stone-500">{label}</span>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-sm text-right truncate ${mono ? 'font-mono' : 'font-semibold'} ${
          accent ? 'text-amber-700 font-bold' : 'text-stone-900'
        }`}>
          {value}
        </span>
        {copyable && <CopyButton value={copyable} />}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Status Pill — auto-poll indicator
   ─────────────────────────────────────────────────────────────── */

function PollStatus({ secondsSinceOpen, pollCount, pollErrorCount }) {
  const errs = pollErrorCount;
  const status = errs > 0 ? 'slow' : 'live';
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border border-emerald-200/60">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <div className={`absolute inset-0 w-2 h-2 rounded-full animate-ping ${status === 'live' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-emerald-900 leading-tight">
            {status === 'live' ? 'Đang tự động kiểm tra' : 'Kết nối chậm...'}
          </p>
          <p className="text-[10px] text-emerald-700/70 leading-tight">
            Sepay polling
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-emerald-700">
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/60 border border-emerald-200/50">
          <Clock className="w-3 h-3" />
          <span className="font-mono font-semibold">
            {Math.floor(secondsSinceOpen / 60)}:{String(secondsSinceOpen % 60).padStart(2, '0')}
          </span>
        </div>
        <div className="px-1.5 py-0.5 rounded bg-white/60 border border-emerald-200/50 font-semibold">
          {pollCount}×
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Success State  — confetti + premium checkmark
   ─────────────────────────────────────────────────────────────── */

function SuccessState({ autoCloseMs, onClose }) {
  return (
    <div className="relative py-10 px-6 text-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500" />

      {/* Confetti dots */}
      <Confetti />

      <div className="relative">
        <div className="relative inline-block">
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute -inset-3 rounded-full border-2 border-emerald-300/40 animate-pulse" />

          {/* Icon */}
          <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-400 animate-pulse" />
          </div>
        </div>

        <h3 className="font-bold text-2xl text-emerald-800 mt-6">
          Thanh toán thành công!
        </h3>
        <p className="text-sm text-emerald-700/80 max-w-xs mx-auto mt-1.5">
          Đơn hàng đã được ghi nhận và đang được xử lý. Cảm ơn bạn đã tin tưởng LUXE.
        </p>

        {/* Progress bar */}
        <div className="mt-6 mx-auto max-w-xs">
          <div className="w-full bg-emerald-200/60 rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
              style={{
                width: '100%',
                animation: `shrink ${autoCloseMs}ms linear forwards`,
              }}
            />
          </div>
          <p className="text-[10px] text-emerald-600/70 mt-1.5">
            Tự động đóng sau {Math.ceil(autoCloseMs / 1000)}s...
          </p>
        </div>

        <Button
          className="mt-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/20"
          onClick={onClose}
        >
          <BadgeCheck className="w-4 h-4" />
          Xem đơn hàng ngay
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function Confetti() {
  const dots = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((i) => (
        <span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${(i * 17) % 100}%`,
            top: `${20 + (i * 13) % 60}%`,
            backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'][i % 5],
            animation: `confetti-fall ${2 + (i % 3)}s ease-in-out ${i * 0.1}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Main Modal
   ─────────────────────────────────────────────────────────────── */

export default function VietQRModal({
  open,
  onOpenChange,
  orderId,
  amount,
  onPaid,
  autoCloseMs = 2500,
}) {
  const [banks, setBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [loadingQR, setLoadingQR] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [confirmingPaid, setConfirmingPaid] = useState(false);
  const [banksError, setBanksError] = useState('');
  const [paid, setPaid] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [secondsSinceOpen, setSecondsSinceOpen] = useState(0);
  const [pollErrorCount, setPollErrorCount] = useState(0);

  const paidRef = useRef(false);
  const pollTimeoutRef = useRef(null);
  const autoCloseTimeoutRef = useRef(null);
  const isOpenRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const triggerPaid = useCallback(() => {
    if (paidRef.current) return;
    paidRef.current = true;
    setPaid(true);
    stopPolling();
    toast.success('🎉 Thanh toán thành công!', { duration: 4000 });
    if (onPaid) onPaid();
    autoCloseTimeoutRef.current = setTimeout(() => {
      if (isOpenRef.current) onOpenChange(false);
    }, autoCloseMs);
  }, [onPaid, onOpenChange, stopPolling, autoCloseMs]);

  /* Open/close lifecycle */
  useEffect(() => {
    isOpenRef.current = open;
    if (open) {
      paidRef.current = false;
      setPaid(false);
      setPollCount(0);
      setPollErrorCount(0);
      setSecondsSinceOpen(0);
      setQrData(null);
    } else {
      stopPolling();
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    }
    return () => {
      stopPolling();
      if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current);
    };
  }, [open, stopPolling]);

  /* Load banks */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoadingBanks(true);
      setBanksError('');
      try {
        const res = await paymentAPI.getBanks();
        if (cancelled) return;
        setBanks(res.banks || []);
        if (res.banks && res.banks[0]) setSelectedBankId(res.banks[0].id);
      } catch (err) {
        if (cancelled) return;
        setBanksError(err.message || 'Không thể tải danh sách ngân hàng');
      } finally {
        if (!cancelled) setLoadingBanks(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [open]);

  /* Load QR */
  useEffect(() => {
    if (!open || !orderId || !selectedBankId) return;
    let cancelled = false;
    const load = async () => {
      setLoadingQR(true);
      try {
        const data = await paymentAPI.getQR(orderId, selectedBankId);
        if (!cancelled) setQrData(data);
      } catch (err) {
        if (!cancelled) {
          if (err.message?.includes('đã được thanh toán')) {
            triggerPaid();
          } else {
            toast.error(err.message || 'Không thể tạo mã QR');
            setQrData(null);
          }
        }
      } finally {
        if (!cancelled) setLoadingQR(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [open, orderId, selectedBankId, triggerPaid]);

  /* Polling */
  const pollPaymentStatus = useCallback(async () => {
    if (!isOpenRef.current || paidRef.current || !orderId) return;
    try {
      const data = await ordersAPI.getById(orderId);
      const status = (data.paymentStatus || data.payment_status || '').toLowerCase();
      if (status === 'paid') {
        triggerPaid();
        return;
      }
      setPollCount((c) => c + 1);
      setPollErrorCount(0);
    } catch (err) {
      setPollErrorCount((c) => c + 1);
    } finally {
      if (isOpenRef.current && !paidRef.current) {
        const delay = pollErrorCount > 3 ? 8000 : 3000;
        pollTimeoutRef.current = setTimeout(pollPaymentStatus, delay);
      }
    }
  }, [orderId, triggerPaid, pollErrorCount]);

  useEffect(() => {
    if (!open || !orderId) return;
    pollTimeoutRef.current = setTimeout(pollPaymentStatus, 1500);
    return () => stopPolling();
  }, [open, orderId, pollPaymentStatus, stopPolling]);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setSecondsSinceOpen((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !paidRef.current && isOpenRef.current) {
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        pollPaymentStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [open, pollPaymentStatus]);

  const handleConfirmPaid = async () => {
    if (!orderId) return;
    setConfirmingPaid(true);
    try {
      await paymentAPI.markPaid(orderId);
      toast.success('Đã ghi nhận. Hệ thống sẽ xử lý đơn ngay khi nhận CK.');
    } catch (err) {
      toast.error(err.message || 'Không thể ghi nhận. Vui lòng thử lại.');
    } finally {
      setConfirmingPaid(false);
    }
  };

  const handleManualClose = () => {
    if (paid) {
      onOpenChange(false);
      return;
    }
    const ok = window.confirm(
      'Đơn hàng chưa được thanh toán. Nếu đóng bây giờ bạn có thể vào "Đơn hàng của tôi" để thanh toán lại sau. Tiếp tục đóng?'
    );
    if (ok) onOpenChange(false);
  };

  const selectedBank = banks.find((b) => b.id === selectedBankId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes qr-scan {
          0%   { transform: translateY(0); opacity: 0.9; }
          50%  { transform: translateY(220px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.9; }
        }
        @keyframes confetti-fall {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
          50%      { transform: translateY(40px) rotate(180deg); opacity: 1; }
        }
        .qr-scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #f59e0b, transparent);
          box-shadow: 0 0 8px 2px rgba(245, 158, 11, 0.5);
          animation: qr-scan 2.4s ease-in-out infinite;
        }
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 2px; }
      `}</style>

      <DialogContent
        className="max-w-[780px] w-[95vw] max-h-[94vh] overflow-y-auto p-0 gap-0 sm:rounded-2xl border-0"
        onPointerDownOutside={(e) => { if (!paid) e.preventDefault(); }}
        onEscapeKeyDown={(e) => {
          if (!paid) {
            e.preventDefault();
            handleManualClose();
          }
        }}
      >
        {paid ? (
          <SuccessState autoCloseMs={autoCloseMs} onClose={() => onOpenChange(false)} />
        ) : (
          <>
            {/* ─── Premium Header ─── */}
            <div className="relative overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.15),transparent_50%)]" />

              {/* Decorative dots */}
              <div className="absolute top-2 right-20 flex gap-1 opacity-30">
                <span className="w-1 h-1 rounded-full bg-white" />
                <span className="w-1 h-1 rounded-full bg-white" />
                <span className="w-1 h-1 rounded-full bg-white" />
              </div>

              <div className="relative flex items-center gap-3 p-5 text-white">
                {/* Brand icon */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-amber-600 animate-pulse" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-base font-bold text-white">
                      Thanh toán VietQR
                    </DialogTitle>
                    <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-[10px] font-semibold">
                      <Zap className="w-2.5 h-2.5" />
                      Tự động
                    </span>
                  </div>
                  <DialogDescription className="text-amber-100 text-xs mt-0.5">
                    Quét QR — hệ thống tự động xác nhận qua Sepay
                  </DialogDescription>
                </div>

                {/* Close */}
                <button
                  onClick={handleManualClose}
                  className="shrink-0 w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-colors"
                  aria-label="Đóng"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* ─── Body (2-column on desktop) ─── */}
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
                {/* ─── Left: QR + Bank selector ─── */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <QRBox
                      qrData={qrData}
                      loading={loadingQR}
                      banksError={banksError}
                    />
                  </div>

                  {loadingBanks ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-xs text-muted-foreground">Đang tải ngân hàng...</span>
                    </div>
                  ) : (
                    <BankSelector
                      banks={banks}
                      selectedBankId={selectedBankId}
                      onSelect={setSelectedBankId}
                    />
                  )}
                </div>

                {/* ─── Right: Info + actions ─── */}
                <div className="space-y-4">
                  {/* Auto-pay banner */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-amber-900">
                        Hoàn toàn tự động
                      </p>
                      <p className="text-[11px] text-amber-800/80 mt-0.5 leading-relaxed">
                        Chỉ cần quét QR & chuyển khoản. Cửa sổ sẽ tự đóng khi nhận được tiền — không cần thao tác thêm.
                      </p>
                    </div>
                  </div>

                  {/* Bank info */}
                  {qrData && selectedBank && (
                    <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-stone-50 to-amber-50/30 border-b border-stone-200">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-3.5 h-3.5 text-amber-700" />
                          <span className="text-xs font-bold text-stone-800">
                            Thông tin chuyển khoản
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {selectedBank.shortName}
                        </span>
                      </div>
                      <div className="px-4 py-1">
                        <InfoRow
                          icon={Building2}
                          label="Ngân hàng"
                          value={selectedBank.name}
                          accent
                        />
                        <InfoRow
                          icon={Hash}
                          label="Số tài khoản"
                          value={selectedBank.accountNumber}
                          copyable={selectedBank.accountNumber}
                          mono
                          accent
                        />
                        <InfoRow
                          icon={User}
                          label="Chủ tài khoản"
                          value={selectedBank.accountName}
                        />
                        <InfoRow
                          icon={Wallet}
                          label="Số tiền"
                          value={formatVND(qrData.amount ?? amount)}
                          accent
                        />
                        <InfoRow
                          icon={Lock}
                          label="Nội dung CK"
                          value={qrData.content}
                          copyable={qrData.content}
                          mono
                          accent
                        />
                      </div>
                    </div>
                  )}

                  {/* Poll status */}
                  <PollStatus
                    secondsSinceOpen={secondsSinceOpen}
                    pollCount={pollCount}
                    pollErrorCount={pollErrorCount}
                  />

                  {/* Manual confirm */}
                  <Button
                    variant="outline"
                    className="w-full h-11 border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50/50 text-amber-900 font-semibold"
                    onClick={handleConfirmPaid}
                    disabled={confirmingPaid}
                  >
                    {confirmingPaid ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang ghi nhận...</>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Tôi đã chuyển khoản xong
                      </>
                    )}
                  </Button>

                  {/* Tip */}
                  <div className="flex items-start gap-2 text-[11px] text-stone-500 leading-relaxed">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-stone-400" />
                    <p>
                      Số tiền & nội dung CK đã được điền sẵn trong QR — chỉ cần mở app ngân hàng và xác nhận. Đơn hàng tự động cập nhật trong vài giây.
                    </p>
                  </div>

                  {/* Security badge */}
                  <div className="flex items-center justify-center gap-2 pt-1 border-t border-stone-100">
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      <span>Mã hóa SSL</span>
                    </div>
                    <span className="text-stone-300">•</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                      <BadgeCheck className="w-3 h-3 text-emerald-600" />
                      <span>Xác nhận bởi Sepay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
