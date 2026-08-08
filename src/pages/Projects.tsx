import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProjectCard } from '../components/ProjectCard';
import { Search, Filter } from 'lucide-react';
import { getGlobalProjects } from '../services/profilesAPI';
import type { ProfileProject } from '../services/profilesAPI';
import { useSEO } from '../hooks/useSEO';
import { PROJECT_TABS, PROJECT_CATEGORIES } from '../constants/categories';

export function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [showFilters, setShowFilters] = useState(false);

  const [projects, setProjects] = useState<ProfileProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: `Projects — Opportunities Pathways`,
    description: 'Browse student and community projects, find collaborations, and explore showcases.',
    url: '/projects'
  });

  // Sync state to URL search parameters so history works seamlessly
  useEffect(() => {
    const params: Record<string, string> = {};
    if (activeTab !== 'all') params.tab = activeTab;
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory !== 'all') params.category = selectedCategory;

    setSearchParams(params, { replace: true });
  }, [activeTab, searchQuery, selectedCategory, setSearchParams]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let statusParam = undefined;
        if (activeTab === 'active') statusParam = 'Active';
        if (activeTab === 'finished') statusParam = 'Showcase';
        if (activeTab === 'require_funding') statusParam = 'Seeking Funding';
        if (activeTab === 'require_labour') statusParam = 'Recruiting';
        if (activeTab === 'archived') statusParam = 'Archived';

        let categoryParam = selectedCategory !== 'all' ? selectedCategory : undefined;

        const response = await getGlobalProjects({
          status: statusParam,
          category: categoryParam
        });
        
        // Client-side search filtering if API doesn't support full-text search yet
        let filtered = response.projects;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(p => 
            (p.title || '').toLowerCase().includes(q) || 
            (p.description || '').toLowerCase().includes(q) ||
            (p.authorName && p.authorName.toLowerCase().includes(q))
          );
        }

        setProjects(filtered);
      } catch (err: any) {
        console.error('Failed to fetch projects', err);
        setError('Unable to load projects at this time.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [activeTab, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Banner */}
      <div className="bg-[#131ADF] rounded-b-3xl shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-10">
          
          <h1 className="text-3xl font-bold text-white mb-6">
            Discover Projects
          </h1>

          {/* Search Bar */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/20 rounded-md border border-white/30 backdrop-blur-sm">
              <Search className="w-5 h-5 text-white/70 shrink-0" />
              <input
                type="text"
                placeholder="Search projects by title, description, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
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

          {/* Filters & Secondary Tabs Row */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            {/* Filters */}
            <div className={`flex-1 ${showFilters ? 'block' : 'hidden'} md:block`}>
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 rounded-sm border border-white/30 outline-none cursor-pointer bg-white/20 text-white font-medium backdrop-blur-sm hover:bg-white/30 transition-colors"
                >
                  <option value="all" className="text-gray-900 bg-white">All Categories</option>
                  {PROJECT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="text-gray-900 bg-white">{cat}</option>
                  ))}
                  <option value="Legacy Project" className="text-gray-900 bg-white">Legacy Project</option>
                </select>
              </div>
            </div>

            {/* Right Tabs */}
            <div className="flex gap-2 shrink-0">
              <Link
                to="/portfolio"
                className="px-6 py-2 rounded-md font-semibold transition-all border border-white bg-transparent text-white hover:bg-white hover:text-blue-900"
              >
                My Projects
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">

            {/* Mobile Filters Panel */}
            {showFilters && (
              <div className="lg:hidden bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-4 pr-8 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Categories</option>
                    {PROJECT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Legacy Project">Legacy Project</option>
                  </select>
                </div>
              </div>
            )}

            {/* Sub-tabs */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
              {PROJECT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold text-sm transition-all shadow-sm
                    ${activeTab === tab.id
                      ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-blue-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium mb-6">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 h-64 animate-pulse shadow-sm border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl mb-4" />
                    <div className="w-3/4 h-5 bg-slate-100 rounded mb-3" />
                    <div className="w-1/2 h-4 bg-slate-100 rounded mb-6" />
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-slate-100 rounded" />
                      <div className="w-4/5 h-3 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length > 0 ? (
              /* Projects Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project, idx) => (
                  <ProjectCard key={project.id || idx} project={project} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">No projects found</h3>
                <p className="text-slate-600 max-w-md mx-auto mb-8">
                  We couldn't find any projects matching your current filters. Try adjusting your search criteria or explore other categories.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('all');
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
