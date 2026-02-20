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
    <section className="py-16 bg-blue-50 border-t border-b border-gray-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-sm mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-gray-900 mb-4 font-bold uppercase tracking-wider text-2xl">Stay Updated</h2>
          <p className="text-gray-700">
            Get weekly updates on new opportunities delivered straight to your inbox
          </p>
        </div>

        {subscribed ? (
          <div className="bg-green-100 border border-green-300 rounded-sm p-6 text-green-900 font-bold">
            ✓ Thank you for subscribing! Check your email for confirmation.
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-300 rounded-sm p-6 text-red-900 font-bold">
            ✗ {error}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-sm border border-gray-300 outline-none focus:border-blue-900 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-900 text-white rounded-sm hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold uppercase tracking-wider"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
