import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, usersAPI } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    const { user, token } = await authAPI.login(email, password);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    
    return { user, token };
  };

  const register = async (email, password, name) => {
    const { user, token } = await authAPI.register(email, password, name);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    
    return { user, token };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const updateProfile = async (data) => {
    const updated = await usersAPI.update(currentUser.id, data);
    
    localStorage.setItem('user', JSON.stringify(updated));
    setCurrentUser(updated);
    
    return updated;
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated: !!currentUser,
      login,
      register,
      logout, 
      updateProfile, 
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