import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Bell, BellRing, Flame, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * CountdownTimer component.
 *
 * Props:
 * - targetTime: ISO string hoặc Date — thời điểm kết thúc
 * - onComplete: callback khi countdown về 0
 * - title: tiêu đề (mặc định "Flash Sale kết thúc sau")
 * - variant: 'default' | 'compact' | 'inline' | 'banner'
 * - showNotify: hiện nút "Báo cho tôi" khi sắp hết
 * - className: class bổ sung
 */
export default function CountdownTimer({
  targetTime,
  onComplete,
  title = 'Flash Sale kết thúc sau',
  variant = 'default',
  showNotify = true,
  className = '',
}) {
  const targetRef = useRef(null);
  if (!targetRef.current) {
    const t = typeof targetTime === 'string' ? new Date(targetTime) : targetTime;
    targetRef.current = t instanceof Date && !isNaN(t.getTime()) ? t.getTime() : null;
  }

  const target = targetRef.current;
  const [remaining, setRemaining] = useState(() => (target ? Math.max(0, target - Date.now()) : 0));
  const [notified, setNotified] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const left = Math.max(0, target - Date.now());
      setRemaining(left);
      if (left <= 0 && !completed) {
        setCompleted(true);
        onComplete?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, completed, onComplete]);

  // Gửi notification khi còn 5 phút (chỉ 1 lần)
  useEffect(() => {
    if (notified || completed) return;
    const FIVE_MIN = 5 * 60 * 1000;
    if (remaining > 0 && remaining <= FIVE_MIN) {
      setNotified(true);
    }
  }, [remaining, notified, completed]);

  if (!target) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  const isUrgent = remaining > 0 && remaining <= 5 * 60 * 1000;
  const isEnded = remaining <= 0;

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold shadow-md ${isUrgent ? 'animate-pulse' : ''} ${className}`}>
        <Zap className="w-3 h-3 fill-current" />
        {isEnded ? 'Đã kết thúc' : timeStr}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-bold ${isUrgent ? 'text-red-600 animate-pulse' : 'text-amber-700'} ${className}`}>
        <Clock className="w-3.5 h-3.5" />
        {isEnded ? 'Đã kết thúc' : timeStr}
      </span>
    );
  }

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${
          isEnded
            ? 'from-neutral-700 to-neutral-800'
            : isUrgent
              ? 'from-red-600 to-orange-600 animate-pulse'
              : 'from-amber-500 via-orange-500 to-rose-500'
        } text-white p-4 md:p-5 shadow-xl ${className}`}
      >
        {/* Animated particles */}
        {!isEnded && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -right-1/4 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
            <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 rounded-full bg-yellow-300/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        )}

        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              {isEnded ? <X className="w-6 h-6" /> : <Flame className="w-6 h-6 animate-pulse" />}
            </div>
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase opacity-80 font-bold">
                {isEnded ? 'Đã kết thúc' : 'Siêu sale giờ vàng'}
              </p>
              <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight">
                {title}
              </h3>
            </div>
          </div>

          {!isEnded && (
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 sm:gap-2">
                {days > 0 && <TimeBlock value={days} label="ngày" />}
                <TimeBlock value={hours} label="giờ" highlight={isUrgent} />
                <TimeBlock value={minutes} label="phút" highlight={isUrgent} />
                <TimeBlock value={seconds} label="giây" highlight={isUrgent} />
              </div>

              {showNotify && isUrgent && !notified && (
                <Button
                  onClick={() => {
                    setNotified(true);
                    toast.success('Sẽ báo trước 1 phút khi sale kết thúc!');
                  }}
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0 hidden sm:inline-flex"
                >
                  <Bell className="w-3.5 h-3.5 mr-1" />
                  Báo tôi
                </Button>
              )}
              {notified && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                  <BellRing className="w-3 h-3" />
                  Đã đăng ký
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // default
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-900/50 ${className}`}>
      <Clock className={`w-4 h-4 text-red-500 ${isUrgent ? 'animate-pulse' : ''}`} />
      <span className="text-xs text-red-700 dark:text-red-300 font-medium">
        {title}:
      </span>
      <span className={`font-mono font-bold text-sm ${isUrgent ? 'text-red-600 animate-pulse' : 'text-amber-700 dark:text-amber-400'}`}>
        {isEnded ? 'Hết giờ' : timeStr}
      </span>
    </div>
  );
}

function TimeBlock({ value, label, highlight = false }) {
  return (
    <div className={`flex flex-col items-center justify-center min-w-[44px] sm:min-w-[56px] h-12 sm:h-14 rounded-xl backdrop-blur-md ${
      highlight ? 'bg-white/30 animate-pulse' : 'bg-white/20'
    } ring-1 ring-white/30`}>
      <span className="text-lg sm:text-2xl font-bold font-mono leading-none tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider opacity-80 mt-0.5">
        {label}
      </span>
    </div>
  );
}
