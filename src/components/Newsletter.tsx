import { Mail, Phone, Users } from 'lucide-react';
import { useState } from 'react';
import { subscribersAPI } from '../services/api';

// Tasking areas — displayed as multi-select chips (6 per row on desktop)
const TASKING_AREAS = [
  'Data Entry', 'Transcription', 'Social Media', 'Content Writing',
  'Research', 'Graphic Design', 'Web Development', 'Bug Testing / QA',
  'Virtual Assistance', 'Customer Support', 'Event Support', 'Delivery & Logistics',
  'Hostel Scouting', 'Property Photography', 'Brand Ambassador', 'Flyer Distribution',
  'Product Sampling', 'Shop Assistant', 'Sales Agent', 'Price Tagging',
  'Campus Ambassador', 'Student Recruiter', 'Orientation Guide', 'Audio Transcription',
  'Captioning', 'Voiceover', 'Community Management', 'Content Scheduling',
  'Brand Monitoring', 'Hype & Engagement', 'Literature Reviews', 'Market Research',
  'Competitor Analysis', 'Survey Design', 'Logo Design', 'Flyer & Poster Design',
  'Social Media Graphics', 'Presentation Design', 'Excel Automation', 'WordPress Setup',
  'Live Chat Support', 'Email Support', 'Appointment Scheduling', 'Package Delivery',
  'Grocery Shopping', 'Inventory Counting', 'Hostel Scouting', 'Property Photography',
  'Facility Inspection', 'Brand Ambassador', 'Flyer Distribution', 'Product Sampling',
  'Street Marketing', 'Shop Assistant', 'Sales Agent', 'Price Tagging',
  'Campus Ambassador', 'Student Recruiter', 'Orientation Guide',
];

// Study areas — displayed as a multi-column dropdown
const STUDY_AREAS = [
  'Engineering', 'Computer Science', 'Information Technology', 'Business Administration',
  'Economics', 'Medicine', 'Nursing', 'Pharmacy', 'Law', 'Education',
  'Agriculture', 'Architecture', 'Art & Design', 'Social Sciences', 'Environmental Science',
  'Mathematics', 'Statistics', 'Public Health', 'Development Studies', 'Gender Studies',
];

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedStudyAreas, setSelectedStudyAreas] = useState<string[]>([]);
  const [studyDropdownOpen, setStudyDropdownOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTask = (task: string) => {
    setSelectedTasks(prev =>
      prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]
    );
  };

  const toggleStudyArea = (area: string) => {
    setSelectedStudyAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const totalSelections = selectedTasks.length + selectedStudyAreas.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalSelections === 0) {
      setError('Please select at least one task area or study area.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await subscribersAPI.subscribe(email, {
        allUpdates: true,
        interests: [
          ...(selectedTasks.length > 0 ? [{ category: 'Tasking Areas', subfields: selectedTasks }] : []),
          ...(selectedStudyAreas.length > 0 ? [{ category: 'Study Areas', subfields: selectedStudyAreas }] : []),
        ],
        whatsapp: whatsapp.trim() ? `+254${whatsapp.trim()}` : undefined,
      });
      setSubscribed(true);
      setEmail('');
      setWhatsapp('');
      setSelectedTasks([]);
      setSelectedStudyAreas([]);
      setTimeout(() => setSubscribed(false), 6000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Subscription failed. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter" className="py-16 bg-[#131ADF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-white mb-4 font-bold uppercase tracking-wider" style={{ fontSize: '2.5rem' }}>
            Stay Updated
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg font-semibold">
            Pick your tasking areas and study interests, then subscribe for curated opportunities delivered to you.
          </p>
        </div>

        {subscribed ? (
          <div className="bg-white/20 border border-white/30 rounded-xl p-6 text-white font-bold text-center max-w-2xl mx-auto">
            ✓ Thank you for subscribing! Check your email for confirmation.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
            {/* Error */}
            {error && (
              <div className="bg-red-500/30 border border-red-300 rounded-xl p-4 text-white font-bold text-center mb-6">
                {error}
              </div>
            )}

            {/* ── Tasking Areas ── */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-white/80" />
                <h3 className="text-white font-bold text-lg">Tasking Areas</h3>
                <span className="text-white/60 text-sm ml-2">(select all that apply)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TASKING_AREAS.map((task) => {
                  const isSelected = selectedTasks.includes(task);
                  return (
                    <button
                      key={task}
                      type="button"
                      onClick={() => toggleTask(task)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${isSelected
                          ? 'bg-white text-blue-700 border-white shadow-md'
                          : 'bg-white/10 text-white/80 border-white/30 hover:bg-white/20 hover:text-white'
                        }`}
                    >
                      {isSelected && '✓ '}{task}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Study Areas ── */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCapIcon />
                <h3 className="text-white font-bold text-lg">Study Areas</h3>
                <span className="text-white/60 text-sm ml-2">(optional)</span>
              </div>

              {/* Dropdown button */}
              <div className="relative mb-3">
                <button
                  type="button"
                  onClick={() => setStudyDropdownOpen(!studyDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-colors"
                >
                  <span>{selectedStudyAreas.length > 0
                    ? `${selectedStudyAreas.length} area${selectedStudyAreas.length > 1 ? 's' : ''} selected`
                    : 'Select your study areas...'}</span>
                  <svg className={`w-5 h-5 transition-transform ${studyDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {studyDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 max-h-80 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {STUDY_AREAS.map((area) => {
                        const isSelected = selectedStudyAreas.includes(area);
                        return (
                          <label
                            key={area}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors ${isSelected
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleStudyArea(area)}
                              className="w-4 h-4 rounded accent-blue-600"
                            />
                            {area}
                          </label>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => { setSelectedStudyAreas([]); setStudyDropdownOpen(false); }}
                        className="flex-1 text-xs font-bold text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Clear All
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudyDropdownOpen(false)}
                        className="flex-1 text-xs font-bold text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Done ✓
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected tags */}
              {selectedStudyAreas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedStudyAreas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1 bg-white/20 border border-white/40 text-white text-xs px-3 py-1 rounded-full font-medium"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() => toggleStudyArea(area)}
                        className="hover:text-red-300 transition-colors ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Contact Inputs ── */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* WhatsApp */}
              <div className="flex-1">
                <label className="block text-white text-xs font-semibold mb-1 pl-1">WhatsApp Number (optional)</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/30 bg-white/10 focus-within:bg-white/20 transition-colors">
                  <Phone className="w-4 h-4 text-gray-300 shrink-0" />
                  <div className="flex items-center flex-1">
                    <span className="text-gray-400 font-medium text-sm select-none pointer-events-none">+254 </span>
                    <input
                      type="tel"
                      placeholder="XXX XXX XXX"
                      className="flex-1 bg-transparent text-white placeholder-blue-200 outline-none text-sm pl-2"
                      value={whatsapp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 9) setWhatsapp(value);
                      }}
                      maxLength={9}
                    />
                  </div>
                </div>
              </div>
              {/* Email */}
              <div className="flex-1">
                <label className="block text-white text-xs font-semibold mb-1 pl-1">Email Address *</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/30 bg-white/10 focus-within:bg-white/20 transition-colors">
                  <Mail className="w-4 h-4 text-gray-300 shrink-0" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="flex-1 bg-transparent text-white placeholder-blue-200 outline-none text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* ── Subscribe Button ── */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading || totalSelections === 0}
                className={`px-10 py-4 rounded-xl transition-all font-bold tracking-wide text-lg border-2 ${totalSelections === 0
                    ? 'bg-white/30 text-white/60 cursor-not-allowed border-transparent'
                    : 'bg-white text-blue-700 shadow-md hover:bg-gray-100 hover:shadow-xl border-white'
                  } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
              {totalSelections === 0 && (
                <p className="text-blue-200 text-sm mt-3">
                  👆 Select at least one tasking area or study area to subscribe
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

// Simple SVG icon for study areas
function GraduationCapIcon() {
  return (
    <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13.18v4L12 21l7-3.82v-4" />
    </svg>
  );
}