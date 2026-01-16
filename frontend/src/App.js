import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/LoginPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import RoleSelectionPage from './pages/RoleSelectionPage';

// Rider Pages
import RiderHomePage from './pages/rider/RiderHomePage';
import RiderBookingPage from './pages/rider/RiderBookingPage';
import RiderTrackingPage from './pages/rider/RiderTrackingPage';

// Driver Pages
import DriverDashboardPage from './pages/driver/DriverDashboardPage';

function App() {
  const { isAuthenticated, role } = useAuthStore();

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    if (!role) return '/role-selection';
    if (role === 'rider' || role === 'both') return '/rider';
    return '/driver';
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          
          {/* Role Selection */}
          <Route
            path="/role-selection"
            element={
              <ProtectedRoute>
                <RoleSelectionPage />
              </ProtectedRoute>
            }
          />

          {/* Rider Routes */}
          <Route
            path="/rider"
            element={
              <ProtectedRoute requireRole="rider">
                <RiderHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rider/booking"
            element={
              <ProtectedRoute requireRole="rider">
                <RiderBookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rider/tracking"
            element={
              <ProtectedRoute requireRole="rider">
                <RiderTrackingPage />
              </ProtectedRoute>
            }
          />

          {/* Driver Routes */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute requireRole="driver">
                <DriverDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster position="top-center" richColors />
      </div>
    </BrowserRouter>
  );
}

export default App;
