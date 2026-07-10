import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ChevronRight,
  CreditCard,
  MapPin,
  Star,
  Wallet,
  Building2,
} from 'lucide-react';
import { getPaymentInfo } from '@/lib/paymentInfo.js';

// Mapping trạng thái → label tiếng Việt + icon + màu
export const ORDER_STATUSES = {
  pending: { label: 'Chờ xác nhận', icon: Clock, color: 'yellow', step: 0 },
  processing: { label: 'Đang xử lý', icon: Package, color: 'blue', step: 1 },
  ready: { label: 'Chờ lấy hàng', icon: Package, color: 'indigo', step: 2 },
  shipping: { label: 'Đang giao', icon: Truck, color: 'sky', step: 3 },
  delivered: { label: 'Đã giao', icon: CheckCircle2, color: 'green', step: 4 },
  cancelled: { label: 'Đã hủy', icon: XCircle, color: 'red', step: -1 },
  returned: { label: 'Đã trả lại', icon: RotateCcw, color: 'gray', step: -2 },
  // Vietnamese variants stored in DB
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
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

const STEPS = [
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'processing', label: 'Xử lý' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
];

function getStatusInfo(status) {
  const key = (status || 'pending').toLowerCase();
  return ORDER_STATUSES[key] || ORDER_STATUSES.pending;
}

function parseShippingAddress(shippingAddress) {
  if (!shippingAddress) return null;
  if (typeof shippingAddress === 'object') return shippingAddress;
  try {
    return JSON.parse(shippingAddress);
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

export default function OrderCard({ order, expanded = false }) {
  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const shippingAddress = parseShippingAddress(order.shippingAddress);
  const items = parseItems(order.items);

  const totalQty = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0),
    [items]
  );

  const firstItem = items[0];
  const otherCount = Math.max(0, items.length - 1);

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">
            Đơn hàng #{String(order.id).slice(-8).toUpperCase()}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">
            {order.createdAt
              ? format(new Date(order.createdAt), 'HH:mm • dd/MM/yyyy', { locale: vi })
              : ''}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            COLOR_CLASSES[statusInfo.color] || COLOR_CLASSES.gray
          }`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {statusInfo.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex gap-4">
          {/* Item thumbnail */}
          {firstItem && (
            <div className="shrink-0">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 border">
                {firstItem.image || firstItem.images?.[0] ? (
                  <img
                    src={
                      (firstItem.image || firstItem.images?.[0] || '').startsWith('http')
                        ? firstItem.image || firstItem.images?.[0]
                        : `http://localhost:5000${firstItem.image || firstItem.images?.[0]}`
                    }
                    alt={firstItem.name}
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
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 line-clamp-2">
              {firstItem?.name || `Đơn hàng có ${totalQty} sản phẩm`}
            </p>
            {otherCount > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                + {otherCount} sản phẩm khác
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> {totalQty} sản phẩm
              </span>
              {shippingAddress && (
                <span className="inline-flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5" />
                  {shippingAddress.city || shippingAddress.district || shippingAddress.address || '—'}
                </span>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500">Tổng tiền</p>
            <p className="text-lg font-bold text-amber-600 tracking-tight">
              {formatVND(order.totalPrice)}
            </p>
            <PaymentMethodBadge method={order.paymentMethod} />
          </div>
        </div>

        {/* Progress timeline (only for active orders) */}
        {statusInfo.step >= 0 && statusInfo.color !== 'red' && statusInfo.color !== 'gray' && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              {STEPS.map((step, idx) => {
                const reached = statusInfo.step >= idx;
                const isCurrent = statusInfo.step === idx;
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          reached
                            ? isCurrent
                              ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                              : 'bg-amber-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {reached ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[10px] font-medium ${reached ? 'text-gray-700' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 -mt-5 transition-all ${
                          statusInfo.step > idx ? 'bg-amber-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled/returned message */}
        {(statusInfo.color === 'red' || statusInfo.color === 'gray') && (
          <div
            className={`mt-4 px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
              statusInfo.color === 'red' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <StatusIcon className="w-4 h-4" />
            Đơn hàng này đã {statusInfo.label.toLowerCase()}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between gap-2 flex-wrap">
          <PaymentInfo order={order} />
          <div className="flex items-center gap-2">
            {(statusInfo.color === 'green') && (
              <button className="px-3 py-1.5 text-xs font-medium border border-amber-300 text-amber-700 rounded-full hover:bg-amber-50 inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5" /> Đánh giá
              </button>
            )}
            {(statusInfo.color === 'yellow' || statusInfo.color === 'blue' || statusInfo.color === 'indigo') && (
              <button className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50">
                Hủy đơn
              </button>
            )}
            <Link
              to={`/account/orders`}
              className="px-3 py-1.5 text-xs font-semibold bg-black text-white rounded-full hover:bg-gray-800 inline-flex items-center gap-1"
            >
              Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== Helper components ==============

export function PaymentMethodBadge({ method }) {
  const info = getPaymentInfo(method);
  const isPaid = method && method !== 'cod';
  const Icon = method === 'momo' ? Wallet : method === 'bank' ? Building2 : CreditCard;
  return (
    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-[10px] font-medium text-gray-600">
      <Icon className="w-3 h-3" />
      {info.shortLabel}
      {isPaid && <span className="ml-1 text-green-600">• Chuyển khoản</span>}
    </div>
  );
}

function PaymentInfo({ order }) {
  const info = getPaymentInfo(order.paymentMethod);
  const isPaid = order.paymentStatus === 'paid';
  const showBankDetails = order.paymentMethod === 'bank' && !isPaid;

  return (
    <div className="text-xs text-gray-600 space-y-1 max-w-md">
      <div className="flex items-center gap-2">
        {order.paymentStatus === 'paid' ? (
          <span className="inline-flex items-center gap-1 text-green-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã thanh toán
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
            <Clock className="w-3.5 h-3.5" /> Chưa thanh toán
          </span>
        )}
        {order.trackingNumber && (
          <>
            <span>•</span>
            <span className="text-gray-500">VC: {order.trackingNumber}</span>
          </>
        )}
      </div>
      {showBankDetails && (
        <div className="bg-amber-50 border border-amber-200 rounded p-2 text-[11px] space-y-0.5">
          <p className="font-medium text-amber-800">
            Vui lòng chuyển khoản theo thông tin sau với nội dung: DH#{order.id}
          </p>
          <p><span className="text-gray-600">Ngân hàng:</span> <span className="font-medium">Vietcombank</span></p>
          <p><span className="text-gray-600">STK:</span> <span className="font-mono font-semibold">1234 5678 9012</span></p>
          <p><span className="text-gray-600">Chủ TK:</span> CONG TY TNHH LUXE JEWELRY</p>
        </div>
      )}
      {order.paymentMethod === 'momo' && !isPaid && (
        <div className="bg-pink-50 border border-pink-200 rounded p-2 text-[11px] space-y-0.5">
          <p className="font-medium text-pink-800">Thanh toán qua MoMo</p>
          <p><span className="text-gray-600">SĐT:</span> <span className="font-mono font-semibold">0865 577 745</span></p>
          <p><span className="text-gray-600">Tên:</span> LUXE JEWELRY</p>
        </div>
      )}
    </div>
  );
}