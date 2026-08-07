import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
            p.title.toLowerCase().includes(q) || 
            p.description.toLowerCase().includes(q) ||
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
    <div className="min-h-screen bg-slate-50 pt-[72px]">
      {/* Banner */}
      <div className="bg-blue-600 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Discover Projects</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Explore community initiatives, student projects, research collaborations, and active developments.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects by title, description, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors border flex-1 ${
                    showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                <div className="hidden lg:flex items-center gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-4 pr-8 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium text-sm text-slate-700"
                  >
                    <option value="all">All Categories</option>
                    {PROJECT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Legacy Project">Legacy Project</option>
                  </select>
                </div>
              </div>
            </div>

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
