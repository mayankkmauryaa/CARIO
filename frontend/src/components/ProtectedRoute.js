import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ children, requireRole }) => {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requireRole) {
    const hasRequiredRole =
      role === requireRole ||
      (role === 'both' && (requireRole === 'rider' || requireRole === 'driver'));

    if (!hasRequiredRole) {
      return <Navigate to="/role-selection" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
