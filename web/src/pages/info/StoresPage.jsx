import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { MapPin, Phone, Clock } from 'lucide-react';

const stores = [
  {
    city: 'TP. Hồ Chí Minh',
    branches: [
      { name: 'LUXE Quận 1', address: '123 Lê Lợi, Phường Bến Nghé, Quận 1', phone: '028 1234 5678', hours: '8:00 - 22:00' },
      { name: 'LUXE Quận 3', address: '456 Nguyễn Thị Minh Khai, Quận 3', phone: '028 8765 4321', hours: '8:00 - 22:00' },
      { name: 'LUXE Bình Thạnh', address: '789 Đinh Bộ Lĩnh, Quận Bình Thạnh', phone: '028 9999 1234', hours: '9:00 - 21:30' },
    ],
  },
  {
    city: 'Hà Nội',
    branches: [
      { name: 'LUXE Hoàn Kiếm', address: '12 Hàng Bài, Quận Hoàn Kiếm', phone: '024 1234 5678', hours: '8:00 - 22:00' },
      { name: 'LUXE Cầu Giấy', address: '88 Xuân Thủy, Quận Cầu Giấy', phone: '024 8765 4321', hours: '9:00 - 21:30' },
    ],
  },
];

export default function StoresPage() {
  return (
    <>
      <Helmet>
        <title>Hệ thống cửa hàng - LUXE</title>
      </Helmet>
      <Header />
      <div className="min-h-screen">
        <div className="bg-black text-white py-16 text-center">
          <h1 className="text-4xl font-bold mb-3">Hệ thống cửa hàng</h1>
          <p className="text-gray-300">Tìm cửa hàng LUXE gần bạn nhất</p>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
          {stores.map((region) => (
            <div key={region.city}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-amber-500" />
                {region.city}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {region.branches.map((store) => (
                  <div key={store.name} className="border rounded-xl p-5 hover:border-amber-400 transition-colors">
                    <h3 className="font-bold text-lg mb-3">{store.name}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
                        <span>{store.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-amber-500" />
                        <a href={`tel:${store.phone}`} className="hover:text-amber-600">{store.phone}</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>{store.hours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
