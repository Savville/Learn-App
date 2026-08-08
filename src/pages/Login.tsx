import React, { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect away
  const isAuthenticated = !!localStorage.getItem('user_token');
  if (isAuthenticated) {
    return <Navigate to="/opportunities" replace />;
  }

  const handleSuccess = (token: string, email: string) => {
    window.dispatchEvent(new Event('auth-changed'));
    // Redirect to where they came from, or default to /opportunities
    const from = location.state?.from?.pathname || '/opportunities';
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-20">
      <AuthForm 
        onSuccess={handleSuccess} 
        title="Welcome to Opportunities Kenya" 
      />
    </div>
  );
}
