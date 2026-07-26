import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Clock, ChevronRight, Flame } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts.js';
import ProductCard from '@/components/shop/ProductCard.jsx';

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-[64px]">
      <div className="relative">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-black font-bold text-2xl md:text-3xl w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40">
          {String(value).padStart(2, '0')}
        </div>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-300 rounded-full animate-pulse" />
      </div>
      <span className="mt-2 text-[10px] tracking-[0.3em] uppercase text-white/60 font-medium">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col gap-1 pt-5">
      <div className="w-1 h-1 bg-amber-400 rounded-full" />
      <div className="w-1 h-1 bg-amber-400 rounded-full" />
    </div>
  );
}

export default function FlashSale() {
  // Countdown to end of day
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ hours, minutes, seconds });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch a few discount products
  const { products: saleProducts, loading } = useProducts(
    { is_featured: true },
    1,
    4
  );

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-amber-300">
              Flash Sale
            </span>
          </div>
          <h2
            className="text-4xl md:text-6xl font-bold text-white mb-2 font-serif"
            style={{ letterSpacing: '-0.02em', lineHeight: '1' }}
          >
            Giảm đến <span className="italic text-amber-400">50%</span>
          </h2>
          <p className="text-white/60 text-sm md:text-base">
            Cơ hội sở hữu những thiết kế đẳng cấp với mức giá không thể tốt hơn.
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400" />
          <span className="text-sm text-white/70 mr-2">Kết thúc trong</span>
          <div className="flex items-center gap-2">
            <CountdownUnit value={timeLeft.hours} label="Giờ" />
            <Separator />
            <CountdownUnit value={timeLeft.minutes} label="Phút" />
            <Separator />
            <CountdownUnit value={timeLeft.seconds} label="Giây" />
          </div>
        </div>
      </motion.div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl overflow-hidden h-[420px] animate-pulse" />
          ))}
        </div>
      ) : saleProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {saleProducts.slice(0, 4).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white/50">
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Sắp có deal sốc — quay lại sau nhé!</p>
        </div>
      )}

      {/* View all link */}
      {saleProducts.length > 0 && (
        <div className="text-center mt-10">
          <Link
            to="/products?sale=true"
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white/5 border border-white/20 text-white hover:bg-amber-400 hover:text-black hover:border-amber-400 transition-all duration-300"
          >
            <span className="text-sm tracking-[0.2em] uppercase font-medium">
              Xem tất cả ưu đãi
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}
