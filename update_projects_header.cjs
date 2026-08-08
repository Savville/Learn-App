const fs = require('fs');
const file = 'src/pages/Projects.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="bg-blue-600 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Discover Projects</h1>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8">
            Explore community initiatives, student projects, research collaborations, and active developments.
          </p>
          <Link 
            to="/post-with-us" 
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-bold shadow hover:bg-blue-50 transition-colors"
          >
            Add a Project
          </Link>
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
                  className={\`lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors border flex-1 \${
                    showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }\`}
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
            </div>`;

const replacementStr = `<div className="bg-[#131ADF] rounded-b-3xl shadow-md">
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
            <div className={\`flex-1 \${showFilters ? 'block' : 'hidden'} md:block\`}>
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
                className="px-6 py-2 rounded-md font-semibold transition-all border-none bg-white text-blue-900 shadow-md hover:bg-gray-100"
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
          <div className="flex-1 min-w-0">`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  console.log("Successfully updated Projects.tsx header");
  fs.writeFileSync(file, content, 'utf8');
} else {
  console.log("Could not find exact string to replace in Projects.tsx. Resorting to regex...");
  const targetRegex = /<div className="bg-blue-600 text-white py-12 px-4 relative overflow-hidden">[\s\S]*?<div className="hidden lg:flex items-center gap-3">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
  if (targetRegex.test(content)) {
    content = content.replace(targetRegex, replacementStr);
    console.log("Successfully updated Projects.tsx header via regex");
    fs.writeFileSync(file, content, 'utf8');
  } else {
    console.log("Regex failed too.");
  }
}
