import Link from 'next/link';
import StoryCard from '@/components/StoryCard';
import StoryCardFull from '@/components/StoryCardFull';
import StoryListRealtime from '@/components/StoryListRealtime';
import Pagination from '@/components/Pagination';
import { getStories, getCategories } from '@/lib/api';
import { Flame, Star, List, Clock, CheckCircle2 } from 'lucide-react';

export default async function Home(props: { searchParams: Promise<{ page?: string }> }) {
    const searchParams = await props.searchParams;
    const currentPage = parseInt(searchParams.page || '1');
    const itemsPerPage = 15;

    // Fetch data from Supabase
    const [hotStoriesResult, newStoriesResult, categoriesResult, fullStoriesResult] = await Promise.all([
        getStories({ hot: true, limit: 16 }),
        getStories({ page: currentPage, pageSize: itemsPerPage, sortBy: 'updated_at' }),
        getCategories(),
        getStories({ status: 'full', limit: 16 })
    ]);

    const hotStories = hotStoriesResult.data;
    const currentNewStories = newStoriesResult.data;
    const totalStoriesCount = newStoriesResult.count;
    const categories = categoriesResult.data;
    const fullStories = fullStoriesResult.data;

    const totalPages = Math.ceil(totalStoriesCount / itemsPerPage);

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-12">
            {/* Hot Stories Section - Full Width Carousel Style Header */}
            <section className="pt-8 pb-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-white/5 pb-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Flame className="text-orange-500" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-white italic uppercase">Truyện Hot</h2>
                        </div>

                        <div className="w-full md:w-48">
                            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors">
                                <option value="all">Tất cả thể loại</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
                        {hotStories.map((story) => (
                            <StoryCard key={story.id} story={story} />
                        ))}
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content: New Stories */}
                    <div className="flex-1 min-w-0">
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Clock className="text-blue-500" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-white italic uppercase">Mới cập nhật</h2>
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
                                <StoryListRealtime initialStories={currentNewStories} />
                            </div>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                baseUrl="/"
                            />
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 shrink-0 space-y-12">
                        {/* Categories List */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    <List className="text-indigo-500" size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wide">Thể loại</h2>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={`/category/${cat.slug}`}
                                            className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Top Rankings */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-yellow-500/10 rounded-lg">
                                    <Star className="text-yellow-500" size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wide">Top Đọc Nhiều</h2>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                                {hotStories.slice(0, 10).map((story, idx) => (
                                    <Link
                                        key={story.id}
                                        href={`/${story.slug}`}
                                        className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-all group"
                                    >
                                        <div className={`
                                            flex items-center justify-center w-7 h-7 shrink-0 rounded-full text-xs font-bold
                                            ${idx === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' :
                                                idx === 1 ? 'bg-slate-300 text-black' :
                                                    idx === 2 ? 'bg-orange-400 text-black' :
                                                        'bg-white/10 text-slate-400'}
                                        `}>
                                            {idx + 1}
                                        </div>
                                        <span className="text-sm font-medium text-slate-300 group-hover:text-blue-400 transition-colors truncate">
                                            {story.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

            {/* Full Stories Section */}
            <section className="py-16 mt-16 bg-white/[0.01] border-y border-white/5">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <CheckCircle2 className="text-emerald-500" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white italic uppercase">Truyện đã hoàn thành</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
                        {fullStories.map((story) => (
                            <StoryCardFull key={story.id} story={story} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
