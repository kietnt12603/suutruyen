'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { Search, Plus, Pencil, Trash2, Check, X, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AdminPagination from './AdminPagination';

interface CategoryListProps {
    initialCategories: any[];
    totalCategories: number;
    currentPage: number;
    pageSize: number;
}

export default function CategoryList({ initialCategories, totalCategories, currentPage, pageSize }: CategoryListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const [newName, setNewName] = useState('');

    const filteredCategories = initialCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(totalCategories / pageSize);

    const handleAdd = async () => {
        if (!newName) return;
        setIsSaving(true);
        try {
            const result = await createCategory({ name: newName });
            if ((result as any).data) {
                setNewName('');
                router.refresh();
            } else {
                alert('Lỗi: ' + ((result as any).error?.message || 'Không thể tạo thể loại'));
            }
        } catch (error) {
            alert('Đã có lỗi xảy ra');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async (id: number) => {
        if (!editName) return;
        setIsSaving(true);
        try {
            const result = await updateCategory(id, { name: editName, slug: editSlug });
            if (result.success) {
                setEditingId(null);
                setEditName('');
                setEditSlug('');
                router.refresh();
            } else {
                alert('Lỗi: ' + (result.error?.message || 'Không thể cập nhật'));
            }
        } catch (error) {
            alert('Đã có lỗi xảy ra');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Bạn có chắc muốn xoá thể loại "${name}"?`)) return;
        setIsSaving(true);
        try {
            const result = await deleteCategory(id);
            if (result.success) {
                router.refresh();
            } else {
                alert('Lỗi: ' + (result.error?.message || 'Không thể xoá'));
            }
        } catch (error) {
            alert('Đã có lỗi xảy ra');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm thể loại..."
                            className="pl-10 border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                    <TableHead className="w-16 pl-6">ID</TableHead>
                                    <TableHead>Tên Thể loại</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead className="text-right pr-6">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((cat) => (
                                    <TableRow key={cat.id} className="transition-colors hover:bg-slate-50/50">
                                        <TableCell className="pl-6 text-slate-500 font-mono text-xs">{cat.id}</TableCell>
                                        <TableCell>
                                            {editingId === cat.id ? (
                                                <Input
                                                    className="h-8 border-slate-300"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="font-bold text-slate-900">{cat.name}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === cat.id ? (
                                                <Input
                                                    className="h-8 border-slate-300 font-mono text-xs"
                                                    value={editSlug}
                                                    onChange={(e) => setEditSlug(e.target.value)}
                                                />
                                            ) : (
                                                <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                                                    {cat.slug}
                                                </code>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-1">
                                                {editingId === cat.id ? (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                            onClick={() => handleUpdate(cat.id)}
                                                            disabled={isSaving}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                                            onClick={() => setEditingId(null)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                            title="Chỉnh sửa"
                                                            onClick={() => {
                                                                setEditingId(cat.id);
                                                                setEditName(cat.name);
                                                                setEditSlug(cat.slug);
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                            title="Xoá"
                                                            onClick={() => handleDelete(cat.id, cat.name)}
                                                            disabled={isSaving}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                            Không tìm thấy thể loại nào phù hợp.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50/50 border-t">
                            <div className="text-sm text-slate-500">
                                Tổng: <span className="font-bold text-slate-900">{totalCategories}</span> thể loại
                            </div>
                            <AdminPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                baseUrl="/admin/categories"
                                searchParams={{}}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-lg font-bold">Thêm Thể loại Mới</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tên thể loại</label>
                                    <Input
                                        placeholder="Ví dụ: Tiên Hiệp"
                                        className="border-slate-200"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                    />
                                </div>
                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200"
                                    onClick={handleAdd}
                                    disabled={isSaving || !newName}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> {isSaving ? 'Đang thêm...' : 'Thêm mới'}
                                </Button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Info className="h-4 w-4 text-slate-400" />
                                    <h6 className="font-bold text-sm text-slate-700">Hướng dẫn</h6>
                                </div>
                                <ul className="space-y-2.5 text-xs text-slate-500 list-disc pl-4">
                                    <li>Tên thể loại ngắn gọn (ví dụ: Hành động).</li>
                                    <li>Slug được tạo tự động để SEO tốt hơn.</li>
                                    <li>Nên tránh trùng lặp tên thể loại.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
