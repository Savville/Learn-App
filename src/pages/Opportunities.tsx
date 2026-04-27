import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OpportunityCard } from '../components/OpportunityCard';
import { AppliedDashboard } from '../components/AppliedDashboard';
import { opportunitiesAPI } from '../services/api';
import { Search, Filter } from 'lucide-react';
import type { Opportunity } from '../data/opportunities';
import { opportunities as localOpportunities } from '../data/opportunities';
import { useSEO } from '../hooks/useSEO';

// ── Tab category buckets (must match backend constants exactly) ───────────────
const GIG_CATEGORIES      = ['Gig', 'Job'];
const CAREER_CATEGORIES   = ['Internship', 'Attachment', 'Project', 'Hackathon', 'Challenge'];
const ACADEMIC_CATEGORIES = ['Scholarship', 'Fellowship', 'Conference', 'Grant', 'CallForPapers', 'Event', 'Volunteer'];

type TabId = 'all' | 'gigs' | 'career' | 'academic' | 'applied';

// Category options tagged to their tab
const ALL_CATEGORY_OPTIONS: { value: string; label: string; tab: TabId }[] = [
  { value: 'Gig',           label: 'Microgigs',            tab: 'gigs' },
  { value: 'Job',           label: 'Jobs',                 tab: 'gigs' },
  { value: 'Internship',    label: 'Internships',          tab: 'career' },
  { value: 'Attachment',    label: 'Attachments',          tab: 'career' },
  { value: 'Project',       label: 'Projects',             tab: 'career' },
  { value: 'Hackathon',     label: 'Hackathons',           tab: 'career' },
  { value: 'Challenge',     label: 'Industry Challenges',  tab: 'career' },
  { value: 'Scholarship',   label: 'Scholarships',         tab: 'academic' },
  { value: 'Fellowship',    label: 'Fellowships',          tab: 'academic' },
  { value: 'Grant',         label: 'Grants',               tab: 'academic' },
  { value: 'Conference',    label: 'Conferences',          tab: 'academic' },
  { value: 'CallForPapers', label: 'Call for Papers',      tab: 'academic' },
  { value: 'Event',         label: 'Events',               tab: 'academic' },
  { value: 'Volunteer',     label: 'Volunteer Programmes', tab: 'academic' },
  { value: 'Other',         label: 'Others',               tab: 'all' },
];

// Funding options tailored per tab
const GIG_FUNDING_OPTIONS = [
  { value: 'all',              label: 'All Pay Types' },
  { value: 'Paid Internship',  label: 'Paid' },
  { value: 'Partially Funded', label: 'Partially Paid' },
  { value: 'Unpaid Internship',label: 'Unpaid' },
];
const CAREER_FUNDING_OPTIONS = [
  { value: 'all',              label: 'All Pay Types' },
  { value: 'Paid Internship',  label: 'Paid / Stipend' },
  { value: 'Partially Funded', label: 'Partially Funded' },
  { value: 'Unpaid Internship',label: 'Unpaid' },
];
const ACADEMIC_FUNDING_OPTIONS = [
  { value: 'all',              label: 'All Funding Types' },
  { value: 'Fully Funded',     label: 'Fully Funded' },
  { value: 'Partially Funded', label: 'Partially Funded' },
  { value: 'Stipend',          label: 'Stipend' },
  { value: 'Unpaid',           label: 'Unpaid' },
];
const ALL_FUNDING_OPTIONS = [
  { value: 'all',              label: 'All Funding Types' },
  { value: 'Fully Funded',     label: 'Fully Funded' },
  { value: 'Partially Funded', label: 'Partially Funded' },
  { value: 'Paid Internship',  label: 'Paid Internship' },
  { value: 'Stipend',          label: 'Stipend' },
  { value: 'Unpaid',           label: 'Unpaid' },
];

// Tab metadata
const TABS: { id: TabId; label: string; emoji: string; description: string }[] = [
  { id: 'all',      label: 'All',                    emoji: '🌍', description: 'Opportunities' },
  { id: 'gigs',     label: 'Microgigs & Jobs',       emoji: '🚀', description: 'Work & Microgigs' },
  { id: 'career',   label: 'Career & Innovation',    emoji: '💼', description: 'Career & Innovation' },
  { id: 'academic', label: 'Academic & Learning',    emoji: '🎓', description: 'Academic & Learning' },
  { id: 'applied',  label: 'Applied',                emoji: '✅', description: 'Applied' },
];

const applyFilters = (
  opps: Opportunity[],
  searchQuery: string,
  selectedType: string,
  selectedLevel: string,
  selectedFunding: string,
  activeTab: TabId
) => {
  return opps.filter(opp => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      opp.title.toLowerCase().includes(q) ||
      opp.provider.toLowerCase().includes(q) ||
      opp.description.toLowerCase().includes(q);

    let matchesTab = true;
    if (activeTab === 'gigs')     matchesTab = GIG_CATEGORIES.includes(opp.category);
    else if (activeTab === 'career')   matchesTab = CAREER_CATEGORIES.includes(opp.category);
    else if (activeTab === 'academic') matchesTab = ACADEMIC_CATEGORIES.includes(opp.category);

    const matchesType    = selectedType === 'all' || opp.category === selectedType;
    const matchesLevel   = selectedLevel === 'all' || opp.eligibility.educationLevel === selectedLevel;
    const matchesFunding = selectedFunding === 'all' || opp.fundingType === selectedFunding;

    return matchesSearch && matchesTab && matchesType && matchesLevel && matchesFunding;
  });
};

export function Opportunities() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab]       = useState<TabId>((searchParams.get('tab') as TabId) || 'all');
  const [searchQuery, setSearchQuery]   = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType]       = useState(searchParams.get('type') || 'all');
  const [selectedLevel, setSelectedLevel]     = useState(searchParams.get('level') || 'all');
  const [selectedFunding, setSelectedFunding] = useState(searchParams.get('funding') || 'all');
  const [showFilters, setShowFilters] = useState(false);

  const currentTab = TABS.find(t => t.id === activeTab) ?? TABS[0];

  useSEO({
    title: `${currentTab.description} — Opportunities Pathways`,
    description: 'Browse scholarships, fellowships, microgigs, internships and more curated for African students and young professionals.',
    url: '/opportunities'
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]       = useState(false);
  const [page, setPage]             = useState(1);
  const [error, setError]           = useState<string | null>(null);

  // Sync from URL params
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedType(searchParams.get('type') || 'all');
    setSelectedLevel(searchParams.get('level') || 'all');
    setSelectedFunding(searchParams.get('funding') || 'all');
    setActiveTab((searchParams.get('tab') as TabId) || 'all');
    setPage(1);
  }, [searchParams]);

  // When switching tabs, reset filters that no longer apply to the new tab
  const handleTabChange = (tab: TabId) => {
    const currentCategoryTab = ALL_CATEGORY_OPTIONS.find(o => o.value === selectedType)?.tab;
    const typeIsCompatible =
      selectedType === 'all' ||
      tab === 'all' ||
      currentCategoryTab === tab ||
      currentCategoryTab === 'all';

    setActiveTab(tab);
    if (!typeIsCompatible) setSelectedType('all');
    if (tab !== activeTab) setSelectedFunding('all'); // funding options differ per tab
  };

  const buildParams = (pageNum: number) => ({
    category:    selectedType !== 'all' ? selectedType : undefined,
    level:       selectedLevel !== 'all' ? selectedLevel : undefined,
    fundingType: selectedFunding !== 'all' ? selectedFunding : undefined,
    search:      searchQuery || undefined,
    tab:         activeTab !== 'all' ? activeTab : undefined,
    page:        pageNum,
    limit:       100,
  });

  const mergeLogos = (opps: Opportunity[]) =>
    opps.map((opp: Opportunity) => {
      const local = localOpportunities.find(l => l.id === opp.id);
      return local ? { ...opp, logoUrl: local.logoUrl } : opp;
    });

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError(null);
        const localFiltered = applyFilters(localOpportunities, searchQuery, selectedType, selectedLevel, selectedFunding, activeTab);
        setOpportunities(localFiltered);
        setHasMore(false);
        setLoading(false);

        const response = await opportunitiesAPI.getAll(buildParams(1));
        const result = response.data;
        const items: Opportunity[] = Array.isArray(result) ? result : result.data;
        const pages: number = result.pages ?? 1;

        if (items && items.length > 0) {
          setOpportunities(mergeLogos(items));
          setHasMore(1 < pages);
        }
        setPage(1);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        const localFiltered = applyFilters(localOpportunities, searchQuery, selectedType, selectedLevel, selectedFunding, activeTab);
        setOpportunities(localFiltered);
        setHasMore(false);
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, [searchQuery, selectedType, selectedLevel, selectedFunding, activeTab]);

  const loadMore = async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await opportunitiesAPI.getAll(buildParams(nextPage));
      const result   = response.data;
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

  // Derive which category options are valid for the current tab
  const visibleCategoryOptions = ALL_CATEGORY_OPTIONS.filter(opt =>
    activeTab === 'all' || opt.tab === activeTab || opt.tab === 'all'
  );

  // Derive funding options for the current tab
  const visibleFundingOptions =
    activeTab === 'gigs'     ? GIG_FUNDING_OPTIONS :
    activeTab === 'career'   ? CAREER_FUNDING_OPTIONS :
    activeTab === 'academic' ? ACADEMIC_FUNDING_OPTIONS :
    ALL_FUNDING_OPTIONS;

  // Count local opportunities per category, scoped to the current tab
  const countFor = (categoryValue: string) =>
    localOpportunities.filter(o => {
      const inTab =
        activeTab === 'gigs'     ? GIG_CATEGORIES.includes(o.category) :
        activeTab === 'career'   ? CAREER_CATEGORIES.includes(o.category) :
        activeTab === 'academic' ? ACADEMIC_CATEGORIES.includes(o.category) :
        true;
      return inTab && o.category === categoryValue;
    }).length;

  const totalForTab =
    activeTab === 'gigs'     ? localOpportunities.filter(o => GIG_CATEGORIES.includes(o.category)).length :
    activeTab === 'career'   ? localOpportunities.filter(o => CAREER_CATEGORIES.includes(o.category)).length :
    activeTab === 'academic' ? localOpportunities.filter(o => ACADEMIC_CATEGORIES.includes(o.category)).length :
    localOpportunities.length;

  const filteredOpportunities = opportunities;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search: searchQuery, type: selectedType, level: selectedLevel, funding: selectedFunding, tab: activeTab });
  };

  const hasActiveFilters = selectedType !== 'all' || selectedLevel !== 'all' || selectedFunding !== 'all' || searchQuery !== '' || activeTab !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedLevel('all');
    setSelectedFunding('all');
    setActiveTab('all');
    setSearchParams({});
  };

  const searchPlaceholder =
    activeTab === 'gigs'     ? 'Search microgigs, jobs...' :
    activeTab === 'career'   ? 'Search internships, hackathons, projects...' :
    activeTab === 'academic' ? 'Search scholarships, fellowships, grants...' :
    'Search by title, organization, or keyword...';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Tab Navigation */}
          <div className="flex bg-white/10 p-1 rounded-lg w-fit mx-auto mb-8 overflow-x-auto max-w-full gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 sm:px-6 py-3 rounded-md font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-900 shadow-md scale-105'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <span className="mr-1.5">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <h1 className="text-3xl font-bold text-white mb-6">
            {currentTab.emoji} {currentTab.description}
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/20 rounded-md border border-white/30 backdrop-blur-sm">
                <Search className="w-5 h-5 text-white/70 shrink-0" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
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
          {activeTab !== 'applied' && (
            <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
              <div className="flex flex-wrap gap-3">
                {/* Type Filter — only categories for the active tab */}
                <select
                  className="px-4 py-2 rounded-sm border border-white/30 outline-none cursor-pointer bg-white/20 text-white font-medium backdrop-blur-sm hover:bg-white/30 transition-colors"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all" className="text-gray-900 bg-white">
                    {activeTab === 'gigs'     ? `All Types (${totalForTab})` :
                     activeTab === 'career'   ? `All Career Types (${totalForTab})` :
                     activeTab === 'academic' ? `All Academic Types (${totalForTab})` :
                     `All Types (${totalForTab})`}
                  </option>
                  {visibleCategoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="text-gray-900 bg-white">
                      {opt.label} ({countFor(opt.value)})
                    </option>
                  ))}
                </select>

                {/* Level Filter */}
                <select
                  className="px-4 py-2 rounded-sm border border-white/30 outline-none cursor-pointer bg-white/20 text-white font-medium backdrop-blur-sm hover:bg-white/30 transition-colors"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <option value="all"       className="text-gray-900 bg-white">All Levels</option>
                  <option value="UnderGrad" className="text-gray-900 bg-white">Undergraduate</option>
                  <option value="PostGrad"  className="text-gray-900 bg-white">Postgraduate</option>
                  <option value="Both"      className="text-gray-900 bg-white">Practitioners</option>
                  <option value="All"       className="text-gray-900 bg-white">All (Everyone)</option>
                </select>

                {/* Funding / Pay Type Filter — adapts to tab */}
                <select
                  className="px-4 py-2 rounded-sm border border-white/30 outline-none cursor-pointer bg-white/20 text-white font-medium backdrop-blur-sm hover:bg-white/30 transition-colors"
                  value={selectedFunding}
                  onChange={(e) => setSelectedFunding(e.target.value)}
                >
                  {visibleFundingOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="text-gray-900 bg-white">
                      {opt.label}
                    </option>
                  ))}
                </select>

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
          )}

          {/* Results Count */}
          {activeTab !== 'applied' && (
            <div className="mt-6">
              <p className="text-white">
                Showing <span className="font-semibold">{filteredOpportunities.length}</span>{' '}
                {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'}
                {activeTab !== 'all' && (
                  <span className="text-white/60 text-sm ml-2">in {currentTab.description}</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'applied' ? (
          <AppliedDashboard />
        ) : loading ? (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-900 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-400 mb-4"><Search className="w-16 h-16 mx-auto" /></div>
            <h3 className="text-xl text-gray-900 mb-2 font-semibold">Error Loading Opportunities</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-900 text-white rounded-sm hover:bg-blue-800 transition-colors font-medium">
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
                    <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Loading...</>
                  ) : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4"><Search className="w-16 h-16 mx-auto" /></div>
            <h3 className="text-xl text-gray-900 mb-2 font-semibold">No opportunities found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
            <button onClick={clearFilters} className="px-6 py-3 bg-blue-900 text-white rounded-sm hover:bg-blue-800 transition-colors font-medium">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Refurbished
