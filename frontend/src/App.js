import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from './components/ui/sonner';
import '@/App.css';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import ServiceDiscovery from './pages/ServiceDiscovery';
import ServiceDetail from './pages/ServiceDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import BookingStatus from './pages/BookingStatus';
import ChangePinPage from './pages/ChangePinPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}-dashboard`} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}-dashboard`} /> : <RegisterPage />} />
      <Route path="/services" element={<ServiceDiscovery />} />
      <Route path="/services/:serviceId" element={<ServiceDetail />} />
      <Route path="/change-pin" element={<ChangePinPage />} />
      <Route path="/track/:bookingId" element={<BookingStatus />} />
      
      <Route
        path="/user-dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute requiredRole="user">
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute requiredRole="user">
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider-dashboard"
        element={
          <ProtectedRoute requiredRole="provider">
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;