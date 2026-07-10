import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '@/hooks/useCart.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Quick View Modal Component
function QuickViewModal({ product, isOpen, onClose, onAddToCart }) {
  if (!product) return null;

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.original_price) || null;
  const images = product.images || [];
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!onAddToCart) return;
    try {
      setAdding(true);
      await onAddToCart(product);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative bg-muted/30 p-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white">
              <img
                src={images[selectedImage]?.startsWith('http') 
                  ? images[selectedImage] 
                  : `http://localhost:5000${images[selectedImage] || ''}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {product.is_new && (
                <Badge className="bg-black text-white">Mới</Badge>
              )}
              {originalPrice && originalPrice > price && (
                <Badge className="bg-red-500 text-white">
                  -{Math.round((1 - price / originalPrice) * 100)}%
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                {product.category || 'Thời trang cao cấp'}
              </p>
              <h2 className="text-2xl font-bold mt-1">{product.name}</h2>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(128 đánh giá)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {price.toLocaleString('vi-VN')}đ
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-lg text-muted-foreground line-through">
                  {originalPrice.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.description || 'Sản phẩm chất lượng cao, thiết kế tinh tế, phù hợp với mọi phong cách.'}
            </p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Còn hàng ({product.stock} sản phẩm)
                </span>
              ) : (
                <span className="text-sm text-red-500">Hết hàng</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAdd}
                disabled={product.stock <= 0 || adding}
                className="flex-1 bg-black hover:bg-gray-800 text-white"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t">
              <div className="text-center">
                <Truck className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Miễn phí vận chuyển</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Bảo hành 12 tháng</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Đổi trả 30 ngày</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [adding, setAdding] = useState(false);

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.original_price) || null;

  const images = product.images || [];
  let imageUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop';

  if (images.length > 0) {
    const firstImage = images[0];
    if (firstImage.startsWith('http')) {
      imageUrl = firstImage;
    } else if (firstImage.startsWith('/')) {
      imageUrl = `http://localhost:5000${firstImage}`;
    }
  }

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  // Hàm thêm vào giỏ dùng chung cho cả card và Quick View modal
  const handleAdd = async (prod) => {
    if (!prod || prod.stock <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }
    try {
      setAdding(true);
      addToCart(prod, 1);
      toast.success(`Đã thêm "${prod.name}" vào giỏ hàng`);
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error('Không thể thêm vào giỏ hàng');
    } finally {
      setAdding(false);
    }
  };

  const salePercent = originalPrice && originalPrice > price 
    ? Math.round((1 - price / originalPrice) * 100) 
    : 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative"
      >
        <Link to={`/product/${product.id}`}>
          <Card className="group overflow-hidden border-border bg-white hover:shadow-2xl transition-all duration-500 relative">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
              {/* Skeleton loader */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse" />
              )}
              
              <img
                src={imageUrl}
                alt={product.name}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isHovered ? 'scale-110' : 'scale-100'
                } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Action buttons */}
              <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
                isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: isHovered ? 1 : 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  onClick={handleWishlist}
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
                    isWishlisted 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/95 text-gray-600 hover:bg-red-500 hover:text-white shadow-lg'
                  }`}
                  aria-label="Yêu thích"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </motion.button>
                
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: isHovered ? 1 : 0 }}
                  transition={{ delay: 0.15, duration: 0.2 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowQuickView(true);
                  }}
                  className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-gray-600 hover:bg-primary hover:text-black transition-all duration-300 shadow-lg"
                  aria-label="Xem nhanh"
                >
                  <Eye className="w-5 h-5" />
                </motion.button>
              </div>
              
              {/* Add to cart button */}
              <motion.div 
                className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${
                  isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAdd(product);
                  }}
                  disabled={product.stock <= 0 || adding}
                  className="w-full py-3 bg-black/95 backdrop-blur-md text-white rounded-xl flex items-center justify-center gap-2 hover:bg-primary hover:text-black transition-all duration-300 font-medium shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Thêm vào giỏ
                </button>
              </motion.div>
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.is_new && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Badge className="bg-black/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 uppercase tracking-wider shadow-lg">
                      ✨ Mới
                    </Badge>
                  </motion.div>
                )}
                {product.is_featured && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Badge className="bg-primary/90 backdrop-blur-md text-black text-[11px] font-semibold px-2.5 py-1 uppercase tracking-wider shadow-lg">
                      Nổi bật
                    </Badge>
                  </motion.div>
                )}
              </div>
              
              {/* Sale Badge */}
              {salePercent > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="absolute top-3 right-14"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex flex-col items-center justify-center text-white shadow-xl shadow-red-500/30">
                    <span className="text-[9px] font-bold leading-none">GIẢM</span>
                    <span className="text-sm font-bold leading-none">{salePercent}%</span>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Content */}
            <CardContent className="p-4 space-y-3">
              {/* Category */}
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {product.category || 'Thời trang'}
              </p>
              
              {/* Name */}
              <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300 min-h-[2.5rem]">
                {product.name}
              </h3>
              
              {/* Price & Stock */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-primary tracking-tight">
                    {price.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-sm font-medium text-primary">đ</span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-sm text-muted-foreground line-through ml-1">
                      {originalPrice.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>
                
                {product.stock > 0 ? (
                  <span className="text-xs text-green-600 flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Còn hàng
                  </span>
                ) : (
                  <span className="text-xs text-red-500 flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    Hết hàng
                  </span>
                )}
              </div>
              
              {/* Color swatches */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex -space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-black border-2 border-white ring-1 ring-gray-200"></span>
                  <span className="w-5 h-5 rounded-full bg-white border-2 border-gray-200"></span>
                  <span className="w-5 h-5 rounded-full bg-amber-700 border-2 border-white ring-1 ring-gray-200"></span>
                </div>
                <span className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 5) + 2} màu</span>
              </div>
              
              {/* Low stock warning */}
              {product.stock > 0 && product.stock <= 5 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  Sắp hết hàng - Chỉ còn {product.stock} sản phẩm
                </motion.div>
              )}
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={setShowQuickView}
        onAddToCart={handleAdd}
      />
    </>
  );
}
