import { useState } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { aiSearchProfiles } from '../services/profilesAPI';
import type { Profile } from '../services/profilesAPI';

interface AISearchBarProps {
    onResults?: (profiles: Profile[]) => void;
    placeholder?: string;
}

export function AISearchBar({ onResults, placeholder = 'Find talent by skill, location, or description...' }: AISearchBarProps) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const result = await aiSearchProfiles(query.trim());
            onResults?.(result.data);
        } catch (err: any) {
            setError(err.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setError(null);
        onResults?.([]);
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full">
            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 outline-none text-slate-700 text-sm bg-transparent"
                />
                {loading ? (
                    <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin shrink-0" />
                ) : query ? (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                ) : (
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                )}
            </div>

            {error && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg">
                    {error}
                </div>
            )}
        </form>
    );
}