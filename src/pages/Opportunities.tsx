import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OpportunityCard } from '../components/OpportunityCard';
import { opportunitiesAPI } from '../services/api';
import { Search, Filter } from 'lucide-react';
import type { Opportunity } from '../data/opportunities';

export function Opportunities() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || 'all');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'all');
  const [selectedFunding, setSelectedFunding] = useState(searchParams.get('funding') || 'all');
  const [showFilters, setShowFilters] = useState(false);
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch opportunities from backend
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const response = await opportunitiesAPI.getAll({
          category: selectedType !== 'all' ? selectedType : undefined,
          level: selectedLevel !== 'all' ? selectedLevel : undefined,
          location: selectedLocation !== 'all' ? (selectedLocation === 'Kenya' ? 'kenya' : 'international') : undefined,
          search: searchQuery || undefined,
        });
        setOpportunities(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError('Failed to load opportunities. Please try again.');
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [searchQuery, selectedType, selectedLevel, selectedLocation]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesFunding = selectedFunding === 'all' || opp.estimatedBenefit === selectedFunding;
      return matchesFunding;
    });
  }, [opportunities, selectedFunding]);

  // Get unique funding types from opportunities
  const fundingTypes = Array.from(new Set(opportunities
    .map(opp => opp.estimatedBenefit)
    .filter((ft): ft is string => ft !== undefined)
  )).sort();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ 
      search: searchQuery, 
      type: selectedType,
      level: selectedLevel,
      location: selectedLocation,
      funding: selectedFunding
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">All Opportunities</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-md border border-gray-200">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, organization, or keyword..."
                  className="flex-1 outline-none bg-transparent text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </form>

          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-wrap gap-3">
              <select
                className="px-4 py-2 rounded-sm border border-gray-200 outline-none cursor-pointer hover:border-blue-500 transition-colors bg-white text-gray-700 font-medium"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="CallForPapers">Call for Papers</option>
                <option value="Internship">Internships</option>
                <option value="Grant">Grants</option>
                <option value="Conference">Conferences</option>
                <option value="Scholarship">Scholarships</option>
              </select>

              <select
                className="px-4 py-2 rounded-sm border border-gray-200 outline-none cursor-pointer hover:border-blue-500 transition-colors bg-white text-gray-700 font-medium"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="UnderGrad">Undergraduate</option>
                <option value="PostGrad">Postgraduate</option>
                <option value="Both">Both</option>
              </select>

              <select
                className="px-4 py-2 rounded-sm border border-gray-200 outline-none cursor-pointer hover:border-blue-500 transition-colors bg-white text-gray-700 font-medium"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="all">All Locations</option>
                <option value="Kenya">Kenya</option>
                <option value="International">International</option>
              </select>

              <select
                className="px-4 py-2 rounded-sm border border-gray-200 outline-none cursor-pointer hover:border-blue-500 transition-colors bg-white text-gray-700 font-medium"
                value={selectedFunding}
                onChange={(e) => setSelectedFunding(e.target.value)}
              >
                <option value="all">All Funding Types</option>
                {fundingTypes.map(ft => (
                  <option key={ft} value={ft}>{ft}</option>
                ))}
              </select>

              {(selectedType !== 'all' || selectedLevel !== 'all' || selectedLocation !== 'all' || selectedFunding !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setSelectedLevel('all');
                    setSelectedLocation('all');
                    setSelectedFunding('all');
                    setSearchParams({});
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredOpportunities.length}</span> {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'}
            </p>
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto border-4 border-gray-200 border-t-blue-900 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">Loading opportunities...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl text-gray-900 mb-2 font-semibold">Error Loading Opportunities</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-900 text-white rounded-sm hover:bg-blue-800 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        ) : filteredOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOpportunities.map(opportunity => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl text-gray-900 mb-2 font-semibold">No opportunities found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedLevel('all');
                setSelectedLocation('all');
                setSelectedFunding('all');
                setSearchParams({});
              }}
              className="px-6 py-3 bg-blue-900 text-white rounded-sm hover:bg-blue-800 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
