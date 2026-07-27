import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, ArrowRight, Loader2, Tag } from 'lucide-react';
import { highlightMatch } from '@/lib/highlightMatch.jsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatVND } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Chuẩn hoá URL ảnh: thêm API_BASE nếu là path tương đối
function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
}

// formatVND được import từ @/lib/utils để đồng bộ.

const POPULAR_SEARCHES = ['Áo thun', 'Quần jean', 'Giày sneaker', 'Túi xách', 'Áo khoác'];

export default function SearchAutocomplete({
  value,
  onChange,
  onSubmit,
  placeholder = 'Bạn muốn tìm gì hôm nay?',
  className = '',
  autoFocus = false,
  onClose,
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  // Click ngoài thì đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load trending khi mở lần đầu
  useEffect(() => {
    if (!open) return;
    if (trending.length > 0) return;
    fetch(`${API_BASE}/api/products/search/suggestions`)
      .then((r) => r.json())
      .then((d) => setTrending(d.trending || []))
      .catch(() => {});
  }, [open, trending.length]);

  // Debounce gọi API suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setCategories([]);
      setHighlightIdx(-1);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/search/suggestions?q=${encodeURIComponent(value)}&limit=6`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setCategories(data.categories || []);
        setHighlightIdx(data.suggestions?.length > 0 ? 0 : -1);
      } catch {
        setSuggestions([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  const handleSelectSuggestion = useCallback((s) => {
    setOpen(false);
    navigate(`/product/${s.id}`);
  }, [navigate]);

  const handleSelectCategory = useCallback((cat) => {
    setOpen(false);
    onChange(cat);
    navigate(`/products?category=${encodeURIComponent(cat)}&search=${encodeURIComponent(value)}`);
    if (onSubmit) onSubmit();
  }, [navigate, value, onChange, onSubmit]);

  const handleSelectPopular = useCallback((kw) => {
    onChange(kw);
    setOpen(false);
    navigate(`/products?search=${encodeURIComponent(kw)}`);
  }, [navigate, onChange]);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const total = suggestions.length;
      if (total > 0) setHighlightIdx((idx) => (idx + 1) % total);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const total = suggestions.length;
      if (total > 0) setHighlightIdx((idx) => (idx - 1 + total) % total);
    } else if (e.key === 'Enter') {
      if (highlightIdx >= 0 && suggestions[highlightIdx]) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightIdx]);
      } else if (value.trim()) {
        e.preventDefault();
        setOpen(false);
        if (onSubmit) onSubmit();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      if (onClose) onClose();
    }
  };

  const showDropdown = open;
  const hasQuery = value && value.trim().length >= 2;
  const showInitialState = !hasQuery;
  const hasNoResults = hasQuery && !loading && suggestions.length === 0 && categories.length === 0;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-14 pl-14 pr-32 rounded-full text-base border-2 border-border focus:border-primary"
          autoComplete="off"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Button
          type="button"
          onClick={() => {
            if (value.trim() && onSubmit) {
              setOpen(false);
              onSubmit();
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-5 h-10"
        >
          Tìm
        </Button>
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-2 px-5 py-4 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tìm...
            </div>
          )}

          {/* Initial state: gợi ý + trending */}
          {showInitialState && !loading && (
            <>
              <div className="px-5 py-3 border-b border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Tìm kiếm phổ biến
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => handleSelectPopular(kw)}
                      className="px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/5 hover:text-primary text-sm transition-colors"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
              {trending.length > 0 && (
                <div className="px-5 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Danh mục nổi bật
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {trending.map((t) => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          navigate(`/products?category=${encodeURIComponent(t.name)}`);
                        }}
                        className="flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border border-border hover:border-primary hover:bg-primary/5 text-left transition-colors"
                      >
                        <span className="text-sm font-semibold capitalize">{t.name}</span>
                        <span className="text-xs text-muted-foreground">{t.count} sản phẩm</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Có kết quả */}
          {!loading && suggestions.length > 0 && (
            <ul className="py-2">
              {suggestions.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    onMouseEnter={() => setHighlightIdx(i)}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                      highlightIdx === i ? 'bg-primary/5' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0 border">
                      {s.image ? (
                        <img
                          src={resolveImageUrl(s.image)}
                          alt={s.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Search className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {highlightMatch(s.name, value)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatVND(s.price)}
                        {s.originalPrice && s.originalPrice > s.price && (
                          <span className="ml-2 line-through text-muted-foreground/60">
                            {formatVND(s.originalPrice)}
                          </span>
                        )}
                      </p>
                    </div>
                    {s.category && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                        {s.category}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Categories hint */}
          {!loading && categories.length > 0 && (
            <div className="px-5 py-3 border-t border-border bg-muted/30">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Có thể bạn muốn tìm trong
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectCategory(c.name)}
                    className="px-3 py-1 rounded-full bg-white border border-border hover:border-primary hover:text-primary text-xs font-medium transition-colors"
                  >
                    {c.name} <span className="text-muted-foreground">({c.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {hasNoResults && (
            <div className="px-5 py-8 text-center">
              <Search className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-foreground">Không tìm thấy "{value}"</p>
              <p className="text-xs text-muted-foreground mt-1">
                Thử dùng từ khoá khác hoặc kiểm tra chính tả
              </p>
            </div>
          )}

          {/* Footer hint */}
          {suggestions.length > 0 && (
            <div className="px-5 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-3">
                <span>↑↓ di chuyển</span>
                <span>↵ chọn</span>
                <span>esc đóng</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (onSubmit) onSubmit();
                }}
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                Xem tất cả kết quả <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
