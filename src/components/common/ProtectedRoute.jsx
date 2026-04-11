import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check email verification for students - redirect to verification page if not verified
  if (user?.role === 'student' && !user?.emailVerified) {
    return <Navigate to="/verify-email-required" replace />;
  }

  // Check email verification for clients - redirect to verification page if not verified
  // Exception: Allow access to startup profile page even if email is not verified
  if (user?.role === 'client' && !user?.emailVerified) {
    // Allow access to startup profile page
    if (location.pathname !== '/client/startup-profile') {
      return <Navigate to="/verify-email-required" replace />;
    }
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'client') {
      return <Navigate to="/client/dashboard" replace />;
    } else {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
