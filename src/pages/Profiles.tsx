import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Filter } from 'lucide-react';
import { ProfileCard } from '../components/ProfileCard';
import { AISearchBar } from '../components/AISearchBar';
import { listProfiles, getTrendingProfiles } from '../services/profilesAPI';
import type { Profile } from '../services/profilesAPI';
import { useSEO } from '../hooks/useSEO';

type FilterType = 'all' | 'students' | 'professionals' | 'organizations';

export function Profiles() {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [showAIResults, setShowAIResults] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });

    useSEO({
        title: 'Profiles — Discover Talent',
        description: 'Browse talented professionals ready for hire. Find designers, developers, data scientists and more.',
        url: '/profiles',
    });

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        setLoading(true);
        try {
            const result = await listProfiles(pagination.page);
            setProfiles(result.data);
            setPagination((prev) => ({ ...prev, pages: result.pages }));
        } catch (err) {
            console.error('Failed to load profiles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAISearchResults = (results: Profile[]) => {
        setProfiles(results);
        setShowAIResults(true);
    };

    const clearFilters = () => {
        setActiveFilter('all');
        setShowAIResults(false);
        loadProfiles();
    };

    const loggedInEmail = localStorage.getItem('user_email');

    // Simple filter logic based on interests/skills and exclude logged-in user
    const filteredProfiles = profiles.filter((p) => {
        if (loggedInEmail && p.email === loggedInEmail) return false;

        if (activeFilter === 'all') return true;

        if (activeFilter === 'students') {
            return p.interestAreas?.some((a) =>
                ['Education', 'EdTech', 'Research'].includes(a)
            );
        }
            if (activeFilter === 'organizations') {
                return p.interestAreas?.some((a) =>
                    ['Government', 'NGO', 'Policy'].includes(a)
                );
            }
            // professionals is default - include everyone else
            return true;
        });

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header Bar */}
            <div className="bg-[#131ADF] rounded-b-3xl shadow-md mb-8">
                <div className="max-w-7xl mx-auto px-4 py-8 pb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h1 className="text-3xl font-bold text-white">Profiles</h1>
                        <div className="flex gap-3 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                            <Link to="/applied" className="px-5 py-2 text-sm rounded-md font-semibold transition-all border border-white text-white hover:bg-white hover:text-blue-900 whitespace-nowrap">Tracker</Link>
                            <Link to="/inbox" className="px-5 py-2 text-sm rounded-md font-semibold transition-all border border-white text-white hover:bg-white hover:text-blue-900 whitespace-nowrap">Inbox</Link>
                            <Link to="/portfolio" className="px-5 py-2 text-sm rounded-md font-semibold transition-all border border-white text-white hover:bg-white hover:text-blue-900 whitespace-nowrap">Portfolio</Link>
                        </div>
                    </div>

                    {/* AI Search */}
                    <div className="bg-white/10 p-1.5 rounded-xl backdrop-blur-sm border border-white/20 shadow-sm">
                        <AISearchBar
                            onResults={handleAISearchResults}
                            placeholder="Find talent by skill, location, or description..."
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Filter Bar */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Filter className="w-4 h-4" />
                        <span>Filter:</span>
                    </div>
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'students', label: 'Students' },
                        { id: 'professionals', label: 'Professionals' },
                        { id: 'organizations', label: 'Organizations' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id as FilterType)}
                            className={`px-4 py-2 rounded-[7px] text-sm font-medium transition-colors ${activeFilter === f.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                    {(activeFilter !== 'all' || showAIResults) && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                        Showing <span className="font-semibold">{filteredProfiles.length}</span> profiles
                        {showAIResults && <span className="text-purple-600 ml-1">(AI Search)</span>}
                    </p>
                </div>

                {/* Profiles Grid */}
                {loading ? (
                    <div className="fixed inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-900 rounded-full animate-spin" />
                    </div>
                ) : filteredProfiles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProfiles.map((profile) => (
                            <ProfileCard
                                key={profile.email}
                                profile={profile}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-slate-400 mb-4">
                            <Users className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl text-gray-900 mb-2 font-semibold">No profiles found</h3>
                        <p className="text-gray-600 mb-2">Try adjusting your search or filters.</p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 px-6 py-3 bg-blue-900 text-white rounded-[7px] hover:bg-blue-800 transition-colors font-medium"
                        >
                            View All Profiles
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}