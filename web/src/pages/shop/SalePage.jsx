import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import ProductCard from '@/components/shop/ProductCard.jsx';
import { useProducts } from '@/hooks/useProducts.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ProductCardSkeleton } from '@/components/ui/product-skeleton.jsx';
import CountdownTimer from '@/components/shop/CountdownTimer.jsx';
import { motion } from 'framer-motion';
import { Tag, Clock, Flame, Percent, Gift, Truck, Shield, ArrowRight } from 'lucide-react';

export default function SalePage() {
  const [sortBy, setSortBy] = useState('-price');
  const [priceFilter, setPriceFilter] = useState('all');
  
  // Filter for sale items (price <= 200000)
  const filters = { maxPrice: 200000 };
  if (priceFilter === '99k') filters.maxPrice = 99000;
  else if (priceFilter === '199k') {
    filters.minPrice = 100000;
    filters.maxPrice = 199000;
  }
  
  const { products, loading, totalItems } = useProducts(filters, 1, 24);

  return (
    <>
      <Helmet>
        <title>Ưu đãi 99k - LUXE</title>
        <meta name="description" content="Săn sale cực sốc - Sản phẩm chỉ từ 99.000đ" />
      </Helmet>
      
      <Header />

      {/* Hero Banner - Hot Sale */}
      <section className="relative bg-gradient-to-br from-red-950 via-red-900 to-rose-950 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Fire glow effects */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
          
          {/* Animated stripes */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-400"></div>
            <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center space-y-6">
            {/* Animated Badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full shadow-lg shadow-orange-500/50"
            >
              <Flame className="w-6 h-6 text-black animate-pulse" />
              <span className="text-black font-bold text-lg tracking-wide">FLASH SALE</span>
              <Flame className="w-6 h-6 text-black animate-pulse" />
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-red-200"
            >
              CHỈ 99K
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl md:text-3xl text-white/90 font-semibold"
            >
              Siêu ưu đãi - Số lượng có hạn
            </motion.p>

            {/* Countdown Timer */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-2 text-white/80"
            >
              <Clock className="w-5 h-5" />
              <span>Kết thúc trong: </span>
              <span className="font-mono font-bold text-yellow-400">23:59:59</span>
            </motion.div>

            {/* CTA */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4"
            >
              <Button size="lg" className="bg-white text-red-600 hover:bg-yellow-400 hover:text-black font-bold rounded-full px-12 py-6 text-xl shadow-xl shadow-red-500/30">
                MUA NGAY
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50L48 45C96 40 192 30 288 35C384 40 480 60 576 65C672 70 768 60 864 50C960 40 1056 30 1152 35C1248 40 1344 60 1392 70L1440 80V100H0V50Z" fill="currentColor" className="text-background"/>
          </svg>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
              <Percent className="w-5 h-5 text-red-500" />
              <span>Giảm đến 70%</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
              <Gift className="w-5 h-5 text-red-500" />
              <span>Quà tặng hấp dẫn</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
              <Truck className="w-5 h-5 text-red-500" />
              <span>Miễn phí giao hàng</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
              <Shield className="w-5 h-5 text-red-500" />
              <span>Bảo hành 30 ngày</span>
            </div>
          </div>
        </div>
      </section>

      {/* Price Filter Tabs */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-6 sticky top-16 z-40 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-gray-900">
                {totalItems || 0} sản phẩm đang sale
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Price Filter */}
              <div className="flex bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setPriceFilter('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    priceFilter === 'all' 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setPriceFilter('99k')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    priceFilter === '99k' 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  99K
                </button>
                <button
                  onClick={() => setPriceFilter('199k')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    priceFilter === '199k' 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  99K - 199K
                </button>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-white border-gray-200">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_at">Mới nhất</SelectItem>
                  <SelectItem value="price">Giá: Thấp → Cao</SelectItem>
                  <SelectItem value="-price">Giá: Cao → Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Flash Sale Countdown */}
          <div className="mb-6">
            <CountdownTimer
              targetTime={(() => {
                // Tự tạo thời điểm kết thúc: cuối ngày hôm nay
                const end = new Date();
                end.setHours(23, 59, 59, 999);
                return end.toISOString();
              })()}
              title="Flash Sale kết thúc trong"
              variant="banner"
            />
          </div>

          {loading ? (
            <ProductCardSkeleton variant="wide" />
          ) : products.length > 0 ? (
            <>
              {/* Sale Banner */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl p-6 mb-8 text-white text-center"
              >
                <p className="text-lg font-semibold">
                  🎉 Ưu đãi đặc biệt - Giảm thêm 10% khi mua từ 3 sản phẩm!
                </p>
              </motion.div>

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
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Hiện không có sản phẩm nào trong khoảng giá này. Hãy thử chọn mức giá khác.
              </p>
              <Button 
                onClick={() => setPriceFilter('all')}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full"
              >
                Xem tất cả ưu đãi
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Không bỏ lỡ ưu đãi tiếp theo!
          </h3>
          <p className="text-gray-400 mb-8 text-lg">
            Đăng ký ngay để nhận thông báo về các deal hot nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Nhập email của bạn"
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-gray-400 focus:outline-none focus:border-red-500 transition-colors"
            />
            <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-full px-8">
              Đăng ký
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
