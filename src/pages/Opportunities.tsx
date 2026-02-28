import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OpportunityCard } from '../components/OpportunityCard';
import { opportunitiesAPI } from '../services/api';
import { Search, Filter } from 'lucide-react';
import type { Opportunity } from '../data/opportunities';
import { opportunities as localOpportunities } from '../data/opportunities';

const applyFilters = (
  opps: Opportunity[],
  searchQuery: string,
  selectedType: string,
  selectedLevel: string,
  selectedFunding: string
) => {
  return opps.filter(opp => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      opp.title.toLowerCase().includes(q) ||
      opp.provider.toLowerCase().includes(q) ||
      opp.description.toLowerCase().includes(q);
    const matchesType = selectedType === 'all' || opp.category === selectedType;
    const matchesLevel = selectedLevel === 'all' || opp.eligibility.educationLevel === selectedLevel;
    const matchesFunding = selectedFunding === 'all' || opp.fundingType === selectedFunding;
    return matchesSearch && matchesType && matchesLevel && matchesFunding;
  });
};

export function Opportunities() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || 'all');
  const [selectedFunding, setSelectedFunding] = useState(searchParams.get('funding') || 'all');
  const [showFilters, setShowFilters] = useState(false);
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Sync filter state when URL params change (e.g. clicking a category card)
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedType(searchParams.get('type') || 'all');
    setSelectedLevel(searchParams.get('level') || 'all');
    setSelectedFunding(searchParams.get('funding') || 'all');
    setPage(1);
  }, [searchParams]);

  const buildParams = (pageNum: number) => ({
    category: selectedType !== 'all' ? selectedType : undefined,
    level: selectedLevel !== 'all' ? selectedLevel : undefined,
    fundingType: selectedFunding !== 'all' ? selectedFunding : undefined,
    search: searchQuery || undefined,
    page: pageNum,
    limit: 12,
  });

  const mergeLogos = (opps: Opportunity[]) =>
    opps.map((opp: Opportunity) => {
      const local = localOpportunities.find(l => l.id === opp.id);
      return local ? { ...opp, logoUrl: local.logoUrl } : opp;
    });

  // Fetch page 1 when filters change
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError(null);

        // Show local data immediately so there's never a white page
        const localFiltered = applyFilters(localOpportunities, searchQuery, selectedType, selectedLevel, selectedFunding);
        setOpportunities(localFiltered);
        setHasMore(false);
        setLoading(false); // stop spinner — cards visible now, API upgrades silently

        const response = await opportunitiesAPI.getAll(buildParams(1));
        const result = response.data;
        // Support both paginated { data, pages } and plain array (fallback)
        const items: Opportunity[] = Array.isArray(result) ? result : result.data;
        const pages: number = result.pages ?? 1;

        if (items && items.length > 0) {
          setOpportunities(mergeLogos(items));
          setHasMore(1 < pages);
        }
        setPage(1);
      } catch (err) {
        // API failed (Render cold start etc.) — local data already visible, just stop loading
        console.error('Error fetching opportunities:', err);
        const localFiltered = applyFilters(localOpportunities, searchQuery, selectedType, selectedLevel, selectedFunding);
        setOpportunities(localFiltered);
        setHasMore(false);
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, [searchQuery, selectedType, selectedLevel, selectedFunding]);

  const loadMore = async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await opportunitiesAPI.getAll(buildParams(nextPage));
      const result = response.data;
      const items: Opportunity[] = Array.isArray(result) ? result : result.data;
      const pages: number = result.pages ?? 1;
      setOpportunities(prev => [...prev, ...mergeLogos(items)]);
      setHasMore(nextPage < pages);
      setPage(nextPage);
    } catch (err) {
      console.error('Load more failed:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const countFor = (type: string) => localOpportunities.filter(o => o.category === type).length;
  const filteredOpportunities = opportunities;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ 
      search: searchQuery, 
      type: selectedType,
      level: selectedLevel,
      funding: selectedFunding
    });
  };

  const hasActiveFilters = selectedType !== 'all' || selectedLevel !== 'all' || selectedFunding !== 'all' || searchQuery;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedLevel('all');
    setSelectedFunding('all');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-6">All Opportunities</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/20 rounded-md border border-white/30 backdrop-blur-sm">
                <Search className="w-5 h-5 text-white/70" />
                <input
                  type="text"
                  placeholder="Search by title, organization, or keyword..."
                  className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-6 py-3 bg-white/20 border border-white/30 rounded-md hover:bg-white/30 transition-colors text-white"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </form>

          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-wrap gap-3">
              {/* Type Filter */}
              <select
                className="px-4 py-2 rounded-sm border border-white/30 outline-none cursor-pointer bg-white/20 text-white font-medium backdrop-blur-sm hover:bg-white/30 transition-colors"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all" className="text-gray-900 bg-white">All Types ({localOpportunities.length})</option>
                <option value="CallForPapers" className="text-gray-900 bg-white">Call for Papers ({countFor('CallForPapers')})</option>
                <option value="Internship" className="text-gray-900 bg-white">Internships ({countFor('Internship')})</option>
                <option value="Grant" className="text-gray-900 bg-white">Grants ({countFor('Grant')})</option>
                <option value="Conference" className="text-gray-900 bg-white">Conferences ({countFor('Conference')})</option>
                <option value="Scholarship" className="text-gray-900 bg-white">Scholarships ({countFor('Scholarship')})</option>
                <option value="Hackathon" className="text-gray-900 bg-white">Hackathons ({countFor('Hackathon')})</option>
                <option value="Event" className="text-gray-900 bg-white">Events ({countFor('Event')})</option>
                <option value="Volunteer" className="text-gray-900 bg-white">Volunteer Programmes ({countFor('Volunteer')})</option>
                <option value="Other" className="text-gray-900 bg-white">Others ({countFor('Other')})</option>
              </select>

              {/* Level Filter */}
              <select
                className="px-4 py-2 rounded-sm border border-white/30 outline-none cursor-pointer bg-white/20 text-white font-medium backdrop-blur-sm hover:bg-white/30 transition-colors"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="all" className="text-gray-900 bg-white">All Levels</option>
                <option value="UnderGrad" className="text-gray-900 bg-white">Undergraduate</option>
                <option value="PostGrad" className="text-gray-900 bg-white">Postgraduate</option>
                <option value="Both" className="text-gray-900 bg-white">Practitioners</option>
              </select>

              {/* Funding Type Filter */}
              <select
                className="px-4 py-2 rounded-sm border border-white/30 outline-none cursor-pointer bg-white/20 text-white font-medium backdrop-blur-sm hover:bg-white/30 transition-colors"
                value={selectedFunding}
                onChange={(e) => setSelectedFunding(e.target.value)}
              >
                <option value="all" className="text-gray-900 bg-white">All Funding Types</option>
                <option value="Fully Funded" className="text-gray-900 bg-white">Fully Funded</option>
                <option value="Partially Funded" className="text-gray-900 bg-white">Partially Funded</option>
                <option value="Stipend" className="text-gray-900 bg-white">Stipend</option>
                <option value="Unpaid" className="text-gray-900 bg-white">Unpaid</option>
              </select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/20 rounded-sm transition-colors font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6">
            <p className="text-white">
              Showing <span className="font-semibold text-white">{filteredOpportunities.length}</span> {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'}
            </p>
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-900 rounded-full animate-spin"></div>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredOpportunities.map(opportunity => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-10 py-3 bg-blue-900 text-white rounded-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center gap-3"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : 'Load More'}
                </button>
              </div>
            )}
          </>
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
              onClick={clearFilters}
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
