import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function OTPLoginModal({ isOpen, onClose }) {
  const { requestOTP, verifyOTP } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpId, setOtpId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    if (!loading) {
      setStep(1);
      setEmail('');
      setCode('');
      setOtpId('');
      onClose();
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }

    setLoading(true);
    try {
      const result = await requestOTP(email);
      setOtpId(result.otpId);
      setStep(2);
      toast.success('Mã xác thực đã được gửi đến email của bạn');
    } catch (error) {
      console.error('OTP Request Error:', error);
      toast.error('Không thể gửi mã xác thực. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (code.length !== 8) {
      toast.error('Mã xác thực phải gồm 8 chữ số');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(otpId, code);
      toast.success('Đăng nhập thành công');
      handleClose();
    } catch (error) {
      console.error('OTP Verify Error:', error);
      toast.error('Mã xác thực không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {step === 1 ? 'Đăng nhập / Đăng ký' : 'Xác thực tài khoản'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 1 
              ? 'Nhập email của bạn để tiếp tục' 
              : `Nhập mã 8 chữ số đã được gửi đến ${email}`}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ví dụ: ten@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="text-foreground"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Tiếp tục'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Mã xác thực (8 chữ số)</Label>
                <Input
                  id="code"
                  type="text"
                  maxLength={8}
                  placeholder="12345678"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  required
                  className="text-center text-2xl tracking-widest text-foreground"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || code.length !== 8}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  'Xác thực'
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Quay lại
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}