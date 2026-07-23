import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ChevronLeft,
  CreditCard,
  MapPin,
  Star,
  Wallet,
  Building2,
  QrCode,
  Loader2,
  AlertCircle,
  Calendar,
  Hash,
  Phone,
  User as UserIcon,
  FileText,
} from 'lucide-react';
import { ordersAPI, paymentAPI } from '@/lib/api.js';
import { getPaymentInfo } from '@/lib/paymentInfo.js';
import { Button } from '@/components/ui/button';
import VietQRModal from '@/components/shop/VietQRModal.jsx';

const ORDER_STATUSES = {
  pending: { label: 'Chờ xác nhận', icon: Clock, color: 'yellow', step: 0 },
  pending_payment: { label: 'Chờ thanh toán', icon: Clock, color: 'amber', step: 0 },
  processing: { label: 'Đang xử lý', icon: Package, color: 'blue', step: 1 },
  ready: { label: 'Chờ lấy hàng', icon: Package, color: 'indigo', step: 2 },
  shipping: { label: 'Đang giao', icon: Truck, color: 'sky', step: 3 },
  delivered: { label: 'Đã giao', icon: CheckCircle2, color: 'green', step: 4 },
  cancelled: { label: 'Đã hủy', icon: XCircle, color: 'red', step: -1 },
  returned: { label: 'Đã trả lại', icon: RotateCcw, color: 'gray', step: -2 },
  'chờ xác nhận': { label: 'Chờ xác nhận', icon: Clock, color: 'yellow', step: 0 },
  'đang xử lý': { label: 'Đang xử lý', icon: Package, color: 'blue', step: 1 },
  'chờ lấy hàng': { label: 'Chờ lấy hàng', icon: Package, color: 'indigo', step: 2 },
  'đang giao': { label: 'Đang giao', icon: Truck, color: 'sky', step: 3 },
  'đã giao': { label: 'Đã giao', icon: CheckCircle2, color: 'green', step: 4 },
  'đã hủy': { label: 'Đã hủy', icon: XCircle, color: 'red', step: -1 },
  'đã trả lại': { label: 'Đã trả lại', icon: RotateCcw, color: 'gray', step: -2 },
};

const COLOR_CLASSES = {
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

const STEPS = [
  { key: 'pending', label: 'Chờ xác nhận', desc: 'Đơn đã được tiếp nhận' },
  { key: 'processing', label: 'Đang xử lý', desc: 'Đang chuẩn bị hàng' },
  { key: 'shipping', label: 'Đang giao', desc: 'Đơn đang trên đường giao' },
  { key: 'delivered', label: 'Đã giao', desc: 'Giao thành công' },
];

function getStatusInfo(status) {
  const key = (status || 'pending').toLowerCase();
  return ORDER_STATUSES[key] || ORDER_STATUSES.pending;
}

function parseShippingAddress(addr) {
  if (!addr) return null;
  if (typeof addr === 'object') return addr;
  try {
    return JSON.parse(addr);
  } catch {
    return null;
  }
}

function parseItems(items) {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  try {
    return JSON.parse(items);
  } catch {
    return [];
  }
}

function formatVND(n) {
  return Number(n || 0).toLocaleString('vi-VN') + '₫';
}

function PaymentMethodBadge({ method }) {
  const info = getPaymentInfo(method);
  const isPaid = method && method !== 'cod';
  const Icon = method === 'momo' ? Wallet : method === 'bank' ? Building2 : CreditCard;
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700">
      <Icon className="w-3.5 h-3.5" />
      {info.shortLabel}
      {isPaid && <span className="text-green-600 ml-1">• Chuyển khoản</span>}
    </div>
  );
}

function StatusTimeline({ step }) {
  const isCancelled = step === -1 || step === -2;
  return (
    <div className="py-4">
      <div className="flex items-start">
        {STEPS.map((s, idx) => {
          const reached = step >= idx;
          const isCurrent = step === idx;
          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    reached
                      ? isCurrent
                        ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                        : 'bg-amber-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {reached ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    reached ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
                <span
                  className={`text-[10px] leading-tight hidden md:block ${
                    reached ? 'text-gray-500' : 'text-gray-300'
                  } max-w-[110px] text-center`}
                >
                  {s.desc}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mt-[18px] mx-1">
                  <div
                    className={`h-0.5 rounded ${
                      step > idx ? 'bg-amber-500' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {isCancelled && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-100">
          <XCircle className="w-4 h-4" />
          Đơn hàng này đã bị hủy.
        </div>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchOrder = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await ordersAPI.getById(id);
        if (!cancelled) setOrder(data);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch order:', err);
          setError(err.message || 'Không thể tải thông tin đơn hàng');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Polling: nếu đơn đang chờ QR, tự refresh mỗi 10s để cập nhật khi Sepay xác nhận.
  useEffect(() => {
    if (!order || order.paymentMethod !== 'vietqr') return;
    if (order.paymentStatus === 'paid') return;
    if (order.status === 'cancelled' || order.status === 'returned') return;

    const interval = setInterval(async () => {
      try {
        const fresh = await ordersAPI.getById(id);
        setOrder(fresh);
        if (fresh.paymentStatus === 'paid') {
          toast.success('Thanh toán QR đã được xác nhận!');
        }
      } catch { /* ignore */ }
    }, 10000);
    return () => clearInterval(interval);
  }, [id, order?.paymentMethod, order?.paymentStatus, order?.status]);

  const statusInfo = order ? getStatusInfo(order.status) : null;
  const shippingAddress = order ? parseShippingAddress(order.shippingAddress) : null;
  const items = order ? parseItems(order.items) : [];

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 1), 0),
    [items]
  );
  const shippingFee = Math.max(0, Number(order?.totalPrice || 0) - subtotal);
  const canCancel = statusInfo && ['yellow', 'amber', 'blue', 'indigo'].includes(statusInfo.color);

  const handleCancel = async () => {
    if (!order || canceling) return;
    const confirmed = window.confirm(
      `Bạn có chắc muốn hủy đơn #${String(order.id).slice(-8).toUpperCase()}? Hành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    setCanceling(true);
    try {
      await ordersAPI.cancel(order.id);
      setOrder((prev) => (prev ? { ...prev, status: 'cancelled' } : prev));
      toast.success('Đã hủy đơn hàng thành công');
    } catch (err) {
      toast.error(err.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <button
          onClick={() => navigate('/account/orders')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Quay lại danh sách đơn
        </button>
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 px-4 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            {error || 'Đơn hàng không tồn tại hoặc đã bị xóa.'}
          </p>
          <Link to="/account/orders">
            <Button className="rounded-full">Xem đơn hàng của tôi</Button>
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = statusInfo.icon;
  const isPaid = order.paymentStatus === 'paid';

  return (
    <>
      <Helmet>
        <title>Đơn hàng #{String(order.id).slice(-8).toUpperCase()} - LUXE</title>
      </Helmet>

      <button
        onClick={() => navigate('/account/orders')}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Quay lại danh sách đơn
      </button>

      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest">
            Chi tiết đơn hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1 inline-flex items-center gap-2 flex-wrap">
            <Hash className="w-3.5 h-3.5" /> #{String(order.id).slice(-8).toUpperCase()}
            <span>•</span>
            <Calendar className="w-3.5 h-3.5" />
            {order.createdAt
              ? format(new Date(order.createdAt), "HH:mm • dd/MM/yyyy", { locale: vi })
              : '—'}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
            COLOR_CLASSES[statusInfo.color] || COLOR_CLASSES.gray
          }`}
        >
          <StatusIcon className="w-4 h-4" />
          {statusInfo.label}
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 mb-5">
        <StatusTimeline step={statusInfo.step} />
      </div>

      {/* QR payment banner */}
      {order.paymentMethod === 'vietqr' && order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900 text-sm">
              Đơn hàng chờ thanh toán QR
            </p>
            <p className="text-xs text-amber-800 mt-0.5">
              Đơn sẽ tự động được xử lý sau khi hệ thống ghi nhận chuyển khoản thành công.
              Trang này sẽ tự cập nhật.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-800 hover:bg-amber-100 shrink-0"
            onClick={() => setQrOpen(true)}
          >
            <QrCode className="w-4 h-4 mr-1.5" />
            Xem QR
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-700">
                Sản phẩm ({items.length})
              </h2>
              <span className="text-xs text-gray-500">
                {items.reduce((s, it) => s + Number(it.quantity || 1), 0)} sản phẩm
              </span>
            </div>
            <ul className="divide-y divide-gray-100">
              {items.map((item, idx) => {
                const img = item.image || item.images?.[0] || '';
                const itemId = item.productId || item.id || idx;
                const productLink = item.productId || item.id ? `/product/${item.productId || item.id}` : '#';
                return (
                  <li key={itemId} className="flex gap-4 p-4">
                    <Link to={productLink} className="shrink-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 border">
                        {img ? (
                          <img
                            src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-7 h-7 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={productLink}
                        className="font-medium text-sm text-gray-900 hover:text-amber-600 line-clamp-2"
                      >
                        {item.name || 'Sản phẩm'}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-gray-500 mt-1">
                          Phân loại: <span className="text-gray-700">{item.variant}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Số lượng: <span className="text-gray-700">{item.quantity || 1}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-sm text-amber-600">
                        {formatVND(Number(item.price || 0) * Number(item.quantity || 1))}
                      </p>
                      {Number(item.quantity || 1) > 1 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatVND(item.price)} / sp
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-700 mb-3">
              Thanh toán
            </h2>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Phương thức</span>
              <PaymentMethodBadge method={order.paymentMethod} />
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Trạng thái</span>
              <span
                className={`inline-flex items-center gap-1 text-sm font-medium ${
                  isPaid ? 'text-green-600' : 'text-amber-700'
                }`}
              >
                {isPaid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Đã thanh toán
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" /> Chưa thanh toán
                  </>
                )}
              </span>
            </div>
            {order.trackingNumber && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Mã vận chuyển</span>
                <span className="font-mono text-sm text-gray-900">{order.trackingNumber}</span>
              </div>
            )}

            <div className="border-t border-gray-100 mt-3 pt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tạm tính</span>
                <span className="text-gray-900">{formatVND(subtotal)}</span>
              </div>
              {shippingFee > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="text-gray-900">{formatVND(shippingFee)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-900">Tổng cộng</span>
                <span className="text-lg font-bold text-amber-600">
                  {formatVND(order.totalPrice)}
                </span>
              </div>
            </div>
          </section>

          {order.notes && (
            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-amber-800 mb-2 inline-flex items-center gap-2">
                <FileText className="w-4 h-4" /> Ghi chú đơn hàng
              </h2>
              <p className="text-sm text-amber-900 whitespace-pre-wrap">{order.notes}</p>
            </section>
          )}
        </div>

        <div className="space-y-5">
          <section className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-700 mb-3 inline-flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Địa chỉ nhận hàng
            </h2>
            {shippingAddress ? (
              <div className="space-y-1.5 text-sm">
                {shippingAddress.fullName && (
                  <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                    {shippingAddress.fullName}
                  </p>
                )}
                {shippingAddress.phone && (
                  <p className="text-gray-600 inline-flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {shippingAddress.phone}
                  </p>
                )}
                <p className="text-gray-600 mt-2 leading-relaxed">
                  {[
                    shippingAddress.address,
                    shippingAddress.ward,
                    shippingAddress.district,
                    shippingAddress.city,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Chưa có thông tin</p>
            )}
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-700 mb-3">
              Thông tin đơn
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Mã đơn</dt>
                <dd className="font-mono text-gray-900">#{String(order.id).slice(-8).toUpperCase()}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Ngày đặt</dt>
                <dd className="text-gray-900">
                  {order.createdAt
                    ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })
                    : '—'}
                </dd>
              </div>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500">Cập nhật</dt>
                  <dd className="text-gray-900">
                    {format(new Date(order.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Trạng thái</dt>
                <dd className="font-medium text-gray-900">{statusInfo.label}</dd>
              </div>
            </dl>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2">
            {canCancel && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={canceling}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                {canceling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang hủy...
                  </>
                ) : (
                  <>Hủy đơn hàng</>
                )}
              </Button>
            )}
            {statusInfo.color === 'green' && (
              <Link to="/account/orders">
                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Star className="w-4 h-4 mr-2" /> Đánh giá sản phẩm
                </Button>
              </Link>
            )}
            <Link to="/products">
              <Button className="w-full">Tiếp tục mua sắm</Button>
            </Link>
          </section>
        </div>
      </div>

      <VietQRModal
        open={qrOpen}
        onOpenChange={setQrOpen}
        orderId={order.id}
        amount={order.totalPrice}
        onPaid={() => {
          // Reload đơn sau khi phát hiện đã thanh toán (modal polling)
          ordersAPI.getById(order.id).then(setOrder).catch(() => {});
        }}
      />
    </>
  );
}