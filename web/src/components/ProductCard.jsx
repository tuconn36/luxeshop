import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProductCard({ product, index = 0 }) {
  const imageUrl = product.images?.[0] 
    ? pb.files.getUrl(product, product.images[0], { thumb: '300x300' })
    : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=300&fit=crop';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.id}`}>
        <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="aspect-square overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-base leading-snug line-clamp-2">
                {product.name}
              </h3>
              <Badge variant="secondary" className="ml-2 shrink-0">
                {product.category}
              </Badge>
            </div>
            <p className="text-primary font-bold text-lg">
              {product.price.toLocaleString('vi-VN')}₫
            </p>
            {product.stock > 0 ? (
              <p className="text-xs text-muted-foreground mt-1">
                Còn {product.stock} sản phẩm
              </p>
            ) : (
              <p className="text-xs text-destructive mt-1">
                Hết hàng
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}