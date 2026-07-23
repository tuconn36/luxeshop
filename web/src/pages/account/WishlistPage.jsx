import React from 'react';
import { useWishlist } from '@/contexts/WishlistContext.jsx';
import ProductCard from '@/components/shop/ProductCard.jsx';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, loading } = useWishlist();

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold mb-2">Chưa có sản phẩm yêu thích</h2>
        <p className="text-muted-foreground mb-6">
          Nhấn vào icon trái tim để lưu sản phẩm bạn thích
        </p>
        <a
          href="/products"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Khám phá sản phẩm
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-center uppercase tracking-widest mb-8">
        Sản phẩm yêu thích ({wishlist.length})
      </h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
