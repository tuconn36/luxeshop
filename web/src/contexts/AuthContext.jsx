import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, usersAPI } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          // Parse user data
          const userData = JSON.parse(user);
          
          // Simple JWT expiry check (if token is well-formed)
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp && payload.exp * 1000 < Date.now();
            
            if (isExpired) {
              // Token expired, clear localStorage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            } else {
              setCurrentUser(userData);
            }
          } catch {
            // If token is malformed, just set user (backend will validate on API calls)
            setCurrentUser(userData);
          }
        } catch (e) {
          // If JSON parsing fails, clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setInitialLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (identifier, password) => {
    const { user, token } = await authAPI.login(identifier, password);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    
    return { user, token };
  };

  const register = async (email, password, name) => {
    const { user, token } = await authAPI.register({ email, password, name });
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    
    return { user, token };
  };

  const logout = () => {
    // Xóa auth
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Xóa toàn bộ data theo user (tránh leak cart/coupon/address qua account khác)
    const userScopedKeys = [
      'cart',
      'luxe_cart',
      'luxe_applied_coupon',
      'saved_addresses',
      'wishlist',
      'luxe_wishlist',
      'luxe_compare',
      'recentlyViewed',
      'luxe_recently_viewed',
    ];
    userScopedKeys.forEach((k) => {
      try { localStorage.removeItem(k); } catch { /* ignore */ }
    });
    // Dispatch event để các context khác (cart, wishlist) reset state
    try { window.dispatchEvent(new CustomEvent('luxe:user-logged-out')); } catch { /* ignore */ }
    setCurrentUser(null);
  };

  // Lắng nghe sự kiện 401 toàn cục từ apiCall
  useEffect(() => {
    const handleAuthExpired = () => {
      if (currentUser) {
        logout();
        // Có thể thêm toast sau: toast.error('Phiên đăng nhập đã hết hạn');
      }
    };
    window.addEventListener('luxe:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('luxe:auth-expired', handleAuthExpired);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const updateProfile = async (data) => {
    if (!currentUser?.id) {
      throw new Error('Bạn chưa đăng nhập');
    }
    const updated = await usersAPI.update(currentUser.id, data);
    // Dùng functional updater để luôn merge với state mới nhất, tránh race condition
    // khi có nhiều update liên tiếp.
    const merged = { ...currentUser, ...updated };
    localStorage.setItem('user', JSON.stringify(merged));
    setCurrentUser(merged);
    return merged;
  };

  const requestOTP = async (identifier, method = 'email') => {
    const result = await authAPI.requestOTP(identifier, method);
    return result;
  };

  const verifyOTP = async (otpId, code) => {
    const { user, token, isNewUser, needsPassword } = await authAPI.verifyOTP(otpId, code);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    
    return { user, token, isNewUser, needsPassword };
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated: !!currentUser,
      login,
      register,
      logout, 
      updateProfile,
      updateUser: (data) => {
        const updated = { ...currentUser, ...data };
        localStorage.setItem('user', JSON.stringify(updated));
        setCurrentUser(updated);
      },
      requestOTP,
      verifyOTP,
      initialLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}