import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const CART_STORAGE_KEY = 'luxe_cart';

export function useCart() {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1, selectedSize = null, selectedColor = null) => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        item => item.id === product.id && 
                item.selectedSize === selectedSize && 
                item.selectedColor === selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prevItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity,
        selectedSize,
        selectedColor,
        product
      }];
    });
  };

  const removeFromCart = (productId, selectedSize = null, selectedColor = null) => {
    setItems(prevItems => 
      prevItems.filter(item => 
        !(item.id === productId && 
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor)
      )
    );
  };

  const updateQuantity = (productId, quantity, selectedSize = null, selectedColor = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor);
      return;
    }

    setItems(prevItems => 
      prevItems.map(item => 
        item.id === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getItemCount
  };
}