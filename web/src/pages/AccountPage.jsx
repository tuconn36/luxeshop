import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AccountPage() {
  const { currentUser, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    district: currentUser?.district || ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(profileData);
      toast.success('Cập nhật thông tin thành công');
    } catch (err) {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ letterSpacing: '-0.02em' }}>
          Tài khoản của tôi
        </h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Thành phố</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        className="text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="district">Quận/Huyện</Label>
                      <Input
                        id="district"
                        value={profileData.district}
                        onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                        className="text-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleLogout}>
                      Đăng xuất
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Đơn hàng của tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Xem tất cả đơn hàng của bạn tại trang Đơn hàng
                </p>
                <Button onClick={() => navigate('/orders')}>
                  Xem đơn hàng
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </>
  );
}