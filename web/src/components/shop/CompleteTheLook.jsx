import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, ShoppingBag, Plus,
  Sparkles, Heart, Loader2, AlertCircle,
} from 'lucide-react';
import { productsAPI, resolveAssetUrl } from '@/lib/api';
import { useCart } from '@/hooks/useCart.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useWishlist } from '@/contexts/WishlistContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop';
const safeImage = (img) => resolveAssetUrl(img) || PLACEHOLDER;

/**
 * Hook gợi ý sản phẩm "complete the look".
 *
 * Logic:
 * - Ưu tiên cùng category, loại trừ chính sp hiện tại
 * - Lấy thêm từ category liên quan (Nam ↔ Nữ, Nữ ↔ Phụ kiện)
 * - Trộn lại và dedupe
 */
export function useCompleteTheLook(product, limit = 6) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!product?.id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Map category liên quan
    const relatedCategories = getRelatedCategories(product.category);

    Promise.all([
      // Cùng category (ưu tiên)
      productsAPI.getAll({
        category: product.category,
        limit: limit + 1,
        sort: '-created_at',
      }).catch(() => []),
      // Category liên quan
      Promise.all(
        relatedCategories.map((cat) =>
          productsAPI.getAll({ category: cat, limit: 3, sort: '-created_at' })
            .catch(() => [])
        )
      ),
    ])
      .then(([sameCat, relatedCats]) => {
        if (cancelled) return;
        const sameCatItems = Array.isArray(sameCat) ? sameCat : [];
        const relatedItems = relatedCats.flat();
        // Gộp + loại trùng + loại chính nó
        const seen = new Set([product.id]);
        const merged = [];
        for (const p of [...sameCatItems, ...relatedItems]) {
          if (!p?.id || seen.has(p.id)) continue;
          seen.add(p.id);
          merged.push(p);
          if (merged.length >= limit) break;
        }
        setItems(merged);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, product?.category]);

  return { items, loading, error };
}

function getRelatedCategories(category) {
  const map = {
    'Nam': ['Nữ', 'Phụ kiện'],
    'Nữ': ['Nam', 'Phụ kiện'],
    'Phụ kiện': ['Nam', 'Nữ'],
  };
  return map[category] || [];
}

/**
 * Component hiển thị carousel "Complete the look" trên PDP.
 */
export default function CompleteTheLook({ product, max = 6, title = 'Hoàn thiện phong cách' }) {
  const { items, loading, error } = useCompleteTheLook(product, max);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const scrollRef = React.useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [items.length]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * scrollRef.current.clientWidth * 0.85, behavior: 'smooth' });
  };

  const handleAdd = (p) => {
    if (p.stock <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập');
      navigate('/signup');
      return;
    }
    addToCart(p, 1);
    toast.success(`Đã thêm "${p.name}" vào giỏ`);
  };

  const totalPrice = items.reduce((sum, p) => sum + Number(p.price || 0), 0) + Number(product?.price || 0);

  if (loading) {
    return (
      <section className="py-10 md:py-14 bg-gradient-to-br from-amber-50/30 via-white to-rose-50/20 dark:from-neutral-900 dark:via-neutral-950 dark:to-amber-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
              Đang gợi ý phong cách...
            </h2>
          </div>
        </div>
      </section>
    );
  }

  if (error || items.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-gradient-to-br from-amber-50/30 via-white to-rose-50/20 dark:from-neutral-900 dark:via-neutral-950 dark:to-amber-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                {title}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Mix cùng <strong className="text-amber-700 dark:text-amber-400">{product.name}</strong> — Tổng {totalPrice.toLocaleString('vi-VN')}₫
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              disabled={!canLeft}
              className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 disabled:opacity-30 transition-all"
              aria-label="Trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!canRight}
              className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 disabled:opacity-30 transition-all"
              aria-label="Sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {items.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="snap-start shrink-0 w-56 sm:w-60"
            >
              <div className="group relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 hover:shadow-xl transition-all">
                <Link to={`/product/${p.id}`} className="block">
                  <div className="relative aspect-[4/5] bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={safeImage(p.images?.[0])}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                    />
                    {/* Category badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">
                        {p.category}
                      </span>
                    </div>
                    {/* Wishlist */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!currentUser) {
                          toast.error('Đăng nhập để lưu');
                          return;
                        }
                        toggleWishlist(p.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:text-rose-500 transition-colors"
                      aria-label="Yêu thích"
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(p.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2 min-h-[2.6em] group-hover:text-amber-600 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-base font-bold text-amber-700 dark:text-amber-400 mt-1.5">
                      {Number(p.price || 0).toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                </Link>
                {/* Add to cart */}
                <div className="px-3 pb-3">
                  <Button
                    onClick={() => handleAdd(p)}
                    disabled={p.stock <= 0}
                    size="sm"
                    className="w-full h-9 text-xs font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                  >
                    {p.stock <= 0 ? 'Hết hàng' : (
                      <>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Thêm vào giỏ
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* CTA "Mua tất cả" card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: items.length * 0.05 }}
            className="snap-start shrink-0 w-56 sm:w-60"
          >
            <div className="relative h-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-5 text-white flex flex-col justify-between min-h-[280px]">
              <div>
                <Sparkles className="w-8 h-8 mb-2" />
                <h3 className="font-serif text-lg font-bold">Mua cả set</h3>
                <p className="text-xs text-white/90 mt-1">
                  {items.length} sản phẩm + {product.name}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold mb-3">
                  {totalPrice.toLocaleString('vi-VN')}₫
                </p>
                <Button
                  onClick={() => {
                    handleAdd(product);
                    items.forEach((p) => {
                      if (p.stock > 0) handleAdd(p);
                    });
                  }}
                  className="w-full bg-white text-amber-700 hover:bg-amber-50 font-semibold"
                  size="sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                  Thêm cả set
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
