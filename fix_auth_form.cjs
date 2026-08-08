const fs = require('fs');
const file = 'src/components/AuthForm.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('otpStep')) {
  content = content.replace(
    'const [error, setError] = useState<string | null>(null);',
    "const [error, setError] = useState<string | null>(null);\n  const [otpStep, setOtpStep] = useState(false);\n  const [otp, setOtp] = useState('');"
  );
  
  const submitLogic = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        if (!otpStep) {
          // Send OTP
          const res = await fetch(\`\${API_BASE}/public/auth/send-otp\`, {
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
          // Verify OTP first
          const verifyRes = await fetch(\`\${API_BASE}/public/auth/verify-otp\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
          });
          const verifyText = await verifyRes.text();
          let verifyData;
          try { verifyData = JSON.parse(verifyText); } catch (e) { throw new Error('Invalid response'); }
          if (!verifyRes.ok) throw new Error(verifyData.error || 'Invalid OTP');
        }
      }

      // Proceed to login or register (after OTP verified)
      const endpoint = mode === 'register' ? '/public/auth/register' : '/public/auth/login';
      const payload = mode === 'register' 
        ? { email, password, username, mpesaPhone }
        : { email, password };

      const res = await fetch(\`\${API_BASE}\${endpoint}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(res.ok ? 'Failed to process request' : 'Server returned an invalid response');
      }

      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      // Save locally
      localStorage.setItem('user_token', data.token);
      localStorage.setItem('user_email', data.email);
      onSuccess(data.token, data.email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };`;

  content = content.replace(/const handleSubmit = async.*?};/s, submitLogic);
  
  const otpUI = `          {mode === 'register' && otpStep && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
              <p className="text-xs text-gray-500 mb-2">We sent a 6-digit code to {email}</p>
              <input 
                type="text" 
                required 
                maxLength={6}
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\\D/g, ''))} 
                placeholder="123456" 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-center tracking-widest text-lg"
              />
            </div>
          )}

          {(!otpStep || mode === 'login') && (
            <>
              {mode === 'register' && (`;
              
  content = content.replace('{mode === \'register\' && (', otpUI);
  
  const submitButtonUI = `          <button 
            type="submit" 
            disabled={loading || (otpStep && otp.length !== 6)}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#131ADF] text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'Sign In' : otpStep ? 'Verify & Register' : 'Continue'}
          </button>`;
          
  content = content.replace(/<button[^>]*type="submit"[^>]*>[\s\S]*?<\/button>/, submitButtonUI);
  
  // Close the <> wrapper we opened for (!otpStep)
  content = content.replace('</form>', '            </>\n          )}\n\n          <button \n            type="submit" \n            disabled={loading || (otpStep && otp.length !== 6)}\n            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#131ADF] text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 mt-4"\n          >\n            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === \'login\' ? \'Sign In\' : otpStep ? \'Verify & Register\' : \'Continue\'}\n          </button>\n        </form>');
  
  // Clean up duplicate button from the replace above since we added it again
  content = content.replace(/<button[^>]*type="submit"[^>]*>[\s\S]*?<\/button>\s*<button[^>]*type="submit"[^>]*>[\s\S]*?<\/button>/g, submitButtonUI);
  
  content = content.replace("onClick={() => { setMode('login'); setError(null); }}", "onClick={() => { setMode('login'); setError(null); setOtpStep(false); }}");
  content = content.replace("onClick={() => { setMode('register'); setError(null); }}", "onClick={() => { setMode('register'); setError(null); setOtpStep(false); }}");
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('AuthForm updated');
} else {
  console.log('AuthForm already has otpStep');
}
