import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthGuard } from '../components/AuthGuard';

export function Login() {
  return (
    <AuthGuard>
      <Navigate to="/opportunities" replace />
    </AuthGuard>
  );
}
