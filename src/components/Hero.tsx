import { Search } from 'lucide-react';
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
    <div className="relative bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-white mb-6 max-w-4xl mx-auto font-black uppercase tracking-tight leading-tight"
            style={{ fontSize: '3rem' }}
          >
            Discover Opportunities, for Kenyan Students and Practitioners
          </h1>

          {/* Subtitle */}
          <p
            className="text-blue-200 mb-12 max-w-2xl mx-auto font-bold"
            style={{ fontSize: '1.5rem' }}
          >
            Internships, scholarships, grants, conferences & more—updated daily
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3 bg-white border border-gray-300 p-2 rounded-md">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Search by title, provider, keyword..."
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
