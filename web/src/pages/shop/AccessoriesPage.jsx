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
import { ArrowRight, Watch, Gem, Sparkle } from 'lucide-react';

export default function AccessoriesPage() {
  const [sortBy, setSortBy] = useState('-created_at');
  const { products, loading, totalItems } = useProducts({ category: 'Phụ kiện', sort: sortBy }, 1, 24);

  return (
    <>
      <Helmet>
        <title>Phụ kiện thời trang - LUXE</title>
        <meta name="description" content="Phụ kiện hoàn thiện phong cách" />
      </Helmet>
      
      <Header />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-amber-950 via-yellow-950 to-orange-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
          {/* Sparkle effects */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-40 w-3 h-3 bg-amber-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-32 left-40 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-full border border-amber-500/30">
                <Gem className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium tracking-wide">BỘ SƯU TẬP PHỤ KIỆN 2026</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Phong cách
                <span className="block bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Hoàn hảo
                </span>
              </h1>

              <p className="text-xl text-gray-400 max-w-lg">
                Hoàn thiện phong cách của bạn với những phụ kiện tinh tế và đẳng cấp. Từ túi xách đến trang sức - tất cả đều tại LUXE.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/products">
                  <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black border-0 rounded-full px-8">
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
                <Watch className="w-8 h-8 text-amber-400 mb-3" />
                <p className="text-4xl font-bold text-white">{totalItems || 12}</p>
                <p className="text-gray-400 text-sm">Phụ kiện</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <Sparkle className="w-8 h-8 text-yellow-400 mb-3" />
                <p className="text-4xl font-bold text-white">8+</p>
                <p className="text-gray-400 text-sm">Thương hiệu</p>
              </div>
              <div className="col-span-2 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30">
                <p className="text-3xl font-bold text-white mb-2">Quà tặng hoàn hảo</p>
                <p className="text-gray-400">Giao hàng nhanh chóng</p>
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

      {/* Filter & Products */}
      <section className="bg-gradient-to-b from-background to-muted/20 py-6 sticky top-16 z-40 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Gem className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-gray-900">
                {totalItems || products.length} sản phẩm phụ kiện
              </span>
            </div>
            
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
      </section>

      {/* Products */}
      <section className="bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl mb-4"></div>
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
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Watch className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có sản phẩm phụ kiện</h3>
              <p className="text-gray-500 mb-6">Hãy quay lại sau để xem thêm</p>
              <Link to="/products">
                <Button variant="outline" className="rounded-full">
                  Xem tất cả sản phẩm
                </Button>
              </Link>
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
            <Link to="/women" className="group relative overflow-hidden rounded-2xl aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=400&fit=crop" 
                alt="Thời trang Nữ"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h4 className="text-white text-xl font-bold">Thời trang Nữ</h4>
                <p className="text-white/70 text-sm">Thanh lịch & quyến rũ</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
