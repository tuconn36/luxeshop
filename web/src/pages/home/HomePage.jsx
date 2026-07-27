import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Truck, Heart, Star, Percent, Gift } from 'lucide-react';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import ProductCard from '@/components/shop/ProductCard.jsx';
import HeroCarousel from '@/components/shop/HeroCarousel.jsx';
import FlashSale from '@/components/shop/FlashSale.jsx';
import SectionHeader from '@/components/shop/SectionHeader.jsx';
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

      {/* Category Showcase - Asymmetric Editorial Layout */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background via-amber-50/30 to-background relative overflow-hidden">
        {/* Decorative ornaments */}
        <div className="absolute top-32 -left-32 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 -right-32 w-[28rem] h-[28rem] bg-rose-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6"
          >
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 mb-5">
                <span className="w-12 h-px bg-amber-500" />
                <span className="text-amber-600 font-semibold tracking-[0.4em] uppercase text-xs">
                  Bộ sưu tập
                </span>
              </div>
              <h2
                className="text-5xl md:text-7xl font-bold mb-4 font-serif"
                style={{ letterSpacing: '-0.03em', lineHeight: '0.95' }}
              >
                Khám phá <span className="italic font-light text-amber-600">bộ sưu tập</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                Hành trình thời trang đẳng cấp — nơi phong cách được định hình bởi sự tinh tế trong từng đường nét.
              </p>
            </div>
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 text-sm font-medium tracking-wider uppercase text-foreground hover:text-amber-600 transition-colors"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Asymmetric Grid: 1 large + 2 small stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
            {/* Large Hero Card - Women (occupies 2 rows) */}
            <Link to="/women" className="group relative lg:row-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="relative h-full min-h-[520px] lg:min-h-[640px]"
              >
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1200&h=1400&fit=crop&q=85"
                    alt="Thời trang Nữ"
                    className="w-full h-full object-cover transition-all duration-[1500ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 transition-opacity duration-500 group-hover:from-black/90" />
                </div>

                {/* Decorative frame corners */}
                <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-white/60 transition-all duration-500 group-hover:w-16 group-hover:h-16" />
                <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-white/60 transition-all duration-500 group-hover:w-16 group-hover:h-16" />

                {/* Top label */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white text-center">
                  <span className="text-[10px] tracking-[0.5em] uppercase font-light block mb-1">
                    Featured Collection
                  </span>
                  <span className="text-[10px] tracking-[0.3em] uppercase font-medium text-amber-400">
                    01 / AW 2026
                  </span>
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <p className="text-[11px] tracking-[0.3em] uppercase font-medium text-amber-400 mb-3">
                    For Her
                  </p>
                  <h3 className="text-5xl md:text-6xl font-bold mb-3 font-serif" style={{ letterSpacing: '-0.02em' }}>
                    Nữ
                  </h3>
                  <p className="text-sm text-white/80 mb-6 max-w-xs leading-relaxed">
                    Thanh lịch, quyến rũ — những thiết kế dành cho phái đẹp hiện đại.
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs tracking-[0.3em] uppercase font-medium border-b border-white pb-1">
                      Khám phá ngay
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transition-all duration-300 group-hover:bg-amber-400 group-hover:rotate-[-45deg]">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Small Card - Men (top-right) */}
            <Link to="/men" className="group relative">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative h-[300px] lg:h-[310px]"
              >
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=900&h=600&fit=crop&q=85"
                    alt="Thời trang Nam"
                    className="w-full h-full object-cover transition-all duration-[1500ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500" />
                </div>

                <div className="absolute top-4 left-4 text-[10px] tracking-[0.4em] uppercase font-light text-white">
                  02 / Men
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-[11px] tracking-[0.3em] uppercase font-medium text-amber-400 mb-2">
                    For Him
                  </p>
                  <h3 className="text-3xl font-bold mb-3 font-serif">Nam</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs tracking-[0.3em] uppercase font-medium">Khám phá</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Small Card - Accessories (bottom-right) */}
            <Link to="/accessories" className="group relative">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="relative h-[300px] lg:h-[310px]"
              >
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&h=600&fit=crop&q=85"
                    alt="Phụ kiện"
                    className="w-full h-full object-cover transition-all duration-[1500ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                <div className="absolute top-4 left-4 text-[10px] tracking-[0.4em] uppercase font-light text-white">
                  03 / Accessories
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-[11px] tracking-[0.3em] uppercase font-medium text-amber-400 mb-2">
                    Essentials
                  </p>
                  <h3 className="text-3xl font-bold mb-3 font-serif">Phụ kiện</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs tracking-[0.3em] uppercase font-medium">Khám phá</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Flash Sale Band + Benefits Row */}
      <section className="relative py-20 overflow-hidden">
        {/* Background: gradient & animated blobs */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-black" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />

        <FlashSale />

        {/* Divider */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center gap-4 mb-12">
            <span className="w-12 h-px bg-white/30" />
            <span className="text-xs tracking-[0.4em] uppercase text-white/50">
              Tại sao chọn LUXE
            </span>
            <span className="flex-1 h-px bg-white/30" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {[
              { icon: Sparkles, title: 'Chất lượng cao cấp', desc: 'Tuyển chọn từ thương hiệu hàng đầu thế giới' },
              { icon: Truck, title: 'Giao hàng 24h', desc: 'Miễn phí ship cho đơn từ 500K' },
              { icon: Shield, title: 'Đổi trả 30 ngày', desc: 'Chính sách linh hoạt, không phí ẩn' },
              { icon: Heart, title: 'Tư vấn 24/7', desc: 'Đội ngũ chuyên nghiệp, tận tâm' }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-amber-400/40 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center mb-4 group-hover:bg-amber-400/20 group-hover:scale-110 transition-all duration-300">
                  <benefit.icon className="w-6 h-6 text-amber-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5">{benefit.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* New Arrivals Section - Bento Style */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background via-amber-50/20 to-background relative overflow-hidden">
        {/* Background ornaments */}
        <div className="absolute top-20 right-0 w-80 h-80 bg-amber-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader
            eyebrow="Vừa ra mắt"
            title="Hàng mới về"
            subtitle="Những thiết kế mới nhất được tuyển chọn — định hình xu hướng thời trang trong mùa."
            link="/products"
            linkText="Xem tất cả"
          />

          {newLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
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
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6"
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

      {/* Promo Banner - Full Width Editorial */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&h=900&fit=crop&q=85"
            alt="Fashion background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
        </div>

        {/* Decorative lines */}
        <div className="absolute top-12 left-12 hidden md:block">
          <div className="w-20 h-px bg-amber-400 mb-2" />
          <div className="w-10 h-px bg-amber-400/60" />
        </div>
        <div className="absolute bottom-12 right-12 hidden md:block">
          <div className="w-20 h-px bg-amber-400 mb-2 ml-auto" />
          <div className="w-10 h-px bg-amber-400/60 ml-auto" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs tracking-[0.3em] uppercase font-bold mb-6">
                <Percent className="w-3.5 h-3.5" />
                Khuyến mãi đặc biệt
              </span>

              <h2
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 font-serif"
                style={{ letterSpacing: '-0.03em', lineHeight: '0.95' }}
              >
                Giảm giá <br />
                <span className="italic text-amber-400">15%</span>{' '}
                <span className="text-3xl md:text-5xl">cho</span>
                <br />
                đơn đầu tiên
              </h2>

              <p className="text-white/70 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
                Đăng ký thành viên ngay hôm nay để nhận ngay ưu đãi giảm giá độc quyền
                15% cho lần mua hàng đầu tiên — áp dụng cho tất cả sản phẩm.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <Link to="/signup">
                  <button className="group relative inline-flex items-center gap-2 px-9 py-4 bg-amber-400 text-black rounded-full font-semibold text-sm tracking-wider uppercase overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-400/40">
                    <span className="relative z-10">Đăng ký ngay</span>
                    <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-amber-300 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </Link>
                <Link to="/products">
                  <span className="inline-flex items-center gap-2 text-white/80 hover:text-amber-400 transition-colors text-sm tracking-wider uppercase font-medium border-b border-white/30 hover:border-amber-400 pb-1">
                    Xem sản phẩm
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>

              {/* Small info row */}
              <div className="mt-12 flex items-center gap-6 text-white/50 text-xs tracking-wider uppercase">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  Miễn phí vận chuyển
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  Đổi trả 30 ngày
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  Thanh toán an toàn
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Men's Collection - Split with side banner */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Bộ sưu tập"
            title="Thời trang"
            highlight="Nam"
            subtitle="Phong cách lịch lãm cho quý ông hiện đại — từ công sở đến dạo phố."
            link="/men"
            linkText="Khám phá tất cả"
          />

          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Vertical banner */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="hidden lg:block relative rounded-3xl overflow-hidden min-h-[520px]"
            >
              <img
                src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=900&fit=crop&q=85"
                alt="Men's fashion"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <p className="text-[10px] tracking-[0.3em] uppercase text-amber-400 mb-2">
                  AW 2026
                </p>
                <h3 className="text-2xl font-bold mb-2 font-serif">Phong cách quý ông</h3>
                <p className="text-xs text-white/70 mb-4">Khám phá bộ sưu tập mới nhất</p>
                <Link to="/men" className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-medium border-b border-amber-400 pb-1 text-amber-400">
                  Xem ngay
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>

            {/* Products grid */}
            <div>
              {menLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {menProducts.slice(0, 4).map((product, index) => (
                    <motion.div key={product.id} variants={itemVariants}>
                      <ProductCard product={product} index={index} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Women's Collection - Mirrored split */}
      <section className="py-20 bg-amber-50/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Bộ sưu tập"
            title="Thời trang"
            highlight="Nữ"
            subtitle="Tinh tế, thanh lịch — những thiết kế tôn vinh vẻ đẹp phái đẹp."
            link="/women"
            linkText="Khám phá tất cả"
          />

          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            {/* Products grid */}
            <div>
              {womenLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {womenProducts.slice(0, 4).map((product, index) => (
                    <motion.div key={product.id} variants={itemVariants}>
                      <ProductCard product={product} index={index} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Vertical banner - right */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="hidden lg:block relative rounded-3xl overflow-hidden min-h-[520px]"
            >
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=900&fit=crop&q=85"
                alt="Women's fashion"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <p className="text-[10px] tracking-[0.3em] uppercase text-amber-400 mb-2">
                  AW 2026
                </p>
                <h3 className="text-2xl font-bold mb-2 font-serif">Bản sắc nữ tính</h3>
                <p className="text-xs text-white/70 mb-4">Khám phá bộ sưu tập mới nhất</p>
                <Link to="/women" className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-medium border-b border-amber-400 pb-1 text-amber-400">
                  Xem ngay
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Editorial Lookbook Strip + Stats */}
      <section className="py-0 bg-stone-950 relative overflow-hidden">
        {/* Top: side-by-side lookbook */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <Link to="/men" className="group relative h-[420px] md:h-[560px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&h=900&fit=crop&q=85"
              alt="Men lookbook"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
              <p className="text-[11px] tracking-[0.4em] uppercase text-amber-400 font-medium mb-3">
                Lookbook / 01
              </p>
              <h3 className="text-4xl md:text-5xl font-bold mb-3 font-serif leading-tight">
                Phong cách <br />
                <span className="italic text-amber-400">Quý ông</span>
              </h3>
              <p className="text-white/70 text-sm mb-5 max-w-sm">
                Khám phá bộ sưu tập thời trang nam với thiết kế tối giản, đường nét tinh tế.
              </p>
              <span className="inline-flex items-center gap-2 text-sm tracking-[0.3em] uppercase font-medium w-fit">
                Khám phá
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          <Link to="/women" className="group relative h-[420px] md:h-[560px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=900&fit=crop&q=85"
              alt="Women lookbook"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
              <p className="text-[11px] tracking-[0.4em] uppercase text-amber-400 font-medium mb-3">
                Lookbook / 02
              </p>
              <h3 className="text-4xl md:text-5xl font-bold mb-3 font-serif leading-tight">
                Bản sắc <br />
                <span className="italic text-amber-400">Phái đẹp</span>
              </h3>
              <p className="text-white/70 text-sm mb-5 max-w-sm">
                Những thiết kế nữ tính, thanh lịch — nơi vẻ đẹp được tôn vinh trọn vẹn.
              </p>
              <span className="inline-flex items-center gap-2 text-sm tracking-[0.3em] uppercase font-medium w-fit">
                Khám phá
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>
        </div>

        {/* Bottom: stats with amber dividers */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-0 md:divide-x md:divide-white/10">
            {[
              { value: '4.9', icon: Star, label: 'Đánh giá trung bình', isIcon: true },
              { value: '10,000+', label: 'Khách hàng tin tưởng' },
              { value: '500+', label: 'Sản phẩm chất lượng' },
              { value: '50+', label: 'Thương hiệu hàng đầu' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center flex-1 min-w-[180px] px-6 py-2"
              >
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  {stat.isIcon && <Star className="w-6 h-6 text-amber-400 fill-amber-400" />}
                  <span className="text-4xl md:text-5xl font-bold text-white font-serif">
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm text-white/50 tracking-wider uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessories Collection - 4 columns with section header */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Hoàn thiện phong cách"
            title="Phụ kiện"
            highlight="đẳng cấp"
            subtitle="Những phụ kiện tinh tế giúp hoàn thiện phong cách của bạn mỗi ngày."
            link="/accessories"
            linkText="Xem tất cả"
          />

          {accessoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {accessoriesProducts.slice(0, 4).map((product, index) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter - Editorial Style */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Frame */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 mb-8">
              <Gift className="w-7 h-7 text-amber-400" strokeWidth={1.5} />
            </div>

            <span className="block text-amber-400 text-xs tracking-[0.4em] uppercase font-medium mb-5">
              Cập nhật mới nhất
            </span>

            <h2
              className="text-4xl md:text-6xl font-bold text-white mb-5 font-serif"
              style={{ letterSpacing: '-0.02em', lineHeight: '1' }}
            >
              Trở thành <span className="italic text-amber-400">thành viên</span> LUXE
            </h2>
            <p className="text-white/60 text-base md:text-lg mb-10 max-w-xl mx-auto">
              Đăng ký ngay để nhận những bộ sưu tập giới hạn, ưu đãi độc quyền và câu chuyện thời trang mỗi tuần.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email của bạn..."
                className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all"
              />
              <button className="group px-8 py-4 rounded-full bg-amber-400 text-black font-semibold tracking-wider uppercase text-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-400/40">
                Đăng ký
                <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <p className="text-xs text-white/40 mt-6 tracking-wider">
              Bằng việc đăng ký, bạn đồng ý với chính sách bảo mật của LUXE.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
