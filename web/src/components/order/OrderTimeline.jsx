import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, Package, Truck, CheckCircle, XCircle,
  RotateCcw, MapPin, CreditCard, Calendar, ChevronRight, Loader2,
  Phone, MessageCircle, Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ordersAPI } from '@/lib/api';
import { toast } from 'sonner';

const STEPS = [
  { key: 'pending', label: 'Chờ thanh toán', icon: CreditCard, description: 'Đơn hàng đã tạo, đang chờ thanh toán' },
  { key: 'processing', label: 'Đang xử lý', icon: Package, description: 'Đơn hàng đã được xác nhận, đang chuẩn bị' },
  { key: 'shipping', label: 'Đang giao', icon: Truck, description: 'Đơn hàng đang trên đường giao đến bạn' },
  { key: 'delivered', label: 'Đã giao', icon: CheckCircle, description: 'Giao hàng thành công' },
];

const CANCELLED_KEY = 'cancelled';
const RETURNED_KEY = 'returned';

const TERMINAL_STATUSES = [CANCELLED_KEY, RETURNED_KEY];

/**
 * Tính index của step hiện tại.
 */
function getStepIndex(status) {
  if (!status) return 0;
  const s = status.toLowerCase();
  const idx = STEPS.findIndex((st) => st.key === s);
  return idx >= 0 ? idx : 0;
}

function formatDate(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * OrderTimeline component.
 *
 * Props:
 * - order: object đơn hàng (status, created_at, items, ...)
 * - onCancel: callback khi user bấm "Hủy đơn"
 * - onReorder: callback khi user bấm "Mua lại"
 * - onTrack: callback khi user bấm "Theo dõi vận đơn"
 * - pollInterval: ms tự động refresh (mặc định 0 = tắt)
 */
export default function OrderTimeline({
  order,
  onCancel,
  onReorder,
  onTrack,
  pollInterval = 0,
}) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [loading, setLoading] = useState(false);
  const [autoRefreshed, setAutoRefreshed] = useState(false);
  const prevStatusRef = useRef(currentOrder?.status);

  // Auto refresh
  useEffect(() => {
    if (!pollInterval || !currentOrder?.id) return;
    const id = setInterval(async () => {
      try {
        setLoading(true);
        const fresh = await ordersAPI.getById(currentOrder.id);
        setCurrentOrder(fresh);
        if (fresh.status !== prevStatusRef.current) {
          setAutoRefreshed(true);
          prevStatusRef.current = fresh.status;
          toast.success('Đơn hàng đã được cập nhật');
          setTimeout(() => setAutoRefreshed(false), 3000);
        }
      } catch {
        /* ignore poll errors */
      } finally {
        setLoading(false);
      }
    }, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval, currentOrder?.id]);

  if (!currentOrder) return null;

  const status = (currentOrder.status || 'pending').toLowerCase();
  const currentStepIdx = getStepIndex(status);
  const isCancelled = status === CANCELLED_KEY;
  const isReturned = status === RETURNED_KEY;
  const isTerminal = isCancelled || isReturned;

  // Tính % progress
  const progressPct = isTerminal ? 0 : ((currentStepIdx) / (STEPS.length - 1)) * 100;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {/* Auto-refresh banner */}
      <AnimatePresence>
        {autoRefreshed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium px-4 py-1.5 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đơn hàng vừa được cập nhật
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-5 md:p-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-4 h-4 text-neutral-400" />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Mã đơn: <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                  #{currentOrder.id?.slice(-8).toUpperCase()}
                </span>
              </p>
              {loading && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
            </div>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              {isCancelled ? 'Đơn hàng đã hủy' : isReturned ? 'Đã trả hàng' : 'Theo dõi đơn hàng'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              Đặt ngày {formatDate(currentOrder.created_at || currentOrder.createdAt)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {(status === 'shipping') && (
              <Button
                onClick={onTrack}
                size="sm"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                Theo dõi vận đơn
              </Button>
            )}
            {status === 'pending' && onCancel && (
              <Button onClick={onCancel} size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                Hủy đơn
              </Button>
            )}
            {(isTerminal) && onReorder && (
              <Button onClick={onReorder} size="sm" variant="outline">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Mua lại
              </Button>
            )}
            <Button onClick={() => window.open('tel:19001234')} size="sm" variant="ghost">
              <Phone className="w-3.5 h-3.5 mr-1.5" />
              Hỗ trợ
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-5 md:p-6">
        {isCancelled ? (
          <CancelledTimeline order={currentOrder} />
        ) : isReturned ? (
          <ReturnedTimeline order={currentOrder} />
        ) : (
          <div className="relative">
            {/* Progress bar background */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full hidden sm:block">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-3 relative">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const isFuture = idx > currentStepIdx;

                return (
                  <div key={step.key} className="relative flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2">
                    {/* Icon circle */}
                    <div className="relative shrink-0">
                      <motion.div
                        initial={false}
                        animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                        transition={isCurrent ? { duration: 2, repeat: Infinity } : {}}
                        className={`relative w-12 h-12 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-neutral-900 transition-all ${
                          isCompleted
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                            : isCurrent
                              ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/40'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        {isCurrent && (
                          <span className="absolute inset-0 rounded-full ring-2 ring-amber-400 animate-ping opacity-75" />
                        )}
                      </motion.div>
                    </div>

                    {/* Label + description */}
                    <div className="flex-1 sm:flex-none sm:text-center sm:max-w-[140px]">
                      <p className={`text-sm font-semibold ${
                        isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isCurrent
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-neutral-500 dark:text-neutral-400'
                      }`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2 sm:line-clamp-3">
                        {step.description}
                      </p>
                      {(isCompleted || isCurrent) && (
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                          {isCompleted && currentOrder[`${step.key}_at`]
                            ? formatDate(currentOrder[`${step.key}_at`])
                            : isCurrent
                              ? 'Đang cập nhật...'
                              : ''}
                        </p>
                      )}
                    </div>

                    {/* Mobile connector line */}
                    {idx < STEPS.length - 1 && (
                      <div className={`absolute left-6 top-12 w-0.5 h-6 sm:hidden ${
                        idx < currentStepIdx ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-800'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Estimate delivery */}
        {!isTerminal && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                  {status === 'pending' && '⏳ Chờ xác nhận thanh toán'}
                  {status === 'processing' && '📦 Dự kiến giao: 2-3 ngày tới'}
                  {status === 'shipping' && (currentOrder.estimatedDelivery || '🚚 Đang trên đường giao')}
                  {status === 'delivered' && '✅ Đã giao thành công'}
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                  {currentOrder.shippingAddress?.fullName && `Giao đến: ${currentOrder.shippingAddress.fullName}`}
                  {currentOrder.shippingAddress?.phone && ` • ${currentOrder.shippingAddress.phone}`}
                </p>
              </div>
              {onTrack && (
                <Button
                  onClick={onTrack}
                  variant="ghost"
                  size="sm"
                  className="text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/10"
                >
                  Chi tiết
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CancelledTimeline({ order }) {
  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-3">
        <XCircle className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">Đơn hàng đã bị hủy</h3>
      {order.cancelled_at && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Hủy lúc {formatDate(order.cancelled_at)}
        </p>
      )}
      {order.cancel_reason && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto">
          Lý do: {order.cancel_reason}
        </p>
      )}
    </div>
  );
}

function ReturnedTimeline({ order }) {
  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-3">
        <RotateCcw className="w-10 h-10 text-amber-500" />
      </div>
      <h3 className="font-semibold text-lg text-amber-600 dark:text-amber-400">Đã trả hàng</h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
        Hoàn tiền sẽ được xử lý trong 3-5 ngày làm việc
      </p>
    </div>
  );
}
