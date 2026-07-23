import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import ProductCard from '@/components/shop/ProductCard.jsx';
import { useProducts } from '@/hooks/useProducts.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Clock, Zap, Star } from 'lucide-react';

export default function NewArrivalsPage() {
  const [sortBy, setSortBy] = useState('-created_at');
  const { products, loading, totalItems } = useProducts({ sort: sortBy }, 1, 24);

  return (
    <>
      <Helmet>
        <title>Hàng mới về - LUXE</title>
        <meta name="description" content="Khám phá những sản phẩm thời trang mới nhất tại LUXE" />
      </Helmet>
      
      <Header />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-40 w-3 h-3 bg-orange-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-32 left-40 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-full border border-amber-500/30">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium tracking-wide">BỘ SƯU TẬP MỚI 2026</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Hàng mới 
                <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  về ngay
                </span>
              </h1>

              <p className="text-xl text-gray-400 max-w-lg">
                Cập nhật xu hướng thời trang mới nhất từ các thương hiệu hàng đầu. 
                Thiết kế độc đáo, chất lượng vượt trội.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/products">
                  <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black border-0 rounded-full px-8">
                    Xem tất cả
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8">
                  Bộ sưu tập
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <Zap className="w-8 h-8 text-amber-400 mb-3" />
                <p className="text-4xl font-bold text-white">{totalItems || 47}</p>
                <p className="text-gray-400 text-sm">Sản phẩm mới</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <Clock className="w-8 h-8 text-orange-400 mb-3" />
                <p className="text-4xl font-bold text-white">24h</p>
                <p className="text-gray-400 text-sm">Giao hàng nhanh</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <Star className="w-8 h-8 text-yellow-400 mb-3" />
                <p className="text-4xl font-bold text-white">4.9</p>
                <p className="text-gray-400 text-sm">Đánh giá trung bình</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-2xl font-bold text-white">10K+</p>
                <p className="text-gray-400 text-sm">Khách hàng</p>
              </div>
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

      {/* Products Section */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-sm font-medium text-amber-600 tracking-wider uppercase">Vừa ra mắt</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">Sản phẩm mới về</h2>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
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

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4"></div>
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
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-3xl">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có sản phẩm mới</h3>
              <p className="text-gray-500 mb-6">Hãy quay lại sau để khám phá bộ sưu tập mới</p>
              <Link to="/products">
                <Button variant="outline" className="rounded-full">
                  Xem tất cả sản phẩm
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories Quick Links */}
      <section className="bg-gradient-to-b from-background to-muted/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-sm font-medium text-gray-500 tracking-wider uppercase mb-8">
            Khám phá thêm
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <Link to="/men" className="group relative overflow-hidden rounded-2xl aspect-[3/4]">
              <img 
                src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=600&fit=crop" 
                alt="Thời trang Nam"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h4 className="text-white text-xl font-bold">Nam</h4>
                <p className="text-white/70 text-sm">Thời trang lịch lãm</p>
              </div>
            </Link>
            <Link to="/women" className="group relative overflow-hidden rounded-2xl aspect-[3/4]">
              <img 
                src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop" 
                alt="Thời trang Nữ"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h4 className="text-white text-xl font-bold">Nữ</h4>
                <p className="text-white/70 text-sm">Thanh lịch & quyến rũ</p>
              </div>
            </Link>
            <Link to="/accessories" className="group relative overflow-hidden rounded-2xl aspect-[3/4]">
              <img 
                src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=600&fit=crop" 
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
