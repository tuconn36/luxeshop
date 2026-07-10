import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Truck, Heart, Star, TrendingUp, Percent, Gift } from 'lucide-react';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import ProductCard from '@/components/shop/ProductCard.jsx';
import HeroCarousel from '@/components/shop/HeroCarousel.jsx';
import { useProducts } from '@/hooks/useProducts.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const { products: menProducts, loading: menLoading } = useProducts({ category: 'Nam' }, 1, 4);
  const { products: womenProducts, loading: womenLoading } = useProducts({ category: 'Nữ' }, 1, 4);
  const { products: accessoriesProducts, loading: accessoriesLoading } = useProducts({ category: 'Phụ kiện' }, 1, 4);
  const { products: newProducts, loading: newLoading } = useProducts({ sort: '-created_at' }, 1, 8);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <>
      <Helmet>
        <title>LUXE - Thời trang Nam, Nữ & Phụ kiện</title>
        <meta name="description" content="Khám phá bộ sưu tập thời trang cao cấp cho Nam, Nữ và Phụ kiện tại LUXE. Phong cách hiện đại, chất lượng vượt trội." />
      </Helmet>
      
      <div className="relative">
        <Header />
        <HeroCarousel />
      </div>

      {/* Marquee Banner */}
      <section className="bg-primary py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-8">
              <span className="flex items-center gap-2 text-black font-medium text-sm">
                <Gift className="w-4 h-4" /> MIỄN PHÍ GIAO HÀNG cho đơn từ 500K
              </span>
              <span className="flex items-center gap-2 text-black font-medium text-sm">
                <Percent className="w-4 h-4" /> GIẢM 15% cho khách hàng mới
              </span>
              <span className="flex items-center gap-2 text-black font-medium text-sm">
                <Shield className="w-4 h-4" /> BẢO HÀNH 30 NGÀY
              </span>
              <span className="flex items-center gap-2 text-black font-medium text-sm">
                <Truck className="w-4 h-4" /> GIAO HÀNG NHANH 24H
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="inline-block text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4">
              Danh mục
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
              Khám phá bộ sưu tập
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tìm kiếm phong cách hoàn hảo cho riêng bạn với những bộ sưu tập đa dạng
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <Link to="/men" className="group relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="relative overflow-hidden rounded-3xl aspect-[3/4] md:aspect-[3/4]"
              >
                <img
                  src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&h=1000&fit=crop"
                  alt="Thời trang Nam"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Decorative corner */}
                <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-white/20 rounded-tr-3xl" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <span className="inline-block text-xs tracking-[0.3em] uppercase mb-3 text-primary">
                    Collection
                  </span>
                  <h3 className="text-4xl font-bold mb-3 font-serif">Nam</h3>
                  <p className="text-base mb-5 text-white/70">Lịch lãm & đẳng cấp</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Khám phá</span>
                    <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/20 transition-all duration-300">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link to="/women" className="group relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -8 }}
                className="relative overflow-hidden rounded-3xl aspect-[3/4] md:aspect-[3/4]"
              >
                <img
                  src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&h=1000&fit=crop"
                  alt="Thời trang Nữ"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Decorative corner */}
                <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-white/20 rounded-tr-3xl" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <span className="inline-block text-xs tracking-[0.3em] uppercase mb-3 text-primary">
                    Collection
                  </span>
                  <h3 className="text-4xl font-bold mb-3 font-serif">Nữ</h3>
                  <p className="text-base mb-5 text-white/70">Thanh lịch & quyến rũ</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Khám phá</span>
                    <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/20 transition-all duration-300">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link to="/accessories" className="group relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -8 }}
                className="relative overflow-hidden rounded-3xl aspect-[3/4] md:aspect-[3/4]"
              >
                <img
                  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=1000&fit=crop"
                  alt="Phụ kiện"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Decorative corner */}
                <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-white/20 rounded-tr-3xl" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <span className="inline-block text-xs tracking-[0.3em] uppercase mb-3 text-primary">
                    Collection
                  </span>
                  <h3 className="text-4xl font-bold mb-3 font-serif">Phụ kiện</h3>
                  <p className="text-base mb-5 text-white/70">Hoàn thiện phong cách</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Khám phá</span>
                    <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/20 transition-all duration-300">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section - Modern Cards */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Sparkles, title: 'Chất lượng cao cấp', desc: 'Sản phẩm được tuyển chọn kỹ lưỡng từ các thương hiệu hàng đầu' },
              { icon: Truck, title: 'Giao hàng nhanh', desc: 'Miễn phí giao hàng cho đơn từ 500K, giao trong 24h' },
              { icon: Shield, title: 'Đổi trả 30 ngày', desc: 'Chính sách đổi trả linh hoạt, không phí ẩn' },
              { icon: Heart, title: 'Tư vấn nhiệt tình', desc: 'Đội ngũ tư vấn chuyên nghiệp, hỗ trợ 24/7' }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent rounded-2xl transition-all duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <span className="text-primary font-medium tracking-wider uppercase text-sm">Just Dropped</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold" style={{ letterSpacing: '-0.02em' }}>
                Hàng mới về
              </h2>
            </div>
            <Link to="/products">
              <Button variant="outline" size="lg" className="group">
                Xem tất cả 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {newLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {newProducts.map((product, index) => (
                <motion.div key={`new-${product.id}`} variants={itemVariants}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <span className="inline-flex items-center gap-2 text-primary font-medium tracking-wider uppercase text-sm mb-4">
                <Percent className="w-4 h-4" /> Khuyến mãi đặc biệt
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ letterSpacing: '-0.02em' }}>
                Giảm giá <span className="text-primary">15%</span> cho đơn hàng đầu tiên
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Đăng ký ngay hôm nay và nhận ưu đãi giảm giá 15% cho lần mua hàng đầu tiên. 
                Áp dụng cho tất cả sản phẩm trong bộ sưu tập mới.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="rounded-full px-8">
                    Đăng ký ngay
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline" size="lg" className="rounded-full px-8">
                    Xem sản phẩm
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <img
                    src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=500&fit=crop"
                    alt="Fashion"
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=300&fit=crop"
                    alt="Fashion"
                    className="w-full h-48 object-cover rounded-2xl"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4 pt-8"
                >
                  <img
                    src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop"
                    alt="Fashion"
                    className="w-full h-48 object-cover rounded-2xl"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop"
                    alt="Fashion"
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                </motion.div>
              </div>
              
              {/* Floating discount badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 w-28 h-28 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/30"
              >
                <div className="text-center">
                  <p className="text-3xl font-bold text-black">15%</p>
                  <p className="text-[10px] font-medium text-black/70 uppercase tracking-wider">Giảm</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Men's Collection */}
      <section className="py-20 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
          >
            <div>
              <span className="inline-flex items-center gap-2 text-primary font-medium tracking-wider uppercase text-sm mb-3">
                Bộ sưu tập
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
                Thời trang Nam
              </h2>
              <p className="text-muted-foreground text-lg">
                Phong cách lịch lãm cho quý ông hiện đại
              </p>
            </div>
            <Link to="/men">
              <Button variant="outline" size="lg" className="group">
                Xem tất cả 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {menLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {menProducts.map((product, index) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Women's Collection */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
          >
            <div>
              <span className="inline-flex items-center gap-2 text-primary font-medium tracking-wider uppercase text-sm mb-3">
                Bộ sưu tập
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
                Thời trang Nữ
              </h2>
              <p className="text-muted-foreground text-lg">
                Thanh lịch & nữ tính
              </p>
            </div>
            <Link to="/women">
              <Button variant="outline" size="lg" className="group">
                Xem tất cả 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {womenLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {womenProducts.map((product, index) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials / Trust Banner */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-12 lg:gap-20">
            {[
              { rating: 4.9, label: 'Đánh giá trung bình' },
              { count: '10,000+', label: 'Khách hàng tin tưởng' },
              { products: '500+', label: 'Sản phẩm chất lượng' },
              { brands: '50+', label: 'Thương hiệu hàng đầu' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  {stat.rating && (
                    <>
                      <Star className="w-5 h-5 text-primary fill-primary" />
                      <span className="text-3xl font-bold text-white">{stat.rating}</span>
                    </>
                  )}
                  {stat.count && <span className="text-3xl font-bold text-white">{stat.count}</span>}
                  {stat.products && <span className="text-3xl font-bold text-white">{stat.products}</span>}
                  {stat.brands && <span className="text-3xl font-bold text-white">{stat.brands}</span>}
                </div>
                <p className="text-sm text-white/50">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessories Collection */}
      <section className="py-20 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
          >
            <div>
              <span className="inline-flex items-center gap-2 text-primary font-medium tracking-wider uppercase text-sm mb-3">
                Bộ sưu tập
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
                Phụ kiện
              </h2>
              <p className="text-muted-foreground text-lg">
                Hoàn thiện phong cách của bạn
              </p>
            </div>
            <Link to="/accessories">
              <Button variant="outline" size="lg" className="group">
                Xem tất cả 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {accessoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {accessoriesProducts.map((product, index) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
              Nhận ưu đãi độc quyền
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Đăng ký nhận bản tin để cập nhật những sản phẩm mới và ưu đãi hấp dẫn
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-5 py-3 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <Button size="lg" className="rounded-full px-8">
                Đăng ký
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Bằng việc đăng ký, bạn đồng ý với chính sách bảo mật của chúng tôi
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
