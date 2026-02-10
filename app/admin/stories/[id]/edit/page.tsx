// import Link from 'next/link';
// import { notFound } from 'next/navigation';
// import { getStoryById, getCategories } from '@/lib/api';
// import StoryForm from '@/components/admin/StoryForm';
// import { ChevronLeft, Pencil } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// export default async function EditStory(props: {
//     params: Promise<{ id: string }>
// }) {
//     const params = await props.params;
//     const id = parseInt(params.id);

//     if (isNaN(id)) {
//         notFound();
//     }

//     const [story, allCategoriesResult] = await Promise.all([
//         getStoryById(id),
//         getCategories()
//     ]);

//     const { data: allCategories } = allCategoriesResult;

//     if (!story) {
//         notFound();
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex flex-col gap-4">
//                 <Button variant="ghost" size="sm" asChild className="w-fit -ml-2 text-slate-500 hover:text-slate-900">
//                     <Link href="/admin/stories" className="flex items-center gap-1">
//                         <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
//                     </Link>
//                 </Button>

//                 <div className="flex items-center gap-3">
//                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
//                         <Pencil className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <div>
//                         <h2 className="text-3xl font-bold tracking-tight text-slate-900">Chỉnh sửa Truyện</h2>
//                         <p className="text-slate-500 text-sm">Cập nhật thông tin cho "<span className="font-medium text-slate-700">{story.name}</span>"</p>
//                     </div>
//                 </div>
//             </div>

//             <StoryForm story={story} allCategories={allCategories} />
//         </div>
//     );
// }

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStoryById, getCategories } from '@/lib/api';
import StoryForm from '@/components/admin/StoryForm';
import { ChevronLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function EditStory(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
        notFound();
    }

    const [story, allCategoriesResult] = await Promise.all([
        getStoryById(id),
        getCategories()
    ]);

    const { data: allCategories } = allCategoriesResult;

    if (!story) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <Button variant="ghost" size="sm" asChild className="w-fit -ml-2 text-slate-500 hover:text-slate-900">
                    <Link href="/admin/stories" className="flex items-center gap-1">
                        <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
                    </Link>
                </Button>

                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                        <Pencil className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Chỉnh sửa Truyện</h2>
                        {/* SỬA TẠI ĐÂY: Thay " bằng &quot; */}
                        <p className="text-slate-500 text-sm">Cập nhật thông tin cho &quot;<span className="font-medium text-slate-700">{story.name}</span>&quot;</p>
                    </div>
                </div>
            </div>

            <StoryForm story={story} allCategories={allCategories} />
        </div>
    );
}