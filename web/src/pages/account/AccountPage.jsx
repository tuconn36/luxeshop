import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from 'lucide-react';

const menuItems = [
  {
    group: 'Trung tâm cá nhân',
    items: [
      {
        label: 'Tài khoản của tôi',
        sub: ['Thông tin của tôi', 'Số địa chỉ', 'Đo lường của tôi'],
      },
    ],
  },
  {
    group: 'Trạng thái đơn hàng',
    items: [
      {
        label: null,
        sub: [
          'Tất cả các đơn hàng',
          'Đơn hàng xử lý',
          'Đơn hàng chờ lấy hàng',
          'Đơn hàng đang giao',
          'Đơn hàng đã giao',
          'Chưa đánh giá',
          'Đã đánh giá',
          'Đơn hàng đã hủy',
          'Đơn hàng trả lại',
        ],
      },
    ],
  },
];

export default function AccountPage() {
  const { currentUser, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showFavorites, setShowFavorites] = useState(true);
  const [profileData, setProfileData] = useState({
    lastName: '',
    firstName: currentUser?.name || '',
    dob: currentUser?.dob || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    district: currentUser?.district || '',
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ ...profileData, name: `${profileData.lastName} ${profileData.firstName}`.trim() });
      toast.success('Cập nhật thông tin thành công');
    } catch {
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Tài khoản - LUXE</title>
        <meta name="description" content="Quản lý tài khoản của bạn" />
      </Helmet>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[70vh]">
        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 text-sm">
            {menuItems.map((section) => (
              <div key={section.group} className="mb-6">
                <p className="font-bold text-base mb-2">{section.group}</p>
                {section.items.map((item, i) => (
                  <div key={i}>
                    {item.label && (
                      <p className="font-semibold flex items-center gap-1 mb-1">
                        <span className="text-lg leading-none">—</span> {item.label}
                      </p>
                    )}
                    <ul className="ml-4 space-y-1">
                      {item.sub.map((s) => (
                        <li key={s}>
                          <button
                            className={`text-left hover:underline ${s === 'Thông tin của tôi' ? 'font-semibold' : 'text-gray-700'}`}
                            onClick={() => s === 'Tất cả các đơn hàng' && navigate('/orders')}
                          >
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
            <button
              className="font-bold text-base hover:underline mt-2"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-center uppercase tracking-widest mb-8">
              Thông tin của tôi
            </h1>

            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
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
                </div>
              </div>

              {/* Ưa thích collapsible */}
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
                  <div className="mt-3 text-sm text-gray-500">
                    {/* Nội dung ưa thích có thể bổ sung sau */}
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
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
