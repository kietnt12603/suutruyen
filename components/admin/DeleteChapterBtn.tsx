'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteChapter } from '@/lib/api';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteChapterBtnProps {
    chapterId: number;
    storyId: number;
    chapterNumber: number;
}

export default function DeleteChapterBtn({ chapterId, storyId, chapterNumber }: DeleteChapterBtnProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Bạn có chắc chắn muốn xoá chương ${chapterNumber}?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteChapter(chapterId, storyId);
            if (result.success) {
                router.refresh();
            } else {
                alert('Lỗi khi xoá chương: ' + (result.error?.message || 'Không rõ nguyên nhân'));
            }
        } catch (error) {
            console.error('Error deleting chapter:', error);
            alert('Đã có lỗi xảy ra khi xoá');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
            title="Xoá"
            onClick={handleDelete}
            disabled={isDeleting}
        >
            {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </Button>
    );
}
