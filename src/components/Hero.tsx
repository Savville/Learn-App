import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory !== 'all') params.append('type', selectedCategory);
    navigate(`/opportunities?${params.toString()}`);
  };

  return (
    <div className="relative bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-blue-1000 mb-6 max-w-4xl mx-auto text-5xl md:text-6xl font-black uppercase tracking-tight leading-tight">
            Discover Opportunities for Kenya Students
          </h1>

          {/* Subtitle */}
          <p className="text-gray-700 mb-12 max-w-2xl mx-auto text-lg font-medium">
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
            
            <div className="flex gap-2 border-l border-gray-300 pl-2">
              <select
                className="px-4 py-3 border border-gray-300 bg-white outline-none cursor-pointer text-gray-900 font-medium rounded-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="CallForPapers">Call for Papers</option>
                <option value="Internship">Internships</option>
                <option value="Grant">Grants</option>
                <option value="Conference">Conferences</option>
                <option value="Scholarship">Scholarships</option>
              </select>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-900 text-white font-bold uppercase tracking-wider text-sm hover:bg-blue-800 transition-all rounded-sm"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
