'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStories } from '@/lib/api';
import type { Story } from '@/types';

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Story[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const router = useRouter();

    const handleSearch = (query: string) => {
        setSearchQuery(query);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (query.length === 0) {
            setShowResults(false);
            setSearchResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            const { data } = await getStories({ search: query, limit: 5 });
            setSearchResults(data);
            setShowResults(true);
        }, 300);

        setSearchTimeout(timeout);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setShowResults(false);
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <form className="relative flex-1 max-w-md group" onSubmit={handleSubmit}>
            <div className="relative">
                <input
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all group-hover:bg-white/10"
                    type="text"
                    placeholder="Tìm kiếm truyện..."
                    name="key_word"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setShowResults(true)}
                />
                <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"
                    type="submit"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" fill="currentColor">
                        <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path>
                    </svg>
                </button>
            </div>

            {showResults && searchQuery.length > 0 && (
                <>
                    <div className="fixed inset-0 z-[-1]" onClick={() => setShowResults(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {searchResults.length > 0 ? (
                            <div className="flex flex-col">
                                {searchResults.map((story) => (
                                    <Link
                                        key={story.id}
                                        href={`/${story.slug}`}
                                        className="px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                                        onClick={() => {
                                            setShowResults(false);
                                            setSearchQuery('');
                                        }}
                                    >
                                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                        <span className="truncate">{story.name}</span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center">
                                Không tìm thấy truyện nào
                            </div>
                        )}
                    </div>
                </>
            )}
        </form>
    );
}
