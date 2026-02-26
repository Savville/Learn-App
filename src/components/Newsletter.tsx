import { Mail } from 'lucide-react';
import { useState } from 'react';
import { subscribersAPI } from '../services/api';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await subscribersAPI.subscribe(email, { allUpdates: true });
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.response?.data?.error || 'Subscription failed. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2
            className="text-white mb-4 font-bold uppercase tracking-wider"
            style={{ fontSize: '2.5rem' }}
          >Stay Updated</h2>
          <p className="text-blue-100" style={{ fontSize: '1.0rem' }}>
            Get weekly updates on new opportunities delivered straight to your inbox
          </p>
        </div>

        {subscribed ? (
          <div className="bg-white/20 border border-white/30 rounded-xl p-6 text-white font-bold">
            ✓ Thank you for subscribing! Check your email for confirmation.
          </div>
        ) : error ? (
          <div className="bg-red-500/30 border border-red-300 rounded-xl p-6 text-white font-bold">
            ✗ {error}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-blue-200 outline-none focus:bg-white/20 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                className="px-8 py-3 bg-white text-blue-700 rounded-xl hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold uppercase tracking-wider"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
              <p className="text-blue-200 text-sm mt-2">Please enter a valid email address</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
