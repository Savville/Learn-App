import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="py-16 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border border-slate-100 text-left">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {step === 1 ? (
          <>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">{subtitle}</p>
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="your.email@example.com" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex items-start gap-2 pb-2">
                <input type="checkbox" id="termsLogin" required defaultChecked className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <label htmlFor="termsLogin" className="text-sm text-gray-600">
                  I agree to the <Link to="/about#terms" target="_blank" className="text-blue-600 hover:underline font-medium">Terms and Conditions</Link>
                </label>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Access Code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              We've sent a 4-digit code to <span className="font-bold text-gray-900">{email}</span>.
            </p>
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Code (OTP)</label>
                <input 
                  type="text" 
                  required 
                  maxLength={4}
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                  placeholder="1234" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-center text-xl tracking-widest"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || otp.length !== 4}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Access'}
              </button>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Change Email
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
