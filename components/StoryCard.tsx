import Link from 'next/link';
import Image from 'next/image';
import type { Story } from '@/types';

interface StoryCardProps {
    story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
    return (
        <div className="group relative flex flex-col gap-2 transition-all duration-300">
            <Link href={`/${story.slug}`} title={story.name} className="relative block aspect-[2/3] overflow-hidden rounded-xl bg-slate-800 shadow-md transition-all duration-500 group-hover:shadow-xl group-hover:shadow-blue-500/10 group-hover:-translate-y-1">
                <Image
                    src={story.image}
                    alt={story.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                />

                {/* Badges Overlay */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {story.is_hot && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg shadow-red-500/40 uppercase tracking-tighter">Hot</span>
                    )}
                    {story.status?.toLowerCase() === 'full' && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg shadow-emerald-500/40 uppercase tracking-tighter">Full</span>
                    )}
                    {story.is_new && (
                        <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg shadow-blue-500/40 uppercase tracking-tighter">New</span>
                    )}
                </div>

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
            </Link>

            <div className="flex flex-col gap-1">
                <Link href={`/${story.slug}`} className="block">
                    <h3 className="text-sm font-bold text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors duration-300" title={story.name}>
                        {story.name}
                    </h3>
                </Link>
                {/* Could add author or chapter count here in the future */}
            </div>
        </div>
    );
}
