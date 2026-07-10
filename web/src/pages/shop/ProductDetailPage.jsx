import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '@/lib/api';
import { useCart } from '@/hooks/useCart.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Helmet } from 'react-helmet';
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, Minus, Plus, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Không tìm thấy sản phẩm</h2>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">Quay về trang chủ</Link>
        </div>
      </div>
    );
  }

  const images = product.images || ['https://via.placeholder.com/600'];
  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;
  const maxQty = Math.max(1, Number(product.stock) || 1);

  const handleSelectImage = (index) => {
    setSelectedImage(index);
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = delta > 0 ? prev + 1 : Math.max(1, prev - 1);
      return Math.min(next, maxQty);
    });
  };

  const handleToggleWishlist = () => {
    setIsWishlisted((prev) => !prev);
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
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

  return (
    <>
      <Helmet>
        <title>{product.name} - LUXE</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">Trang chủ</Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to="/products" className="text-muted-foreground hover:text-primary">Sản phẩm</Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{discount}%
                  </div>
                )}
                <button
                  onClick={handleToggleWishlist}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isWishlisted ? 'bg-primary text-black' : 'bg-white/90 text-gray-600 hover:bg-primary hover:text-black'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectImage(index)}
                      className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-wider">
                  {product.category}
                </span>
                <h1 className="text-3xl font-bold mt-2">{product.name}</h1>

                <div className="flex items-center gap-2 mt-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(0 đánh giá)</span>
                </div>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {Number(product.price)?.toLocaleString('vi-VN')}đ
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {Number(product.original_price)?.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              <div className="border-t pt-6">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Số lượng:</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-2 hover:bg-muted transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-2 hover:bg-muted transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1"
                  disabled={product.stock <= 0 || addingToCart}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                </Button>
                <Button
                  onClick={handleToggleWishlist}
                  variant="outline"
                  size="lg"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>

              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Truck className="w-5 h-5" />
                  <span>Miễn phí giao hàng cho đơn từ 500K</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="w-5 h-5" />
                  <span>Bảo hành 30 ngày</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <RotateCcw className="w-5 h-5" />
                  <span>Đổi trả trong 7 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}