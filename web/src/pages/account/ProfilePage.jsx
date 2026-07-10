import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showFavorites, setShowFavorites] = useState(true);

  // Split name thành họ và tên
  const nameParts = (currentUser?.name || '').trim().split(' ');
  const [profileData, setProfileData] = useState({
    lastName: nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '',
    firstName: nameParts[nameParts.length - 1] || '',
    dob: currentUser?.dob || '',
    phone: currentUser?.phone || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const name = `${profileData.lastName} ${profileData.firstName}`.trim();
      await updateProfile({ name, phone: profileData.phone, dob: profileData.dob || null });
      toast.success('Cập nhật thông tin thành công');
    } catch (err) {
      toast.error(err.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-center uppercase tracking-widest mb-8">
        Thông tin của tôi
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div>
          <p className="font-semibold mb-4">Thông tin</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lastName">Họ</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="firstName">Tên</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dob">Ngày sinh</Label>
              <Input
                id="dob"
                type="date"
                value={profileData.dob}
                onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Ưa thích */}
        <div className="border-t pt-4">
          <button
            type="button"
            className="flex items-center justify-between w-full font-semibold"
            onClick={() => setShowFavorites(!showFavorites)}
          >
            <span>Ưa thích</span>
            {showFavorites ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showFavorites && (
            <div className="mt-3 text-sm text-gray-400 italic">
              Chưa có sản phẩm yêu thích
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            type="submit"
            disabled={loading}
            className="w-32 bg-black text-white py-2 font-semibold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'LƯU'}
          </button>
          <p className="text-xs text-gray-500">Chúng tôi sẽ giữ thông tin bí mật bạn điền ở trên</p>
        </div>
      </form>
    </>
  );
}
