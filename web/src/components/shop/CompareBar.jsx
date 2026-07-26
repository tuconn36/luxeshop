import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, BarChart2, Scale, Trash2, Sparkles } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext.jsx';
import { resolveAssetUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&h=100&fit=crop';

const safeImage = (img) => {
  const url = resolveAssetUrl(img);
  return url || PLACEHOLDER;
};

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const [pulsing, setPulsing] = useState(false);

  // Khi vừa thêm sp mới → pulse bar 1 lần để thu hút
  useEffect(() => {
    if (compareList.length > 0) {
      setPulsing(true);
      const t = setTimeout(() => setPulsing(false), 1200);
      return () => clearTimeout(t);
    }
  }, [compareList.length]);

  if (compareList.length === 0) return null;

  const slotsLeft = 3 - compareList.length;
  const canCompare = compareList.length >= 2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgb(0,0,0,0.4)] pb-[env(safe-area-inset-bottom)]"
        role="region"
        aria-label="Thanh so sánh sản phẩm"
      >
        {/* Pulse highlight khi vừa thêm sp */}
        {pulsing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
          />
        )}

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center gap-2 sm:gap-4">
          {/* Icon + counter */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
                <Scale className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              {compareList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-neutral-950">
                  {compareList.length}
                </span>
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                So sánh sản phẩm
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                Tối đa 3 sản phẩm
              </p>
            </div>
          </div>

          {/* Mobile label */}
          <div className="sm:hidden text-xs font-semibold text-neutral-700 dark:text-neutral-300 shrink-0">
            So sánh ({compareList.length}/3)
          </div>

          {/* Product list */}
          <div className="flex flex-1 gap-2 sm:gap-3 overflow-x-auto py-1 -mx-1 px-1">
            {compareList.map((p) => {
              const imgUrl = safeImage(p.images?.[0]);
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group flex items-center gap-2 border border-neutral-200 dark:border-neutral-700 rounded-xl px-2 sm:px-3 py-1.5 shrink-0 bg-white dark:bg-neutral-900 hover:border-amber-400 dark:hover:border-amber-500 transition-all min-w-0"
                >
                  <img
                    src={imgUrl}
                    alt={p.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-700"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                  />
                  <span className="hidden sm:block text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[100px]">
                    {p.name}
                  </span>
                  <button
                    onClick={() => removeFromCompare(p.id)}
                    className="ml-1 w-6 h-6 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500 flex items-center justify-center shrink-0 transition-colors"
                    aria-label={`Xóa ${p.name}`}
                    title="Xóa"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}

            {/* Empty slots */}
            {Array.from({ length: slotsLeft }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl px-3 sm:px-5 py-1.5 shrink-0 text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5"
              >
                <span className="hidden sm:inline">+ Thêm sp</span>
                <span className="sm:hidden">+</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5 sm:gap-2 shrink-0">
            <Button
              onClick={clearCompare}
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 h-9 px-2 sm:px-3"
              title="Xóa tất cả"
            >
              <Trash2 className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden md:inline">Xóa</span>
            </Button>
            <Button
              onClick={() => navigate('/compare')}
              disabled={!canCompare}
              className={`h-9 px-3 sm:px-4 text-sm font-semibold shadow-md transition-all ${
                canCompare
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-amber-500/20'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
              }`}
            >
              {canCompare ? (
                <>
                  <span className="hidden sm:inline">So sánh ngay</span>
                  <span className="sm:hidden">So sánh</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Thêm 1 sp nữa</span>
                  <span className="sm:hidden">+1</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
