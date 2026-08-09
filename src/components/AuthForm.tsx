import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AuthFormProps {
  onSuccess: (token: string, email: string) => void;
  title?: string;
  subtitle?: string;
}

export function AuthForm({ onSuccess, title, subtitle }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      if (!otpStep) {
        // Send OTP
        const res = await fetch(`${API_BASE}/public/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch (e) { throw new Error('Invalid response'); }
        if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
        
        setOtpStep(true);
        setLoading(false);
        return;
      } else {
        // Verify OTP and Authenticate/Register
        const payload = mode === 'register' 
          ? { email, otp, username, mpesaPhone }
          : { email, otp };

        const verifyRes = await fetch(`${API_BASE}/public/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const verifyText = await verifyRes.text();
        let verifyData;
        try { verifyData = JSON.parse(verifyText); } catch (e) { throw new Error('Invalid response'); }
        if (!verifyRes.ok) throw new Error(verifyData.error || 'Invalid OTP');

        // Save locally
        localStorage.setItem('user_token', verifyData.token);
        localStorage.setItem('user_email', verifyData.email);
        onSuccess(verifyData.token, verifyData.email);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border border-slate-100 text-left">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title || (mode === 'login' ? 'Welcome Back' : 'Create an Account')}</h2>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          {subtitle || (mode === 'login' ? 'Enter your email to receive a secure login code.' : 'Join us to access exclusive opportunities.')}
        </p>

        {/* Tabs */}
        {!otpStep && (
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'login' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setMode('login'); setError(null); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'register' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setMode('register'); setError(null); }}
            >
              Sign Up
            </button>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {otpStep ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
              <p className="text-xs text-gray-500 mb-2">We sent a 6-digit code to {email}</p>
              <input 
                type="text" 
                required 
                maxLength={6}
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                placeholder="123456" 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-center tracking-widest text-lg"
              />
            </div>
          ) : (
            <>
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username / Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    placeholder="e.g. Jane Doe" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

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

              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MPESA Phone Number <span className="text-gray-400 font-normal">(Optional initially)</span></label>
                  <input 
                    type="tel" 
                    value={mpesaPhone} 
                    onChange={e => setMpesaPhone(e.target.value)} 
                    placeholder="e.g. 0712345678" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              {mode === 'register' && (
                <div className="flex items-start gap-2 py-2">
                  <input type="checkbox" id="termsLogin" required defaultChecked className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <label htmlFor="termsLogin" className="text-sm text-gray-600">
                    I agree to the <Link to="/about#terms" target="_blank" className="text-blue-600 hover:underline font-medium">Terms and Conditions</Link>
                  </label>
                </div>
              )}
            </>
          )}

          <button 
            type="submit" 
            disabled={loading || (otpStep && otp.length !== 6)}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#131ADF] text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : otpStep ? 'Verify & Continue' : 'Send Code'}
          </button>
        </form>
      </div>
    </div>
  );
}
