import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistAPI } from '@/lib/api.js';
import { useAuth } from './AuthContext.jsx';
import { toast } from 'sonner';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { currentUser, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const data = await wishlistAPI.list();
      setWishlist(data);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu sản phẩm yêu thích');
      return false;
    }

    try {
      await wishlistAPI.add(productId);
      await loadWishlist();
      toast.success('Đã thêm vào danh sách yêu thích');
      return true;
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      toast.error('Không thể thêm vào danh sách yêu thích');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      setWishlist((prev) => prev.filter((item) => item.id !== productId));
      toast.success('Đã xóa khỏi danh sách yêu thích');
      return true;
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast.error('Không thể xóa khỏi danh sách yêu thích');
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        refreshWishlist: loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
