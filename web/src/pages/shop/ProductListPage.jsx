import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import ProductCard from '@/components/shop/ProductCard.jsx';
import { useProducts } from '@/hooks/useProducts.js';
import { highlightMatch, tokenizeQuery } from '@/lib/highlightMatch.jsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Sparkles, Lightbulb, WifiOff, RefreshCw, Grid3x3,
  ArrowDownAZ, ArrowDown01, ArrowUpDown, AlertCircle, SearchX, Inbox,
  Compass, ChevronRight, ChevronLeft,
} from 'lucide-react';

const CATEGORY_PILLS = [
  { key: '', label: 'Tất cả', icon: Grid3x3 },
  { key: 'Nam', label: 'Nam' },
  { key: 'Nữ', label: 'Nữ' },
  { key: 'Phụ kiện', label: 'Phụ kiện' },
];

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Mới nhất', icon: Sparkles },
  { value: 'created_at', label: 'Cũ nhất', icon: ArrowDown01 },
  { value: 'price', label: 'Giá: Thấp → Cao', icon: ArrowDownAZ },
  { value: '-price', label: 'Giá: Cao → Thấp', icon: ArrowDownAZ },
  { value: 'name', label: 'Tên: A → Z', icon: ArrowDownAZ },
];

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: undefined,
    maxPrice: undefined,
    sort: '-created_at',
  });

  const { products, loading, error, totalPages, totalItems } = useProducts(filters, page, 12);

  useEffect(() => {
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    setFilters((prev) => ({ ...prev, category, search }));
    setSearchInput(search);
    setPage(1);
  }, [searchParams]);

  const hasActiveFilters = useMemo(
    () => Boolean(filters.category || filters.search || filters.minPrice || filters.maxPrice),
    [filters]
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    if (key === 'category' || key === 'search') {
      const next = new URLSearchParams(searchParams);
      value ? next.set(key, value) : next.delete(key);
      setSearchParams(next);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    handleFilterChange('search', '');
  };

  const handleResetFilters = () => {
    setFilters({ category: '', search: '', minPrice: undefined, maxPrice: undefined, sort: '-created_at' });
    setSearchInput('');
    setSearchParams({});
    setPage(1);
  };

  const removeFilter = (key) => {
    if (key === 'search') clearSearch();
    else handleFilterChange(key, '');
  };

  return (
    <>
      <Helmet>
        <title>
          {filters.search ? `Tìm "${filters.search}"` : 'Tất cả sản phẩm'} - LUXE
        </title>
        <meta name="description" content="Khám phá bộ sưu tập thời trang cao cấp tại LUXE" />
      </Helmet>

      <Header />

      <PageHeader
        search={filters.search}
        totalItems={totalItems}
        loading={loading}
        searchInput={searchInput}
        onSearchInput={setSearchInput}
        onSubmit={handleSearch}
        onClearSearch={clearSearch}
      />

      <ActiveFilters
        filters={filters}
        onRemove={removeFilter}
        onReset={handleResetFilters}
      />

      <main className="bg-white py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FilterBar
            category={filters.category}
            sort={filters.sort}
            onCategoryChange={(c) => handleFilterChange('category', c)}
            onSortChange={(s) => handleFilterChange('sort', s)}
          />

          <ResultSection
            loading={loading}
            error={error}
            products={products}
            filters={filters}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onReset={handleResetFilters}
            onSearch={(q) => {
              setSearchInput(q);
              handleFilterChange('search', q);
            }}
            onCategory={(c) => handleFilterChange('category', c)}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ============================================================= */
/*  PAGE HEADER                                                   */
/* ============================================================= */

function PageHeader({ search, totalItems, loading, searchInput, onSearchInput, onSubmit, onClearSearch }) {
  const totalTokens = search ? tokenizeQuery(search).length : 0;

  return (
    <section className="relative bg-stone-50 border-b border-stone-100 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 md:pt-14 md:pb-16">
        {/* Breadcrumb */}
        <Breadcrumb search={search} />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mt-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3">
              LUXE Collection
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.05]">
              {search ? (
                <>
                  <span className="block">Kết quả cho</span>
                  <span className="block mt-1 font-serif italic text-amber-700">
                    "{highlightMatch(search, search)}"
                  </span>
                </>
              ) : (
                <>
                  <span className="block">Tất cả</span>
                  <span className="block mt-1 font-serif italic text-amber-700">
                    sản phẩm
                  </span>
                </>
              )}
            </h1>
            <div className="mt-5 flex items-center gap-3 text-sm text-stone-500">
              <span className="w-10 h-px bg-stone-300" />
              <span className="font-medium text-stone-700">
                {loading ? 'Đang tìm...' : `${totalItems || 0} sản phẩm`}
              </span>
              {totalTokens > 1 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                  {totalTokens} từ khoá
                </span>
              )}
            </div>
          </motion.div>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onSubmit={onSubmit}
            className="w-full lg:w-96"
          >
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => onSearchInput(e.target.value)}
                placeholder="Áo thun, túi xách..."
                className="w-full pl-12 pr-16 py-3.5 bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition shadow-sm hover:shadow-md focus:shadow-md placeholder:text-stone-400"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition"
                  aria-label="Xoá"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 items-center px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[10px] font-mono">
                  Enter
                </kbd>
              )}
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Breadcrumb({ search }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm text-stone-500"
    >
      <Link to="/" className="hover:text-stone-900 transition">Trang chủ</Link>
      <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
      <span className="text-stone-900 font-medium">Sản phẩm</span>
      {search && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          <span className="text-stone-900 font-medium truncate max-w-[200px]">
            "{search}"
          </span>
        </>
      )}
    </motion.nav>
  );
}

/* ============================================================= */
/*  ACTIVE FILTERS                                                */
/* ============================================================= */

function ActiveFilters({ filters, onRemove, onReset }) {
  const { category, search, minPrice, maxPrice } = filters;
  const hasAny = Boolean(category || search || minPrice || maxPrice);
  if (!hasAny) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-white border-b border-stone-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Đang lọc
            </span>
            {category && (
              <FilterChip
                label={category}
                onRemove={() => onRemove('category')}
                variant="dark"
              />
            )}
            {search && (
              <FilterChip
                label={`"${search}"`}
                icon={Search}
                onRemove={() => onRemove('search')}
                variant="amber"
              />
            )}
            {(minPrice || maxPrice) && (
              <FilterChip
                label={`${minPrice?.toLocaleString('vi-VN') || 0}₫ - ${maxPrice?.toLocaleString('vi-VN') || '∞'}₫`}
                onRemove={() => {
                  onRemove('minPrice');
                  onRemove('maxPrice');
                }}
                variant="gray"
              />
            )}
            <button
              onClick={onReset}
              className="text-xs text-stone-500 hover:text-stone-900 transition inline-flex items-center gap-1 ml-2 px-2.5 py-1 rounded-full hover:bg-stone-100"
            >
              <X className="w-3.5 h-3.5" />
              Xoá tất cả
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function FilterChip({ label, icon: Icon, onRemove, variant = 'dark' }) {
  const styles = {
    dark: 'bg-stone-900 text-white hover:bg-stone-800',
    amber: 'bg-amber-100 text-amber-900 hover:bg-amber-200',
    gray: 'bg-stone-100 text-stone-700 hover:bg-stone-200',
  }[variant];

  const closeStyles = {
    dark: 'hover:bg-white/20',
    amber: 'hover:bg-amber-300/40',
    gray: 'hover:bg-stone-300/40',
  }[variant];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${styles}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {label}
      <button
        onClick={onRemove}
        className={`ml-0.5 rounded-full p-0.5 ${closeStyles}`}
        aria-label="Bỏ lọc"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.span>
  );
}

/* ============================================================= */
/*  FILTER BAR                                                    */
/* ============================================================= */

function FilterBar({ category, sort, onCategoryChange, onSortChange }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-6 pb-5 border-b border-stone-100">
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORY_PILLS.map(({ key, label, icon: Icon }) => {
          const active = category === key;
          return (
            <button
              key={key || 'all'}
              onClick={() => onCategoryChange(key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                active
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400 hover:text-stone-900'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {label}
            </button>
          );
        })}
      </div>

      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="w-52 bg-white border-stone-200 rounded-full">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <SelectValue placeholder="Sắp xếp" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
            <SelectItem key={value} value={value}>
              <span className="inline-flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" /> {label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ============================================================= */
/*  RESULT SECTION                                                */
/* ============================================================= */

function ResultSection({ loading, error, products, filters, page, totalPages, onPageChange, onReset, onSearch, onCategory }) {
  if (loading) return <ProductGridSkeleton />;
  if (error) return <ErrorState error={error} onRetry={onReset} />;
  if (products.length === 0) {
    return (
      <SmartEmptyState
        search={filters.search}
        category={filters.category}
        onClear={onReset}
        onSearch={onSearch}
        onCategory={onCategory}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
          >
            <ProductCard product={product} index={index} />
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onChange={onPageChange} />
      )}
    </>
  );
}

/* ============================================================= */
/*  SKELETON                                                      */
/* ============================================================= */

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-50 rounded-2xl mb-4" />
          <div className="h-3 bg-stone-100 rounded-full mb-2 w-1/3" />
          <div className="h-4 bg-stone-100 rounded-full mb-2" />
          <div className="h-4 bg-stone-100 rounded-full mb-3 w-2/3" />
          <div className="h-5 bg-stone-100 rounded-full w-1/2" />
        </div>
      ))}
    </div>
  );
}

/* ============================================================= */
/*  ERROR STATE                                                   */
/* ============================================================= */

function ErrorState({ error, onRetry }) {
  const isNetwork = /kết nối|mạng/i.test(error);
  const Icon = isNetwork ? WifiOff : AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-4"
    >
      <div className="relative inline-block mb-5">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-rose-100 rounded-full blur-2xl opacity-60" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-100 rounded-full flex items-center justify-center">
          <Icon className="w-9 h-9 text-amber-600" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-stone-900 mb-2">
        {isNetwork ? 'Mất kết nối mạng' : 'Đã có lỗi xảy ra'}
      </h3>
      <p className="text-sm text-stone-500 mb-6 max-w-md mx-auto">{error}</p>
      <Button onClick={onRetry} className="rounded-full bg-stone-900 hover:bg-stone-800 text-white px-6">
        <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
      </Button>
    </motion.div>
  );
}

/* ============================================================= */
/*  PAGINATION                                                    */
/* ============================================================= */

function Pagination({ currentPage, totalPages, onChange }) {
  const items = useMemo(() => buildPageItems(currentPage, totalPages), [currentPage, totalPages]);

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      aria-label="Phân trang"
      className="mt-12 flex items-center justify-center gap-2 select-none"
    >
      <PageButton
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        icon={<ChevronLeft className="w-4 h-4" />}
        label="Trước"
      />
      {items.map((p, idx) =>
        p === '...' ? (
          <span key={`dots-${idx}`} className="w-10 h-10 inline-flex items-center justify-center text-stone-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`min-w-[40px] h-10 px-3 rounded-full text-sm font-semibold border transition ${
              p === currentPage
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:text-stone-900'
            }`}
          >
            {p}
          </button>
        )
      )}
      <PageButton
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
        label="Sau"
        iconRight
        icon={<ChevronRight className="w-4 h-4" />}
      />
    </motion.nav>
  );
}

function PageButton({ disabled, onClick, icon, label, iconRight }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium border transition ${
        disabled
          ? 'border-stone-200 bg-white text-stone-300 cursor-not-allowed'
          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-900'
      }`}
    >
      {!iconRight && icon}
      <span>{label}</span>
      {iconRight && icon}
    </button>
  );
}

function buildPageItems(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const items = [1];
  if (current > 3) items.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) items.push(i);
  if (current < total - 2) items.push('...');
  items.push(total);
  return items;
}

/* ============================================================= */
/*  EMPTY STATE                                                   */
/* ============================================================= */

function SmartEmptyState({ search, category, onClear, onSearch, onCategory }) {
  const isSearchEmpty = Boolean(search && search.trim());
  const tokens = isSearchEmpty ? tokenizeQuery(search) : [];
  const suggestions = useMemo(() => getSuggestions(tokens), [tokens]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden text-center py-16 px-4 sm:px-8 bg-gradient-to-br from-amber-50/60 via-white to-rose-50/40 rounded-3xl border border-amber-100/80"
    >
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-amber-200/30 to-rose-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-rose-200/30 to-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-rose-300 rounded-full blur-2xl opacity-40 animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-amber-100 to-rose-100 rounded-full flex items-center justify-center ring-1 ring-amber-200/60">
            {isSearchEmpty ? (
              <SearchX className="w-11 h-11 text-amber-600" />
            ) : (
              <Inbox className="w-11 h-11 text-amber-600" />
            )}
          </div>
        </div>

        {isSearchEmpty ? (
          <SearchEmpty
            search={search}
            suggestions={suggestions}
            onSearch={onSearch}
            onCategory={onCategory}
            onClear={onClear}
          />
        ) : (
          <CategoryEmpty
            category={category}
            onCategory={onCategory}
            onClear={onClear}
          />
        )}
      </div>
    </motion.div>
  );
}

function SearchEmpty({ search, suggestions, onSearch, onCategory, onClear }) {
  return (
    <>
      <h3 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">
        Không tìm thấy sản phẩm cho "{search}"
      </h3>
      <p className="text-sm md:text-base text-stone-500 mb-8 max-w-md mx-auto leading-relaxed">
        Rất tiếc! Chúng tôi không tìm thấy sản phẩm nào phù hợp.
        <br className="hidden sm:block" />
        Thử từ khoá khác hoặc khám phá các gợi ý bên dưới.
      </p>

      {suggestions.length > 0 && (
        <SuggestionGroup
          title="Có thể bạn muốn tìm"
          icon={Lightbulb}
          items={suggestions}
          onClick={onSearch}
        />
      )}

      <SuggestionGroup
        title="Khám phá danh mục"
        icon={Compass}
        items={['Nam', 'Nữ', 'Phụ kiện']}
        onClick={onCategory}
      />

      <div className="flex flex-wrap gap-2 justify-center mt-8">
        <Button onClick={onClear} className="bg-stone-900 hover:bg-stone-800 text-white rounded-full px-6">
          <X className="w-4 h-4 mr-1.5" /> Xoá tất cả bộ lọc
        </Button>
        <Link to="/">
          <Button variant="outline" className="rounded-full px-6">
            Về trang chủ
          </Button>
        </Link>
      </div>
    </>
  );
}

function CategoryEmpty({ category, onCategory, onClear }) {
  return (
    <>
      <h3 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">
        Danh mục {category} đang cập nhật
      </h3>
      <p className="text-sm md:text-base text-stone-500 mb-8 max-w-md mx-auto leading-relaxed">
        Chúng tôi đang cập nhật thêm sản phẩm mới cho danh mục này.
        <br className="hidden sm:block" />
        Vui lòng quay lại sau hoặc khám phá danh mục khác.
      </p>

      <SuggestionGroup
        title="Khám phá danh mục"
        icon={Compass}
        items={['Nam', 'Nữ', 'Phụ kiện']}
        onClick={onCategory}
        activeItem={category}
      />

      <div className="mt-8">
        <Link to="/products" onClick={onClear}>
          <Button className="bg-stone-900 hover:bg-stone-800 text-white rounded-full px-6">
            <Grid3x3 className="w-4 h-4 mr-2" /> Xem tất cả sản phẩm
          </Button>
        </Link>
      </div>
    </>
  );
}

function SuggestionGroup({ title, icon: Icon, items, onClick, activeItem }) {
  return (
    <div className="mb-6 max-w-2xl mx-auto">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 inline-flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" /> {title}
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onClick(item)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              item === activeItem
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 hover:border-stone-900 hover:bg-stone-50 text-stone-700'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function getSuggestions(tokens) {
  if (tokens.length === 0) return [];
  const dict = {
    ao: ['Áo thun', 'Áo sơ mi', 'Áo khoác', 'Áo len'],
    quan: ['Quần jean', 'Quần tây', 'Quần short', 'Quần kaki'],
    giay: ['Giày sneaker', 'Giày da', 'Sandal', 'Dép'],
    tui: ['Túi xách', 'Túi đeo chéo', 'Balo', 'Ví'],
    'phu kien': ['Thắt lưng', 'Kính', 'Mũ', 'Khăn'],
    vay: ['Váy dài', 'Váy ngắn', 'Chân váy', 'Đầm'],
  };
  const first = tokens[0];
  for (const [key, vals] of Object.entries(dict)) {
    if (first.includes(key) || key.includes(first)) return vals;
  }
  return ['Áo thun', 'Quần jean', 'Túi xách', 'Phụ kiện'];
}
