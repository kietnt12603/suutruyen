import Link from 'next/link';
import { getStories, getCategories } from '@/lib/api';
import StoryListItem from '@/components/StoryListItem';
import Pagination from '@/components/Pagination';
import type { Story } from '@/types';
import { List, ArrowLeft, Flame, Clock, CheckCircle, Hash } from 'lucide-react';

export default async function ListPage(props: {
    params: Promise<{ type: string }>,
    searchParams: Promise<{ page?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const type = params.type;
    const currentPage = parseInt(searchParams.page || '1');
    const itemsPerPage = 30;

    const [allCategoriesResult, allStoriesResult] = await Promise.all([
        getCategories(),
        getStories()
    ]);

    const allCategories = allCategoriesResult.data;
    const allStories = allStoriesResult.data;

    let title = 'Danh sách truyện';
    let icon = <List size={20} />;
    let filteredStories: Story[] = [];

    switch (type) {
        case 'truyen-hot':
            title = 'Truyện Hot';
            icon = <Flame size={20} className="text-orange-500" />;
            filteredStories = allStories.filter(s => s.is_hot);
            break;
        case 'truyen-moi':
            title = 'Truyện Mới Cập Nhật';
            icon = <Clock size={20} className="text-blue-400" />;
            filteredStories = [...allStories];
            break;
        case 'truyen-full':
            title = 'Truyện Đã Hoàn Thành';
            icon = <CheckCircle size={20} className="text-emerald-400" />;
            filteredStories = allStories.filter(s => s.status === 'full');
            break;
        case 'duoi-100-chuong':
            title = 'Truyện Dưới 100 Chương';
            icon = <Hash size={20} className="text-indigo-400" />;
            filteredStories = allStories.filter(s => s.chapters_count < 100);
            break;
        case '100-500-chuong':
            title = 'Truyện 100 - 500 Chương';
            icon = <Hash size={20} className="text-indigo-400" />;
            filteredStories = allStories.filter(s => s.chapters_count >= 100 && s.chapters_count <= 500);
            break;
        case '500-1000-chuong':
            title = 'Truyện 500 - 1000 Chương';
            icon = <Hash size={20} className="text-indigo-400" />;
            filteredStories = allStories.filter(s => s.chapters_count > 500 && s.chapters_count <= 1000);
            break;
        case 'tren-1000-chuong':
            title = 'Truyện Trên 1000 Chương';
            icon = <Hash size={20} className="text-indigo-400" />;
            filteredStories = allStories.filter(s => s.chapters_count > 1000);
            break;
    }

    const totalPages = Math.ceil(filteredStories.length / itemsPerPage);
    const paginatedStories = filteredStories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-12">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-8 overflow-hidden whitespace-nowrap">
                    <Link href="/" className="hover:text-blue-400 transition-colors">Trang chủ</Link>
                    <span>/</span>
                    <span className="text-slate-300 truncate font-bold italic">{title}</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg text-slate-200">
                                    {icon}
                                </div>
                                <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">
                                    {title}
                                </h1>
                            </div>
                            <span className="text-xs font-bold text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                {filteredStories.length} truyện
                            </span>
                        </div>

                        <div className="bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-8">
                            {paginatedStories.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {paginatedStories.map((story) => (
                                        <StoryListItem key={story.id} story={story} />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <p className="text-slate-500 font-medium italic">Hiện chưa có truyện nào trong danh sách này.</p>
                                </div>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                baseUrl={`/list/${type}`}
                            />
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 shrink-0 space-y-10">
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <List size={18} className="text-blue-400" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Thể loại truyện</h2>
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
