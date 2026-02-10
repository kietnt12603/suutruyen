'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface StoryDescriptionProps {
    description: string;
}

export default function StoryDescription({ description }: StoryDescriptionProps) {
    const [showFullDesc, setShowFullDesc] = useState(false);

    return (
        <div className="relative group">
            <div
                className={`text-slate-400 leading-relaxed font-medium transition-all duration-700 overflow-hidden relative ${showFullDesc ? 'max-h-none' : 'max-h-[200px]'}`}
                dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br>') }}
            />

            {!showFullDesc && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none" />
            )}

            <div className="flex justify-center mt-6">
                <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="group/btn flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 rounded-full transition-all duration-300 shadow-xl active:scale-95"
                >
                    <span className="text-xs font-black text-slate-300 group-hover/btn:text-white uppercase tracking-widest italic">
                        {showFullDesc ? 'Thu gọn' : 'Xem thêm'}
                    </span>
                    <ChevronDown size={14} className={`text-blue-500 group-hover/btn:text-white transition-transform duration-500 ${showFullDesc ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
    );
}
