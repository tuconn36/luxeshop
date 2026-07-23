import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Eye,
  Star,
  Truck,
  Shield,
  Plus,
  Minus,
  Share2,
  GitCompareArrows,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useWishlist } from '@/contexts/WishlistContext.jsx';
import { useCompare } from '@/contexts/CompareContext.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { resolveAssetUrl } from '@/lib/api';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop';

const safeImage = (img) => {
  const url = resolveAssetUrl(img);
  return url || PLACEHOLDER_IMAGE;
};

// 3 tiện ích hiển thị khi bấm vào biểu tượng con mắt
const QUICK_VIEW_FEATURES = [
  {
    key: 'wishlist',
    label: 'Yêu thích',
    description: 'Lưu vào danh sách',
    icon: Heart,
    requiresAuth: true,
  },
  {
    key: 'compare',
    label: 'So sánh',
    description: 'Đặt cạnh sản phẩm khác',
    icon: GitCompareArrows,
    requiresAuth: false,
  },
  {
    key: 'share',
    label: 'Chia sẻ',
    description: 'Sao chép liên kết',
    icon: Share2,
    requiresAuth: false,
  },
];

// Quick View Modal Component
function QuickViewModal({ product, isOpen, onClose, onAddToCart }) {
  if (!product) return null;

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.original_price) || null;
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [PLACEHOLDER_IMAGE];
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  // Build color options from product data or fallback
  const colorOptions = (product.colors && product.colors.length > 0)
    ? product.colors
    : [
        { name: 'Đen', value: '#000000' },
        { name: 'Trắng', value: '#FFFFFF' },
        { name: 'Nâu', value: '#92400E' },
        { name: 'Be', value: '#D6BC8A' },
      ];

  // Build size options from product data or fallback
  const sizeOptions = (product.sizes && product.sizes.length > 0)
    ? product.sizes
    : ['S', 'M', 'L', 'XL'];

  const handleAdd = async () => {
    if (!onAddToCart) return;
    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error('Vui lòng chọn kích thước');
      return;
    }
    try {
      setAdding(true);
      await onAddToCart(product, quantity);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error('Vui lòng chọn kích thước');
      return;
    }
    try {
      setBuying(true);
      if (onAddToCart) await onAddToCart(product, quantity);
      onClose(false);
      window.location.href = '/checkout';
    } catch (err) {
      console.error('Buy now error:', err);
    } finally {
      setBuying(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${product.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description || product.name,
          url,
        });
        setShareCopied(true);
        toast.success('Đã chia sẻ sản phẩm');
        setTimeout(() => setShareCopied(false), 2000);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      toast.success('Đã sao chép liên kết sản phẩm');
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleWishlistToggle = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để lưu sản phẩm');
      onClose(false);
      navigate('/login');
      return;
    }
    await toggleWishlist(product.id);
  };

  const handleCompareToggle = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    addToCompare(product);
  };

  const runFeatureAction = (key) => (e) => {
    if (key === 'wishlist') return handleWishlistToggle(e);
    if (key === 'compare') return handleCompareToggle(e);
    if (key === 'share') return handleShare(e);
  };

  const decreaseQty = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const increaseQty = () => {
    const max = Number(product.stock) || 99;
    setQuantity((q) => Math.min(max, q + 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogTitle className="sr-only">{product.name || 'Xem nhanh sản phẩm'}</DialogTitle>
        <DialogDescription className="sr-only">Xem nhanh chi tiết sản phẩm</DialogDescription>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative bg-muted/30 p-4 flex gap-3">
            {/* Thumbnail column */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === idx
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={safeImage(img)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-white">
                <img
                  src={safeImage(images[selectedImage])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                />
              </div>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
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
          </div>

          {/* Product Info */}
          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
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
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-green-600">Đã bán 1.2k</span>
            </div>

              {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap bg-primary/5 px-4 py-3 rounded-xl">
              <span className="text-3xl font-bold text-primary">
                {price.toLocaleString('vi-VN')}₫
              </span>
              {originalPrice && originalPrice > price && (
                <>
                  <span className="text-base text-muted-foreground line-through">
                    {originalPrice.toLocaleString('vi-VN')}₫
                  </span>
                  <Badge className="bg-red-500 text-white text-xs">
                    -{Math.round((1 - price / originalPrice) * 100)}%
                  </Badge>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
              {product.description || 'Sản phẩm chất liệu cao cấp, thiết kế tinh tế, phù hợp với mọi phong cách thời trang.'}
            </p>

            {/* Color */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Màu sắc:</span>
                <span className="text-sm text-muted-foreground">
                  {colorOptions[selectedColor]?.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(idx)}
                    title={color.name}
                    aria-label={color.name}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      selectedColor === idx
                        ? 'border-primary scale-110 ring-2 ring-primary/30'
                        : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Kích thước:</span>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                >
                  Hướng dẫn chọn size
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-10 px-3 rounded-lg border text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-black'
                        : 'border-gray-300 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <span className="text-sm font-medium block mb-2">Số lượng:</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={decreaseQty}
                    disabled={quantity <= 1}
                    className="w-9 h-9 flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
                      const max = Number(product.stock) || 99;
                      if (Number.isNaN(val)) return;
                      setQuantity(Math.min(max, Math.max(1, val)));
                    }}
                    className="w-12 h-9 text-center text-sm font-medium border-x outline-none"
                  />
                  <button
                    type="button"
                    onClick={increaseQty}
                    disabled={quantity >= (Number(product.stock) || 99)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock > 0
                    ? `Còn ${product.stock} sản phẩm`
                    : 'Hết hàng'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAdd}
                disabled={product.stock <= 0 || adding}
                variant="outline"
                className="flex-1 border-black bg-white text-black hover:bg-black hover:text-white"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={product.stock <= 0 || buying}
                className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold"
              >
                {buying ? 'Đang xử lý...' : 'Mua ngay'}
              </Button>
            </div>

            {/* Tiện ích nhanh - hiển thị khi bấm vào con mắt */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/60">
              {QUICK_VIEW_FEATURES.map((feature) => {
                const Icon = feature.icon;
                const isActive =
                  (feature.key === 'wishlist' && inWishlist) ||
                  (feature.key === 'compare' && inCompare) ||
                  (feature.key === 'share' && shareCopied);
                const stateColor =
                  feature.key === 'wishlist' && inWishlist
                    ? 'bg-red-50 text-red-500 border-red-200'
                    : feature.key === 'compare' && inCompare
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : feature.key === 'share' && shareCopied
                        ? 'bg-green-50 text-green-600 border-green-200'
                        : 'bg-muted/40 text-foreground/80 border-transparent hover:bg-muted hover:text-primary';
                const subLabel =
                  feature.key === 'wishlist' && inWishlist
                    ? 'Đã lưu'
                    : feature.key === 'compare' && inCompare
                      ? 'Đã thêm'
                      : feature.key === 'share' && shareCopied
                        ? 'Đã sao chép'
                        : feature.description;

                return (
                  <button
                    key={feature.key}
                    type="button"
                    onClick={runFeatureAction(feature.key)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${stateColor}`}
                    aria-label={feature.label}
                    aria-pressed={isActive}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        feature.key === 'wishlist' && inWishlist ? 'fill-current' : ''
                      }`}
                    />
                    <span className="text-xs font-semibold">{feature.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight text-center">
                      {subLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Link to full details */}
            <div className="flex items-center justify-center pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose(false);
                  window.location.href = `/product/${product.id}`;
                }}
                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                <Eye className="w-4 h-4" />
                Xem chi tiết sản phẩm
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t">
              <div className="text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Truck className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Miễn phí vận chuyển</p>
                <p className="text-[10px] text-muted-foreground">Đơn từ 500k</p>
              </div>
              <div className="text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <MessageCircle className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Hỗ trợ 24/7</p>
                <p className="text-[10px] text-muted-foreground">Tư vấn miễn phí</p>
              </div>
              <div className="text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Shield className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Bảo hành 12 tháng</p>
                <p className="text-[10px] text-muted-foreground">Đổi trả 30 ngày</p>
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
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [adding, setAdding] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.original_price) || null;

  const images = product.images || [];
  const imageUrl = safeImage(images[0]);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  // Hàm thêm vào giỏ dùng chung cho cả card và Quick View modal
  const handleAdd = async (prod, qty = 1) => {
    if (!prod || prod.stock <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/signup');
      return;
    }
    try {
      setAdding(true);
      addToCart(prod, qty);
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
                    inWishlist
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/95 text-gray-600 hover:bg-red-500 hover:text-white shadow-lg'
                  }`}
                  aria-label="Yêu thích"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
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
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-0.5 flex-wrap">
                  <span className="text-xl font-bold text-primary tracking-tight">
                    {price.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-sm font-medium text-primary">₫</span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-sm text-muted-foreground line-through ml-2 whitespace-nowrap">
                      {originalPrice.toLocaleString('vi-VN')}₫
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
