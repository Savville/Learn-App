import { Mail, Phone, ChevronDown, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { subscribersAPI } from '../services/api';

const CATEGORIES = [
  {
    id: 'engineering',
    label: 'Engineering',
    icon: '⚙️',
    sub: ['Civil Engineering', 'Mechanical Eng.', 'Electrical Eng.', 'Chemical Eng.', 'Biomedical Eng.', 'Structural Eng.'],
  },
  {
    id: 'technology',
    label: 'Technology',
    icon: '💻',
    sub: ['Software Dev', 'Data Science', 'AI / ML', 'Cybersecurity', 'UX / UI Design', 'Cloud Computing'],
  },
  {
    id: 'economics',
    label: 'Economics',
    icon: '📊',
    sub: ['Finance', 'Entrepreneurship', 'Trade & Commerce', 'Banking', 'Accounting', 'Supply Chain'],
  },
  {
    id: 'health',
    label: 'Health',
    icon: '🏥',
    sub: ['Public Health', 'Clinical Research', 'Pharmacy', 'Nutrition', 'Global Health', 'Mental Health'],
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: '🌿',
    sub: ['Climate Change', 'Architecture', 'Built Environment', 'Geospatial', 'Food Systems', 'Renewable Energy', 'Water Resources'],
  },
  {
    id: 'social',
    label: 'Social Sciences',
    icon: '⚖️',
    sub: ["Law & Policy", "Political Science", "Int'l Relations", "Education", "Sociology", "Human Rights"],
  },
];

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [interests, setInterests] = useState<Record<string, string[]>>({});
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenCategory(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleSub = (catId: string, sub: string) => {
    setInterests(prev => {
      const current = prev[catId] || [];
      const updated = current.includes(sub)
        ? current.filter(s => s !== sub)
        : [...current, sub];
      return { ...prev, [catId]: updated };
    });
  };

  const removeInterest = (catId: string, sub: string) => {
    setInterests(prev => ({
      ...prev,
      [catId]: (prev[catId] || []).filter(s => s !== sub),
    }));
  };

  const clearCategoryInterests = (catId: string) => {
    setInterests(prev => ({
      ...prev,
      [catId]: [],
    }));
  };

  const totalInterests = Object.values(interests).flat().length;
  const allSelectedInterests = Object.entries(interests).flatMap(([catId, subs]) =>
    subs.map(sub => ({ catId, sub }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await subscribersAPI.subscribe(email, {
        allUpdates: true,
        interests: Object.entries(interests)
          .filter(([, subs]) => subs.length > 0)
          .map(([category, subfields]) => ({ category, subfields })),
        whatsapp: whatsapp.trim() ? `+254${whatsapp.trim()}` : undefined,
      });
      setSubscribed(true);
      setEmail('');
      setWhatsapp('');
      setInterests({});
      setTimeout(() => setSubscribed(false), 6000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Subscription failed. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2
            className="text-white mb-4 font-bold uppercase tracking-wider"
            style={{ fontSize: '2.5rem' }}
          >
            Stay Updated
          </h2>
          <p className="text-blue-100" style={{ fontSize: '1.0rem' }}>
            Pick your areas of interest, then subscribe for curated opportunities delivered to you
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
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Category Selectors ── */}
            <div ref={dropdownRef} className="relative">
              <div className="flex flex-wrap justify-center gap-2">
                {CATEGORIES.map(cat => {
                  const count = (interests[cat.id] || []).length;
                  const isOpen = openCategory === cat.id;
                  return (
                    <div key={cat.id} className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all whitespace-nowrap
                          ${
                            count > 0
                              ? 'bg-white text-blue-700 border-white shadow-md'
                              : 'bg-white text-gray-700 border-white shadow-sm hover:shadow-md hover:text-blue-600'
                          }`}
                      >
                        <span className="text-base leading-none">{cat.icon}</span>
                        <span>{cat.label}</span>
                        {count > 0 ? (
                          <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0">
                            {count}
                          </span>
                        ) : (
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                          />
                        )}
                      </button>

                      {/* Subfield dropdown */}
                      {isOpen && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 w-52 text-left">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                            {cat.label}
                          </p>
                          {cat.sub.map(sub => {
                            const selected = (interests[cat.id] || []).includes(sub);
                            return (
                              <label
                                key={sub}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors
                                  ${selected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleSub(cat.id, sub)}
                                  className="w-4 h-4 rounded accent-blue-600"
                                />
                                {sub}
                              </label>
                            );
                          })}
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => clearCategoryInterests(cat.id)}
                              className="flex-1 text-xs font-bold text-red-600 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Clear
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenCategory(null)}
                              className="flex-1 text-xs font-bold text-blue-600 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Done ✓
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Fixed-height reserved space for selected tags — prevents layout shift */}
              <div className="h-20 mt-3 flex flex-wrap content-start gap-2 justify-center overflow-hidden">
                {allSelectedInterests.map(({ catId, sub }) => (
                  <span
                    key={`${catId}-${sub}`}
                    className="inline-flex items-center gap-1 bg-white/20 border border-white/40 text-white text-xs px-3 py-1 rounded-full font-medium h-fit"
                  >
                    {sub}
                    <button
                      type="button"
                      onClick={() => removeInterest(catId, sub)}
                      className="hover:text-red-300 transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* ── Contact Inputs ── */}
            {totalInterests > 0 ? (
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mt-2 transition-all duration-300">
                <div className="flex items-center gap-3 flex-1 px-5 py-4 rounded-xl border border-white/30 bg-white/10 focus-within:bg-white/20 transition-colors">
                  <Phone className="w-5 h-5 text-gray-300 shrink-0" />
                  <div className="flex items-center flex-1">
                    <span className="text-gray-400 font-medium text-sm select-none pointer-events-none">+254 </span>
                    <input
                      type="tel"
                      placeholder={"XXX" + " " + "XXX" + " " + "XXX"}
                      className="flex-1 bg-transparent text-white placeholder-blue-200 outline-none text-sm pl-2"
                      value={whatsapp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only digits
                        if (value.length <= 9) {
                          setWhatsapp(value);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent backspace from affecting the prefix
                        if (e.key === 'Backspace' && whatsapp.length === 0) {
                          e.preventDefault();
                        }
                      }}
                      maxLength={9}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1 px-5 py-4 rounded-xl border border-white/30 bg-white/10 focus-within:bg-white/20 transition-colors">
                  <Mail className="w-5 h-5 text-gray-300 shrink-0" />
                  <input
                    type="email"
                    placeholder="Email address *"
                    className="flex-1 bg-transparent text-white placeholder-blue-200 outline-none text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-blue-100 text-sm opacity-70">
                  👆 Please select at least one area of interest to continue
                </p>
              </div>
            )}

            {/* ── Subscribe Button ── */}
            {totalInterests > 0 && (
              <div className="flex flex-col items-center gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                  className={`px-8 py-3 rounded-xl transition-all font-bold tracking-wide text-lg border-2 border-white ${
                    !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-700 shadow-md hover:bg-gray-100 hover:shadow-xl hover:text-blue-800'
                  } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
                {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                  <p className="text-blue-200 text-sm">Please enter a valid email address</p>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
