'use client';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface AdminPaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    searchParams: Record<string, string | undefined>;
}

export default function AdminPagination({ currentPage, totalPages, baseUrl, searchParams }: AdminPaginationProps) {
    if (totalPages <= 1) return null;

    const createUrl = (page: number) => {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value && key !== 'page') {
                params.set(key, value);
            }
        });
        params.set('page', page.toString());
        return `${baseUrl}?${params.toString()}`;
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <Pagination className="mx-0 w-auto">
            <PaginationContent>
                <PaginationItem>
                    {currentPage <= 1 ? (
                        <span className="flex h-9 items-center justify-center px-4 py-2 text-sm text-slate-300 pointer-events-none">
                            Trước
                        </span>
                    ) : (
                        <PaginationPrevious
                            href={createUrl(currentPage - 1)}
                            className="bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                        />
                    )}
                </PaginationItem>

                {pageNumbers[0] > 1 && (
                    <>
                        <PaginationItem>
                            <PaginationLink href={createUrl(1)} className="bg-white border-slate-200 hover:bg-slate-50">1</PaginationLink>
                        </PaginationItem>
                        {pageNumbers[0] > 2 && <PaginationEllipsis />}
                    </>
                )}

                {pageNumbers.map(page => (
                    <PaginationItem key={page}>
                        <PaginationLink
                            href={createUrl(page)}
                            isActive={currentPage === page}
                            className={currentPage === page
                                ? "bg-slate-900 text-white hover:bg-slate-800 border-slate-900 shadow-sm"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                            }
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <PaginationEllipsis />}
                        <PaginationItem>
                            <PaginationLink href={createUrl(totalPages)} className="bg-white border-slate-200 hover:bg-slate-50">{totalPages}</PaginationLink>
                        </PaginationItem>
                    </>
                )}

                <PaginationItem>
                    {currentPage >= totalPages ? (
                        <span className="flex h-9 items-center justify-center px-4 py-2 text-sm text-slate-300 pointer-events-none">
                            Sau
                        </span>
                    ) : (
                        <PaginationNext
                            href={createUrl(currentPage + 1)}
                            className="bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                        />
                    )}
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
