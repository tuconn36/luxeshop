import { useState, useEffect, useCallback } from 'react';

const CART_STORAGE_KEY = 'luxe_cart';

// Chỉ giữ các trường cần thiết để tránh localStorage phình to (giới hạn ~5MB).
function toCartItem(product, quantity, selectedSize, selectedColor) {
  return {
    id: product.id,
    name: product.name,
    price: Number(product.price) || 0,
    image: product.images?.[0] || '',
    quantity,
    selectedSize: selectedSize ?? null,
    selectedColor: selectedColor ?? null,
  };
}

export function useCart() {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Đồng bộ xuống localStorage mỗi khi items đổi
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('[useCart] Không thể lưu cart vào localStorage:', err);
    }
  }, [items]);

  const addToCart = useCallback((product, quantity = 1, selectedSize = null, selectedColor = null) => {
    if (!product?.id) {
      console.warn('[useCart] addToCart: product.id bắt buộc');
      return;
    }

    // Không cho vượt quá tồn kho
    const stock = Number(product.stock);
    const safeStock = Number.isFinite(stock) && stock > 0 ? stock : Infinity;
    if (quantity > safeStock) quantity = safeStock;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = Math.min(updated[existingIndex].quantity + quantity, safeStock);
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      }

      return [...prevItems, toCartItem(product, quantity, selectedSize, selectedColor)];
    });
  }, []);

  const removeFromCart = useCallback((productId, selectedSize = null, selectedColor = null) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          )
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productId, quantity, selectedSize = null, selectedColor = null, maxStock = Infinity) => {
      if (quantity <= 0) {
        removeFromCart(productId, selectedSize, selectedColor);
        return;
      }

      // Giới hạn số lượng theo tồn kho nếu được truyền vào
      const safeQty = Math.min(quantity, maxStock);

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
            ? { ...item, quantity: safeQty }
            : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getItemCount,
  };
}