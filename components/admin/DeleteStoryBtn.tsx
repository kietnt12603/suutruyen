'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteStory } from '@/lib/api';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteStoryBtnProps {
    storyId: number;
    storyName: string;
}

export default function DeleteStoryBtn({ storyId, storyName }: DeleteStoryBtnProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Bạn có chắc chắn muốn xoá truyện "${storyName}"? Hành động này sẽ xoá tất cả các chương liên quan.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteStory(storyId);
            if (result.success) {
                // In a real app, maybe use a toast here
                router.refresh();
            } else {
                alert('Lỗi khi xoá truyện: ' + (result.error?.message || 'Không rõ nguyên nhân'));
            }
        } catch (error) {
            console.error('Error deleting story:', error);
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
                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </Button>
    );
}
