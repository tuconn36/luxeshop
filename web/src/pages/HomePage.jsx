import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Truck } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ProductCard from '@/components/ProductCard.jsx';
import { useProducts } from '@/hooks/useProducts.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const { products: featuredProducts, loading: featuredLoading } = useProducts({}, 1, 6);
  const { products: kidsProducts, loading: kidsLoading } = useProducts({ category: 'Trẻ em' }, 1, 4);

  return (
    <>
      <Helmet>
        <title>LUXE - Thời trang cao cấp</title>
        <meta name="description" content="Khám phá bộ sưu tập thời trang cao cấp dành cho nam, nữ và trẻ em tại LUXE. Phong cách hiện đại, chất lượng vượt trội." />
      </Helmet>
      
      <Header />

      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1656042744506-1d3c6e2b013e"
            alt="Luxury fashion collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight" style={{ letterSpacing: '-0.02em' }}>
              Định nghĩa phong cách<br />của riêng bạn
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Bộ sưu tập thời trang cao cấp cho những ai yêu thích sự tinh tế
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/products">
                <Button size="lg" className="text-base px-8">
                  Khám phá ngay
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/products?category=Nam">
                <Button size="lg" variant="outline" className="text-base px-8 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  Bộ sưu tập Nam
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center h-full">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Chất lượng cao cấp</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Sản phẩm được tuyển chọn kỹ lưỡng từ các thương hiệu uy tín
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="text-center h-full">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Giao hàng nhanh</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Miễn phí vận chuyển cho đơn hàng trên 500.000₫
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="text-center h-full">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Đổi trả dễ dàng</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Chính sách đổi trả trong vòng 30 ngày
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
              Sản phẩm nổi bật
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Khám phá những món đồ được yêu thích nhất
            </p>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg">
                Xem tất cả sản phẩm
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-secondary text-secondary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ letterSpacing: '-0.02em' }}>
                Thời trang Nam
              </h2>
              <p className="text-lg leading-relaxed mb-6 opacity-90">
                Bộ sưu tập dành cho phái mạnh với thiết kế hiện đại, lịch lãm và sang trọng
              </p>
              <Link to="/products?category=Nam">
                <Button size="lg" variant="outline" className="border-secondary-foreground/20 hover:bg-secondary-foreground/10">
                  Khám phá ngay
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="aspect-square rounded-2xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&h=600&fit=crop"
                alt="Men's fashion collection"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="aspect-square rounded-2xl overflow-hidden order-2 md:order-1"
            >
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop"
                alt="Women's fashion collection"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 md:order-2"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ letterSpacing: '-0.02em' }}>
                Thời trang Nữ
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Bộ sưu tập dành cho phái đẹp với phong cách thanh lịch, quyến rũ và đầy cá tính
              </p>
              <Link to="/products?category=Nữ">
                <Button size="lg">
                  Khám phá ngay
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
                Sản phẩm trẻ em nổi bật
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Phong cách đáng yêu và thoải mái cho bé
              </p>
            </div>
            <Link to="/products?category=Trẻ em">
              <Button size="lg" variant="outline" className="shrink-0 bg-background">
                Xem thêm
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {kidsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={`skeleton-${i}`} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kidsProducts.map((product, index) => (
                <ProductCard key={`kids-${product.id}`} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}