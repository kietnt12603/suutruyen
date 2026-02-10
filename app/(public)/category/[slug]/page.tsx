import Link from 'next/link';
import StoryCard from '@/components/StoryCard';
import Pagination from '@/components/Pagination';
import { getStories, getCategories } from '@/lib/api';
import { ArrowLeft, BookOpen, Layers, List } from 'lucide-react';

export default async function CategoryPage(props: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ page?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const slug = params.slug;
    const currentPage = parseInt(searchParams.page || '1');
    const itemsPerPage = 30;

    const [allCategoriesResult, storiesResult] = await Promise.all([
        getCategories(),
        getStories({ categorySlug: slug, page: currentPage, pageSize: itemsPerPage })
    ]);

    const allCategories = allCategoriesResult.data;
    const stories = storiesResult.data;
    const totalStoriesCount = storiesResult.count;

    const currentCategory = allCategories.find(cat => cat.slug === slug);

    if (!currentCategory) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-white mb-6">Không tìm thấy thể loại</h2>
                <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                >
                    <ArrowLeft size={18} />
                    Quay lại trang chủ
                </Link>
            </div>
        );
    }

    // Pagination logic
    const totalPages = Math.ceil(totalStoriesCount / itemsPerPage);
    const currentStories = stories;

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-12">
            <div className="container mx-auto px-4 py-8">
                {/* Header / Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-8 overflow-hidden whitespace-nowrap">
                    <Link href="/" className="hover:text-blue-400 transition-colors">Trang chủ</Link>
                    <span>/</span>
                    <span className="text-slate-300 truncate">Thể loại: {currentCategory.name}</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Main Content: Story Grid */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600/10 rounded-lg text-blue-400">
                                    <Layers size={20} />
                                </div>
                                <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">
                                    {currentCategory.name}
                                </h1>
                            </div>
                            <span className="text-xs font-bold text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                {totalStoriesCount} truyện
                            </span>
                        </div>

                        {currentStories.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                                {currentStories.map((story) => (
                                    <StoryCard key={story.id} story={story} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center">
                                <p className="text-slate-500 font-medium">Chưa có truyện nào trong thể loại này.</p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="mt-12">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    baseUrl={`/category/${slug}`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 shrink-0 space-y-10">
                        {/* Category Info */}
                        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <BookOpen size={18} className="text-blue-400" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Mô tả thể loại</h2>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed italic">
                                {currentCategory.name}: Truyện thuộc kiểu {currentCategory.name.toLowerCase()},
                                thường tập trung vào các tình tiết và đặc trưng của thể loại này.
                                Tổng hợp đầy đủ và cập nhật liên tục các bộ truyện {currentCategory.name.toLowerCase()} hay nhất.
                            </p>
                        </section>

                        {/* All Categories List */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <List size={18} className="text-indigo-400" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Tất cả thể loại</h2>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
                                <div className="grid grid-cols-2 gap-2">
                                    {allCategories.map(cat => (
                                        <Link
                                            key={cat.id}
                                            href={`/category/${cat.slug}`}
                                            className={`text-[11px] font-bold px-3 py-2 rounded-xl transition-all ${cat.slug === slug
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                }`}
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
