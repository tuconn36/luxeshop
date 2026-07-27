import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'
import UsersPage from './pages/UsersPage'
import CategoriesPage from './pages/CategoriesPage'
import ReviewsPage from './pages/ReviewsPage'
import PromotionsPage from './pages/PromotionsPage'
import BannersPage from './pages/BannersPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-slate-500 text-sm">Đang tải...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="products"   element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="orders"     element={<OrdersPage />} />
          <Route path="users"      element={<UsersPage />} />
          <Route path="reviews"    element={<ReviewsPage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="banners"    element={<BannersPage />} />
          <Route path="analytics"  element={<AnalyticsPage />} />
          <Route path="settings"   element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}

export default App