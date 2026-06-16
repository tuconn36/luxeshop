import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useCart } from '@/hooks/useCart.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shippingName: currentUser?.name || '',
    shippingPhone: currentUser?.phone || '',
    shippingAddress: currentUser?.address || '',
    shippingCity: currentUser?.city || '',
    shippingDistrict: currentUser?.district || ''
  });

  const shippingFee = getTotalPrice() >= 500000 ? 0 : 30000;
  const total = getTotalPrice() + shippingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        userId: currentUser.id,
        totalPrice: total,
        status: 'Chờ xác nhận',
        ...formData
      };

      const order = await pb.collection('orders').create(orderData, { $autoCancel: false });

      for (const item of items) {
        await pb.collection('orderItems').create({
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }, { $autoCancel: false });
      }

      clearCart();
      toast.success('Đặt hàng thành công');
      navigate('/orders');
    } catch (err) {
      toast.error('Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Thanh toán - LUXE</title>
        <meta name="description" content="Hoàn tất đơn hàng của bạn" />
      </Helmet>
      
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ letterSpacing: '-0.02em' }}>
          Thanh toán
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin giao hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shippingName">Họ và tên *</Label>
                    <Input
                      id="shippingName"
                      required
                      value={formData.shippingName}
                      onChange={(e) => setFormData({ ...formData, shippingName: e.target.value })}
                      className="text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shippingPhone">Số điện thoại *</Label>
                    <Input
                      id="shippingPhone"
                      type="tel"
                      required
                      value={formData.shippingPhone}
                      onChange={(e) => setFormData({ ...formData, shippingPhone: e.target.value })}
                      className="text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shippingAddress">Địa chỉ *</Label>
                    <Input
                      id="shippingAddress"
                      required
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                      className="text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shippingCity">Thành phố</Label>
                      <Input
                        id="shippingCity"
                        value={formData.shippingCity}
                        onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                        className="text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="shippingDistrict">Quận/Huyện</Label>
                      <Input
                        id="shippingDistrict"
                        value={formData.shippingDistrict}
                        onChange={(e) => setFormData({ ...formData, shippingDistrict: e.target.value })}
                        className="text-foreground"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Đơn hàng của bạn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="font-medium">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-medium">{getTotalPrice().toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span className="font-medium">
                        {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold">Tổng cộng</span>
                      <span className="text-2xl font-bold text-primary">
                        {total.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </>
  );
}