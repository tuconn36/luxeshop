import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = (product) => {
    if (compareList.find(p => p.id === product.id)) {
      toast.info('Sản phẩm đã có trong danh sách so sánh');
      return;
    }
    if (compareList.length >= 3) {
      toast.error('Chỉ so sánh tối đa 3 sản phẩm cùng lúc');
      return;
    }
    setCompareList(prev => [...prev, product]);
    toast.success('Đã thêm vào so sánh');
  };

  const removeFromCompare = (id) => {
    setCompareList(prev => prev.filter(p => p.id !== id));
  };

  const clearCompare = () => setCompareList([]);

  const isInCompare = (id) => compareList.some(p => p.id === id);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
