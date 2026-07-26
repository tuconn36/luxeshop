import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, History, X, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { resolveAssetUrl } from '@/lib/api';
import { toast } from 'sonner';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop';

const safeImage = (img) => {
  const url = resolveAssetUrl(img);
  return url || PLACEHOLDER_IMAGE;
};

/**
 * Format "viewed ago" cho UI: "vừa xem", "5 phút trước", "2 giờ trước", "3 ngày trước"
 */
function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Vừa xem';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return 'Lâu rồi';
}

/**
 * RecentlyViewedCarousel — hiển thị danh sách sản phẩm đã xem gần đây.
 *
 * Props:
 * - excludeId: id sp hiện tại (PDP) — không hiện chính nó
 * - title: tiêu đề (mặc định "Đã xem gần đây")
 * - max: số sp tối đa hiển thị
 * - className: class bổ sung
 */
export default function RecentlyViewedCarousel({
  excludeId,
  title = 'Đã xem gần đây',
  max = 12,
  className = '',
}) {
  const { items, removeItem, clearAll } = useRecentlyViewed();
  const { currentUser } = useAuth();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Lọc và sắp xếp
  const filtered = items
    .filter((it) => it.id !== excludeId)
    .slice(0, max);

  // Check scroll position
  useEffect(() => {
    const check = () => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    check();
    const el = scrollRef.current;
    el?.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      el?.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [filtered.length]);

  if (filtered.length === 0) return null;

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.85;
    scrollRef.current.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  const handleRemove = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    removeItem(id);
    toast.success('Đã xóa khỏi lịch sử');
  };

  const handleClearAll = () => {
    if (window.confirm('Xóa toàn bộ lịch sử xem?')) {
      clearAll();
      toast.success('Đã xóa lịch sử xem');
    }
  };

  return (
    <section className={`py-10 md:py-14 bg-gradient-to-b from-amber-50/40 via-white to-rose-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-amber-950/10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                {title}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {filtered.length} sản phẩm {currentUser ? '' : '(chế độ khách)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="hidden sm:inline-flex text-xs text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 transition-colors px-2 py-1"
              title="Xóa tất cả"
            >
              Xóa tất cả
            </button>
            <button
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Cuộn trái"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Cuộn phải"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <AnimatePresence>
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="snap-start shrink-0 w-44 sm:w-48"
              >
                <Link
                  to={`/product/${item.id}`}
                  className="group block relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl transition-all duration-300"
                >
                  {/* Remove button */}
                  <button
                    onClick={(e) => handleRemove(e, item.id)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-red-500 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Xóa"
                    title="Xóa khỏi lịch sử"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-amber-50 to-rose-50 dark:from-neutral-800 dark:to-neutral-900 overflow-hidden">
                    <img
                      src={safeImage(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-xs text-neutral-900 dark:text-white font-medium line-clamp-2 leading-snug min-h-[2.4em] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                        {Number(item.price || 0).toLocaleString('vi-VN')}₫
                      </p>
                      {item.viewCount > 1 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-neutral-500 dark:text-neutral-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                          <TrendingUp className="w-2.5 h-2.5" />
                          x{item.viewCount}
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(item.viewedAt)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
