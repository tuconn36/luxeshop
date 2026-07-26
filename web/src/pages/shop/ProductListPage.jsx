import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import ProductCard from '@/components/shop/ProductCard.jsx';
import { useProducts } from '@/hooks/useProducts.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCardSkeleton } from '@/components/ui/product-skeleton.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Package,
  Search, X, TrendingUp
} from 'lucide-react';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: undefined,
    maxPrice: undefined,
    sort: '-created_at'
  });

  const { products, loading, error, totalPages, totalItems } = useProducts(filters, page, 12);

  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    setFilters(prev => ({
      ...prev,
      category: category || '',
      search: search || ''
    }));
    setSearchInput(search || '');
    setPage(1);
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
    
    if (key === 'category' || key === 'search') {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      setSearchParams(newParams);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    handleFilterChange('search', '');
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: undefined,
      maxPrice: undefined,
      sort: '-created_at'
    });
    setSearchInput('');
    setSearchParams({});
    setPage(1);
  };

  const removeFilter = (key) => {
    if (key === 'search') {
      clearSearch();
    } else {
      handleFilterChange(key, '');
    }
  };

  const getPageTitle = () => {
    if (filters.search) return `Kết quả tìm kiếm: "${filters.search}"`;
    if (filters.category) return `Thời trang ${filters.category}`;
    return 'Tất cả sản phẩm';
  };

  const hasActiveFilters = filters.category || filters.search || filters.minPrice || filters.maxPrice;

  return (
    <>
      <Helmet>
        <title>{getPageTitle()} - LUXE</title>
        <meta name="description" content="Khám phá bộ sưu tập thời trang cao cấp tại LUXE" />
      </Helmet>
      
      <Header />

      {/* Page Header with Search */}
      <section className="bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <motion.nav 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <Link to="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Sản phẩm</span>
            {filters.category && (
              <>
                <span>/</span>
                <span className="text-foreground font-medium capitalize">{filters.category}</span>
              </>
            )}
            {filters.search && (
              <>
                <span>/</span>
                <span className="text-foreground font-medium">Tìm kiếm</span>
              </>
            )}
          </motion.nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            {/* Title & Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {getPageTitle()}
                </h1>
                {filters.category === '' && !filters.search && (
                  <span className="px-3 py-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    <span className="text-sm font-medium">Xu hướng</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="w-5 h-5" />
                <span className="font-medium">{totalItems || products.length} sản phẩm</span>
                {filters.category || filters.search ? (
                  <span className="text-sm">• Đang lọc</span>
                ) : null}
              </div>
            </motion.div>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSearch}
              className="relative w-full lg:w-80"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.form>
          </div>
        </div>
      </section>

      {/* Active Filters Tags */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-background border-b"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Đang lọc:</span>
                {filters.category && (
                  <Badge variant="secondary" className="gap-1 px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    {filters.category}
                    <button onClick={() => removeFilter('category')} className="ml-1 hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.search && (
                  <Badge variant="secondary" className="gap-1 px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    "{filters.search}"
                    <button onClick={() => removeFilter('search')} className="ml-1 hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <Badge variant="secondary" className="gap-1 px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    {filters.minPrice?.toLocaleString('vi-VN')}₫ - {filters.maxPrice?.toLocaleString('vi-VN')}₫
                    <button onClick={() => {
                      handleFilterChange('minPrice', undefined);
                      handleFilterChange('maxPrice', undefined);
                    }} className="ml-1 hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-sm text-muted-foreground hover:text-foreground gap-1"
                >
                  <X className="w-4 h-4" />
                  Xóa tất cả
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <section className="bg-background py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-destructive/10 text-destructive px-6 py-4 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <p>{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Thử lại
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            {/* Category Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={filters.category === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('category', '')}
                className={`rounded-full ${filters.category === '' ? 'bg-black hover:bg-gray-800' : ''}`}
              >
                Tất cả
              </Button>
              {['Nam', 'Nữ', 'Phụ kiện'].map((cat) => (
                <Button
                  key={cat}
                  variant={filters.category === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('category', cat)}
                  className={`rounded-full ${filters.category === cat ? 'bg-black hover:bg-gray-800' : ''}`}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
              <SelectTrigger className="w-44 bg-white border-gray-200">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-created_at">Mới nhất</SelectItem>
                <SelectItem value="created_at">Cũ nhất</SelectItem>
                <SelectItem value="price">Giá: Thấp → Cao</SelectItem>
                <SelectItem value="-price">Giá: Cao → Thấp</SelectItem>
                <SelectItem value="name">Tên: A → Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <main>
              {loading ? (
                <ProductCardSkeleton />
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-3xl">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy sản phẩm</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Không có sản phẩm nào phù hợp với bộ lọc của bạn.
                  </p>
                  <Button 
                    onClick={handleResetFilters}
                    className="bg-black hover:bg-gray-800 text-white rounded-full"
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                      >
                        <ProductCard product={product} index={index} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-center gap-4 mt-12"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-full"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? 'default' : 'outline'}
                              size="icon"
                              onClick={() => setPage(pageNum)}
                              className={`w-10 h-10 ${page === pageNum ? 'bg-black hover:bg-gray-800' : ''}`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="rounded-full"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
          </main>
        </div>
      </section>

      <Footer />
    </>
  );
}
