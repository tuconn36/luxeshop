import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useCart } from '@/hooks/useCart.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const record = await pb.collection('products').getOne(id, { $autoCancel: false });
        setProduct(record);
        
        if (record.sizes) {
          const sizesArray = record.sizes.split(',').map(s => s.trim());
          setSelectedSize(sizesArray[0]);
        }
        
        if (record.colors) {
          const colorsArray = record.colors.split(',').map(c => c.trim());
          setSelectedColor(colorsArray[0]);
        }
      } catch (err) {
        toast.error('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product, quantity, selectedSize, selectedColor);
    toast.success('Đã thêm vào giỏ hàng');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-4">Không tìm thấy sản phẩm</p>
            <Button onClick={() => navigate('/products')}>Quay lại</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const images = product.images || [];
  const sizes = product.sizes ? product.sizes.split(',').map(s => s.trim()) : [];
  const colors = product.colors ? product.colors.split(',').map(c => c.trim()) : [];

  return (
    <>
      <Helmet>
        <title>{`${product.name} - LUXE`}</title>
        <meta name="description" content={product.description || `Mua ${product.name} tại LUXE`} />
      </Helmet>
      
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-4">
              <img
                src={images[selectedImage] 
                  ? pb.files.getUrl(product, images[selectedImage])
                  : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={pb.files.getUrl(product, img, { thumb: '100x100' })}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4">
              <Badge variant="secondary" className="mb-2">{product.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-primary mb-6">
                {product.price.toLocaleString('vi-VN')}₫
              </p>
            </div>

            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Mô tả</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Kích cỡ</h2>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      onClick={() => setSelectedSize(size)}
                      className="min-w-[60px]"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Màu sắc</h2>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? 'default' : 'outline'}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Số lượng</h2>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
              </p>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 w-5 h-5" />
              Thêm vào giỏ hàng
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}