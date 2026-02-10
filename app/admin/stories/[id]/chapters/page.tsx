// import Link from 'next/link';
// import { notFound } from 'next/navigation';
// import { getStoryById, getChapters } from '@/lib/api';
// import ChapterList from '@/components/admin/ChapterList';
// import { ChevronLeft, ListOrdered, Plus } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// interface ChapterManagementProps {
//     params: Promise<{ id: string }>;
//     searchParams: Promise<{ page?: string; search?: string }>;
// }

// export default async function ChapterManagement({ params: paramsPromise, searchParams: searchParamsPromise }: ChapterManagementProps) {
//     const params = await paramsPromise;
//     const searchParams = await searchParamsPromise;
//     const id = parseInt(params.id);
//     const currentPage = parseInt(searchParams.page || '1');
//     const search = searchParams.search || '';
//     const pageSize = 10;

//     if (isNaN(id)) {
//         notFound();
//     }

//     const [story, chaptersResult] = await Promise.all([
//         getStoryById(id),
//         getChapters(id, { page: currentPage, pageSize, search })
//     ]);

//     if (!story) {
//         notFound();
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex flex-col gap-4">
//                 <div className="flex items-center gap-2">
//                     <Button variant="ghost" size="sm" asChild className="w-fit -ml-2 text-slate-500 hover:text-slate-900">
//                         <Link href="/admin/stories" className="flex items-center gap-1">
//                             <ChevronLeft className="h-4 w-4" /> Truyện
//                         </Link>
//                     </Button>
//                     <span className="text-slate-300">/</span>
//                     <Button variant="ghost" size="sm" asChild className="w-fit text-slate-500 hover:text-slate-900">
//                         <Link href={`/admin/stories/${id}/edit`}>
//                             {story.name}
//                         </Link>
//                     </Button>
//                 </div>

//                 <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//                     <div className="flex items-center gap-3">
//                         <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100">
//                             <ListOrdered className="h-6 w-6 text-cyan-600" />
//                         </div>
//                         <div>
//                             <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Chương</h2>
//                             <p className="text-slate-500 text-sm">Danh sách chương của "<span className="font-medium text-slate-700">{story.name}</span>"</p>
//                         </div>
//                     </div>
//                     <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
//                         <Link href={`/admin/stories/${id}/chapters/new`} className="flex items-center gap-2">
//                             <Plus className="h-4 w-4" /> Thêm Chương Mới
//                         </Link>
//                     </Button>
//                 </div>
//             </div>

//             <ChapterList
//                 storyId={id}
//                 initialChapters={chaptersResult.data}
//                 totalChapters={chaptersResult.count}
//                 currentPage={currentPage}
//                 pageSize={pageSize}
//             />
//         </div>
//     );
// }
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStoryById, getChapters } from '@/lib/api';
import ChapterList from '@/components/admin/ChapterList';
import { ChevronLeft, ListOrdered, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChapterManagementProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function ChapterManagement({ params: paramsPromise, searchParams: searchParamsPromise }: ChapterManagementProps) {
    const params = await paramsPromise;
    const searchParams = await searchParamsPromise;
    const id = parseInt(params.id);
    const currentPage = parseInt(searchParams.page || '1');
    const search = searchParams.search || '';
    const pageSize = 10;

    if (isNaN(id)) {
        notFound();
    }

    const [story, chaptersResult] = await Promise.all([
        getStoryById(id),
        getChapters(id, { page: currentPage, pageSize, search })
    ]);

    if (!story) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="w-fit -ml-2 text-slate-500 hover:text-slate-900">
                        <Link href="/admin/stories" className="flex items-center gap-1">
                            <ChevronLeft className="h-4 w-4" /> Truyện
                        </Link>
                    </Button>
                    <span className="text-slate-300">/</span>
                    <Button variant="ghost" size="sm" asChild className="w-fit text-slate-500 hover:text-slate-900">
                        <Link href={`/admin/stories/${id}/edit`}>
                            {story.name}
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100">
                            <ListOrdered className="h-6 w-6 text-cyan-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Chương</h2>
                            {/* SỬA TẠI ĐÂY: Thay " bằng &quot; */}
                            <p className="text-slate-500 text-sm">Danh sách chương của &quot;<span className="font-medium text-slate-700">{story.name}</span>&quot;</p>
                        </div>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                        <Link href={`/admin/stories/${id}/chapters/new`} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Thêm Chương Mới
                        </Link>
                    </Button>
                </div>
            </div>

            <Suspense fallback={<div className="h-40 w-full bg-white/5 animate-pulse rounded-lg" />}>
                <ChapterList
                    storyId={id}
                    initialChapters={chaptersResult.data}
                    totalChapters={chaptersResult.count}
                    currentPage={currentPage}
                    pageSize={pageSize}
                />
            </Suspense>
        </div>
    );
}
