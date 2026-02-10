import Link from 'next/link';
import { getStories, getCategories } from '@/lib/api';
import StoryCard from '@/components/StoryCard';
import { Search, List, ArrowLeft } from 'lucide-react';

export default async function SearchPage(props: {
    searchParams: Promise<{ q?: string }>
}) {
    const searchParams = await props.searchParams;
    const query = searchParams.q || '';

    const [storiesResult, allCategoriesResult] = await Promise.all([
        getStories({ search: query }),
        getCategories()
    ]);

    const stories = storiesResult.data;
    const allCategories = allCategoriesResult.data;

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-12">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-8 overflow-hidden whitespace-nowrap">
                    <Link href="/" className="hover:text-blue-400 transition-colors">Trang chủ</Link>
                    <span>/</span>
                    <span className="text-slate-300 truncate font-bold italic">Tìm kiếm: {query}</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-400">
                                    <Search size={22} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">
                                        Kết quả tìm kiếm
                                    </h1>
                                    <p className="text-xs font-medium text-slate-500 mt-1">
                                        Tìm thấy <span className="text-blue-400 font-bold">{stories.length}</span> kết quả cho "{query}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {stories.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                                {stories.map((story) => (
                                    <StoryCard key={story.id} story={story} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-20 text-center flex flex-col items-center shadow-2xl">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-600 mb-6">
                                    <Search size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy truyện nào</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mb-8">
                                    {query
                                        ? `Chúng tôi không tìm thấy kết quả nào cho "${query}". Thử tìm kiếm với từ khóa khác nhé!`
                                        : 'Vui lòng nhập từ khóa để bắt đầu tìm kiếm những bộ truyện hấp dẫn.'}
                                </p>
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                >
                                    <ArrowLeft size={18} />
                                    Khám phá kho truyện
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 shrink-0 space-y-10">
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <List size={18} className="text-blue-400" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Tất cả thể loại</h2>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
                                <div className="grid grid-cols-2 gap-2">
                                    {allCategories.map(cat => (
                                        <Link
                                            key={cat.id}
                                            href={`/category/${cat.slug}`}
                                            className="text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition-all"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}
