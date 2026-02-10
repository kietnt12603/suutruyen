'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Story, Category } from '@/types';
import { updateStory, uploadStoryImage } from '@/lib/api';
import AdminImage from './AdminImage';
import {
    ChevronLeft,
    Save,
    Image as ImageIcon,
    Settings,
    ListOrdered,
    Loader2,
    Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface StoryFormProps {
    story: Story;
    allCategories: Category[];
}

export default function StoryForm({ story, allCategories }: StoryFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: story.name,
        author: story.author || '',
        image: story.image || '',
        description: story.description || '',
        status: story.status?.toLowerCase() || 'ongoing',
        is_hot: story.is_hot || false,
        is_new: story.is_new || false,
        categories: story.categories || []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleCategoryToggle = (checked: boolean, catName: string) => {
        setFormData(prev => ({
            ...prev,
            categories: checked
                ? [...prev.categories, catName]
                : prev.categories.filter(c => c !== catName)
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const result = await uploadStoryImage(file);
            if (result.success && result.url) {
                setFormData({ ...formData, image: result.url });
            } else {
                alert('Lỗi upload: ' + (result.error?.message || 'Không thể upload ảnh'));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Đã có lỗi xảy ra khi upload ảnh');
        } finally {
            setIsUploading(false);
            // Reset input để có thể upload lại cùng file
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateStory(story.id, formData as any);
            if (result.success) {
                router.refresh();
                router.push('/admin/stories');
            } else {
                alert('Lỗi: ' + (result.error?.message || 'Không thể lưu thay đổi'));
            }
        } catch (error) {
            console.error('Error in handleSave:', error);
            alert('Đã có lỗi xảy ra');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3 pb-12">
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-sm">
                    <CardHeader className="border-b">
                        <CardTitle className="text-xl font-bold">Thông tin chi tiết</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-slate-500">Tên Truyện</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="border-slate-200 focus:border-emerald-500"
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="author" className="text-sm font-bold uppercase tracking-wider text-slate-500">Tác giả</Label>
                                <Input
                                    id="author"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-bold uppercase tracking-wider text-slate-500">Trạng thái</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val as any })}
                                >
                                    <SelectTrigger className="border-slate-200">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ongoing">Đang ra</SelectItem>
                                        <SelectItem value="full">Full</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Thể loại</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                {allCategories.map(cat => (
                                    <div key={cat.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`cat-${cat.id}`}
                                            checked={formData.categories.includes(cat.name)}
                                            onCheckedChange={(checked) => handleCategoryToggle(!!checked, cat.name)}
                                        />
                                        <Label
                                            htmlFor={`cat-${cat.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {cat.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-slate-500">Mô tả truyện</Label>
                            <Textarea
                                id="description"
                                rows={10}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="border-slate-200 resize-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" asChild className="border-slate-200 shadow-sm" type="button">
                        <Link href="/admin/stories">Huỷ bỏ</Link>
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                        type="button"
                    >
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-slate-400" /> Ảnh bìa
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 text-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <div className="group relative mb-4 mx-auto w-[180px] aspect-[2/3] overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-emerald-300 shadow-inner">
                            <AdminImage
                                src={formData.image}
                                alt="Cover"
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-white/90 hover:bg-white shadow-md"
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-3 w-3" />
                                            Thay đổi
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Định dạng hỗ trợ: JPG, PNG. Tối đa 2MB.</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm h-fit">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Settings className="h-4 w-4 text-slate-400" /> Cài đặt hiển thị
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50/50">
                            <div className="space-y-0.5">
                                <Label htmlFor="isHot" className="text-base font-bold text-slate-900 border-none">Truyện Hot</Label>
                                <p className="text-xs text-slate-500">Hiển thị trong mục truyện nổi bật.</p>
                            </div>
                            <Switch
                                id="isHot"
                                checked={formData.is_hot}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_hot: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50/50">
                            <div className="space-y-0.5">
                                <Label htmlFor="isNew" className="text-base font-bold text-slate-900 border-none">Truyện Mới</Label>
                                <p className="text-xs text-slate-500">Gắn nhãn &quot;Mới&quot; cho truyện.</p>
                            </div>
                            <Switch
                                id="isNew"
                                checked={formData.is_new}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <Button variant="secondary" className="w-full justify-start gap-2 bg-slate-100 shadow-none border-none text-slate-600 hover:bg-slate-200" asChild type="button">
                                <Link href={`/admin/stories/${story.id}/chapters`}>
                                    <ListOrdered className="h-4 w-4" /> Quản lý Chương
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
