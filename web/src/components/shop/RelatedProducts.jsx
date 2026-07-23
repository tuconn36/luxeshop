import React, { useEffect, useState } from 'react';
import { productsAPI } from '@/lib/api.js';
import ProductCard from './ProductCard.jsx';

export default function RelatedProducts({ category, currentId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!category) return;
    productsAPI.getList(1, 4, { category })
      .then(data => {
        const items = (data.items || []).filter(p => p.id !== parseInt(currentId));
        setProducts(items.slice(0, 4));
      })
      .catch(() => {});
  }, [category, currentId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-16 border-t pt-12">
      <h2 className="text-2xl font-bold mb-8">Sản phẩm liên quan</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}
