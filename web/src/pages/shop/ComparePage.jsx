import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '@/contexts/CompareContext.jsx';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { Button } from '@/components/ui/button';
import { X, Check, Minus } from 'lucide-react';

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length < 2) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">So Sánh Sản Phẩm</h1>
            <p className="text-muted-foreground mb-8">
              Cần ít nhất 2 sản phẩm để so sánh. Hiện tại bạn có {compareList.length} sản phẩm.
            </p>
            <Link to="/products">
              <Button>Tiếp tục mua sắm</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const getImageUrl = (img) => {
    if (!img) return null;
    return img.startsWith('http') ? img : `${baseUrl}${img}`;
  };

  const categories = compareList.map(p => p.category);
  const allSameCategory = categories.every(c => c === categories[0]);

  const specs = [
    { key: 'price', label: 'Giá', render: (p) => `${Number(p.price)?.toLocaleString('vi-VN')}₫` },
    { key: 'original_price', label: 'Giá gốc', render: (p) => p.original_price ? `${Number(p.original_price)?.toLocaleString('vi-VN')}₫` : '-' },
    { key: 'category', label: 'Danh mục', render: (p) => p.category },
    { key: 'stock', label: 'Tình trạng', render: (p) => p.stock > 0 ? `Còn hàng (${p.stock})` : 'Hết hàng' },
    { key: 'description', label: 'Mô tả', render: (p) => p.description?.slice(0, 100) + (p.description?.length > 100 ? '...' : '') },
  ];

  if (allSameCategory) {
    specs.push(
      { key: 'materials', label: 'Chất liệu', render: (p) => Array.isArray(p.materials) ? p.materials.join(', ') : p.materials || '-' },
      { key: 'sizes', label: 'Kích thước', render: (p) => Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes || '-' },
      { key: 'colors', label: 'Màu sắc', render: (p) => Array.isArray(p.colors) ? p.colors.join(', ') : p.colors || '-' }
    );
  }

  const hasDiscount = (p) => p.original_price && p.original_price > p.price;
  const bestPrice = Math.min(...compareList.map(p => p.price));
  const bestStock = Math.max(...compareList.map(p => p.stock));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">So Sánh Sản Phẩm</h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={clearCompare}>Xóa tất cả</Button>
              <Link to="/products">
                <Button variant="secondary">Thêm sản phẩm</Button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left w-40 bg-muted/50 border-b sticky left-0 z-10"></th>
                  {compareList.map(p => (
                    <th key={p.id} className="p-4 text-center w-64 border-b min-w-[256px]">
                      <div className="relative">
                        <button
                          onClick={() => removeFromCompare(p.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <Link to={`/product/${p.id}`}>
                          <img
                            src={getImageUrl(p.images?.[0])}
                            alt={p.name}
                            className="w-full aspect-square object-cover rounded-lg mb-3"
                          />
                          <h3 className="font-semibold line-clamp-2">{p.name}</h3>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specs.map((spec, i) => (
                  <tr key={spec.key} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                    <td className="p-4 font-medium border-b sticky left-0 bg-background z-10">
                      {spec.label}
                    </td>
                    {compareList.map(p => (
                      <td key={p.id} className="p-4 text-center border-b">
                        {spec.key === 'price' && (
                          <div>
                            <span className={`font-bold ${p.price === bestPrice ? 'text-green-600' : ''}`}>
                              {spec.render(p)}
                            </span>
                            {p.price === bestPrice && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Giá tốt nhất</span>
                            )}
                          </div>
                        )}
                        {spec.key === 'stock' && (
                          <div>
                            <span className={`${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {spec.render(p)}
                            </span>
                            {p.stock === bestStock && bestStock > 0 && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Nhiều nhất</span>
                            )}
                          </div>
                        )}
                        {(spec.key === 'original_price' || spec.key === 'category' || spec.key === 'description' || spec.key === 'materials' || spec.key === 'sizes' || spec.key === 'colors') && (
                          <span className="text-muted-foreground">{spec.render(p)}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Actions Row */}
                <tr>
                  <td className="p-4 font-medium sticky left-0 bg-background z-10"></td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 text-center">
                      <Link to={`/product/${p.id}`}>
                        <Button className="w-full">Xem chi tiết</Button>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
