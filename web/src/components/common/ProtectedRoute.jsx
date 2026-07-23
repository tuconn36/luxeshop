import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { currentUser, initialLoading } = useAuth();
  const location = useLocation();

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login with return URL
    return <Navigate to={`/signup?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}