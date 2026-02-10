import Link from 'next/link';
import Image from 'next/image';
import { getStoryBySlug, getChapters, getCategories, getStories, incrementStoryViews } from '@/lib/api';
import { notFound } from 'next/navigation';
import type { Chapter } from '@/types';
import StoryDescription from '@/components/StoryDescription';
import ChapterListPagination from '@/components/ChapterListPagination';
import { Star, User, BookOpen, Clock, List, Flame, Heart, Share2, Crown } from 'lucide-react';

export default async function StoryDetail(props: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ page?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const slug = params.slug;
    const currentChapterPage = parseInt(searchParams.page || '1');
    const itemsPerPage = 50;

    const [story, allCategoriesResult, hotStoriesResult] = await Promise.all([
        getStoryBySlug(slug),
        getCategories(),
        getStories({ hot: true, limit: 10 })
    ]);

    if (!story) {
        notFound();
    }

    // Increment views
    try {
        await incrementStoryViews(story.id);
    } catch (err) {
        console.error('Failed to increment views:', err);
    }

    const allCategories = allCategoriesResult.data;
    const hotStories = hotStoriesResult.data;

    const chaptersResult = await getChapters(story.id, {
        page: currentChapterPage,
        pageSize: itemsPerPage
    });
    const paginatedChapters = chaptersResult.data as Chapter[];
    const totalChaptersCount = chaptersResult.count;
    const totalPages = Math.ceil(totalChaptersCount / itemsPerPage);

    const half = Math.ceil(paginatedChapters.length / 2);
    const leftColChapters = paginatedChapters.slice(0, half);
    const rightColChapters = paginatedChapters.slice(half);

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-12">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-8 overflow-hidden whitespace-nowrap">
                    <Link href="/" className="hover:text-blue-400 transition-colors">Trang chủ</Link>
                    <span>/</span>
                    <span className="text-slate-300 truncate">{story.name}</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Story Top Section: Cover & Info */}
                        <section className="mb-12">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Cover Image */}
                                <div className="w-full md:w-64 shrink-0 group">
                                    <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-slate-800 shadow-2xl shadow-black/50 transition-transform duration-500 group-hover:-translate-y-2">
                                        <Image
                                            src={story.image || '/images/default_cover.jpg'}
                                            alt={story.name}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                </div>

                                {/* Basic Info */}
                                <div className="flex-1 space-y-6">
                                    <h1 className="text-3xl md:text-4xl font-black text-white leading-tight italic tracking-tight">
                                        {story.name}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-6 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 uppercase text-[10px] font-bold tracking-widest mb-1">Tác giả</span>
                                            <div className="flex items-center gap-2 text-slate-200">
                                                <User size={14} className="text-blue-400" />
                                                <span className="font-semibold">{story.author}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-slate-500 uppercase text-[10px] font-bold tracking-widest mb-1">Trạng thái</span>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${story.status === 'full' ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`} />
                                                <span className={`${story.status === 'full' ? 'text-emerald-400' : 'text-blue-400'} font-bold`}>
                                                    {story.status === 'full' ? 'Hoàn thành' : 'Đang ra'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-slate-500 uppercase text-[10px] font-bold tracking-widest mb-1">Đánh giá</span>
                                            <div className="flex items-center gap-1.5 text-yellow-500 font-black">
                                                <Star size={16} fill="currentColor" />
                                                <span className="text-lg">{story.rating || 0}</span>
                                                <span className="text-slate-500 text-xs font-medium">/ 10</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {story.categories.map((cat) => (
                                            <Link
                                                key={cat}
                                                href={`/category/${cat.toLowerCase().replace(/ /g, '-')}`}
                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium text-slate-300 transition-all hover:text-blue-400"
                                            >
                                                {cat}
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                        <Link
                                            href={`/${story.slug}/1`}
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                                        >
                                            Đọc ngay
                                        </Link>
                                        <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-slate-400 hover:text-red-400">
                                            <Heart size={20} />
                                        </button>
                                        <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-slate-400 hover:text-blue-400">
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Story Description */}
                        <section className="mb-12 bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/20">
                            <div className="flex items-center gap-3 mb-8">
                                <BookOpen size={20} className="text-blue-400" />
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Nội dung cốt truyện</h2>
                            </div>
                            <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed text-sm md:text-base">
                                <StoryDescription description={story.description || ''} />
                            </div>
                        </section>

                        {/* Chapter List */}
                        <section id="chapters" className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-10">
                            <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                                <div className="flex items-center gap-3">
                                    <List size={20} className="text-blue-400" />
                                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Danh sách chương</h2>
                                </div>
                                <span className="text-sm text-slate-500 font-medium bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                    {totalChaptersCount} chương
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 mb-10">
                                <div className="space-y-0.5">
                                    {leftColChapters.map((chap) => (
                                        <Link
                                            key={chap.number}
                                            href={`/${story.slug}/${chap.number}`}
                                            className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/5 transition-all group"
                                        >
                                            <span className="text-sm font-medium text-slate-400 group-hover:text-blue-400 truncate">
                                                Chương {chap.number}{chap.title ? `: ${chap.title.replace(/^chương\s+\d+[:\s-]*/i, '').trim()}` : ''}
                                            </span>
                                            {chap.is_vip && (
                                                <Crown size={14} className="text-orange-500 shrink-0 ml-2" />
                                            )}
                                        </Link>
                                    ))}
                                </div>
                                <div className="space-y-0.5">
                                    {rightColChapters.map((chap) => (
                                        <Link
                                            key={chap.number}
                                            href={`/${story.slug}/${chap.number}`}
                                            className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/5 transition-all group"
                                        >
                                            <span className="text-sm font-medium text-slate-400 group-hover:text-blue-400 truncate">
                                                Chương {chap.number}{chap.title ? `: ${chap.title.replace(/^chương\s+\d+[:\s-]*/i, '').trim()}` : ''}
                                            </span>
                                            {chap.is_vip && (
                                                <Crown size={14} className="text-orange-500 shrink-0 ml-2" />
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <ChapterListPagination
                                currentPage={currentChapterPage}
                                totalPages={totalPages}
                                baseUrl={`/${story.slug}`}
                            />
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-96 shrink-0 space-y-12">
                        {/* Top Rankings */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Flame size={20} className="text-orange-500" />
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Top Đọc Nhiều</h2>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                                {hotStories.map((s, idx) => (
                                    <div
                                        key={s.id}
                                        className="flex items-center gap-4 px-5 py-4 border-b border-white/5 hover:bg-white/[0.03] transition-all group"
                                    >
                                        <div className={`
                                            flex items-center justify-center w-8 h-8 shrink-0 rounded-full text-sm font-black italic
                                            ${idx === 0 ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/30' :
                                                idx === 1 ? 'bg-slate-300 text-black' :
                                                    idx === 2 ? 'bg-orange-400 text-black' :
                                                        'bg-white/10 text-slate-500'}
                                        `}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/${s.slug}`} className="block text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate mb-1">
                                                {s.name}
                                            </Link>
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {s.categories.slice(0, 2).map((cat) => (
                                                    <span key={cat} className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* All Categories Sidebar */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <List size={20} className="text-indigo-400" />
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Thể loại truyện</h2>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
                                <div className="grid grid-cols-2 gap-2">
                                    {allCategories.map(cat => (
                                        <Link
                                            key={cat.id}
                                            href={`/category/${cat.slug}`}
                                            className="text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition-all"
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
