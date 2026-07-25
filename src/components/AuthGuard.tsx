import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Sparkles, ShieldCheck } from 'lucide-react';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthGuard({ children, allowAdmin = false }: { children: React.ReactNode, allowAdmin?: boolean }) {
  const [loginEmail, setLoginEmail] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!localStorage.getItem('user_token') || (allowAdmin && !!localStorage.getItem('adminToken'));

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-[#131ADF] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <ShieldCheck className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Sign in to Access</h2>
          <p className="text-blue-100 text-sm relative z-10">We use a passwordless system. We'll send a magic code to your email.</p>
        </div>
        
        <div className="p-8">
          {!showOTP ? (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setAuthLoading(true);
              setError(null);
              try {
                const res = await fetch(`${API_BASE}/public/auth/send-otp`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: loginEmail })
                });
                if (res.ok) setShowOTP(true);
                else {
                  const data = await res.json();
                  setError(data.error || 'Failed to send code');
                }
              } catch (err) { setError('Network error'); }
              setAuthLoading(false);
            }} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Email Address</label>
                <Input
                  required
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. name@organization.org"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-gray-50/50 transition-colors h-auto"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" disabled={authLoading} className="w-full py-4 h-auto rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white mt-4">
                {authLoading ? 'Sending...' : 'Send Access Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setAuthLoading(true);
              setError(null);
              try {
                const res = await fetch(`${API_BASE}/public/auth/verify-otp`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: loginEmail, otp })
                });
                const data = await res.json();
                if (res.ok) {
                  localStorage.setItem('user_token', data.token);
                  localStorage.setItem('user_email', data.email);
                  
                  // Dispatch a custom event so the Header can update instantly without a hard reload
                  window.dispatchEvent(new Event('auth-changed'));
                  
                  setShowOTP(false);
                } else {
                  setError(data.error || 'Invalid code');
                }
              } catch (err) { setError('Network error'); }
              setAuthLoading(false);
            }} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Enter Access Code</label>
                <Input
                  required
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-gray-50/50 transition-colors h-auto text-center tracking-widest text-lg font-bold"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-2">Code sent to {loginEmail}</p>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex flex-col gap-3 mt-4">
                <Button type="submit" disabled={authLoading} className="w-full py-4 h-auto rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white">
                  {authLoading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
                <button type="button" onClick={() => setShowOTP(false)} className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                  Use a different email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
