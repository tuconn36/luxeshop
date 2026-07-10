import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { Users, Award, Heart, Leaf } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>Giới thiệu - LUXE</title>
      </Helmet>
      <Header />
      <div className="min-h-screen">
        {/* Hero */}
        <div className="bg-black text-white py-20 text-center">
          <h1 className="text-5xl font-bold mb-4">Về LUXE</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Thời trang cao cấp, phong cách sống hiện đại
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-16">
          {/* Story */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl font-bold mb-6">Câu chuyện của chúng tôi</h2>
              <p className="text-muted-foreground mb-4">
                LUXE được thành lập với sứ mệnh mang đến những sản phẩm thời trang chất lượng cao, 
                kết hợp giữa phong cách hiện đại và tinh tế.
              </p>
              <p className="text-muted-foreground">
                Từ năm 2020, chúng tôi đã không ngừng phát triển, mang đến hàng nghìn sản phẩm 
                từ các thương hiệu uy tín trong và ngoài nước đến tay khách hàng Việt Nam.
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl h-64 flex items-center justify-center">
              <span className="text-6xl font-bold text-amber-600">LUXE</span>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {[
              { icon: Award, title: 'Chất lượng', desc: 'Cam kết sản phẩm chính hãng 100%' },
              { icon: Users, title: 'Cộng đồng', desc: 'Hơn 50,000 khách hàng tin tưởng' },
              { icon: Heart, title: 'Tận tâm', desc: 'Dịch vụ khách hàng 24/7' },
              { icon: Leaf, title: 'Bền vững', desc: 'Cam kết phát triển bền vững' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-xl border">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-3">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-black text-white rounded-2xl p-10 grid grid-cols-3 gap-8 text-center">
            {[
              { num: '50K+', label: 'Khách hàng' },
              { num: '500+', label: 'Thương hiệu' },
              { num: '10K+', label: 'Sản phẩm' },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="text-4xl font-bold text-amber-400 mb-2">{num}</div>
                <div className="text-gray-300">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
