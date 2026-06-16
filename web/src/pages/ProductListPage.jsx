import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ProductCard from '@/components/ProductCard.jsx';
import FilterSidebar from '@/components/FilterSidebar.jsx';
import { useProducts } from '@/hooks/useProducts.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: 0,
    maxPrice: 5000000,
    sort: '-created'
  });

  const { products, loading, totalPages } = useProducts(filters, page, 12);

  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    setFilters(prev => ({
      ...prev,
      category: category || '',
      search: search || ''
    }));
    setPage(1);
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
    
    // Sync critical filters back to URL for shareability
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

  const handleResetFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: 0,
      maxPrice: 5000000,
      sort: '-created'
    });
    setSearchParams({});
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>Sản phẩm - LUXE</title>
        <meta name="description" content="Khám phá bộ sưu tập thời trang cao cấp tại LUXE" />
      </Helmet>
      
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
            {filters.category ? `Thời trang ${filters.category}` : 'Tất cả sản phẩm'}
          </h1>
          {filters.search && (
            <p className="text-lg text-muted-foreground">
              Kết quả tìm kiếm cho: "{filters.search}"
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </aside>

          <main className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {loading ? 'Đang tải...' : `${products.length} sản phẩm`}
              </p>
              <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created">Mới nhất</SelectItem>
                  <SelectItem value="price">Giá thấp đến cao</SelectItem>
                  <SelectItem value="-price">Giá cao đến thấp</SelectItem>
                  <SelectItem value="name">Tên A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-4">Không tìm thấy sản phẩm nào</p>
                <Button onClick={handleResetFilters}>Xóa bộ lọc</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-12">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Trang {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}