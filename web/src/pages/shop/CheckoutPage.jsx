import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Wallet, Copy, Check, Building2, Truck, QrCode } from 'lucide-react';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { useCart } from '@/hooks/useCart.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { ordersAPI, paymentAPI } from '@/lib/api.js';
import { PAYMENT_METHODS, getPaymentInfo } from '@/lib/paymentInfo.js';
import { CITIES, getDistricts } from '@/lib/vietnamLocations.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VietQRModal from '@/components/shop/VietQRModal.jsx';
import { toast } from 'sonner';

function PaymentMethodIcon({ method }) {
  if (method === 'bank') return <Building2 className="w-5 h-5" />;
  if (method === 'momo') return <Wallet className="w-5 h-5" />;
  if (method === 'vietqr') return <QrCode className="w-5 h-5" />;
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
  if (method === 'vietqr') {
    return (
      <div className="mt-4 rounded-lg border bg-muted/40 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <QrCode className="w-5 h-5 mt-0.5 text-primary shrink-0" />
          <div className="flex-1 space-y-2 text-sm">
            <p className="font-medium">{info.description}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs pt-1">
              {info.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
            <p className="text-xs italic text-primary/80 bg-primary/5 border border-primary/20 rounded p-2">
              {info.transferNote}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Mã QR sẽ hiển thị ngay sau khi bạn đặt hàng. Hỗ trợ mọi ngân hàng nội địa VN.
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
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderJustSucceeded, setOrderJustSucceeded] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [qrOrder, setQrOrder] = useState(null); // {id, amount} khi user chọn QR
  const [formData, setFormData] = useState({
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingDistrict: '',
    paymentMethod: 'cod',
    notes: ''
  });

  // Update districts when city changes
  useEffect(() => {
    if (formData.shippingCity) {
      const districts = getDistricts(formData.shippingCity);
      setAvailableDistricts(districts);
      // Reset district if it's not in the new city's districts
      if (formData.shippingDistrict && !districts.includes(formData.shippingDistrict)) {
        setFormData((prev) => ({ ...prev, shippingDistrict: '' }));
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [formData.shippingCity, formData.shippingDistrict]);

  // Đồng bộ thông tin người dùng khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      // Parse shipping_address nếu là JSON string
      let savedAddress = {};
      if (currentUser.shipping_address) {
        try {
          savedAddress = typeof currentUser.shipping_address === 'string' 
            ? JSON.parse(currentUser.shipping_address)
            : currentUser.shipping_address;
        } catch (e) {
          console.error('Error parsing shipping address:', e);
        }
      }

      setFormData((prev) => ({
        ...prev,
        shippingName: prev.shippingName || savedAddress.name || currentUser.name || '',
        shippingPhone: prev.shippingPhone || savedAddress.phone || currentUser.phone || '',
        shippingAddress: prev.shippingAddress || savedAddress.address || currentUser.address || '',
        shippingCity: prev.shippingCity || savedAddress.city || currentUser.city || '',
        shippingDistrict: prev.shippingDistrict || savedAddress.district || currentUser.district || ''
      }));
    }
  }, [currentUser]);

  const shippingFee = getTotalPrice() >= 500000 ? 0 : 30000;
  const subtotal = getTotalPrice();
  const discount = appliedCoupon ? Math.min(appliedCoupon.discountAmount, subtotal * appliedCoupon.discountPercent / 100) : 0;
  const total = subtotal + shippingFee - discount;

  // Danh sách mã giảm giá mẫu (có thể lấy từ API sau)
  const availableCoupons = [
    { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 0, description: 'Giảm 10% cho đơn hàng đầu tiên' },
    { code: 'SAVE50K', type: 'fixed', value: 50000, minOrder: 500000, description: 'Giảm 50k cho đơn từ 500k' },
    { code: 'FREESHIP', type: 'shipping', value: 30000, minOrder: 0, description: 'Miễn phí vận chuyển' },
    { code: 'VIP100K', type: 'fixed', value: 100000, minOrder: 1000000, description: 'Giảm 100k cho đơn từ 1 triệu' },
  ];

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    setCouponLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const coupon = availableCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
      
      if (!coupon) {
        toast.error('Mã giảm giá không hợp lệ');
        setCouponLoading(false);
        return;
      }

      if (coupon.minOrder > subtotal) {
        toast.error(`Đơn hàng tối thiểu ${coupon.minOrder.toLocaleString('vi-VN')}₫ để áp dụng mã này`);
        setCouponLoading(false);
        return;
      }

      let discountAmount = 0;
      let discountPercent = 0;

      if (coupon.type === 'percent') {
        discountPercent = coupon.value;
        discountAmount = subtotal * coupon.value / 100;
      } else if (coupon.type === 'fixed') {
        discountAmount = coupon.value;
      } else if (coupon.type === 'shipping') {
        discountAmount = shippingFee;
      }

      setAppliedCoupon({
        ...coupon,
        discountAmount,
        discountPercent
      });
      toast.success(`Áp dụng mã giảm giá thành công! Giảm ${discountAmount.toLocaleString('vi-VN')}₫`);
      setCouponLoading(false);
    }, 500);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Đã xóa mã giảm giá');
  };

  const handleSaveAddress = async () => {
    if (!currentUser?.id) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    // Validate required fields
    if (!formData.shippingName || !formData.shippingPhone || !formData.shippingAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setSavingAddress(true);

    try {
      const shippingAddress = {
        name: formData.shippingName,
        phone: formData.shippingPhone,
        address: formData.shippingAddress,
        city: formData.shippingCity,
        district: formData.shippingDistrict
      };

      // Update user profile with shipping address using updateProfile from AuthContext
      // This will automatically sync with localStorage and AuthContext state
      await updateProfile({
        name: formData.shippingName,
        phone: formData.shippingPhone,
        shipping_address: shippingAddress
      });

      toast.success('Đã lưu thông tin giao hàng vào tài khoản');
    } catch (err) {
      console.error('Save address error:', err);
      toast.error('Không thể lưu thông tin. Vui lòng thử lại.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser?.id) {
      toast.error('Vui lòng đăng nhập để đặt hàng');
      navigate('/signup');
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
        notes: formData.notes || '',
        coupon_code: appliedCoupon?.code || null,
        discount_amount: discount || 0
      };

      const createdOrder = await ordersAPI.create(orderData);

      // QR: không xoá giỏ ngay, để user có thể đóng modal xem lại
      if (formData.paymentMethod === 'vietqr') {
        toast.success('Đặt hàng thành công! Vui lòng quét QR để thanh toán.');
        setQrOrder({ id: createdOrder.id, amount: total });
        return; // không clearCart / navigate, đợi user đóng modal
      }

      // Đánh dấu đã đặt hàng TRƯỚC khi clearCart để useEffect bỏ qua redirect
      setOrderJustSucceeded(true);
      clearCart();
      toast.success('Đặt hàng thành công');
      navigate('/account/orders', { replace: true });
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRModalClose = (open) => {
    if (!open && qrOrder) {
      setOrderJustSucceeded(true);
      clearCart();
      setQrOrder(null);
      navigate('/account/orders', { replace: true });
    }
  };

  // Redirect an toàn khi giỏ hàng rỗng — nhưng KHÔNG redirect nếu vừa đặt hàng xong
  useEffect(() => {
    if (items.length === 0 && !orderJustSucceeded) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate, orderJustSucceeded]);

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
                  <div className="flex items-center justify-between">
                    <CardTitle>Thông tin giao hàng</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveAddress}
                      disabled={savingAddress}
                      className="text-primary hover:text-primary"
                    >
                      {savingAddress ? 'Đang lưu...' : '💾 Lưu địa chỉ'}
                    </Button>
                  </div>
                  {currentUser && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Thông tin sẽ được tự động điền từ tài khoản của bạn
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="shippingName">Họ và tên *</Label>
                      {currentUser?.name && !formData.shippingName && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, shippingName: currentUser.name }))}
                          className="text-xs text-primary hover:underline"
                        >
                          Dùng tên tài khoản
                        </button>
                      )}
                    </div>
                    <Input
                      id="shippingName"
                      required
                      value={formData.shippingName}
                      onChange={(e) => setFormData({ ...formData, shippingName: e.target.value })}
                      className="text-foreground"
                      placeholder="Nhập họ tên người nhận"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="shippingPhone">Số điện thoại *</Label>
                      {currentUser?.phone && !formData.shippingPhone && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, shippingPhone: currentUser.phone }))}
                          className="text-xs text-primary hover:underline"
                        >
                          Dùng SĐT tài khoản
                        </button>
                      )}
                    </div>
                    <Input
                      id="shippingPhone"
                      type="tel"
                      required
                      value={formData.shippingPhone}
                      onChange={(e) => setFormData({ ...formData, shippingPhone: e.target.value })}
                      className="text-foreground"
                      placeholder="Nhập số điện thoại"
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
                      <Label htmlFor="shippingCity">Tỉnh / Thành phố</Label>
                      <select
                        id="shippingCity"
                        value={formData.shippingCity}
                        onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                        className="mt-1 w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">-- Chọn tỉnh/thành --</option>
                        {CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="shippingDistrict">Quận / Huyện</Label>
                      <select
                        id="shippingDistrict"
                        value={formData.shippingDistrict}
                        onChange={(e) => setFormData({ ...formData, shippingDistrict: e.target.value })}
                        disabled={!formData.shippingCity}
                        className="mt-1 w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Chọn quận/huyện --</option>
                        {availableDistricts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
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
                      <span className="font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span className="font-medium">
                        {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá ({appliedCoupon?.code})</span>
                        <span className="font-medium">-{discount.toLocaleString('vi-VN')}₫</span>
                      </div>
                    )}
                  </div>

                  {/* Coupon Section */}
                  <div className="border-t border-border pt-4">
                    <Label className="mb-2 block text-sm font-medium">Mã giảm giá</Label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-700">{appliedCoupon.code}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập mã giảm giá"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="text-foreground"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                        >
                          {couponLoading ? 'Đang xử lý...' : 'Áp dụng'}
                        </Button>
                      </div>
                    )}
                    
                    {/* Available Coupons */}
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">Mã giảm giá có sẵn:</p>
                      <div className="grid gap-2">
                        {availableCoupons.map(c => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCouponCode(c.code);
                              setTimeout(() => handleApplyCoupon(), 100);
                            }}
                            disabled={appliedCoupon?.code === c.code}
                            className={`text-left text-xs p-2 rounded border transition-colors ${
                              appliedCoupon?.code === c.code
                                ? 'bg-green-50 border-green-200 cursor-not-allowed'
                                : 'hover:bg-muted border-border'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-semibold text-primary">{c.code}</span>
                              {appliedCoupon?.code === c.code && (
                                <span className="text-green-600 text-xs">Đã áp dụng</span>
                              )}
                            </div>
                            <p className="text-muted-foreground mt-1">{c.description}</p>
                          </button>
                        ))}
                      </div>
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

      <VietQRModal
        open={!!qrOrder}
        onOpenChange={handleQRModalClose}
        orderId={qrOrder?.id}
        amount={qrOrder?.amount}
      />
    </>
  );
}