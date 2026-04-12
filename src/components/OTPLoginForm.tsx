import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail } from 'lucide-react';

interface OTPLoginFormProps {
  onSuccess: (token: string, email: string) => void;
  title?: string;
  subtitle?: string;
}

export function OTPLoginForm({ onSuccess, title = "Secure Verification", subtitle = "Enter your email to receive a 4-digit access code." }: OTPLoginFormProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/public/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(res.ok ? 'Failed to process request' : (text.includes('Cannot POST') ? 'Backend server needs restarting' : 'Server returned an invalid response'));
      }
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
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/public/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch(e) {
        throw new Error(res.ok ? 'Failed to process request' : (text.includes('Cannot POST') ? 'Backend server needs restarting' : 'Server returned an invalid response'));
      }
      if (!res.ok) throw new Error(data.error || 'Invalid code. Try again.');
      
      // Save locally
      localStorage.setItem('user_token', data.token);
      localStorage.setItem('user_email', data.email);
      onSuccess(data.token, data.email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center animate-in fade-in zoom-in duration-300">
      <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
        <Mail className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-600 text-sm mb-8">{subtitle}</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <Input 
            type="email" 
            required 
            placeholder="Enter your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-6 text-center text-lg rounded-xl bg-slate-50 border-slate-200"
          />
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:shadow-lg transition-all rounded-xl"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Access Code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <p className="text-sm text-slate-500 mb-4">We sent a 4-digit code to <strong className="text-slate-800">{email}</strong></p>
          <Input 
            type="text" 
            required 
            placeholder="0 0 0 0" 
            maxLength={4}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full py-6 text-center text-3xl tracking-[1em] font-mono rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
          />
          <Button 
            type="submit" 
            disabled={loading || otp.length !== 4}
            className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:shadow-lg transition-all rounded-xl mb-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Access'}
          </Button>
          <button 
            type="button" 
            onClick={() => setStep(1)}
            className="text-sm text-blue-600 hover:text-blue-800 underline underline-offset-4"
          >
            Wrong email? Go back.
          </button>
        </form>
      )}
    </div>
  );
}