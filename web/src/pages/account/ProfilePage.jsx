import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';

// Chuyển bất kỳ format ngày nào về "YYYY-MM-DD" — TUYỆT ĐỐI KHÔNG dùng Date object
// (vì Date object sẽ ép UTC và gây lùi ngày khi server trả ISO có "T...Z")
const toDateInputValue = (val) => {
  if (val == null || val === '') return '';
  // Nếu là string, regex match YYYY-MM-DD ở đầu (cắt phần T...Z phía sau)
  if (typeof val === 'string') {
    const m = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    return '';
  }
  // Nếu là Date object (một số pg driver trả Date), dùng local getters (KHÔNG dùng toISOString)
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const mo = String(val.getMonth() + 1).padStart(2, '0');
    const da = String(val.getDate()).padStart(2, '0');
    return `${y}-${mo}-${da}`;
  }
  return '';
};

// So sánh ngày mà KHÔNG qua Date object để tránh lỗi timezone
const compareDateStrings = (a, b) => {
  // a, b đều là "YYYY-MM-DD" hoặc rỗng
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a === b;
};

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showFavorites, setShowFavorites] = useState(true);
  const [dobError, setDobError] = useState('');
  const [dobSuccess, setDobSuccess] = useState(false);
  const lastSavedDobRef = useRef('');

  // Split name thành họ và tên
  const nameParts = (currentUser?.name || '').trim().split(' ');
  const initialDob = toDateInputValue(currentUser?.dob);
  lastSavedDobRef.current = initialDob;

  const [profileData, setProfileData] = useState({
    lastName: nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '',
    firstName: nameParts[nameParts.length - 1] || '',
    dob: initialDob,
    phone: currentUser?.phone || '',
  });

  // Đồng bộ lại form khi currentUser thay đổi (sau khi save, khi load trang).
  // So sánh ngày đúng cách — nếu khác thì cập nhật.
  useEffect(() => {
    const newDob = toDateInputValue(currentUser?.dob);
    setProfileData((prev) => {
      const shouldUpdateDob = !compareDateStrings(prev.dob, newDob);
      return {
        lastName: (currentUser?.name || '').trim().split(' ').length > 1
          ? (currentUser?.name || '').trim().split(' ').slice(0, -1).join(' ')
          : '',
        firstName: (currentUser?.name || '').trim().split(' ').slice(-1)[0] || '',
        dob: shouldUpdateDob ? newDob : prev.dob,
        phone: currentUser?.phone || '',
      };
    });
    if (newDob) lastSavedDobRef.current = newDob;
  }, [currentUser?.id, currentUser?.dob]);

  const validateDob = (dob) => {
    if (!dob) return ''; // Cho phép trống
    // Validate bằng regex — không qua Date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return 'Ngày sinh không hợp lệ';
    const [y, m, d] = dob.split('-').map(Number);
    if (m < 1 || m > 12) return 'Tháng không hợp lệ';
    if (d < 1 || d > 31) return 'Ngày không hợp lệ';
    // So sánh với hôm nay bằng string, không qua Date
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (dob > todayStr) return 'Ngày sinh không thể ở tương lai';
    return '';
  };

  const handleDobChange = (e) => {
    const value = e.target.value;
    setProfileData({ ...profileData, dob: value });
    setDobSuccess(false);
    const err = validateDob(value);
    setDobError(err);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateDob(profileData.dob);
    if (err) {
      setDobError(err);
      toast.error(err);
      return;
    }
    setLoading(true);
    try {
      const name = `${profileData.lastName} ${profileData.firstName}`.trim();
      // Truyền ngày thuần string YYYY-MM-DD (không qua Date)
      const dobToSave = profileData.dob
        ? profileData.dob
        : null;

      await updateProfile({
        name,
        phone: profileData.phone,
        dob: dobToSave,
      });
      lastSavedDobRef.current = dobToSave || '';
      setDobError('');
      setDobSuccess(true);
      toast.success('Cập nhật thông tin thành công');
      setTimeout(() => setDobSuccess(false), 3000);
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
                onChange={handleDobChange}
                max={(() => {
                  const t = new Date();
                  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
                })()}
                className={`mt-1 ${dobError ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
              />
              {dobError && (
                <p className="text-xs text-red-600 mt-1 inline-flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {dobError}
                </p>
              )}
              {dobSuccess && !dobError && (
                <p className="text-xs text-green-600 mt-1 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã cập nhật ngày sinh thành công
                </p>
              )}
              {!dobError && !dobSuccess && profileData.dob && (
                <p className="text-xs text-gray-500 mt-1">
                  Ngày đã chọn: {profileData.dob.split('-').reverse().join('/')}
                </p>
              )}
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
            disabled={loading || !!dobError}
            className="w-32 bg-black text-white py-2 font-semibold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang lưu...' : 'LƯU'}
          </button>
          <p className="text-xs text-gray-500">Chúng tôi sẽ giữ thông tin bí mật bạn điền ở trên</p>
        </div>
      </form>
    </>
  );
}
