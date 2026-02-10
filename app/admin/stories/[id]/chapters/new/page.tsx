import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStoryById, getChapters } from '@/lib/api';
import ChapterForm from '@/components/admin/ChapterForm';
import { ChevronLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function NewChapter(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
        notFound();
    }

    const { data: chaptersData } = await getChapters(id);
    const story = await getStoryById(id);

    if (!story) {
        notFound();
    }

    // Determine next chapter number
    const maxNumber = chaptersData.length > 0
        ? Math.max(...chaptersData.map((c: any) => c.number))
        : 0;
    const nextNumber = maxNumber + 1;

    const dummyChapter = {
        number: nextNumber,
        title: '',
        content: '',
        story_id: id
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="w-fit -ml-2 text-slate-500 hover:text-slate-900">
                        <Link href={`/admin/stories/${id}/chapters`} className="flex items-center gap-1">
                            <ChevronLeft className="h-4 w-4" /> Danh sách chương
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                        <Plus className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Thêm Chương Mới</h2>
                        <p className="text-slate-500 text-sm">Thêm chương mới vào truyện "<span className="font-medium text-slate-700">{story.name}</span>"</p>
                    </div>
                </div>
            </div>

            <ChapterForm story={story} chapter={dummyChapter as any} />
        </div>
    );
}
