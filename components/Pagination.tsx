'use client';

import Link from 'next/link';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl?: string;
    onPageChange?: (page: number) => void;
}

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, baseUrl, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const renderPageButton = (page: number | string, idx: number) => {
        if (page === '...') {
            return (
                <span key={`dots-${idx}`} className="flex items-center justify-center w-10 h-10 text-slate-500">
                    ...
                </span>
            );
        }

        const isActive = currentPage === page;
        const buttonClasses = `
            flex items-center justify-center w-10 h-10 rounded-lg text-sm font-semibold transition-all duration-200
            ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/20'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
            }
        `;

        if (baseUrl) {
            const url = page === 1 ? baseUrl : `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page}`;
            return (
                <Link key={page} href={url} className={buttonClasses}>
                    {page}
                </Link>
            );
        }

        return (
            <button
                key={page}
                onClick={() => onPageChange?.(page as number)}
                className={buttonClasses}
            >
                {page}
            </button>
        );
    };

    return (
        <nav className="flex items-center justify-center gap-2 py-8" aria-label="Pagination">
            {/* Previous Button */}
            {currentPage > 1 ? (
                baseUrl ? (
                    <Link
                        href={currentPage > 2 ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage - 1}` : baseUrl}
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                ) : (
                    <button
                        onClick={() => onPageChange?.(currentPage - 1)}
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )
            ) : (
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-slate-700 border border-white/5 opacity-50 cursor-not-allowed">
                    <ChevronLeft size={20} />
                </div>
            )}

            {/* Page Numbers */}
            <div className="flex items-center gap-1.5">
                {getPageNumbers().map((page, idx) => renderPageButton(page, idx))}
            </div>

            {/* Next Button */}
            {currentPage < totalPages ? (
                baseUrl ? (
                    <Link
                        href={`${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage + 1}`}
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5 transition-all"
                    >
                        <ChevronRight size={20} />
                    </Link>
                ) : (
                    <button
                        onClick={() => onPageChange?.(currentPage + 1)}
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5 transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                )
            ) : (
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-slate-700 border border-white/5 opacity-50 cursor-not-allowed">
                    <ChevronRight size={20} />
                </div>
            )}
        </nav>
    );
}
