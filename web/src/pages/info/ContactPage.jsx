import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại sớm.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <Helmet>
        <title>Liên hệ hợp tác - LUXE</title>
      </Helmet>
      <Header />
      <div className="min-h-screen">
        <div className="bg-black text-white py-16 text-center">
          <h1 className="text-4xl font-bold mb-3">Liên hệ hợp tác</h1>
          <p className="text-gray-300">Chúng tôi luôn sẵn sàng lắng nghe bạn</p>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Thông tin liên hệ</h2>
            <div className="space-y-5">
              {[
                { icon: Phone, label: 'Hotline', value: '0865 577 745', href: 'tel:0865577745' },
                { icon: Mail, label: 'Email', value: 'contact@luxe.vn', href: 'mailto:contact@luxe.vn' },
                { icon: MapPin, label: 'Địa chỉ', value: '123 Lê Lợi, Quận 1, TP.HCM', href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    {href ? (
                      <a href={href} className="font-medium hover:text-amber-600">{value}</a>
                    ) : (
                      <p className="font-medium">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-amber-50 rounded-xl border border-amber-100">
              <h3 className="font-semibold mb-2">Giờ làm việc</h3>
              <p className="text-sm text-muted-foreground">Thứ 2 - Thứ 6: 8:00 - 18:00</p>
              <p className="text-sm text-muted-foreground">Thứ 7 - Chủ nhật: 9:00 - 17:00</p>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Gửi yêu cầu</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Họ và tên"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                placeholder="Tiêu đề"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
              <Textarea
                placeholder="Nội dung"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
              <Button type="submit" className="w-full gap-2">
                <Send className="w-4 h-4" /> Gửi yêu cầu
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
