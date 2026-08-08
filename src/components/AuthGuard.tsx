import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export function AuthGuard({ children, allowAdmin = false }: { children: React.ReactNode, allowAdmin?: boolean }) {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('user_token') || (allowAdmin && !!localStorage.getItem('adminToken'));

  if (!isAuthenticated) {
    // Redirect to login page but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
