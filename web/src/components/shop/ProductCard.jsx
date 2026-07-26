import React, { useState, useRef, useEffect } from 'react';
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
  const hoverTimerRef = useRef(null);
  const cardRef = useRef(null);

  // Auto mở Quick View khi rê chuột 800ms (chỉ desktop, không phải touch)
  useEffect(() => {
    // Bỏ qua trên touch device
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
      return;
    }

    if (isHovered && !showQuickView) {
      hoverTimerRef.current = setTimeout(() => {
        setShowQuickView(true);
      }, 800);
    }

    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    };
  }, [isHovered, showQuickView]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const inWishlist = isInWishlist(product.id);

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.original_price) || null;

  const images = product.images || [];
  const imageUrl = safeImage(images[0]);

  // Build color swatches from product data
  const colorSwatches = (product.colors && product.colors.length > 0)
    ? product.colors.slice(0, 5).map((c) => (typeof c === 'string' ? { name: c, value: c } : c))
    : [];

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

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

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <>
      <motion.article
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative h-full"
      >
        <Link to={`/product/${product.id}`} className="block h-full">
          {/* Modern Glass Card */}
          <div className="relative flex flex-col h-full rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl ring-1 ring-neutral-200/60 hover:ring-amber-400/40 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(251,191,36,0.1)]">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-neutral-100">
              {/* Skeleton loader */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-100 animate-pulse" />
              )}

              {/* Primary image with smooth zoom */}
              <img
                src={imageUrl}
                alt={product.name}
                onLoad={() => setImageLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                  isHovered ? 'scale-110' : 'scale-100'
                } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* Glass gradient overlay on hover for button readability */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent transition-opacity duration-500 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Top-left glass chips */}
              <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
                {salePercent > 0 && (
                  <span className="inline-flex items-center bg-rose-500/95 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-rose-500/30">
                    -{salePercent}%
                  </span>
                )}
                {product.is_new && (
                  <span className="inline-flex items-center bg-white/70 backdrop-blur-md text-neutral-900 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/40 shadow-sm">
                    Mới
                  </span>
                )}
              </div>

              {/* Wishlist - top right, glass pill */}
              <button
                onClick={handleWishlist}
                aria-label={inWishlist ? 'Bỏ yêu thích' : 'Yêu thích'}
                className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-90 ${
                  inWishlist
                    ? 'bg-rose-500/95 text-white shadow-lg shadow-rose-500/40'
                    : 'bg-white/70 text-neutral-700 hover:bg-white hover:text-rose-500 border border-white/40 shadow-sm'
                }`}
              >
                <Heart
                  className={`w-[18px] h-[18px] ${inWishlist ? 'fill-current' : ''}`}
                  strokeWidth={2}
                />
              </button>

              {/* Centered floating add-to-cart button - glass */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAdd(product);
                }}
                disabled={isOutOfStock || adding}
                aria-label="Thêm vào giỏ"
                className={`absolute left-1/2 -translate-x-1/2 bottom-4 z-10 h-11 px-5 bg-white/90 backdrop-blur-md text-neutral-900 text-[13px] font-semibold rounded-full flex items-center gap-2 shadow-xl hover:bg-neutral-900 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/40 ${
                  isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
                }`}
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={2} />
                {adding ? 'Đang thêm' : 'Thêm vào giỏ'}
              </button>

              {/* Quick view - bottom right corner, glass - luôn hiện trên mobile, hover trên desktop */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowQuickView(true);
                }}
                aria-label="Xem nhanh"
                title="Xem nhanh"
                className={`absolute bottom-4 right-3 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-white/40 dark:border-neutral-700 shadow-sm flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-900 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white transition-all duration-300 ${
                  isHovered
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-3 pointer-events-none sm:opacity-0'
                }`}
              >
                <Eye className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-5">
              {/* Category eyebrow */}
              <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-[0.2em] mb-2">
                {product.category || 'LUXE'}
              </p>

              {/* Name */}
              <h3 className="text-[15px] font-semibold leading-snug text-neutral-900 line-clamp-2 min-h-[2.7em] group-hover:text-amber-600 transition-colors duration-300">
                {product.name}
              </h3>

              {/* Price row */}
              <div className="flex items-baseline gap-2 mt-3">
                <span className="price-value text-[18px] font-bold text-neutral-900">
                  {price.toLocaleString('vi-VN')}
                  <span className="text-[15px] font-semibold ml-0.5">₫</span>
                </span>
                {originalPrice && originalPrice > price && (
                  <span className="price-value text-[12px] text-neutral-400 line-through font-normal">
                    {originalPrice.toLocaleString('vi-VN')}₫
                  </span>
                )}
              </div>

              {/* Footer row: color + stock */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200/60">
                {/* Color swatches */}
                {colorSwatches.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    {colorSwatches.slice(0, 4).map((color, idx) => (
                      <span
                        key={idx}
                        title={color.name}
                        className="w-4 h-4 rounded-full border-2 border-white ring-1 ring-neutral-200 shadow-sm transition-transform hover:scale-110"
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                    {colorSwatches.length > 4 && (
                      <span className="text-[10px] text-neutral-500 ml-1 font-medium">
                        +{colorSwatches.length - 4}
                      </span>
                    )}
                  </div>
                ) : (
                  <span />
                )}

                {/* Stock indicator */}
                <div>
                  {isOutOfStock ? (
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                      Hết hàng
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-semibold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      Còn {product.stock}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Còn hàng
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>

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
