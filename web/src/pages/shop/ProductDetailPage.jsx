import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI, resolveAssetUrl } from '@/lib/api';
import { useCart } from '@/hooks/useCart.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useWishlist } from '@/contexts/WishlistContext.jsx';
import { Helmet } from 'react-helmet';
import {
  ChevronLeft, ChevronRight, Heart, ShoppingBag, Minus, Plus, Star,
  Truck, Shield, RotateCcw, ZoomIn, Zap, Tag, Package, Award,
  Share2, Facebook, Twitter, Link as LinkIcon, Copy,
  ChevronDown, Ruler, MapPin, Clock, Phone, Check, Sparkles,
  TrendingUp, Eye, ThumbsUp, MessageCircle, Loader2, X,
} from 'lucide-react';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReviewSection from '@/components/shop/ReviewSection.jsx';
import RelatedProducts from '@/components/shop/RelatedProducts.jsx';
import Lightbox from 'yet-another-react-lightbox';
import ErrorBoundary from '@/components/common/ErrorBoundary.jsx';

const SIZE_CHART = [
  { size: 'S',   chest: '86-90',  waist: '70-74',  height: '160-170' },
  { size: 'M',   chest: '90-94',  waist: '74-78',  height: '165-175' },
  { size: 'L',   chest: '94-98',  waist: '78-82',  height: '170-180' },
  { size: 'XL',  chest: '98-102', waist: '82-86',  height: '175-185' },
  { size: 'XXL', chest: '102-106',waist: '86-90',  height: '180-190' },
];

const FAQ_ITEMS = [
  { q: 'Sản phẩm có chính hãng không?', a: 'Tất cả sản phẩm tại LUXE đều là hàng chính hãng 100%, có hóa đơn VAT và tem bảo hành từ nhà sản xuất.' },
  { q: 'Thời gian giao hàng bao lâu?', a: 'Nội thành TP.HCM/Hà Nội: 1-2 ngày. Tỉnh thành khác: 2-4 ngày. Miễn phí ship cho đơn từ 500.000₫.' },
  { q: 'Chính sách đổi trả như thế nào?', a: 'Đổi trả miễn phí trong 7 ngày nếu sản phẩm còn nguyên tem mác, chưa qua sử dụng.' },
  { q: 'Có hỗ trợ trả góp không?', a: 'Có. Chúng tôi hỗ trợ trả góp 0% qua thẻ tín dụng hoặc công ty tài chính (Home Credit, FE Credit).' },
];

const COLORS = [
  { name: 'Đen', hex: '#1a1a1a' },
  { name: 'Xám than', hex: '#3a3a3a' },
  { name: 'Xanh navy', hex: '#1e3a5f' },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewStats, setReviewStats] = useState({ avgRating: 0, count: 0 });
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(0);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [openFaq, setOpenFaq] = useState(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const ctaRef = useRef(null);
  const tabsRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Không thể tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const v = Math.floor(Math.random() * 80) + 20;
    setViewCount(v);
  }, [id]);

  useEffect(() => {
    const onScroll = () => {
      if (ctaRef.current) {
        const rect = ctaRef.current.getBoundingClientRect();
        setShowStickyCta(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/30 to-orange-50/20">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-amber-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-amber-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-sm text-gray-500 font-medium">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-500 mb-6">Sản phẩm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            <ChevronLeft className="w-4 h-4" /> Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images || ['https://via.placeholder.com/600'];
  const resolvedImages = images.map((img) => resolveAssetUrl(img) || img);
  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;
  const savings = product.original_price && product.original_price > product.price
    ? product.original_price - product.price
    : 0;
  const maxQty = Math.max(1, Number(product.stock) || 1);
  const inWishlist = isInWishlist(product.id);
  const stockStatus = product.stock <= 0 ? 'out' : product.stock <= 5 ? 'low' : 'in';

  const handleSelectImage = (index) => setSelectedImage(index);
  const handlePrevImage = () => setSelectedImage((p) => (p === 0 ? resolvedImages.length - 1 : p - 1));
  const handleNextImage = () => setSelectedImage((p) => (p === resolvedImages.length - 1 ? 0 : p + 1));

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = delta > 0 ? prev + 1 : Math.max(1, prev - 1);
      return Math.min(next, maxQty);
    });
  };

  const handleToggleWishlist = async () => {
    await toggleWishlist(product.id);
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/signup');
      return;
    }
    if (!product || product.stock <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    try {
      setAddingToCart(true);
      addToCart(product, quantity);
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error('Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/signup');
      return;
    }
    if (!product || product.stock <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    try {
      setAddingToCart(true);
      addToCart(product, quantity);
      toast.success('Đang chuyển đến trang thanh toán...');
      setTimeout(() => navigate('/checkout'), 500);
    } catch (err) {
      console.error('Buy now error:', err);
      toast.error('Có lỗi xảy ra');
      setAddingToCart(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép liên kết');
  };

  const scrollToTabs = () => {
    setActiveTab('description');
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const productUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <Helmet>
        <title>{product.name} - LUXE Fashion House</title>
        <meta name="description" content={product.description?.slice(0, 155)} />
        <meta property="og:title" content={`${product.name} - LUXE`} />
        <meta property="og:description" content={product.description?.slice(0, 155)} />
        <meta property="og:image" content={resolvedImages[0]} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="VND" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.name} />
        <meta name="twitter:image" content={resolvedImages[0]} />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-white via-amber-50/10 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Enhanced breadcrumb */}
          <nav className="mb-6 text-sm flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="text-gray-500 hover:text-amber-700 transition-colors inline-flex items-center gap-1">
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link to="/products" className="text-gray-500 hover:text-amber-700 transition-colors">Sản phẩm</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            {product.category && (
              <>
                <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="text-gray-500 hover:text-amber-700 transition-colors">
                  {product.category}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </>
            )}
            <span className="text-amber-900 font-semibold truncate">{product.name}</span>
          </nav>

          {/* Top: Gallery + Info */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden group cursor-zoom-in shadow-sm"
                onClick={() => setLightboxOpen(true)}>
                <img
                  src={resolvedImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Discount badge */}
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-br from-red-500 to-red-600 text-white px-3.5 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    -{discount}%
                  </div>
                )}

                {/* Image counter */}
                {resolvedImages.length > 1 && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                    {selectedImage + 1} / {resolvedImages.length}
                  </div>
                )}

                {/* Wishlist */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleWishlist(); }}
                  className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    inWishlist
                      ? 'bg-red-500 text-white scale-110'
                      : 'bg-white/95 text-gray-600 hover:bg-red-500 hover:text-white hover:scale-110'
                  }`}
                  aria-label="Yêu thích"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                </button>

                {/* Nav arrows */}
                {resolvedImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      aria-label="Ảnh sau"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Zoom hint */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-3.5 h-3.5" /> Nhấn để phóng to
                </div>
              </div>

              {/* Thumbnails */}
              {resolvedImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {resolvedImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectImage(index)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-amber-600 shadow-md ring-2 ring-amber-200'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {selectedImage === index && (
                        <div className="absolute inset-0 bg-amber-600/10"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-5">
              {/* Brand & category */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-widest text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded">
                  {product.category || 'LUXE Collection'}
                </span>
                {product.brand && (
                  <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> {product.brand}
                  </span>
                )}
                <span className="text-xs text-gray-400 inline-flex items-center gap-1 ml-auto">
                  <Eye className="w-3.5 h-3.5" /> {viewCount} người đang xem
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(reviewStats.avgRating)
                            ? 'fill-amber-500 text-amber-500'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-base font-bold text-gray-900">
                    {reviewStats.avgRating > 0 ? reviewStats.avgRating.toFixed(1) : '0.0'}
                  </span>
                </div>
                <button
                  onClick={scrollToTabs}
                  className="text-sm text-gray-600 hover:text-amber-700 transition-colors underline-offset-4 hover:underline"
                >
                  ({reviewStats.count} đánh giá)
                </button>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-600">
                  Đã bán <span className="font-bold text-gray-900">{Math.max(0, (product.sold || Math.floor(Math.random() * 200) + 30))}</span>
                </span>
              </div>

              {/* Price card */}
              <div className="bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-50 border border-amber-200/60 rounded-2xl p-5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-bold text-amber-900">
                    {Number(product.price)?.toLocaleString('vi-VN')}₫
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        {Number(product.original_price)?.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">
                        Tiết kiệm {savings.toLocaleString('vi-VN')}₫
                      </span>
                    </>
                  )}
                </div>
                {discount > 0 && (
                  <p className="text-xs text-amber-800 mt-2 inline-flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Giá đã bao gồm VAT • Hỗ trợ trả góp 0%
                  </p>
                )}
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2">
                {stockStatus === 'in' && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Còn hàng
                  </span>
                )}
                {stockStatus === 'low' && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Chỉ còn {product.stock} sản phẩm
                  </span>
                )}
                {stockStatus === 'out' && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                    <X className="w-3.5 h-3.5" />
                    Hết hàng
                  </span>
                )}
                <span className="text-xs text-gray-500">| SKU: {product.sku || `LUXE-${product.id}`}</span>
              </div>

              {/* Color */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Màu sắc: <span className="text-gray-600 font-normal">{COLORS[selectedColor].name}</span>
                </p>
                <div className="flex gap-2">
                  {COLORS.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(i)}
                      className={`w-10 h-10 rounded-full border-2 transition-all relative ${
                        selectedColor === i
                          ? 'border-amber-600 scale-110 ring-2 ring-amber-200 ring-offset-2'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === i && (
                        <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">
                    Kích thước: <span className="text-gray-600 font-normal">{selectedSize}</span>
                  </p>
                  <button
                    onClick={() => setSizeChartOpen(true)}
                    className="text-xs text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-1"
                  >
                    <Ruler className="w-3.5 h-3.5" /> Bảng size
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {SIZE_CHART.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedSize(s.size)}
                      className={`min-w-[3rem] h-11 px-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                        selectedSize === s.size
                          ? 'border-amber-600 bg-amber-50 text-amber-900'
                          : 'border-gray-200 text-gray-700 hover:border-amber-300'
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="border-t pt-5">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">Số lượng:</span>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-2.5 hover:bg-gray-50 transition-colors disabled:opacity-40"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-14 text-center font-bold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-2.5 hover:bg-gray-50 transition-colors disabled:opacity-40"
                      disabled={quantity >= maxQty}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.stock > 0 ? `${product.stock} sản phẩm có sẵn` : 'Tạm hết hàng'}
                  </span>
                </div>
              </div>

              {/* CTA buttons */}
              <div ref={ctaRef} className="space-y-3 pt-2">
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="w-full h-14 text-base font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-200"
                  disabled={product.stock <= 0 || addingToCart}
                >
                  {addingToCart ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang xử lý...</>
                  ) : (
                    <><Zap className="w-5 h-5 mr-2 fill-current" /> Mua ngay</>
                  )}
                </Button>

                <div className="grid grid-cols-4 gap-2">
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    variant="outline"
                    className="col-span-3 h-12 border-2 border-amber-600 text-amber-700 hover:bg-amber-50 font-semibold"
                    disabled={product.stock <= 0 || addingToCart}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Thêm vào giỏ hàng
                  </Button>
                  <Button
                    onClick={handleToggleWishlist}
                    variant="outline"
                    size="lg"
                    className={`h-12 border-2 ${
                      inWishlist
                        ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border-gray-200 hover:border-red-300 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>

                {/* Share */}
                <div className="relative">
                  <button
                    onClick={() => setShareOpen(!shareOpen)}
                    className="w-full text-sm text-gray-600 hover:text-amber-700 font-medium inline-flex items-center justify-center gap-1.5 py-2 transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Chia sẻ sản phẩm
                  </button>
                  {shareOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 flex items-center gap-2 z-10">
                      <button onClick={handleCopyLink} className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors" title="Sao chép liên kết">
                        <Copy className="w-4 h-4" />
                      </button>
                      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Facebook">
                        <Facebook className="w-4 h-4" />
                      </a>
                      <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" className="p-2.5 hover:bg-sky-50 text-sky-600 rounded-lg transition-colors" title="Twitter">
                        <Twitter className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t">
                <div className="flex items-start gap-2.5 p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Truck className="w-4.5 h-4.5 text-blue-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">Free ship</p>
                    <p className="text-[11px] text-gray-600 leading-tight">Đơn từ 500K</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 bg-green-50/60 border border-green-100 rounded-xl">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Shield className="w-4.5 h-4.5 text-green-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">Bảo hành 30 ngày</p>
                    <p className="text-[11px] text-gray-600 leading-tight">Đổi mới miễn phí</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                  <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4.5 h-4.5 text-amber-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">Đổi trả 7 ngày</p>
                    <p className="text-[11px] text-gray-600 leading-tight">Không hỏi lý do</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 bg-purple-50/60 border border-purple-100 rounded-xl">
                  <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <Award className="w-4.5 h-4.5 text-purple-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">Chính hãng</p>
                    <p className="text-[11px] text-gray-600 leading-tight">100% authentic</p>
                  </div>
                </div>
              </div>

              {/* Shipping estimate */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">Giao hàng tới</p>
                    <p className="text-xs text-gray-600 mt-0.5">Hồ Chí Minh • Mặc định</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
                        <Clock className="w-3.5 h-3.5" /> Nhận hàng: T2–T3 (28–29/07)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-amber-800">Cần tư vấn? Gọi ngay</p>
                  <p className="text-base font-bold text-amber-900">1900 6868</p>
                </div>
                <MessageCircle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Tabs: Description / Specs / Guide / FAQ */}
          <div ref={tabsRef} className="mt-16 scroll-mt-20">
            <div className="border-b border-gray-200 flex gap-1 overflow-x-auto scrollbar-hide">
              {[
                { key: 'description', label: 'Mô tả sản phẩm' },
                { key: 'specs', label: 'Thông số' },
                { key: 'guide', label: 'Hướng dẫn sử dụng' },
                { key: 'faq', label: 'Câu hỏi thường gặp' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-amber-600 text-amber-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="py-8">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description || 'Sản phẩm cao cấp từ LUXE Fashion House, được thiết kế tinh tế với chất liệu nhập khẩu.'}
                  </p>

                  <div className="grid sm:grid-cols-3 gap-4 mt-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <TrendingUp className="w-6 h-6 text-amber-700 mb-2" />
                      <p className="font-bold text-gray-900 text-sm">Thiết kế tinh tế</p>
                      <p className="text-xs text-gray-600 mt-1">Đường nét cắt may chuẩn xác, form dáng hiện đại</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <Package className="w-6 h-6 text-amber-700 mb-2" />
                      <p className="font-bold text-gray-900 text-sm">Chất liệu cao cấp</p>
                      <p className="text-xs text-gray-600 mt-1">Vải nhập khẩu, thoáng mát, bền màu</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <Sparkles className="w-6 h-6 text-amber-700 mb-2" />
                      <p className="font-bold text-gray-900 text-sm">Dễ phối đồ</p>
                      <p className="text-xs text-gray-600 mt-1">Phù hợp nhiều dịp: công sở, dạo phố, sự kiện</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-3xl">
                  {[
                    ['Mã sản phẩm', product.sku || `LUXE-${product.id}`],
                    ['Danh mục', product.category || '—'],
                    ['Thương hiệu', product.brand || 'LUXE'],
                    ['Chất liệu', product.material || 'Cotton cao cấp'],
                    ['Xuất xứ', product.origin || 'Việt Nam'],
                    ['Kiểu dáng', product.style || 'Slim fit'],
                    ['Mùa phù hợp', 'Tất cả các mùa'],
                    ['Bảo hành', '30 ngày'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-gray-100 py-2">
                      <span className="text-sm text-gray-600">{k}</span>
                      <span className="text-sm font-semibold text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'guide' && (
                <div className="prose max-w-none text-gray-700 space-y-3">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">Hướng dẫn giặt ủi</h4>
                    <ul className="text-sm space-y-1 mt-2 list-disc pl-5">
                      <li>Giặt máy ở nhiệt độ tối đa 30°C</li>
                      <li>Không sử dụng chất tẩy có clo</li>
                      <li>Phơi nơi thoáng mát, tránh ánh nắng trực tiếp</li>
                      <li>Ủi ở nhiệt độ trung bình (150°C)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">Hướng dẫn bảo quản</h4>
                    <ul className="text-sm space-y-1 mt-2 list-disc pl-5">
                      <li>Treo trên móc gỗ chuyên dụng để giữ form dáng</li>
                      <li>Tránh ẩm mốc bằng túi hút ẩm trong tủ</li>
                      <li>Không để chung với quần áo dễ phai màu</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'faq' && (
                <div className="space-y-2 max-w-3xl">
                  {FAQ_ITEMS.map((item, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-sm text-gray-900">{item.q}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === i && (
                        <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-100 pt-3">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-8">
            <ErrorBoundary fallback={<div className="text-center py-8 text-gray-500">Không thể tải đánh giá</div>}>
              <ReviewSection productId={id} onStatsUpdate={setReviewStats} />
            </ErrorBoundary>
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <ErrorBoundary fallback={null}>
              <RelatedProducts category={product.category} currentId={product.id} />
            </ErrorBoundary>
          </div>
        </div>
      </main>

      {/* Sticky add-to-cart bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl transition-transform duration-300 ${
          showStickyCta ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <img src={resolvedImages[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-900 truncate">{product.name}</p>
            <p className="text-base font-bold text-amber-700">
              {Number(product.price)?.toLocaleString('vi-VN')}₫
            </p>
          </div>
          <Button
            onClick={handleAddToCart}
            variant="outline"
            className="hidden sm:inline-flex border-amber-600 text-amber-700 hover:bg-amber-50"
            disabled={product.stock <= 0}
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> Thêm giỏ
          </Button>
          <Button
            onClick={handleBuyNow}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            disabled={product.stock <= 0 || addingToCart}
          >
            <Zap className="w-4 h-4 mr-2 fill-current" /> Mua ngay
          </Button>
        </div>
      </div>

      {/* Size chart modal */}
      {sizeChartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSizeChartOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 inline-flex items-center gap-2">
                <Ruler className="w-5 h-5 text-amber-600" /> Bảng size
              </h3>
              <button onClick={() => setSizeChartOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-bold text-gray-900">Size</th>
                  <th className="text-left py-2 font-bold text-gray-900">Ngực (cm)</th>
                  <th className="text-left py-2 font-bold text-gray-900">Eo (cm)</th>
                  <th className="text-left py-2 font-bold text-gray-900">Cao (cm)</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.map((s) => (
                  <tr key={s.size} className={`border-b border-gray-100 ${selectedSize === s.size ? 'bg-amber-50' : ''}`}>
                    <td className="py-2.5 font-bold text-amber-700">{s.size}</td>
                    <td className="py-2.5 text-gray-700">{s.chest}</td>
                    <td className="py-2.5 text-gray-700">{s.waist}</td>
                    <td className="py-2.5 text-gray-700">{s.height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-4">
              💡 Mẹo: Nếu bạn ở giữa 2 size, hãy chọn size lớn hơn để thoải mái.
            </p>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={selectedImage}
        slides={resolvedImages.map((src) => ({ src }))}
        on={{ view: ({ index }) => setSelectedImage(index) }}
      />

      <Footer />
    </>
  );
}