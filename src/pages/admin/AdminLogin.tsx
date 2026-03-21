import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_URL}/admin/login`, { password });
      
      const { token } = response.data;
      if (token) {
        sessionStorage.setItem('adminToken', token);
        navigate('/admin/dashboard');
      } else {
        setError('Invalid server response: no token received.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please verify password and backend connection.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950/95 px-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-800/60 bg-slate-950/60 shadow-xl backdrop-blur-md">
          <CardHeader className="space-y-2">
            <CardTitle className="text-center text-2xl font-semibold tracking-tight text-slate-50">
              Admin Access
            </CardTitle>
            <p className="text-center text-sm text-slate-400">
              Internal tools for managing opportunities.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900/60 text-slate-50 placeholder:text-slate-500 border-slate-700 focus-visible:ring-primary"
                required
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button
                type="submit"
                size="lg"
                className="mt-1 w-full"
                style={{ backgroundColor: '#0933ed', color: '#ffffff' }}
                disabled={loading}
              >
                {loading ? 'Verifying…' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
