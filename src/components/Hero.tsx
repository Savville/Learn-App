import { Search, Briefcase, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    navigate(`/opportunities?${params.toString()}`);
  };

  return (
    <div className="relative bg-[#131ADF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-white mb-4 max-w-4xl mx-auto font-black uppercase tracking-tight leading-tight"
            style={{ fontSize: '2.5rem' }}
          >
            Discover. Work. Grow.
          </h1>

          {/* Subtitle */}
          <p
            className="text-blue-200 mb-10 max-w-2xl mx-auto font-semibold"
            style={{ fontSize: '1.1rem' }}
          >
            Students find paid gigs and opportunities. Companies source vetted student talent — fast.
          </p>
        </div>

        {/* Dual CTA Cards */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Card */}
            <button
              onClick={() => navigate('/opportunities?task_type=online')}
              className="group text-left bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 rounded-2xl p-6 transition-all backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-lg">I'm a Student</h3>
              </div>
              <p className="text-blue-100 text-sm mb-4">
                Find paid micro-gigs, internships, scholarships and grants. Earn money while building your portfolio.
              </p>
              <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                <span>Browse Opportunities</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Company Card */}
            <button
              onClick={() => navigate('/post-with-us')}
              className="group text-left bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 rounded-2xl p-6 transition-all backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-lg">I'm a Company</h3>
              </div>
              <p className="text-blue-100 text-sm mb-4">
                Post tasks and get vetted student talent within hours. Cost-effective, escrow-protected payments.
              </p>
              <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                <span>Post a Task</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-blue-200 text-sm font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              350+ Students Registered
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              10+ Tasks Posted Weekly
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              Escrow-Protected Payments
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3 bg-white border border-gray-300 p-2 rounded-md">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Search tasks, gigs, scholarships..."
                className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3 bg-blue-900 text-white font-bold uppercase tracking-wider text-sm hover:bg-blue-800 transition-all rounded-sm"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}