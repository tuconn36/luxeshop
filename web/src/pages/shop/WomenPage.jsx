import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import ProductCard from '@/components/shop/ProductCard.jsx';
import { useProducts } from '@/hooks/useProducts.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Shirt, Sparkle, Heart } from 'lucide-react';

export default function WomenPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('-created_at');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  
  const brands = ['Elise', 'Juno', 'Biluxury', 'IVY moda', 'Kiza', 'NEM', 'Xita', 'VietCharm', 'Lime Orange', 'May 10'];
  
  const { products, loading, totalItems } = useProducts({ 
    category: 'Nữ',
    brand: selectedBrand,
    sort: sortBy 
  }, 1, 24);

  const handleBrandClick = (brand) => {
    const newBrand = selectedBrand === brand ? '' : brand;
    setSelectedBrand(newBrand);
    if (newBrand) {
      setSearchParams({ brand: newBrand });
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
      <Helmet>
        <title>Thời trang Nữ - LUXE</title>
        <meta name="description" content="Bộ sưu tập thời trang nữ thanh lịch" />
      </Helmet>
      
      <Header />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-rose-950 via-pink-950 to-fuchsia-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-rose-400 rounded-full animate-ping"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 backdrop-blur-sm rounded-full border border-pink-500/30">
                <Sparkle className="w-4 h-4 text-pink-400" />
                <span className="text-pink-400 text-sm font-medium tracking-wide">BỘ SƯU TẬP NỮ 2026</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Phong cách
                <span className="block bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Thanh lịch
                </span>
              </h1>

              <p className="text-xl text-gray-400 max-w-lg">
                Khám phá bộ sưu tập thời trang nữ cao cấp. Từ váy đầm thanh lịch đến trang phục công sở - tất cả đều tại LUXE.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/products">
                  <Button size="lg" className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 rounded-full px-8">
                    Mua sắm ngay
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8">
                  Bộ sưu tập
                </Button>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <Shirt className="w-8 h-8 text-pink-400 mb-3" />
                <p className="text-4xl font-bold text-white">{totalItems || 15}</p>
                <p className="text-gray-400 text-sm">Sản phẩm nữ</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <Heart className="w-8 h-8 text-rose-400 mb-3" />
                <p className="text-4xl font-bold text-white">10+</p>
                <p className="text-gray-400 text-sm">Thương hiệu</p>
              </div>
              <div className="col-span-2 bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/30">
                <p className="text-3xl font-bold text-white mb-2">Ưu đãi đặc biệt</p>
                <p className="text-gray-400">Giảm đến 30% cho khách hàng mới</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50L48 45C96 40 192 30 288 35C384 40 480 60 576 65C672 70 768 60 864 50C960 40 1056 30 1152 35C1248 40 1344 60 1392 70L1440 80V100H0V50Z" fill="currentColor" className="text-background"/>
          </svg>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-gradient-to-b from-background to-muted/20 py-6 sticky top-16 z-40 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Brand Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Thương hiệu:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedBrand === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBrandClick('')}
                  className={`rounded-full whitespace-nowrap ${selectedBrand === '' ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
                >
                  Tất cả
                </Button>
                {brands.map((brand) => (
                  <Button
                    key={brand}
                    variant={selectedBrand === brand ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleBrandClick(brand)}
                    className={`rounded-full whitespace-nowrap ${selectedBrand === brand ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
                  >
                    {brand}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{totalItems || products.length} sản phẩm</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-white border-gray-200">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_at">Mới nhất</SelectItem>
                  <SelectItem value="created_at">Cũ nhất</SelectItem>
                  <SelectItem value="price">Giá: Thấp → Cao</SelectItem>
                  <SelectItem value="-price">Giá: Cao → Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded-lg w-2/3"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
          ) : (
            <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-3xl">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shirt className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-500 mb-6">Hãy thử chọn thương hiệu khác</p>
              <Button 
                onClick={() => handleBrandClick('')}
                variant="outline" 
                className="rounded-full"
              >
                Xem tất cả
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Related Categories */}
      <section className="bg-gradient-to-b from-background to-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-sm font-medium text-gray-500 tracking-wider uppercase mb-8">
            Khám phá thêm
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/men" className="group relative overflow-hidden rounded-2xl aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=400&fit=crop" 
                alt="Thời trang Nam"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h4 className="text-white text-xl font-bold">Thời trang Nam</h4>
                <p className="text-white/70 text-sm">Lịch lãm & đẳng cấp</p>
              </div>
            </Link>
            <Link to="/accessories" className="group relative overflow-hidden rounded-2xl aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=400&fit=crop" 
                alt="Phụ kiện"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h4 className="text-white text-xl font-bold">Phụ kiện</h4>
                <p className="text-white/70 text-sm">Hoàn thiện phong cách</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
