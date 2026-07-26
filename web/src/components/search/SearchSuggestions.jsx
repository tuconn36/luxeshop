import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Clock, TrendingUp, ArrowRight,
  Tag, Sparkles, History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productsAPI, resolveAssetUrl } from '@/lib/api';
import { searchProducts, splitByMatch, getSuggestions } from '@/lib/search';
import Highlight from '@/components/search/Highlight.jsx';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&h=100&fit=crop';
const safeImage = (img) => resolveAssetUrl(img) || PLACEHOLDER;

const RECENT_KEY = 'luxe_recent_searches';
const POPULAR_SEARCHES = ['Áo polo nam', 'Váy nữ công sở', 'Quần jeans', 'Túi xách', 'Giày thể thao'];
const QUICK_CATEGORIES = [
  { name: 'Nam', href: '/men', color: 'from-blue-500 to-indigo-500' },
  { name: 'Nữ', href: '/women', color: 'from-pink-500 to-rose-500' },
  { name: 'Phụ kiện', href: '/accessories', color: 'from-amber-500 to-orange-500' },
  { name: 'Sale', href: '/sale', color: 'from-red-500 to-rose-500' },
];

/**
 * SearchSuggestions — autocomplete dropdown cho Header search.
 *
 * Props:
 * - query: chuỗi tìm kiếm hiện tại
 * - onClose: đóng dropdown
 * - onPick: callback khi chọn gợi ý
 * - allProducts: optional - danh sách sp đã cache (để tránh gọi API mỗi lần)
 */
export default function SearchSuggestions({ query, onClose, onPick, allProducts = null }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState(allProducts || []);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const dropdownRef = useRef(null);
  const abortRef = useRef(null);

  // Load products cho gợi ý (debounced)
  useEffect(() => {
    if (allProducts && allProducts.length) {
      setProducts(allProducts);
      return;
    }
    if (!query || query.length < 1) return;
    const timer = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        setLoading(true);
        const data = await productsAPI.getAll({ limit: 50, search: query });
        const list = Array.isArray(data) ? data : data?.products || data?.data || [];
        setProducts(list);
      } catch (e) {
        if (e.name !== 'AbortError') {
          // fallback: lấy top 50 không filter
          try {
            const data = await productsAPI.getAll({ limit: 50 });
            setProducts(Array.isArray(data) ? data : []);
          } catch {
            setProducts([]);
          }
        }
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, allProducts]);

  // Tính kết quả
  const results = useMemo(() => {
    if (!query || !query.trim()) return [];
    return searchProducts(products, query, 8);
  }, [query, products]);

  // Từ khóa gợi ý
  const suggestions = useMemo(() => {
    if (!query || !query.trim()) return [];
    return getSuggestions(products, query, 6);
  }, [query, products]);

  const handlePick = useCallback((q) => {
    if (!q || !q.trim()) return;
    const newRecent = [q, ...recent.filter((r) => r !== q)].slice(0, 6);
    setRecent(newRecent);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
    } catch { /* ignore */ }
    onPick?.(q);
    onClose?.();
  }, [recent, onPick, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handlePick(query);
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearRecent = () => {
    setRecent([]);
    try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
  };

  const removeRecent = (item) => {
    const next = recent.filter((r) => r !== item);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  // Keyboard nav
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(-1, i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const p = results[activeIndex];
      if (p) {
        onClose?.();
        navigate(`/product/${p.id}`);
      }
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, results]);

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {!query ? (
        // Empty state: recent + popular + categories
        <div className="p-4 space-y-4">
          {recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 px-2">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Tìm gần đây
                </p>
                <button
                  onClick={clearRecent}
                  className="text-xs text-neutral-400 hover:text-red-500"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button
                    key={r}
                    onClick={() => handlePick(r)}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-500/10 dark:hover:text-amber-300 transition-colors"
                  >
                    <Clock className="w-3 h-3" />
                    {r}
                    <X
                      className="w-3 h-3 opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); removeRecent(r); }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 px-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Tìm nhiều nhất
            </p>
            <div className="flex flex-wrap gap-2 px-2">
              {POPULAR_SEARCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => handlePick(s)}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 text-sm text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 hover:border-amber-400 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 px-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Danh mục nhanh
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-2">
              {QUICK_CATEGORIES.map((c) => (
                <Link
                  key={c.href}
                  to={c.href}
                  onClick={onClose}
                  className={`group flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-br ${c.color} text-white hover:scale-105 transition-transform`}
                >
                  <span className="text-sm font-semibold">{c.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-2">
            <Button
              type="submit"
              disabled={!query}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Search className="w-4 h-4 mr-2" />
              Tìm kiếm
            </Button>
          </form>
        </div>
      ) : (
        // With query: show results + suggestions
        <div className="p-2">
          {loading && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-neutral-500">
              <Search className="w-6 h-6 mx-auto mb-2 animate-pulse" />
              Đang tìm "{query}"...
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 px-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Gợi ý từ khóa
              </p>
              <div className="flex flex-wrap gap-1.5 px-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handlePick(s)}
                    className="px-2.5 py-1 rounded-full text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-500/10 dark:hover:text-amber-300 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 px-2 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Sản phẩm ({results.length})
              </p>
              <div>
                {results.map((p, idx) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    onClick={() => { handlePick(query); onClose?.(); }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      activeIndex === idx
                        ? 'bg-amber-50 dark:bg-amber-500/10'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <img
                      src={safeImage(p.images?.[0])}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-700"
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-neutral-900 dark:text-white truncate">
                        {highlightMatch(p.name, query)}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {p.category} {p.brand && `• ${p.brand}`}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400 shrink-0">
                      {Number(p.price || 0).toLocaleString('vi-VN')}₫
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!loading && results.length === 0 && suggestions.length === 0 && (
            <div className="px-4 py-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2">
                <Search className="w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                Không tìm thấy "{query}"
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Thử từ khóa khác hoặc kiểm tra chính tả
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-neutral-800 mt-2 pt-2 px-2">
              <Button
                onClick={handleSubmit}
                variant="ghost"
                className="w-full justify-between text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
              >
                Xem tất cả kết quả cho "{query}"
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
