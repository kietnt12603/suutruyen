import Link from 'next/link';
import type { Story } from '@/types';
import { formatTimeAgo } from '@/lib/utils';

interface StoryListItemProps {
    story: Story;
}

export default function StoryListItem({ story }: StoryListItemProps) {
    return (
        <div className="group flex items-center justify-between py-3 px-2 border-b border-white/5 hover:bg-white/[0.02] transition-colors gap-4">
            {/* Story Name & Badges */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
                <Link
                    href={`/${story.slug}`}
                    className="text-sm font-bold text-slate-200 hover:text-blue-400 transition-colors truncate"
                    title={story.name}
                >
                    {story.name}
                </Link>
                <div className="flex items-center gap-1 shrink-0">
                    {story.is_hot && (
                        <span className="text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Hot</span>
                    )}
                    {story.is_new && (
                        <span className="text-[9px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">New</span>
                    )}
                    {story.status?.toLowerCase() === 'full' && (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Full</span>
                    )}
                </div>
            </div>

            {/* Categories - Hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-1.5 flex-1 min-w-0">
                {story.categories.slice(0, 2).map((cat, index) => (
                    <Link
                        key={cat}
                        href={`/category/${cat.toLowerCase().replace(/ /g, '-')}`}
                        className="text-[12px] text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap"
                    >
                        {cat}{index < 1 && index < story.categories.length - 1 ? ',' : ''}
                    </Link>
                ))}
            </div>

            {/* Chapters & Time */}
            <div className="flex items-center gap-3 shrink-0 text-right">
                <span className="text-[12px] font-medium text-slate-400">
                    {story.chapters_count} <span className="hidden md:inline">chương</span>
                </span>
                {story.updated_at && (
                    <span className="text-[11px] text-slate-500 italic hidden lg:inline" suppressHydrationWarning>
                        {formatTimeAgo(story.updated_at)}
                    </span>
                )}
            </div>
        </div>
    );
}
