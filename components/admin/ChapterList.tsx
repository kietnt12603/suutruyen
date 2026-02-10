'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';
import DeleteChapterBtn from './DeleteChapterBtn';
import AdminPagination from './AdminPagination';
import { Search, Pencil, Calendar, Gem } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { bulkUpdateChapters } from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ChapterListProps {
    storyId: number;
    initialChapters: any[];
    totalChapters: number;
    currentPage: number;
    pageSize: number;
}

export default function ChapterList({ storyId, initialChapters, totalChapters, currentPage, pageSize }: ChapterListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || '';
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const debouncedSearch = useDebounce(searchTerm, 500);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [bulkPrice, setBulkPrice] = useState(10);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearch) {
            params.set('search', debouncedSearch);
        } else {
            params.delete('search');
        }
        params.set('page', '1'); // Reset to page 1 on search
        router.push(`/admin/stories/${storyId}/chapters?${params.toString()}`);
        setSelectedIds([]); // Clear selection when search changes
    }, [debouncedSearch, router, storyId]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(initialChapters.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(i => i !== id));
        }
    };

    const handleBulkUpdate = async (isVip: boolean) => {
        if (selectedIds.length === 0) return;

        setIsBulkUpdating(true);
        try {
            const result = await bulkUpdateChapters(selectedIds, { is_vip: isVip, price: bulkPrice });
            if (result.success) {
                router.refresh();
                setSelectedIds([]);
            } else {
                alert('Có lỗi xảy ra khi cập nhật hàng loạt');
            }
        } catch (error) {
            console.error('Bulk update error:', error);
            alert('Đã có lỗi xảy ra');
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const totalPages = Math.ceil(totalChapters / pageSize);

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm chương theo số hoặc tiêu đề..."
                            className="pl-10 border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="w-12 pl-6">
                                    <Checkbox
                                        checked={selectedIds.length === initialChapters.length && initialChapters.length > 0}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                    />
                                </TableHead>
                                <TableHead className="w-20">Số</TableHead>
                                <TableHead>Tiêu đề chương</TableHead>
                                <TableHead>Ngày cập nhật</TableHead>
                                <TableHead className="text-right pr-6">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialChapters.map((chap) => (
                                <TableRow key={chap.id} className="transition-colors hover:bg-slate-50/50">
                                    <TableCell className="pl-6">
                                        <Checkbox
                                            checked={selectedIds.includes(chap.id)}
                                            onCheckedChange={(checked) => handleSelect(chap.id, !!checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono font-bold text-slate-500 text-sm">#{chap.number}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-slate-900 flex items-center gap-2">
                                            Chương {chap.number}{chap.title ? `: ${chap.title.replace(/^chương\s+\d+[:\s-]*/i, '').trim()}` : ''}
                                            {chap.is_vip && (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-1.5 py-0.5 text-xs font-bold text-orange-700 ring-1 ring-inset ring-orange-200">
                                                    VIP
                                                </span>
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {chap.created_at ? new Date(chap.created_at).toLocaleDateString('vi-VN') : 'Unknown'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                <Link href={`/admin/stories/${storyId}/chapters/${chap.number}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DeleteChapterBtn
                                                chapterId={chap.id}
                                                storyId={storyId}
                                                chapterNumber={chap.number}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {initialChapters.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                        Không tìm thấy chương nào phù hợp.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50/50 border-t">
                        <div className="text-sm text-slate-500">
                            Hiển thị <span className="font-bold text-slate-900">{initialChapters.length}</span> trên <span className="font-bold text-slate-900">{totalChapters}</span> chương
                        </div>
                        <AdminPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            baseUrl={`/admin/stories/${storyId}/chapters`}
                            searchParams={initialSearch ? { search: initialSearch } : {}}
                        />
                    </div>
                </CardContent>
            </Card>

            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-800">
                        <div className="flex items-center gap-2 border-r border-slate-700 pr-6 mr-2">
                            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {selectedIds.length}
                            </span>
                            <span className="text-sm font-medium text-slate-300">đã chọn</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                                <Gem className="h-4 w-4 text-orange-400" />
                                <Input
                                    type="number"
                                    className="w-20 h-7 bg-transparent border-none text-white text-sm focus-visible:ring-0 p-0 text-center font-bold"
                                    value={bulkPrice}
                                    onChange={(e) => setBulkPrice(parseInt(e.target.value) || 0)}
                                    min={0}
                                />
                            </div>

                            <Button
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700 h-10 px-4"
                                onClick={() => handleBulkUpdate(true)}
                                disabled={isBulkUpdating}
                            >
                                {isBulkUpdating ? 'Đang xử lý...' : 'Bật VIP hàng loạt'}
                            </Button>

                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-400 hover:text-white hover:bg-slate-800 h-10 px-4"
                                onClick={() => handleBulkUpdate(false)}
                                disabled={isBulkUpdating}
                            >
                                Tắt VIP
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-white ml-2"
                            onClick={() => setSelectedIds([])}
                        >
                            <Search className="h-4 w-4 rotate-45" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
