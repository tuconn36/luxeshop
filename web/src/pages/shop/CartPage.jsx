import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import CartItem from '@/components/shop/CartItem.jsx';
import { useCart } from '@/hooks/useCart.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatVND } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const shippingFee = getTotalPrice() >= 500000 ? 0 : 30000;
  const total = getTotalPrice() + shippingFee;

  const handleCheckout = () => {
    if (!currentUser) {
      navigate('/signup?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <>
      <Helmet>
        <title>Giỏ hàng - LUXE</title>
        <meta name="description" content="Xem giỏ hàng của bạn tại LUXE" />
      </Helmet>
      
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ letterSpacing: '-0.02em' }}>
          Giỏ hàng
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-4">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <Link to="/products">
              <Button size="lg">Khám phá sản phẩm</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <CartItem
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{formatVND(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span className="font-medium">
                      {shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}
                    </span>
                  </div>
                  {getTotalPrice() < 500000 && (
                    <p className="text-xs text-muted-foreground">
                      Mua thêm {formatVND(500000 - getTotalPrice())} để được miễn phí vận chuyển
                    </p>
                  )}
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold">Tổng cộng</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatVND(total)}
                      </span>
                    </div>
                    <Button size="lg" className="w-full" onClick={handleCheckout}>
                      Thanh toán
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}