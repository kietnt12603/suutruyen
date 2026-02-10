'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from './Pagination';

interface ChapterListPaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
}

export default function ChapterListPagination({ currentPage, totalPages, baseUrl }: ChapterListPaginationProps) {
    const [inputPage, setInputPage] = useState('');
    const router = useRouter();

    const handleInputPaginate = () => {
        const page = parseInt(inputPage);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            router.push(`${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page}`);
            setInputPage('');
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl border border-white/5 shadow-xl">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl={baseUrl}
                />

                <div className="relative group ms-2">
                    <button
                        className="h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2 italic"
                        type="button"
                    >
                        <span>Chọn trang</span>
                    </button>

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-4 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 min-w-[160px]">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">Nhập số trang</div>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="w-20 h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold"
                                value={inputPage}
                                onChange={(e) => setInputPage(e.target.value)}
                                placeholder="..."
                            />
                            <button
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase italic transition-all active:scale-95"
                                onClick={handleInputPaginate}
                            >
                                Đi
                            </button>
                        </div>
                        {/* Caret */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-[#1e293b]" />
                    </div>
                </div>

                {totalPages > 2 && currentPage < totalPages && (
                    <button
                        onClick={() => router.push(`${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${totalPages}`)}
                        className="h-10 w-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5 ms-2 active:scale-95"
                        title="Trang cuối"
                    >
                        <i className="fa-solid fa-angles-right"></i>
                    </button>
                )}
            </div>
        </div>
    );
}
