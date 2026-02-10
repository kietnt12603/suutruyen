import Link from 'next/link';
import { getStoryBySlug, getChapter, getChapters, incrementStoryViews } from '@/lib/api-server';
import { notFound } from 'next/navigation';
import ChapterKeyboardNav from '@/components/ChapterKeyboardNav';
import VipChapterLock from '@/components/VipChapterLock';
import type { Chapter } from '@/types';
import { ChevronLeft, ChevronRight, List, Home, ArrowLeft } from 'lucide-react';

export default async function ChapterPage(props: {
    params: Promise<{ slug: string, chapterId: string }>
}) {
    const params = await props.params;
    const slug = params.slug;
    const chapterNumber = parseInt(params.chapterId);

    const story = await getStoryBySlug(slug);
    if (!story) notFound();

    // Increment views
    incrementStoryViews(story.id).catch((err: Error) => console.error('Failed to increment views:', err));

    const [chapter, firstBatchChaptersResult] = await Promise.all([
        getChapter(story.id, chapterNumber),
        getChapters(story.id, { page: 1, pageSize: 1000 })
    ]);

    let allChapters = firstBatchChaptersResult.data;
    const totalChaptersCount = firstBatchChaptersResult.count;

    // If there are more than 1000 chapters, fetch the remaining batches
    if (totalChaptersCount > 1000) {
        const remainingPages = Math.ceil(totalChaptersCount / 1000);
        const fetchPromises = [];
        for (let p = 2; p <= remainingPages; p++) {
            fetchPromises.push(getChapters(story.id, { page: p, pageSize: 1000 }));
        }
        const remainingResults = await Promise.all(fetchPromises);
        remainingResults.forEach((res: { data: any[]; count: number }) => {
            allChapters = [...allChapters, ...res.data];
        });
    }

    if (!chapter) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-white mb-6">Không tìm thấy chương</h2>
                <Link
                    href={`/${story.slug}`}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                >
                    <ArrowLeft size={18} />
                    Quay lại truyện
                </Link>
            </div>
        );
    }

    const prevChapter = chapterNumber > 1 ? chapterNumber - 1 : null;
    const nextChapter = chapterNumber < totalChaptersCount ? chapterNumber + 1 : null;

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-300 pb-20 md:pb-0">
            <ChapterKeyboardNav
                storySlug={slug}
                chapterNumber={chapterNumber}
                hasPrev={!!prevChapter}
                hasNext={!!nextChapter}
            />

            {/* Reading Header */}
            <header className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5 py-4">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-1">
                        <Link href={`/${story.slug}`} className="text-blue-500 hover:text-blue-400 font-bold uppercase tracking-widest text-[10px] transition-colors">
                            {story.name}
                        </Link>
                        <h1 className="text-lg md:text-xl font-black text-white italic truncate w-full">
                            Chương {chapterNumber}: {chapter.title?.replace(/^chương\s+\d+[:\s-]*/i, '').trim() || ''}
                        </h1>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Top Navigation */}
                <div className="flex items-center justify-center gap-3 mb-16">
                    <Link
                        href={prevChapter ? `/${slug}/${prevChapter}` : '#'}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${prevChapter
                            ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10 active:scale-95 shadow-lg'
                            : 'opacity-10 pointer-events-none'
                            }`}
                    >
                        <ChevronLeft size={20} />
                        <span className="hidden sm:inline">Trước</span>
                    </Link>

                    <div className="relative group">
                        <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95">
                            <List size={20} />
                            <span className="hidden sm:inline">Chương</span>
                        </button>

                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-72 bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar px-2">
                                {allChapters.map((chap: any) => (
                                    <Link
                                        key={chap.id}
                                        href={`/${slug}/${chap.number}`}
                                        className={`block px-4 py-3 text-sm font-medium rounded-xl transition-all ${chap.number === chapterNumber
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        Chương {chap.number}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Link
                        href={nextChapter ? `/${slug}/${nextChapter}` : '#'}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${nextChapter
                            ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10 active:scale-95 shadow-lg'
                            : 'opacity-10 pointer-events-none'
                            }`}
                    >
                        <span className="hidden sm:inline">Tiếp</span>
                        <ChevronRight size={20} />
                    </Link>
                </div>

                {/* Content Section */}
                <article className="max-w-3xl mx-auto">
                    <div className="chapter-content text-[19px] md:text-[22px] leading-[1.8] text-slate-300 space-y-8 font-medium selection:bg-blue-500/30 selection:text-white tracking-wide">
                        {chapter.is_locked ? (
                            <VipChapterLock chapter={chapter} />
                        ) : (
                            <div
                                className="chapter-rich-text text-justify"
                                dangerouslySetInnerHTML={{ __html: chapter.content || '' }}
                            />
                        )}
                    </div>
                </article>

                {/* Bottom Navigation */}
                <div className="mt-24 flex flex-col items-center gap-10 border-t border-white/5 pt-16">
                    <div className="flex items-center justify-center gap-6">
                        <Link
                            href={prevChapter ? `/${slug}/${prevChapter}` : '#'}
                            className={`flex flex-col items-center gap-3 group ${!prevChapter ? 'opacity-10 pointer-events-none' : ''}`}
                        >
                            <div className="p-5 bg-white/5 group-hover:bg-blue-600 group-hover:text-white rounded-3xl text-slate-500 transition-all active:scale-90 shadow-xl border border-white/5">
                                <ChevronLeft size={28} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-500 transition-colors">Trước</span>
                        </Link>

                        <Link
                            href={`/${story.slug}`}
                            className="flex flex-col items-center gap-3 group"
                        >
                            <div className="p-5 bg-white/5 group-hover:bg-indigo-600 group-hover:text-white rounded-3xl text-slate-500 transition-all active:scale-90 shadow-xl border border-white/5">
                                <Home size={28} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-500 transition-colors">Truyện</span>
                        </Link>

                        <Link
                            href={nextChapter ? `/${slug}/${nextChapter}` : '#'}
                            className={`flex flex-col items-center gap-3 group ${!nextChapter ? 'opacity-10 pointer-events-none' : ''}`}
                        >
                            <div className="p-5 bg-white/5 group-hover:bg-blue-600 group-hover:text-white rounded-3xl text-slate-500 transition-all active:scale-90 shadow-xl border border-white/5">
                                <ChevronRight size={28} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-500 transition-colors">Tiếp</span>
                        </Link>
                    </div>

                    <div className="px-8 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                        Mẹo: Phím <span className="text-slate-300 mx-1 border border-white/10 px-2 py-1 rounded-lg">←</span> <span className="text-slate-300 mx-1 border border-white/10 px-2 py-1 rounded-lg">→</span> để đổi chương
                    </div>
                </div>
            </div>
        </div>
    );
}
