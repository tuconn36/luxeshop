import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';

const brands = [
  { name: 'Routine', category: 'Nam', origin: 'Việt Nam' },
  { name: 'Coolmate', category: 'Nam', origin: 'Việt Nam' },
  { name: 'Owen', category: 'Nam', origin: 'Việt Nam' },
  { name: 'Canifa', category: 'Nam & Nữ', origin: 'Việt Nam' },
  { name: 'Yody', category: 'Nam & Nữ', origin: 'Việt Nam' },
  { name: 'Ninomaxx', category: 'Nam', origin: 'Việt Nam' },
  { name: 'Elise', category: 'Nữ', origin: 'Việt Nam' },
  { name: 'IVY moda', category: 'Nữ', origin: 'Việt Nam' },
  { name: 'NEM', category: 'Nữ', origin: 'Việt Nam' },
  { name: 'GUMAC', category: 'Nữ', origin: 'Việt Nam' },
  { name: "Biti's Hunter", category: 'Giày', origin: 'Việt Nam' },
  { name: 'Lados', category: 'Giày', origin: 'Việt Nam' },
];

export default function BrandsPage() {
  return (
    <>
      <Helmet>
        <title>Thương hiệu đối tác - LUXE</title>
      </Helmet>
      <Header />
      <div className="min-h-screen">
        <div className="bg-black text-white py-16 text-center">
          <h1 className="text-4xl font-bold mb-3">Thương hiệu đối tác</h1>
          <p className="text-gray-300">Các thương hiệu uy tín hàng đầu Việt Nam</p>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <div
                key={brand.name}
                className="border rounded-xl p-6 text-center hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:from-amber-200 transition-colors">
                  <span className="text-xl font-bold text-amber-600">{brand.name[0]}</span>
                </div>
                <h3 className="font-bold mb-1">{brand.name}</h3>
                <p className="text-xs text-muted-foreground">{brand.category}</p>
                <p className="text-xs text-muted-foreground">{brand.origin}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
