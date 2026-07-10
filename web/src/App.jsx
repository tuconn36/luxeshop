import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import HomePage from './pages/home/HomePage.jsx';
import ProductListPage from './pages/shop/ProductListPage.jsx';
import ProductDetailPage from './pages/shop/ProductDetailPage.jsx';
import SimplePage from './pages/simple.jsx';
import CartPage from './pages/shop/CartPage.jsx';
import CheckoutPage from './pages/shop/CheckoutPage.jsx';
import OrderHistoryPage from './pages/account/OrderHistoryPage.jsx';
import AccountPage from './pages/account/AccountPage.jsx';
import AccountLayout from './pages/account/AccountLayout.jsx';
import ProfilePage from './pages/account/ProfilePage.jsx';
import AddressPage from './pages/account/AddressPage.jsx';
import MeasurementsPage from './pages/account/MeasurementsPage.jsx';
import AccountOrdersPage from './pages/account/AccountOrdersPage.jsx';
import MyAccountPage from './pages/account/MyAccountPage.jsx';
import ChangePasswordPage from './pages/account/ChangePasswordPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import NewArrivalsPage from './pages/shop/NewArrivalsPage.jsx';
import SalePage from './pages/shop/SalePage.jsx';
import MenPage from './pages/shop/MenPage.jsx';
import WomenPage from './pages/shop/WomenPage.jsx';
import AccessoriesPage from './pages/shop/AccessoriesPage.jsx';
import AboutPage from './pages/info/AboutPage.jsx';
import BrandsPage from './pages/info/BrandsPage.jsx';
import StoresPage from './pages/info/StoresPage.jsx';
import ContactPage from './pages/info/ContactPage.jsx';
import SizeGuidePage from './pages/info/SizeGuidePage.jsx';
import PolicyPage from './pages/policy/PolicyPage.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/simple" element={<SimplePage />} />
          <Route path="/new-arrivals" element={<NewArrivalsPage />} />
          <Route path="/sale" element={<SalePage />} />
          <Route path="/men" element={<MenPage />} />
          <Route path="/women" element={<WomenPage />} />
          <Route path="/accessories" element={<AccessoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/size-guide" element={<SizeGuidePage />} />
          <Route path="/policy/:type" element={<PolicyPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MyAccountPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
            <Route path="address" element={<AddressPage />} />
            <Route path="measurements" element={<MeasurementsPage />} />
            <Route path="orders" element={<AccountOrdersPage />} />
          </Route>
        </Routes>
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              error: 'animate-shake border-red-500 bg-red-50 text-red-700',
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
