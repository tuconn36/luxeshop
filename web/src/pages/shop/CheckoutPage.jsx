import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Copy, Check, Building2, Truck, QrCode, ShieldCheck,
  ChevronRight, ChevronLeft, MapPin, User, Phone, FileText,
  CreditCard, Gift, Tag, Lock, Sparkles, AlertCircle, Plus,
  Home, Briefcase, Trash2, Edit3, X, Loader2, Package
} from 'lucide-react';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { useCart } from '@/hooks/useCart.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { ordersAPI } from '@/lib/api.js';
import { PAYMENT_METHODS, getPaymentInfo } from '@/lib/paymentInfo.js';
import { CITIES, getDistricts } from '@/lib/vietnamLocations.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import VietQRModal from '@/components/shop/VietQRModal.jsx';
import { toast } from 'sonner';

/* ────────────────────────────────────────────────────────────────
 *  HELPERS
 * ──────────────────────────────────────────────────────────────── */
const fmtVND = (n) => `${(Number(n) || 0).toLocaleString('vi-VN')}₫`;

const PHONE_RE = /^(0|\+84)[3-9][0-9]{8}$/;

const validateForm = (data) => {
  const errors = {};
  if (!data.shippingName.trim()) errors.shippingName = 'Vui lòng nhập họ tên';
  else if (data.shippingName.trim().length < 2) errors.shippingName = 'Họ tên quá ngắn';

  if (!data.shippingPhone.trim()) errors.shippingPhone = 'Vui lòng nhập số điện thoại';
  else if (!PHONE_RE.test(data.shippingPhone.replace(/\s/g, '')))
    errors.shippingPhone = 'Số điện thoại không hợp lệ (VD: 0912345678)';

  if (!data.shippingAddress.trim()) errors.shippingAddress = 'Vui lòng nhập địa chỉ';
  else if (data.shippingAddress.trim().length < 5) errors.shippingAddress = 'Địa chỉ quá ngắn';

  return errors;
};

/* ────────────────────────────────────────────────────────────────
 *  STEPPER
 * ──────────────────────────────────────────────────────────────── */
function Stepper({ currentStep }) {
  const steps = [
    { id: 1, label: 'Thông tin', icon: User },
    { id: 2, label: 'Thanh toán', icon: CreditCard },
    { id: 3, label: 'Xác nhận', icon: Check },
  ];

  return (
    <div className="flex items-center justify-center mb-10 px-4">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isDone = currentStep > step.id;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone
                    ? 'bg-green-600 text-white shadow-md'
                    : isActive
                    ? 'bg-amber-600 text-white shadow-md ring-4 ring-amber-100'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`mt-2 text-xs sm:text-sm font-medium transition-colors ${
                  isActive ? 'text-amber-700' : isDone ? 'text-green-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 sm:mx-4 rounded transition-colors duration-300 mb-6 ${
                  currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  SAVED ADDRESS CARD
 * ──────────────────────────────────────────────────────────────── */
function SavedAddressCard({ address, selected, onSelect, onDelete }) {
  const Icon = address.tag === 'home' ? Home : address.tag === 'work' ? Briefcase : MapPin;
  return (
    <button
      type="button"
      onClick={() => onSelect(address)}
      className={`group relative w-full text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-amber-600 bg-amber-50/50 shadow-sm'
          : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            selected ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{address.name}</span>
            <span className="text-xs text-muted-foreground">• {address.phone}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {address.address}, {address.district}, {address.city}
          </p>
        </div>
        {selected && (
          <div className="absolute top-3 right-3 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(address.id);
            }}
            className="opacity-0 group-hover:opacity-100 absolute bottom-3 right-3 text-xs text-red-600 hover:underline"
          >
            Xóa
          </button>
        )}
      </div>
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  COPY BUTTON
 * ──────────────────────────────────────────────────────────────── */
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
      className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 hover:underline font-medium"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Đã sao chép' : label}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  PAYMENT METHOD CARD
 * ──────────────────────────────────────────────────────────────── */
function PaymentMethodCard({ method, value, info, selected, onSelect }) {
  const Icon = method === 'bank' ? Building2 : method === 'momo' ? Wallet : method === 'vietqr' ? QrCode : Truck;
  const accent =
    method === 'momo'
      ? 'text-pink-600'
      : method === 'vietqr'
      ? 'text-blue-600'
      : 'text-amber-700';

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`relative w-full text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-amber-600 bg-amber-50/50 shadow-md'
          : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
            selected ? `bg-white ${accent} shadow-sm` : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{info.shortLabel}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{info.description}</p>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            selected ? 'border-amber-600 bg-amber-600' : 'border-gray-300'
          }`}
        >
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  PAYMENT DETAILS
 * ──────────────────────────────────────────────────────────────── */
function PaymentDetails({ method }) {
  const info = getPaymentInfo(method);

  if (method === 'bank') {
    return (
      <div className="mt-4 rounded-xl border bg-amber-50/50 border-amber-200 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 mt-0.5 text-amber-700 shrink-0" />
          <div className="flex-1 space-y-2.5 text-sm">
            <p className="font-medium text-amber-900">{info.description}</p>
            <div className="space-y-2 pt-2 border-t border-amber-200/60">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Ngân hàng:</span>
                <span className="font-medium text-right">{info.bankName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Chủ tài khoản:</span>
                <span className="font-medium text-right">{info.accountName}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Số tài khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-amber-900">{info.accountNumber}</span>
                  <CopyButton value={info.accountNumber.replace(/\s/g, '')} label="Sao chép STK" />
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
            <div className="bg-amber-100/60 border border-amber-300 rounded-lg p-3 text-xs italic text-amber-900">
              💡 {info.transferNote}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (method === 'momo') {
    return (
      <div className="mt-4 rounded-xl border bg-pink-50/50 border-pink-200 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Wallet className="w-5 h-5 mt-0.5 text-pink-600 shrink-0" />
          <div className="flex-1 space-y-2.5 text-sm">
            <p className="font-medium text-pink-900">{info.description}</p>
            <div className="space-y-2 pt-2 border-t border-pink-200/60">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Tên tài khoản:</span>
                <span className="font-medium text-right">{info.momoName}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Số điện thoại:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-pink-900">{info.momoPhone}</span>
                  <CopyButton value={info.momoPhone.replace(/\s/g, '')} label="Sao chép SĐT" />
                </div>
              </div>
            </div>
            <div className="bg-pink-100/60 border border-pink-300 rounded-lg p-3 text-xs italic text-pink-900">
              💡 {info.transferNote}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (method === 'vietqr') {
    return (
      <div className="mt-4 rounded-xl border bg-blue-50/50 border-blue-200 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <QrCode className="w-5 h-5 mt-0.5 text-blue-600 shrink-0" />
          <div className="flex-1 space-y-2.5 text-sm">
            <p className="font-medium text-blue-900">{info.description}</p>
            <ul className="space-y-1.5 pt-2 text-xs text-blue-800">
              {info.details.map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 mt-0.5 text-blue-600 shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            <div className="bg-blue-100/60 border border-blue-300 rounded-lg p-3 text-xs italic text-blue-900">
              💡 {info.transferNote}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border bg-green-50/50 border-green-200 p-5">
      <div className="flex items-start gap-3">
        <Truck className="w-5 h-5 mt-0.5 text-green-700 shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-medium text-green-900 mb-2">{info.description}</p>
          <ul className="space-y-1.5 text-xs text-green-800">
            {info.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 mt-0.5 text-green-600 shrink-0" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  TRUST BADGES
 * ──────────────────────────────────────────────────────────────── */
function TrustBadges() {
  const badges = [
    { icon: ShieldCheck, label: 'Bảo mật SSL' },
    { icon: Lock, label: 'Thanh toán an toàn' },
    { icon: Truck, label: 'Giao hàng toàn quốc' },
  ];
  return (
    <div className="flex items-center justify-center gap-6 py-4 text-xs text-muted-foreground">
      {badges.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <Icon className="w-4 h-4 text-green-600" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  MAIN PAGE
 * ──────────────────────────────────────────────────────────────── */
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
  const [qrOrder, setQrOrder] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [couponWarning, setCouponWarning] = useState(''); // cảnh báo khi coupon bị vô hiệu

  const COUPON_STORAGE_KEY = 'luxe_applied_coupon';

  const [formData, setFormData] = useState({
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingDistrict: '',
    paymentMethod: 'cod',
    notes: '',
  });

  /* Load saved addresses + coupon từ localStorage */
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('saved_addresses') || '[]');
      setSavedAddresses(stored);
    } catch {
      setSavedAddresses([]);
    }
    try {
      const storedCoupon = JSON.parse(localStorage.getItem(COUPON_STORAGE_KEY) || 'null');
      if (storedCoupon && storedCoupon.code) {
        setCouponCode(storedCoupon.code);
        setAppliedCoupon(storedCoupon);
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* Update districts when city changes */
  useEffect(() => {
    if (formData.shippingCity) {
      const districts = getDistricts(formData.shippingCity);
      setAvailableDistricts(districts);
      if (formData.shippingDistrict && !districts.includes(formData.shippingDistrict)) {
        setFormData((prev) => ({ ...prev, shippingDistrict: '' }));
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [formData.shippingCity]);

  /* Auto-fill from currentUser */
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        shippingName: prev.shippingName || currentUser.name || '',
        shippingPhone: prev.shippingPhone || currentUser.phone || '',
        shippingAddress: prev.shippingAddress || currentUser.address || '',
      }));
    }
  }, [currentUser]);

  const shippingFee = getTotalPrice() >= 500000 ? 0 : 30000;
  const subtotal = getTotalPrice();
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percent') return Math.min(subtotal * appliedCoupon.value / 100, subtotal);
    if (appliedCoupon.type === 'fixed') return Math.min(appliedCoupon.value, subtotal);
    if (appliedCoupon.type === 'shipping') return shippingFee;
    return 0;
  }, [appliedCoupon, subtotal, shippingFee]);
  const total = subtotal + shippingFee - discount;

  const availableCoupons = [
    { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 0, description: 'Giảm 10% đơn đầu tiên' },
    { code: 'SAVE50K', type: 'fixed', value: 50000, minOrder: 500000, description: 'Giảm 50K cho đơn từ 500K' },
    { code: 'FREESHIP', type: 'shipping', value: 30000, minOrder: 0, description: 'Miễn phí vận chuyển' },
    { code: 'VIP100K', type: 'fixed', value: 100000, minOrder: 1000000, description: 'Giảm 100K cho đơn từ 1 triệu' },
  ];

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    setCouponLoading(true);
    setTimeout(() => {
      const coupon = availableCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
      if (!coupon) {
        toast.error('Mã giảm giá không hợp lệ');
        setCouponLoading(false);
        return;
      }
      if (coupon.minOrder > subtotal) {
        toast.error(`Đơn hàng tối thiểu ${fmtVND(coupon.minOrder)} để áp dụng mã này`);
        setCouponLoading(false);
        return;
      }
      setAppliedCoupon(coupon);
      // Lưu vào localStorage để giữ khi refresh/navigate
      try {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      } catch { /* ignore */ }
      setCouponWarning('');
      toast.success(`Áp dụng thành công! Giảm ${fmtVND(discount)}`);
      setCouponLoading(false);
    }, 300);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponWarning('');
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch { /* ignore */ }
    toast.info('Đã xóa mã giảm giá');
  };

  // Clear coupon khi đặt hàng thành công — không để coupon cũ lưu lại cho lần sau
  const clearCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponWarning('');
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch { /* ignore */ }
  };

  /* Validate lại coupon khi subtotal thay đổi.
     Nếu không còn đủ điều kiện → cảnh báo (KHÔNG tự ý xóa,
     để user quyết định — vì cart có thể tăng lại). */
  useEffect(() => {
    if (!appliedCoupon) {
      setCouponWarning('');
      return;
    }
    if (appliedCoupon.minOrder > subtotal) {
      setCouponWarning(
        `Mã ${appliedCoupon.code} yêu cầu đơn tối thiểu ${fmtVND(appliedCoupon.minOrder)}. ` +
        `Hiện tại đơn mới ${fmtVND(subtotal)} — hãy thêm sản phẩm hoặc bỏ mã.`
      );
    } else {
      setCouponWarning('');
    }
  }, [appliedCoupon, subtotal]);

  const handleSelectSavedAddress = (address) => {
    setSelectedAddressId(address.id);
    setFormData((prev) => ({
      ...prev,
      shippingName: address.name,
      shippingPhone: address.phone,
      shippingAddress: address.address,
      shippingCity: address.city,
      shippingDistrict: address.district,
    }));
    setErrors({});
    toast.success(`Đã chọn địa chỉ: ${address.tag === 'home' ? 'Nhà riêng' : address.tag === 'work' ? 'Văn phòng' : 'Khác'}`);
  };

  const handleDeleteAddress = (id) => {
    const updated = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(updated);
    localStorage.setItem('saved_addresses', JSON.stringify(updated));
    if (selectedAddressId === id) setSelectedAddressId(null);
    toast.success('Đã xóa địa chỉ');
  };

  const handleSaveAddress = async () => {
    if (!currentUser?.id) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    const newErrors = validateForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSavingAddress(true);
    try {
      const newAddress = {
        id: Date.now(),
        tag: 'home',
        name: formData.shippingName,
        phone: formData.shippingPhone,
        address: formData.shippingAddress,
        city: formData.shippingCity,
        district: formData.shippingDistrict,
      };
      const updated = [...savedAddresses, newAddress];
      setSavedAddresses(updated);
      localStorage.setItem('saved_addresses', JSON.stringify(updated));
      setSelectedAddressId(newAddress.id);

      // Sync user profile
      await updateProfile({
        name: formData.shippingName,
        phone: formData.shippingPhone,
        shipping_address: {
          name: formData.shippingName,
          phone: formData.shippingPhone,
          address: formData.shippingAddress,
          city: formData.shippingCity,
          district: formData.shippingDistrict,
        },
      });

      toast.success('Đã lưu địa chỉ vào tài khoản');
    } catch (err) {
      console.error('Save address error:', err);
      toast.error('Không thể lưu địa chỉ. Vui lòng thử lại.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      const newErrors = validateForm(formData);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
        return;
      }
      setErrors({});
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser?.id) {
      toast.error('Vui lòng đăng nhập để đặt hàng');
      navigate('/signup');
      return;
    }

    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setCurrentStep(1);
      toast.error('Vui lòng kiểm tra lại thông tin giao hàng');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        id: item.id,
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        image: item.image,
      }));

      const shippingAddress = {
        name: formData.shippingName,
        phone: formData.shippingPhone,
        address: formData.shippingAddress,
        city: formData.shippingCity,
        district: formData.shippingDistrict,
      };

      const orderData = {
        user_id: currentUser.id,
        items: orderItems,
        total_amount: total,
        shipping_address: shippingAddress,
        payment_method: formData.paymentMethod,
        notes: formData.notes || '',
        coupon_code: appliedCoupon?.code || null,
        discount_amount: discount,
      };

      const createdOrder = await ordersAPI.create(orderData);

      if (formData.paymentMethod === 'vietqr') {
        toast.success('Đặt hàng thành công! Vui lòng quét QR để thanh toán.');
        setQrOrder({ id: createdOrder.id, amount: total });
        return;
      }

      setOrderJustSucceeded(true);
      clearCart();
      clearCoupon();
      toast.success('🎉 Đặt hàng thành công!');
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
      clearCoupon();
      setQrOrder(null);
      navigate('/account/orders', { replace: true });
    }
  };

  // Khi modal QR xác nhận đã thanh toán — phát nhạc + clear cart ngay
  // để user có thể đóng modal hoặc ở lại xem chi tiết
  const handleQRPaid = () => {
    // Clear cart ngay khi paid để UX mượt hơn (auto-close sẽ tự navigate)
    clearCart();
    clearCoupon();
  };

  // Safe redirect when cart empty
  useEffect(() => {
    if (items.length === 0 && !orderJustSucceeded) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate, orderJustSucceeded]);

  if (items.length === 0) return null;

  const paymentInfo = getPaymentInfo(formData.paymentMethod);

  return (
    <>
      <Helmet>
        <title>Thanh toán - LUXE</title>
        <meta name="description" content="Hoàn tất đơn hàng của bạn tại LUXE Jewelry" />
      </Helmet>

      <Header />

      {/* Hero header */}
      <div className="bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Bước cuối cùng
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Hoàn tất đơn hàng
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Vui lòng kiểm tra kỹ thông tin trước khi đặt hàng
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Stepper currentStep={currentStep} />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* ─── LEFT: FORM ─── */}
            <div className="lg:col-span-2 space-y-6">
              {/* STEP 1: SHIPPING INFO */}
              {currentStep === 1 && (
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-transparent border-b px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">Thông tin giao hàng</h2>
                        <p className="text-xs text-muted-foreground">Nhập địa chỉ nhận hàng của bạn</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5 sm:p-6 space-y-5">
                    {/* Saved addresses */}
                    {savedAddresses.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-medium">Địa chỉ đã lưu</Label>
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(!showAddressForm)}
                            className="text-xs text-amber-700 hover:underline inline-flex items-center gap-1"
                          >
                            {showAddressForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            {showAddressForm ? 'Ẩn form' : 'Thêm địa chỉ mới'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {savedAddresses.map((address) => (
                            <SavedAddressCard
                              key={address.id}
                              address={address}
                              selected={selectedAddressId === address.id}
                              onSelect={handleSelectSavedAddress}
                              onDelete={handleDeleteAddress}
                            />
                          ))}
                        </div>
                        <div className="border-t border-dashed my-5" />
                      </div>
                    )}

                    {(showAddressForm || savedAddresses.length === 0) && (
                      <>
                        {savedAddresses.length > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <Label className="text-sm font-medium">Hoặc nhập địa chỉ mới</Label>
                          </div>
                        )}

                        {/* Name + Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="shippingName" className="text-sm">
                              Họ và tên <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative mt-1.5">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="shippingName"
                                value={formData.shippingName}
                                onChange={(e) => {
                                  setFormData({ ...formData, shippingName: e.target.value });
                                  if (errors.shippingName) setErrors({ ...errors, shippingName: '' });
                                }}
                                placeholder="Nguyễn Văn A"
                                className={`pl-10 ${errors.shippingName ? 'border-red-500' : ''}`}
                              />
                            </div>
                            {errors.shippingName && (
                              <p className="text-xs text-red-600 mt-1 inline-flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {errors.shippingName}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="shippingPhone" className="text-sm">
                              Số điện thoại <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative mt-1.5">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="shippingPhone"
                                type="tel"
                                value={formData.shippingPhone}
                                onChange={(e) => {
                                  setFormData({ ...formData, shippingPhone: e.target.value });
                                  if (errors.shippingPhone) setErrors({ ...errors, shippingPhone: '' });
                                }}
                                placeholder="0912345678"
                                className={`pl-10 ${errors.shippingPhone ? 'border-red-500' : ''}`}
                              />
                            </div>
                            {errors.shippingPhone && (
                              <p className="text-xs text-red-600 mt-1 inline-flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {errors.shippingPhone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <Label htmlFor="shippingAddress" className="text-sm">
                            Địa chỉ <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative mt-1.5">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="shippingAddress"
                              value={formData.shippingAddress}
                              onChange={(e) => {
                                setFormData({ ...formData, shippingAddress: e.target.value });
                                if (errors.shippingAddress) setErrors({ ...errors, shippingAddress: '' });
                              }}
                              placeholder="Số nhà, tên đường, phường/xã"
                              className={`pl-10 ${errors.shippingAddress ? 'border-red-500' : ''}`}
                            />
                          </div>
                          {errors.shippingAddress && (
                            <p className="text-xs text-red-600 mt-1 inline-flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {errors.shippingAddress}
                            </p>
                          )}
                        </div>

                        {/* City + District */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="shippingCity" className="text-sm">
                              Tỉnh / Thành phố
                            </Label>
                            <select
                              id="shippingCity"
                              value={formData.shippingCity}
                              onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                              className="mt-1.5 w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                            <Label htmlFor="shippingDistrict" className="text-sm">
                              Quận / Huyện
                            </Label>
                            <select
                              id="shippingDistrict"
                              value={formData.shippingDistrict}
                              onChange={(e) => setFormData({ ...formData, shippingDistrict: e.target.value })}
                              disabled={!formData.shippingCity}
                              className="mt-1.5 w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

                        {/* Save address button */}
                        {currentUser && (
                          <div className="flex items-center justify-between pt-2 border-t border-dashed">
                            <p className="text-xs text-muted-foreground">
                              💾 Lưu địa chỉ này để dùng cho lần sau
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleSaveAddress}
                              disabled={savingAddress}
                            >
                              {savingAddress ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Đang lưu...
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Lưu địa chỉ
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes" className="text-sm">
                        Ghi chú đơn hàng <span className="text-muted-foreground">(tùy chọn)</span>
                      </Label>
                      <div className="relative mt-1.5">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Ghi chú cho đơn hàng (VD: giao giờ hành chính, gọi trước khi giao...)"
                          rows={3}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* STEP 2: PAYMENT */}
              {currentStep === 2 && (
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-transparent border-b px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">Phương thức thanh toán</h2>
                        <p className="text-xs text-muted-foreground">Chọn cách thanh toán phù hợp với bạn</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PAYMENT_METHODS.map(({ value }) => {
                        const info = getPaymentInfo(value);
                        return (
                          <PaymentMethodCard
                            key={value}
                            method={value}
                            value={value}
                            info={info}
                            selected={formData.paymentMethod === value}
                            onSelect={(v) => setFormData({ ...formData, paymentMethod: v })}
                          />
                        );
                      })}
                    </div>
                    <PaymentDetails method={formData.paymentMethod} />
                  </CardContent>
                </Card>
              )}

              {/* STEP 3: REVIEW */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-50 to-transparent border-b px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                          <Check className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="font-semibold text-lg">Xác nhận đơn hàng</h2>
                          <p className="text-xs text-muted-foreground">Vui lòng kiểm tra kỹ trước khi đặt</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-5 sm:p-6 space-y-4">
                      {/* Shipping info */}
                      <div className="bg-stone-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            📍 Giao đến
                          </h3>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="text-xs text-amber-700 hover:underline inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Chỉnh sửa
                          </button>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold">{formData.shippingName}</p>
                          <p className="text-sm text-muted-foreground">{formData.shippingPhone}</p>
                          <p className="text-sm text-muted-foreground">
                            {formData.shippingAddress}
                            {formData.shippingDistrict && `, ${formData.shippingDistrict}`}
                            {formData.shippingCity && `, ${formData.shippingCity}`}
                          </p>
                        </div>
                      </div>

                      {/* Payment method */}
                      <div className="bg-stone-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            💳 Thanh toán
                          </h3>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="text-xs text-amber-700 hover:underline inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Chỉnh sửa
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                            <PaymentMethodIconInline method={formData.paymentMethod} />
                          </div>
                          <div>
                            <p className="font-semibold">{paymentInfo.shortLabel}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{paymentInfo.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                          📦 Sản phẩm ({items.length})
                        </h3>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                              className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                            >
                              <div className="w-14 h-14 rounded-md bg-stone-100 overflow-hidden shrink-0">
                                {item.image && (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  SL: {item.quantity}
                                  {item.selectedSize && ` • Size: ${item.selectedSize}`}
                                  {item.selectedColor && ` • ${item.selectedColor}`}
                                </p>
                              </div>
                              <p className="font-semibold text-sm whitespace-nowrap">
                                {fmtVND(item.price * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {formData.notes && (
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                          <h3 className="font-semibold text-xs uppercase tracking-wider text-amber-800 mb-1">
                            📝 Ghi chú
                          </h3>
                          <p className="text-sm text-amber-900">{formData.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Quay lại
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/cart')}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Về giỏ hàng
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="gap-2 bg-amber-600 hover:bg-amber-700"
                    size="lg"
                  >
                    Tiếp tục
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Đặt hàng {fmtVND(total)}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* ─── RIGHT: ORDER SUMMARY ─── */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 overflow-hidden">
                <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    <h2 className="font-semibold">Đơn hàng của bạn</h2>
                  </div>
                  <p className="text-xs text-stone-300 mt-1">{items.length} sản phẩm</p>
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                        className="flex items-start gap-3"
                      >
                        <div className="w-12 h-12 rounded-md bg-stone-100 overflow-hidden shrink-0 relative">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-600 text-white rounded-full text-[10px] flex items-center justify-center font-semibold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                          {item.selectedSize && (
                            <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                          )}
                        </div>
                        <p className="text-sm font-semibold whitespace-nowrap">
                          {fmtVND(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div className="border-t pt-4">
                    <Label className="text-xs font-medium mb-2 block uppercase tracking-wider text-muted-foreground">
                      <Gift className="w-3.5 h-3.5 inline mr-1" />
                      Mã giảm giá
                    </Label>
                    {appliedCoupon ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Tag className="w-4 h-4 text-green-600 shrink-0" />
                            <span className="font-mono font-semibold text-green-700 text-sm truncate">
                              {appliedCoupon.code}
                            </span>
                            <span className="text-xs text-green-600 truncate">
                              −{fmtVND(discount)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-xs text-red-600 hover:underline shrink-0 ml-2"
                          >
                            Xóa
                          </button>
                        </div>
                        {couponWarning && (
                          <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>{couponWarning}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập mã"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                          size="sm"
                        >
                          {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Áp dụng'}
                        </Button>
                      </div>
                    )}

                    {!appliedCoupon && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted-foreground">Mã có sẵn:</p>
                        <div className="grid gap-1.5">
                          {availableCoupons.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setCouponCode(c.code);
                                setTimeout(() => handleApplyCoupon(), 100);
                              }}
                              className="text-left text-xs p-2 rounded-md border border-dashed border-stone-300 hover:border-amber-500 hover:bg-amber-50/50 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-semibold text-amber-700">{c.code}</span>
                                <span className="text-muted-foreground text-[11px]">{c.description}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subtotal */}
                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-medium">{fmtVND(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span className="font-medium">
                        {shippingFee === 0 ? (
                          <span className="text-green-600">Miễn phí</span>
                        ) : (
                          fmtVND(shippingFee)
                        )}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá</span>
                        <span className="font-medium">-{fmtVND(discount)}</span>
                      </div>
                    )}
                    {shippingFee > 0 && (
                      <p className="text-[11px] text-muted-foreground italic">
                        Mua thêm {fmtVND(500000 - subtotal)} để được miễn phí vận chuyển
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4 bg-amber-50/50 -mx-5 px-5 -mb-5 pb-5 rounded-b-xl">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold">Tổng cộng</span>
                      <span className="text-2xl font-bold text-amber-700">
                        {fmtVND(total)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">Đã bao gồm VAT</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        <TrustBadges />
      </div>

      <Footer />

      <VietQRModal
        open={!!qrOrder}
        onOpenChange={handleQRModalClose}
        orderId={qrOrder?.id}
        amount={qrOrder?.amount}
        onPaid={handleQRPaid}
      />
    </>
  );
}

function PaymentMethodIconInline({ method }) {
  if (method === 'bank') return <Building2 className="w-5 h-5 text-amber-700" />;
  if (method === 'momo') return <Wallet className="w-5 h-5 text-pink-600" />;
  if (method === 'vietqr') return <QrCode className="w-5 h-5 text-blue-600" />;
  return <Truck className="w-5 h-5 text-green-700" />;
}
