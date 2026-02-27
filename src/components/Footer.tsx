import { useState } from 'react';
import { Instagram, Linkedin, MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subscribersAPI } from '../services/api';

// ── Interest fields & subfields ────────────────────────────────────────────
const INTEREST_FIELDS = [
  {
    field: 'Engineering',
    emoji: '⚙️',
    subfields: ['Civil', 'Mechanical', 'Electrical', 'Chemical', 'Biomedical'],
  },
  {
    field: 'Technology',
    emoji: '💻',
    subfields: ['Software', 'Data Science', 'AI & Machine Learning', 'Cybersecurity', 'UX/UI Design'],
  },
  {
    field: 'Economics & Business',
    emoji: '📊',
    subfields: ['Finance', 'Entrepreneurship', 'Trade & Commerce', 'Banking', 'Accounting'],
  },
  {
    field: 'Health & Medicine',
    emoji: '🩺',
    subfields: ['Public Health', 'Clinical Medicine', 'Medical Research', 'Pharmacy', 'Nutrition'],
  },
  {
    field: 'Environment & Agriculture',
    emoji: '🌱',
    subfields: ['Climate & Environment', 'Conservation', 'Agribusiness', 'Food Systems'],
  },
  {
    field: 'Social Sciences & Law',
    emoji: '⚖️',
    subfields: ['Law', 'Political Science', 'International Relations', 'Education & Teaching'],
  },
];

// ── Component ──────────────────────────────────────────────────────────────
export function Footer() {
  const [email, setEmail]       = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage]   = useState('');

  const toggleField = (field: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(field) ? next.delete(field) : next.add(field);
      return next;
    });
  };

  const toggleSubfield = (sub: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(sub) ? next.delete(sub) : next.add(sub);
      return next;
    });
  };

  const toggleAllSubfields = (subfields: string[]) => {
    const allSel = subfields.every(s => selected.has(s));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSel) subfields.forEach(s => next.delete(s));
      else subfields.forEach(s => next.add(s));
      return next;
    });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await subscribersAPI.subscribe(email, {
        interests: Array.from(selected),
        whatsapp: whatsapp.trim() || undefined,
        allUpdates: selected.size === 0,
      });
      setStatus('success');
      setMessage("You're subscribed! Check your email for confirmation 🎉");
      setEmail('');
      setWhatsapp('');
      setSelected(new Set());
      setExpanded(new Set());
    } catch (err: any) {
      setStatus('error');
      const msg = err?.response?.data?.error || 'Something went wrong. Please try again.';
      setMessage(msg === 'Already subscribed' ? "You're already subscribed! ✅" : msg);
    } finally {
      setTimeout(() => { setStatus('idle'); setMessage(''); }, 5000);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Top grid: Brand / Quick Links / Connect ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/Opportunities Kenya Logo 2.png"
                alt="Opportunities Kenya"
                className="h-10 w-auto"
              />
              <span
                className="text-white font-bold"
                style={{ fontFamily: "'Inknut Antiqua', serif", fontSize: '1rem' }}
              >
                Opportunities Kenya
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering students and young professionals across Africa and beyond by
              giving them equal access to global opportunities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/opportunities" className="hover:text-white transition-colors">Opportunities</Link>
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Newsletter / Subscribe section ── */}
        <div className="border-t border-gray-700 pt-10 mb-10">
          <div className="max-w-3xl">
            <h3 className="text-white text-lg font-bold mb-1">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-6">
              Select your fields of interest — we'll send you matching opportunities directly to your inbox.
            </p>

            {/* Interest accordion grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {INTEREST_FIELDS.map(({ field, emoji, subfields }) => {
                const isOpen   = expanded.has(field);
                const countSel = subfields.filter(s => selected.has(s)).length;
                const allSel   = countSel === subfields.length;

                return (
                  <div
                    key={field}
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between px-3 py-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={allSel}
                          onChange={() => toggleAllSubfields(subfields)}
                          className="w-4 h-4 rounded accent-blue-500 shrink-0"
                        />
                        <span className="text-sm text-white font-medium truncate">
                          {emoji} {field}
                        </span>
                        {countSel > 0 && (
                          <span className="ml-1 text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5 shrink-0">
                            {countSel}
                          </span>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleField(field)}
                        className="ml-2 text-gray-400 hover:text-white transition-colors shrink-0"
                        aria-label={isOpen ? 'Collapse' : 'Expand'}
                      >
                        {isOpen
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Subfield pills */}
                    {isOpen && (
                      <div className="border-t border-gray-700 px-3 py-2 flex flex-wrap gap-2">
                        {subfields.map(sub => (
                          <label
                            key={sub}
                            className={`flex items-center gap-1.5 cursor-pointer text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              selected.has(sub)
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-blue-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected.has(sub)}
                              onChange={() => toggleSubfield(sub)}
                              className="sr-only"
                            />
                            {sub}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected summary */}
            {selected.size > 0 && (
              <p className="text-xs text-blue-400 mb-4">
                ✓ {selected.size} area{selected.size !== 1 ? 's' : ''} selected:{' '}
                {Array.from(selected).slice(0, 4).join(', ')}
                {selected.size > 4 ? ` +${selected.size - 4} more` : ''}
              </p>
            )}

            {/* Email + WhatsApp + Button */}
            <form onSubmit={handleSubscribe}>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                />
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="WhatsApp e.g. +254712345678"
                  className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500"
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors whitespace-nowrap"
                >
                  {status === 'loading' ? 'Subscribing…' : status === 'success' ? '✓ Subscribed' : 'Subscribe'}
                </button>
              </div>

              {message && (
                <p className={`mt-3 text-sm ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Opportunities Kenya. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
