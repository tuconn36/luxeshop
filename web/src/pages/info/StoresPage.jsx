import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import {
  MapPin,
  Phone,
  Clock,
  Search,
  X,
  Navigation2,
  Crosshair,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const PROVINCES = [
  'Tất cả tỉnh thành',
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
  'Long An',
  'Bà Rịa - Vũng Tàu',
  'Khánh Hòa',
];

// Danh sách cửa hàng. Tọa độ dùng để nhúng Google Maps Embed theo lng/lat.
const STORES = [
  {
    id: 'luxe-q1',
    name: 'LUXE Quận 1',
    address: '123 Lê Lợi, Phường Bến Nghé, Quận 1',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    phone: '028 1234 5678',
    hours: '8:00 - 22:00',
    lat: 10.7725,
    lng: 106.7003,
    isMain: true,
  },
  {
    id: 'luxe-q3',
    name: 'LUXE Quận 3',
    address: '456 Nguyễn Thị Minh Khai, Quận 3',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 3',
    phone: '028 8765 4321',
    hours: '8:00 - 22:00',
    lat: 10.771,
    lng: 106.685,
  },
  {
    id: 'luxe-binh-thanh',
    name: 'Old Sailor Bigsize Bình Thạnh',
    address: '789 Đinh Bộ Lĩnh, Phường 25, Quận Bình Thạnh',
    province: 'TP. Hồ Chí Minh',
    district: 'Bình Thạnh',
    phone: '028 9999 1234',
    hours: '9:00 - 21:30',
    lat: 10.8019,
    lng: 106.7104,
  },
  {
    id: 'luxe-thu-duc',
    name: 'LUXE Thủ Đức',
    address: '02 Võ Văn Ngân, TP. Thủ Đức',
    province: 'TP. Hồ Chí Minh',
    district: 'Thủ Đức',
    phone: '028 7777 1234',
    hours: '9:00 - 22:00',
    lat: 10.8493,
    lng: 106.7538,
  },
  {
    id: 'luxe-hoan-kiem',
    name: 'LUXE Hoàn Kiếm',
    address: '12 Hàng Bài, Quận Hoàn Kiếm',
    province: 'Hà Nội',
    district: 'Hoàn Kiếm',
    phone: '024 1234 5678',
    hours: '8:00 - 22:00',
    lat: 21.0245,
    lng: 105.8542,
  },
  {
    id: 'luxe-cau-giay',
    name: 'LUXE Cầu Giấy',
    address: '88 Xuân Thủy, Quận Cầu Giấy',
    province: 'Hà Nội',
    district: 'Cầu Giấy',
    phone: '024 8765 4321',
    hours: '9:00 - 21:30',
    lat: 21.0367,
    lng: 105.7822,
  },
  {
    id: 'luxe-dn',
    name: 'LUXE Đà Nẵng',
    address: '56 Bạch Đằng, Quận Hải Châu',
    province: 'Đà Nẵng',
    district: 'Hải Châu',
    phone: '023 6369 1234',
    hours: '8:30 - 22:00',
    lat: 16.0678,
    lng: 108.2208,
  },
];

const formatCoord = (n) => n.toFixed(4);

export default function StoresPage() {
  const [province, setProvince] = useState('Tất cả tỉnh thành');
  const [keyword, setKeyword] = useState('');
  const [selectedId, setSelectedId] = useState('luxe-q1');

  const filteredStores = useMemo(() => {
    return STORES.filter((s) => {
      const matchProvince =
        province === 'Tất cả tỉnh thành' || s.province === province;
      if (!matchProvince) return false;
      if (!keyword.trim()) return true;
      const q = keyword.trim().toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
      );
    });
  }, [province, keyword]);

  const selected = useMemo(
    () => STORES.find((s) => s.id === selectedId) || filteredStores[0] || STORES[0],
    [selectedId, filteredStores]
  );

  const mapEmbedSrc = useMemo(() => {
    if (!selected) return '';
    const { lat, lng } = selected;
    return `https://www.google.com/maps?q=${lat},${lng}&hl=vi&z=16&output=embed`;
  }, [selected]);

  const directionsHref = useMemo(() => {
    if (!selected) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`;
  }, [selected]);

  return (
    <>
      <Helmet>
        <title>Hệ thống cửa hàng - LUXE</title>
        <meta
          name="description"
          content="Tìm cửa hàng LUXE gần bạn nhất với bản đồ trực quan."
        />
      </Helmet>
      <Header />

      <div className="min-h-screen bg-muted/30">
        <div className="bg-black text-white py-10 md:py-14 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Hệ thống cửa hàng
          </h1>
          <p className="text-gray-300">
            Tìm cửa hàng LUXE gần bạn nhất với bản đồ trực quan
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
          <div className="grid lg:grid-cols-[380px_1fr] gap-6">
            {/* Panel bên trái */}
            <aside className="bg-white rounded-2xl shadow-sm border border-border/60 p-5 lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-primary" />
                Tìm cửa hàng
              </h2>

              {/* Bộ lọc tỉnh thành */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Tỉnh thành
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="mt-1.5 w-full h-10 px-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ô tìm kiếm */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Tên cửa hàng / Địa chỉ
                </label>
                <div className="relative mt-1.5">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="pl-9 pr-9 h-10"
                  />
                  {keyword && (
                    <button
                      type="button"
                      onClick={() => setKeyword('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
                      aria-label="Xóa"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Kết quả */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">
                  {filteredStores.length} cửa hàng
                </p>
                <span className="text-xs text-muted-foreground">
                  Bấm vào để xem trên bản đồ
                </span>
              </div>

              {filteredStores.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground border rounded-xl">
                  Không tìm thấy cửa hàng phù hợp.
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {filteredStores.map((store) => {
                    const active = store.id === selected?.id;
                    return (
                      <li key={store.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(store.id)}
                          className={`w-full text-left rounded-xl border p-4 transition-all ${
                            active
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border/60 hover:border-primary/40 hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                active
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <MapPin className="w-4 h-4" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-sm">
                                  {store.name}
                                </p>
                                {store.isMain && (
                                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                                    Flagship
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {store.address}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {store.phone}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {store.hours}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>

            {/* Bản đồ bên phải */}
            <section className="bg-white rounded-2xl shadow-sm border border-border/60 overflow-hidden flex flex-col">
              {selected && (
                <>
                  <div className="px-5 py-4 border-b flex items-start gap-3">
                    <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base leading-snug">
                        {selected.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {selected.address}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {selected.phone}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {selected.hours}
                        </span>
                        <span className="inline-flex items-center gap-1 text-primary/70">
                          <Crosshair className="w-3.5 h-3.5" />
                          {formatCoord(selected.lat)}, {formatCoord(selected.lng)}
                        </span>
                      </div>
                    </div>
                    <a
                      href={directionsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                    >
                      <Navigation2 className="w-3.5 h-3.5" />
                      Chỉ đường
                    </a>
                  </div>

                  <div className="relative w-full" style={{ aspectRatio: '16 / 10' }}>
                    <iframe
                      title={`Bản đồ ${selected.name}`}
                      src={mapEmbedSrc}
                      className="absolute inset-0 w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}