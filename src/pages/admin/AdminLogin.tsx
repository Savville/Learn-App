import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, ShieldCheck } from 'lucide-react';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const ADMIN_EMAIL = 'ochiwilliamotieno@gmail.com';

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/public/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send code');
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/public/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');

      if (!data.isAdmin) {
        setError('Access denied. Only the platform administrator can access this page.');
        return;
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminEmail', data.email);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950/95 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/60 p-8 shadow-xl backdrop-blur-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <ShieldCheck className="h-7 w-7 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              Admin Access
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              OTP verification for platform administrator.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-800/50 bg-red-950/50 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={ADMIN_EMAIL}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-4 text-slate-50 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                style={{ backgroundColor: '#0933ed', color: '#ffffff' }}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Access Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Access Code (OTP)</label>
                <p className="mb-2 text-xs text-slate-500">
                  A 6-digit code was sent to <span className="font-medium text-slate-300">{email}</span>
                </p>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-center text-xl tracking-widest text-slate-50 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                style={{ backgroundColor: '#0933ed', color: '#ffffff' }}
                disabled={loading || otp.length !== 6}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Access'}
              </Button>
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="w-full text-sm text-slate-500 hover:text-slate-300"
              >
                Change Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
