import { Suspense } from 'react';
import Link from 'next/link';
import { getStories, getCategories } from '@/lib/api';
import StoryFilters from '@/components/admin/StoryFilters';
import AdminPagination from '@/components/admin/AdminPagination';
import StoryTable from '@/components/admin/StoryTable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function AdminStories(props: {
    searchParams: Promise<{ q?: string, category?: string, status?: string, page?: string }>
}) {
    const searchParams = await props.searchParams;
    const q = searchParams.q || '';
    const category = searchParams.category || '';
    const status = searchParams.status || '';
    const currentPage = parseInt(searchParams.page || '1');
    const itemsPerPage = 5;

    const [storiesResult, allCategoriesResult] = await Promise.all([
        getStories({
            search: q,
            categoryName: category,
            status: status,
            page: currentPage,
            pageSize: itemsPerPage
        }),
        getCategories()
    ]);

    const { data: stories, count: totalStories } = storiesResult;
    const { data: allCategories } = allCategoriesResult;
    const totalPages = Math.ceil(totalStories / itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Truyện</h2>
                    <p className="text-slate-500 text-sm">Danh sách tất cả truyện trên hệ thống.</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm" asChild>
                    <Link href="/admin/stories/new">
                        <Plus className="mr-2 h-4 w-4" /> Thêm Truyện Mới
                    </Link>
                </Button>
            </div>

            <Suspense fallback={<div className="h-10 w-full bg-white/5 animate-pulse rounded-lg" />}>
                <StoryFilters categories={allCategories} />
            </Suspense>

            <StoryTable initialStories={stories} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 pb-8">
                <div className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-md border shadow-sm">
                    Hiển thị <span className="font-bold text-slate-900">{stories.length}</span> trên <span className="font-bold text-slate-900">{totalStories}</span> truyện
                </div>
                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl="/admin/stories"
                    searchParams={{ q, category, status }}
                />
            </div>
        </div>
    );
}
