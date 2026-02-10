import Link from 'next/link';
import Image from 'next/image';
import type { Story } from '@/types';

interface StoryCardFullProps {
    story: Story;
}

export default function StoryCardFull({ story }: StoryCardFullProps) {
    return (
        <div className="group relative flex flex-col gap-2 transition-all duration-300">
            <Link href={`/${story.slug}`} className="relative block aspect-[2/3] overflow-hidden rounded-xl bg-slate-800 shadow-md transition-all duration-500 group-hover:shadow-xl group-hover:shadow-blue-500/10 group-hover:-translate-y-1">
                <Image
                    src={story.image}
                    alt={story.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                />

                {/* Status Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        Full - {story.chapters_count} chương
                    </span>
                </div>

                {/* Badges Overlay */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {story.is_hot && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg shadow-red-500/40 uppercase tracking-tighter">Hot</span>
                    )}
                    {story.is_new && (
                        <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg shadow-blue-500/40 uppercase tracking-tighter">New</span>
                    )}
                </div>
            </Link>

            <div className="flex flex-col gap-1 text-center">
                <Link href={`/${story.slug}`} className="block">
                    <h3 className="text-sm font-bold text-slate-200 line-clamp-1 group-hover:text-blue-400 transition-colors duration-300" title={story.name}>
                        {story.name}
                    </h3>
                </Link>
            </div>
        </div>
    );
}
