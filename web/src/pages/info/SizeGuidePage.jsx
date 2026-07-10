import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const menSizes = [
  { size: 'XS', chest: '82-86', waist: '66-70', hip: '86-90' },
  { size: 'S', chest: '86-90', waist: '70-74', hip: '90-94' },
  { size: 'M', chest: '90-94', waist: '74-78', hip: '94-98' },
  { size: 'L', chest: '94-98', waist: '78-82', hip: '98-102' },
  { size: 'XL', chest: '98-102', waist: '82-86', hip: '102-106' },
  { size: 'XXL', chest: '102-108', waist: '86-92', hip: '106-112' },
];

const womenSizes = [
  { size: 'XS', chest: '78-82', waist: '60-64', hip: '84-88' },
  { size: 'S', chest: '82-86', waist: '64-68', hip: '88-92' },
  { size: 'M', chest: '86-90', waist: '68-72', hip: '92-96' },
  { size: 'L', chest: '90-94', waist: '72-76', hip: '96-100' },
  { size: 'XL', chest: '94-98', waist: '76-80', hip: '100-104' },
  { size: 'XXL', chest: '98-104', waist: '80-86', hip: '104-110' },
];

function SizeTable({ sizes }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-black text-white">
            <th className="px-4 py-3 text-left">Size</th>
            <th className="px-4 py-3 text-center">Ngực (cm)</th>
            <th className="px-4 py-3 text-center">Eo (cm)</th>
            <th className="px-4 py-3 text-center">Hông (cm)</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((row, i) => (
            <tr key={row.size} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="px-4 py-3 font-bold text-amber-600">{row.size}</td>
              <td className="px-4 py-3 text-center">{row.chest}</td>
              <td className="px-4 py-3 text-center">{row.waist}</td>
              <td className="px-4 py-3 text-center">{row.hip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuidePage() {
  return (
    <>
      <Helmet>
        <title>Hướng dẫn chọn size - LUXE</title>
      </Helmet>
      <Header />
      <div className="min-h-screen">
        <div className="bg-black text-white py-16 text-center">
          <h1 className="text-4xl font-bold mb-3">Hướng dẫn chọn size</h1>
          <p className="text-gray-300">Chọn đúng size để có trải nghiệm mặc tốt nhất</p>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* How to measure */}
          <div className="mb-10 p-6 bg-amber-50 rounded-xl border border-amber-100">
            <h2 className="font-bold text-lg mb-3">Cách đo size</h2>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Ngực: Đo vòng quanh phần ngực rộng nhất</li>
              <li>Eo: Đo vòng quanh phần eo nhỏ nhất</li>
              <li>Hông: Đo vòng quanh phần hông rộng nhất</li>
              <li>Nên đo khi mặc đồ mỏng hoặc không mặc áo</li>
            </ul>
          </div>

          <Tabs defaultValue="men">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="men" className="flex-1">Nam</TabsTrigger>
              <TabsTrigger value="women" className="flex-1">Nữ</TabsTrigger>
            </TabsList>
            <TabsContent value="men">
              <SizeTable sizes={menSizes} />
            </TabsContent>
            <TabsContent value="women">
              <SizeTable sizes={womenSizes} />
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            * Kích thước có thể chênh lệch ±2cm tùy từng sản phẩm
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
