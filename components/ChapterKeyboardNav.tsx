'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ChapterKeyboardNavProps {
    storySlug: string;
    chapterNumber: number;
    hasPrev: boolean;
    hasNext: boolean;
}

export default function ChapterKeyboardNav({ storySlug, chapterNumber, hasPrev, hasNext }: ChapterKeyboardNavProps) {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                if (hasPrev) {
                    router.push(`/${storySlug}/${chapterNumber - 1}`);
                }
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                if (hasNext) {
                    router.push(`/${storySlug}/${chapterNumber + 1}`);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [chapterNumber, storySlug, hasPrev, hasNext, router]);

    return null;
}
