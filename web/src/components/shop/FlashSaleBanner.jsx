import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import CountdownTimer from './CountdownTimer.jsx';
import { productsAPI } from '@/lib/api.js';
import ProductCard from './ProductCard.jsx';

// Flash sale cứng — có thể thay bằng API sau
const FLASH_SALE = {
  endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 tiếng từ bây giờ
  discountPercent: 30,
  category: 'Nam',
};

export default function FlashSaleBanner() {
  const [products, setProducts] = useState([]);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    productsAPI.getList(1, 4, { category: FLASH_SALE.category })
      .then(data => setProducts((data.items || []).slice(0, 4)))
      .catch(() => {});
  }, []);

  if (ended || products.length === 0) return null;

  return (
    <section className="py-10 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-y border-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg shadow-red-200">
              <Zap className="w-5 h-5 fill-white" />
              <span className="font-bold text-lg uppercase tracking-wide">Flash Sale</span>
            </div>
            <span className="text-2xl font-black text-red-600">-{FLASH_SALE.discountPercent}%</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">Kết thúc sau:</span>
            <CountdownTimer endTime={FLASH_SALE.endTime} onEnd={() => setEnded(true)} />
          </div>

          <Link
            to={`/${FLASH_SALE.category === 'Nam' ? 'men' : FLASH_SALE.category === 'Nữ' ? 'women' : 'accessories'}`}
            className="text-sm font-semibold text-red-600 hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((p, i) => (
            <div key={p.id} className="relative">
              <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                -{FLASH_SALE.discountPercent}%
              </div>
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
