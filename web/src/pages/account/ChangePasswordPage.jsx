import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/lib/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

function PasswordInput({ id, label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  const { currentUser, updateUser } = useAuth();
  const hasPassword = currentUser?.has_password;

  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPass !== form.confirm) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.newPass.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword(form.current, form.newPass);
      toast.success(hasPassword ? 'Đổi mật khẩu thành công' : 'Thêm mật khẩu thành công');
      updateUser({ has_password: true });
      setForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-center uppercase tracking-widest mb-8">
        {hasPassword ? 'Đổi mật khẩu' : 'Thêm mật khẩu'}
      </h1>

      {!hasPassword && (
        <p className="text-sm text-gray-500 mb-6 max-w-md">
          Tài khoản của bạn chưa có mật khẩu. Thêm mật khẩu để có thể đăng nhập bằng email/số điện thoại.
        </p>
      )}

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {hasPassword && (
          <PasswordInput
            id="current"
            label="Mật khẩu hiện tại"
            value={form.current}
            onChange={(e) => setForm({ ...form, current: e.target.value })}
          />
        )}

        <PasswordInput
          id="newPass"
          label={hasPassword ? 'Mật khẩu mới' : 'Mật khẩu'}
          value={form.newPass}
          onChange={(e) => setForm({ ...form, newPass: e.target.value })}
        />

        <PasswordInput
          id="confirm"
          label={hasPassword ? 'Xác nhận mật khẩu mới' : 'Xác nhận mật khẩu'}
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />

        <p className="text-xs text-gray-400">Mật khẩu phải có ít nhất 6 ký tự</p>

        <button
          type="submit"
          disabled={loading}
          className="w-44 bg-black text-white py-2 font-semibold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : hasPassword ? 'ĐỔI MẬT KHẨU' : 'THÊM MẬT KHẨU'}
        </button>
      </form>
    </>
  );
}
