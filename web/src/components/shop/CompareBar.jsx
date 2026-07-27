import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, BarChart2 } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext.jsx';

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length === 0) return null;

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold shrink-0">
          <BarChart2 className="w-5 h-5 text-primary" />
          So sánh ({compareList.length}/3)
        </div>

        <div className="flex flex-1 gap-3 overflow-x-auto">
          {compareList.map(p => {
            const img = p.images?.[0];
            const imgUrl = img ? (img.startsWith('http') ? img : `${baseUrl}${img}`) : null;
            return (
              <div key={p.id} className="flex items-center gap-2 border rounded-lg px-3 py-2 shrink-0 bg-muted/30 min-w-0">
                {imgUrl && (
                  <img src={imgUrl} alt={p.name} className="w-10 h-10 rounded object-cover shrink-0" />
                )}
                <span className="text-sm truncate max-w-[120px]">{p.name}</span>
                <button onClick={() => removeFromCompare(p.id)} className="ml-1 text-gray-400 hover:text-red-500 shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {/* Empty slots */}
          {Array.from({ length: 3 - compareList.length }).map((_, i) => (
            <div key={i} className="border-2 border-dashed rounded-lg px-6 py-2 shrink-0 text-xs text-muted-foreground">
              + Thêm sản phẩm
            </div>
          ))}
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="text-sm text-muted-foreground hover:text-gray-900 px-3 py-2"
          >
            Xóa tất cả
          </button>
          <button
            onClick={() => navigate('/compare')}
            disabled={compareList.length < 2}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            So sánh ngay <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
