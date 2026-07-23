import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { paymentAPI, ordersAPI } from '@/lib/api.js';
import { QrCode, Copy, Check, Loader2, Building2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

function CopyButton({ value, label = 'Sao chép' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Đã sao chép');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép');
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Đã sao chép' : label}
    </button>
  );
}

function formatVND(n) {
  return Number(n || 0).toLocaleString('vi-VN') + '₫';
}

/**
 * Modal hiển thị QR thanh toán VietQR.
 *
 * Props:
 *  - open: bool
 *  - onOpenChange: (open) => void
 *  - orderId: number | string
 *  - amount: number  — fallback nếu QR API chưa trả amount
 *  - onPaid: () => void  — gọi khi phát hiện đã thanh toán (qua polling)
 */
export default function VietQRModal({ open, onOpenChange, orderId, amount, onPaid }) {
  const [banks, setBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [loadingQR, setLoadingQR] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [confirmingPaid, setConfirmingPaid] = useState(false);
  const [banksError, setBanksError] = useState('');
  const [paid, setPaid] = useState(false);
  const [pollInterval, setPollInterval] = useState(null);

  // Load danh sách ngân hàng
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

  // Khi đã chọn bank → load QR
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
          toast.error(err.message || 'Không thể tạo mã QR');
          setQrData(null);
        }
      } finally {
        if (!cancelled) setLoadingQR(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [open, orderId, selectedBankId]);

  // Polling payment status mỗi 8s — dùng ordersAPI thay vì gọi fetch cứng port 5000
  useEffect(() => {
    if (!open || !orderId || paid) return;
    const id = setInterval(async () => {
      try {
        const data = await ordersAPI.getById(orderId);
        const status = (data.paymentStatus || data.payment_status || '').toLowerCase();
        if (status === 'paid') {
          setPaid(true);
          toast.success('Thanh toán thành công!');
          if (onPaid) onPaid();
        }
      } catch { /* ignore polling errors */ }
    }, 8000);
    setPollInterval(id);
    return () => clearInterval(id);
  }, [open, orderId, paid, onPaid]);

  // Cleanup interval when modal closes
  useEffect(() => {
    if (!open && pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  }, [open, pollInterval]);

  // Reset state when reopening
  useEffect(() => {
    if (open) {
      setQrData(null);
      setPaid(false);
    }
  }, [open]);

  const handleConfirmPaid = async () => {
    if (!orderId) return;
    setConfirmingPaid(true);
    try {
      await paymentAPI.markPaid(orderId);
      toast.success('Đã ghi nhận. Hệ thống sẽ xử lý đơn trong ít phút.');
    } catch (err) {
      toast.error(err.message || 'Không thể ghi nhận. Vui lòng thử lại.');
    } finally {
      setConfirmingPaid(false);
    }
  };

  const selectedBank = banks.find((b) => b.id === selectedBankId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <QrCode className="w-5 h-5 text-primary" />
            Thanh toán qua VietQR
          </DialogTitle>
          <DialogDescription>
            Quét mã QR bằng app ngân hàng để hoàn tất thanh toán đơn hàng.
          </DialogDescription>
        </DialogHeader>

        {paid ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <h3 className="font-bold text-lg text-green-700">Thanh toán thành công!</h3>
            <p className="text-sm text-muted-foreground">
              Đơn hàng đã được ghi nhận. Bạn có thể đóng cửa sổ này.
            </p>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bank selector */}
            {loadingBanks ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Đang tải ngân hàng...</span>
              </div>
            ) : banksError ? (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{banksError}</p>
              </div>
            ) : banks.length === 0 ? (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">
                  Hiện chưa có ngân hàng nào được cấu hình. Vui lòng liên hệ LUXE để được hỗ trợ.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Chọn ngân hàng
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {banks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBankId(b.id)}
                        className={`flex flex-col items-center gap-1 p-2 border rounded-lg transition-all ${
                          selectedBankId === b.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-muted/50'
                        }`}
                      >
                        <Building2 className="w-5 h-5 text-primary" />
                        <span className="text-xs font-medium">{b.shortName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* QR image */}
                <div className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-white border rounded-xl">
                  {loadingQR ? (
                    <div className="w-[220px] h-[220px] flex items-center justify-center bg-gray-100 rounded-lg">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : qrData ? (
                    <>
                      <img
                        src={qrData.qrUrl}
                        alt="VietQR"
                        className="w-[220px] h-[220px] rounded-lg bg-white"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Mở app ngân hàng → Quét QR → Xác nhận
                      </p>
                    </>
                  ) : (
                    <div className="w-[220px] h-[220px] flex items-center justify-center bg-gray-100 rounded-lg text-xs text-muted-foreground text-center p-3">
                      Không thể tạo mã QR
                    </div>
                  )}
                </div>

                {/* Bank info */}
                {qrData && selectedBank && (
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Ngân hàng:</span>
                      <span className="font-semibold text-right">{selectedBank.name}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Số tài khoản:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold">{selectedBank.accountNumber}</span>
                        <CopyButton value={selectedBank.accountNumber} label="STK" />
                      </div>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Chủ tài khoản:</span>
                      <span className="font-medium text-right">{selectedBank.accountName}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Số tiền:</span>
                      <span className="font-bold text-primary text-sm">
                        {formatVND(qrData.amount ?? amount)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 pt-1.5 border-t">
                      <span className="text-muted-foreground">Nội dung CK:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-700">{qrData.content}</span>
                        <CopyButton value={qrData.content} label="Nội dung" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Polling indicator */}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3 animate-pulse" />
                  Đang tự động kiểm tra thanh toán...
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleConfirmPaid}
                  disabled={confirmingPaid}
                >
                  {confirmingPaid ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang ghi nhận...</>
                  ) : (
                    'Tôi đã chuyển khoản xong'
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}