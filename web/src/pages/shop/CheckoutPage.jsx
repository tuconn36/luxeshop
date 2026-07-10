import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Wallet, Copy, Check, Building2, Truck } from 'lucide-react';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { useCart } from '@/hooks/useCart.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { ordersAPI } from '@/lib/api.js';
import { PAYMENT_METHODS, getPaymentInfo } from '@/lib/paymentInfo.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

function PaymentMethodIcon({ method }) {
  if (method === 'bank') return <Building2 className="w-5 h-5" />;
  if (method === 'momo') return <Wallet className="w-5 h-5" />;
  return <Truck className="w-5 h-5" />;
}

function CopyButton({ value, label = 'Sao chép' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`Đã sao chép: ${value}`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép');
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-xs text-primary hover:underline flex items-center gap-1"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Đã sao chép' : label}
    </button>
  );
}

function PaymentDetails({ method }) {
  const info = getPaymentInfo(method);
  if (method === 'bank') {
    return (
      <div className="mt-4 rounded-lg border bg-muted/40 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 mt-0.5 text-primary shrink-0" />
          <div className="flex-1 space-y-2 text-sm">
            <p className="font-medium">{info.description}</p>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Ngân hàng:</span>
                <span className="font-medium text-right">{info.bankName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Chủ tài khoản:</span>
                <span className="font-medium text-right">{info.accountName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Số tài khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{info.accountNumber}</span>
                  <CopyButton value={info.accountNumber.replace(/\s/g, '')} label="STK" />
                </div>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Chi nhánh:</span>
                <span className="text-right">{info.branch}</span>
              </div>
              {info.swift && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">SWIFT:</span>
                  <span className="font-mono">{info.swift}</span>
                </div>
              )}
            </div>
            <p className="text-xs italic text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              {info.transferNote}
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (method === 'momo') {
    return (
      <div className="mt-4 rounded-lg border bg-muted/40 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Wallet className="w-5 h-5 mt-0.5 text-pink-600 shrink-0" />
          <div className="flex-1 space-y-2 text-sm">
            <p className="font-medium">{info.description}</p>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Tên tài khoản:</span>
                <span className="font-medium text-right">{info.momoName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Số điện thoại:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{info.momoPhone}</span>
                  <CopyButton value={info.momoPhone.replace(/\s/g, '')} label="SĐT" />
                </div>
              </div>
            </div>
            <p className="text-xs italic text-pink-700 bg-pink-50 border border-pink-200 rounded p-2">
              {info.transferNote}
            </p>
          </div>
        </div>
      </div>
    );
  }
  // COD hoặc mặc định
  return (
    <div className="mt-4 rounded-lg border bg-muted/40 p-4 space-y-2">
      <div className="flex items-start gap-3">
        <Truck className="w-5 h-5 mt-0.5 text-primary shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-medium mb-2">{info.description}</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
            {info.details.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingDistrict: '',
    paymentMethod: 'cod',
    notes: ''
  });

  // Đồng bộ thông tin người dùng khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        shippingName: prev.shippingName || currentUser.name || '',
        shippingPhone: prev.shippingPhone || currentUser.phone || '',
        shippingAddress: prev.shippingAddress || currentUser.address || '',
        shippingCity: prev.shippingCity || currentUser.city || '',
        shippingDistrict: prev.shippingDistrict || currentUser.district || ''
      }));
    }
  }, [currentUser]);

  const shippingFee = getTotalPrice() >= 500000 ? 0 : 30000;
  const total = getTotalPrice() + shippingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser?.id) {
      toast.error('Vui lòng đăng nhập để đặt hàng');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Map field names khớp với API: user_id, total_amount, shipping_address (object JSONB), payment_method, notes, items
      const orderItems = items.map((item) => ({
        id: item.id,
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        image: item.image
      }));

      const shippingAddress = {
        name: formData.shippingName,
        phone: formData.shippingPhone,
        address: formData.shippingAddress,
        city: formData.shippingCity,
        district: formData.shippingDistrict
      };

      const orderData = {
        user_id: currentUser.id,
        items: orderItems,
        total_amount: total,
        shipping_address: shippingAddress,
        payment_method: formData.paymentMethod,
        notes: formData.notes || ''
      };

      await ordersAPI.create(orderData);

      clearCart();
      toast.success('Đặt hàng thành công');
      navigate('/account/orders');
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect an toàn khi giỏ hàng rỗng
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
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

                  <div>
                    <Label className="mb-3 block">Phương thức thanh toán</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {PAYMENT_METHODS.map(({ value, label, shortLabel }) => (
                        <label
                          key={value}
                          className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                            formData.paymentMethod === value
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={value}
                            checked={formData.paymentMethod === value}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="accent-primary"
                          />
                          <PaymentMethodIcon method={value} />
                          <span className="text-sm font-medium">{shortLabel}</span>
                        </label>
                      ))}
                    </div>
                    <PaymentDetails method={formData.paymentMethod} />
                  </div>

                  <div>
                    <Label htmlFor="notes">Ghi chú</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                      className="text-foreground"
                    />
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