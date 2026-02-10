// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { getCategories, createStory, uploadStoryImage } from '@/lib/api';
// import AdminImage from '@/components/admin/AdminImage';
// import type { Category } from '@/types';
// import {
//     ChevronLeft,
//     Plus,
//     Save,
//     Image as ImageIcon,
//     Settings,
//     Loader2,
//     Upload
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue
// } from '@/components/ui/select';
// import { Switch } from '@/components/ui/switch';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';

// export default function NewStory() {
//     const fileInputRef = useRef<HTMLInputElement>(null);
//     const [formData, setFormData] = useState({
//         name: '',
//         author: '',
//         image: '',
//         description: '',
//         status: 'ongoing',
//         is_hot: false,
//         is_new: true,
//         categories: [] as string[]
//     });
//     const [allCategories, setAllCategories] = useState<Category[]>([]);
//     const [isSaving, setIsSaving] = useState(false);
//     const [isUploading, setIsUploading] = useState(false);
//     const router = useRouter();

//     useEffect(() => {
//         getCategories().then(res => setAllCategories(res.data));
//     }, []);

//     const handleCategoryToggle = (checked: boolean, catName: string) => {
//         setFormData(prev => ({
//             ...prev,
//             categories: checked
//                 ? [...prev.categories, catName]
//                 : prev.categories.filter(c => c !== catName)
//         }));
//     };

//     const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (!file) return;

//         setIsUploading(true);
//         try {
//             const result = await uploadStoryImage(file);
//             if (result.success && result.url) {
//                 setFormData({ ...formData, image: result.url });
//             } else {
//                 alert('Lỗi upload: ' + (result.error?.message || 'Không thể upload ảnh'));
//             }
//         } catch (error) {
//             console.error('Error uploading image:', error);
//             alert('Đã có lỗi xảy ra khi upload ảnh');
//         } finally {
//             setIsUploading(false);
//             if (fileInputRef.current) {
//                 fileInputRef.current.value = '';
//             }
//         }
//     };

//     const handleSave = async () => {
//         if (!formData.name) {
//             alert('Vui lòng nhập tên truyện');
//             return;
//         }
//         setIsSaving(true);
//         try {
//             const result = await createStory(formData);
//             if ((result as any).data) {
//                 router.refresh();
//                 router.push('/admin/stories');
//             } else {
//                 alert('Lỗi: ' + ((result as any).error?.message || 'Không thể tạo truyện'));
//             }
//         } catch (error) {
//             console.error('Error in handleSave:', error);
//             alert('Đã có lỗi xảy ra');
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     return (
//         <div className="space-y-6 pb-12">
//             <div className="flex flex-col gap-4">
//                 <Button variant="ghost" size="sm" asChild className="w-fit -ml-2 text-slate-500 hover:text-slate-900">
//                     <Link href="/admin/stories" className="flex items-center gap-1">
//                         <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
//                     </Link>
//                 </Button>

//                 <div className="flex items-center gap-3">
//                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
//                         <Plus className="h-6 w-6 text-emerald-600" />
//                     </div>
//                     <div>
//                         <h2 className="text-3xl font-bold tracking-tight text-slate-900">Thêm Truyện Mới</h2>
//                         <p className="text-slate-500 text-sm">Tạo một truyện mới trong hệ thống.</p>
//                     </div>
//                 </div>
//             </div>

//             <div className="grid gap-6 lg:grid-cols-3">
//                 <div className="lg:col-span-2 space-y-6">
//                     <Card className="border-none shadow-sm">
//                         <CardHeader className="border-b">
//                             <CardTitle className="text-xl font-bold">Thông tin chi tiết</CardTitle>
//                         </CardHeader>
//                         <CardContent className="pt-6 space-y-6">
//                             <div className="space-y-2">
//                                 <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-slate-500">Tên Truyện</Label>
//                                 <Input
//                                     id="name"
//                                     placeholder="Ví dụ: Tên truyện hay nhất..."
//                                     value={formData.name}
//                                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                                     className="border-slate-200 focus:border-emerald-500"
//                                 />
//                             </div>

//                             <div className="grid gap-6 md:grid-cols-2">
//                                 <div className="space-y-2">
//                                     <Label htmlFor="author" className="text-sm font-bold uppercase tracking-wider text-slate-500">Tác giả</Label>
//                                     <Input
//                                         id="author"
//                                         placeholder="Tên tác giả..."
//                                         value={formData.author}
//                                         onChange={(e) => setFormData({ ...formData, author: e.target.value })}
//                                         className="border-slate-200"
//                                     />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="status" className="text-sm font-bold uppercase tracking-wider text-slate-500">Trạng thái</Label>
//                                     <Select
//                                         value={formData.status}
//                                         onValueChange={(val) => setFormData({ ...formData, status: val })}
//                                     >
//                                         <SelectTrigger className="border-slate-200">
//                                             <SelectValue placeholder="Chọn trạng thái" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             <SelectItem value="ongoing">Đang ra</SelectItem>
//                                             <SelectItem value="full">Full</SelectItem>
//                                         </SelectContent>
//                                     </Select>
//                                 </div>
//                             </div>

//                             <div className="space-y-3">
//                                 <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Thể loại</Label>
//                                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
//                                     {allCategories.map(cat => (
//                                         <div key={cat.id} className="flex items-center space-x-2">
//                                             <Checkbox
//                                                 id={`cat-${cat.id}`}
//                                                 checked={formData.categories.includes(cat.name)}
//                                                 onCheckedChange={(checked) => handleCategoryToggle(!!checked, cat.name)}
//                                             />
//                                             <Label
//                                                 htmlFor={`cat-${cat.id}`}
//                                                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
//                                             >
//                                                 {cat.name}
//                                             </Label>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-slate-500">Mô tả truyện</Label>
//                                 <Textarea
//                                     id="description"
//                                     rows={10}
//                                     placeholder="Nhập nội dung giới thiệu truyện..."
//                                     value={formData.description}
//                                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                                     className="border-slate-200 resize-none"
//                                 />
//                             </div>
//                         </CardContent>
//                     </Card>

//                     <div className="flex justify-end gap-3">
//                         <Button variant="outline" asChild className="border-slate-200 shadow-sm">
//                             <Link href="/admin/stories">Huỷ bỏ</Link>
//                         </Button>
//                         <Button
//                             onClick={handleSave}
//                             disabled={isSaving}
//                             className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
//                         >
//                             {isSaving ? (
//                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             ) : (
//                                 <Save className="mr-2 h-4 w-4" />
//                             )}
//                             {isSaving ? 'Đang lưu...' : 'Lưu Truyện'}
//                         </Button>
//                     </div>
//                 </div>

//                 <div className="space-y-6">
//                     <Card className="border-none shadow-sm overflow-hidden">
//                         <CardHeader className="border-b bg-slate-50/50">
//                             <CardTitle className="text-lg font-bold flex items-center gap-2">
//                                 <ImageIcon className="h-4 w-4 text-slate-400" /> Ảnh bìa
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent className="pt-6 text-center">
//                             <input
//                                 ref={fileInputRef}
//                                 type="file"
//                                 accept="image/jpeg,image/jpg,image/png"
//                                 onChange={handleImageUpload}
//                                 className="hidden"
//                             />
//                             <div className="group relative mb-4 mx-auto w-[180px] aspect-[2/3] overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-emerald-300 shadow-inner">
//                                 {formData.image ? (
//                                     <AdminImage
//                                         src={formData.image}
//                                         alt="Preview"
//                                         className="h-full w-full object-cover transition-transform group-hover:scale-105"
//                                     />
//                                 ) : (
//                                     <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4">
//                                         <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
//                                         <span className="text-xs">Chưa có ảnh</span>
//                                     </div>
//                                 )}
//                                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
//                                     <Button
//                                         variant="secondary"
//                                         size="sm"
//                                         className="bg-white/90 hover:bg-white shadow-md"
//                                         type="button"
//                                         onClick={() => fileInputRef.current?.click()}
//                                         disabled={isUploading}
//                                     >
//                                         {isUploading ? (
//                                             <>
//                                                 <Loader2 className="mr-2 h-3 w-3 animate-spin" />
//                                                 Uploading...
//                                             </>
//                                         ) : (
//                                             <>
//                                                 <Upload className="mr-2 h-3 w-3" />
//                                                 {formData.image ? 'Thay đổi' : 'Upload'}
//                                             </>
//                                         )}
//                                     </Button>
//                                 </div>
//                             </div>

//                             <div className="space-y-3">
//                                 <Label className="text-[10px] text-slate-400 uppercase tracking-tighter">Hoặc nhập URL ảnh bìa</Label>
//                                 <Input
//                                     placeholder="https://example.com/image.jpg"
//                                     value={formData.image}
//                                     onChange={(e) => setFormData({ ...formData, image: e.target.value })}
//                                     className="h-8 text-xs border-slate-200"
//                                 />
//                                 <p className="text-[10px] text-slate-400">Hoặc sử dụng tính năng tải ảnh lên (Backend required).</p>
//                             </div>
//                         </CardContent>
//                     </Card>

//                     <Card className="border-none shadow-sm h-fit">
//                         <CardHeader className="border-b bg-slate-50/50">
//                             <CardTitle className="text-lg font-bold flex items-center gap-2">
//                                 <Settings className="h-4 w-4 text-slate-400" /> Cài đặt hiển thị
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent className="pt-6 space-y-6">
//                             <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50/50">
//                                 <div className="space-y-0.5">
//                                     <Label htmlFor="isHot" className="text-base font-bold text-slate-900 border-none">Truyện Hot</Label>
//                                     <p className="text-xs text-slate-500">Hiển thị trong mục truyện nổi bật.</p>
//                                 </div>
//                                 <Switch
//                                     id="isHot"
//                                     checked={formData.is_hot}
//                                     onCheckedChange={(checked) => setFormData({ ...formData, is_hot: checked })}
//                                 />
//                             </div>

//                             <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50/50">
//                                 <div className="space-y-0.5">
//                                     <Label htmlFor="isNew" className="text-base font-bold text-slate-900 border-none">Truyện Mới</Label>
//                                     <p className="text-xs text-slate-500">Gắn nhãn "Mới" cho truyện.</p>
//                                 </div>
//                                 <Switch
//                                     id="isNew"
//                                     checked={formData.is_new}
//                                     onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
//                                 />
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>
//             </div>
//         </div>
//     );
// }


'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCategories, createStory, uploadStoryImage } from '@/lib/api';
import AdminImage from '@/components/admin/AdminImage';
import type { Category } from '@/types';
import {
    ChevronLeft,
    Plus,
    Save,
    Image as ImageIcon,
    Settings,
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

export default function NewStory() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: '',
        author: '',
        image: '',
        description: '',
        status: 'ongoing',
        is_hot: false,
        is_new: true,
        categories: [] as string[]
    });
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        getCategories().then(res => setAllCategories(res.data));
    }, []);

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
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert('Vui lòng nhập tên truyện');
            return;
        }
        setIsSaving(true);
        try {
            const result = await createStory(formData);
            if ((result as any).data) {
                router.refresh();
                router.push('/admin/stories');
            } else {
                alert('Lỗi: ' + ((result as any).error?.message || 'Không thể tạo truyện'));
            }
        } catch (error) {
            console.error('Error in handleSave:', error);
            alert('Đã có lỗi xảy ra');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4">
                <Button variant="ghost" size="sm" asChild className="w-fit -ml-2 text-slate-500 hover:text-slate-900">
                    <Link href="/admin/stories" className="flex items-center gap-1">
                        <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
                    </Link>
                </Button>

                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                        <Plus className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Thêm Truyện Mới</h2>
                        <p className="text-slate-500 text-sm">Tạo một truyện mới trong hệ thống.</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
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
                                    placeholder="Ví dụ: Tên truyện hay nhất..."
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
                                        placeholder="Tên tác giả..."
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-sm font-bold uppercase tracking-wider text-slate-500">Trạng thái</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val) => setFormData({ ...formData, status: val })}
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
                                    placeholder="Nhập nội dung giới thiệu truyện..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="border-slate-200 resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild className="border-slate-200 shadow-sm">
                            <Link href="/admin/stories">Huỷ bỏ</Link>
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                        >
                            {isSaving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {isSaving ? 'Đang lưu...' : 'Lưu Truyện'}
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
                                {formData.image ? (
                                    <AdminImage
                                        src={formData.image}
                                        alt="Preview"
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4">
                                        <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
                                        <span className="text-xs">Chưa có ảnh</span>
                                    </div>
                                )}
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
                                                {formData.image ? 'Thay đổi' : 'Upload'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] text-slate-400 uppercase tracking-tighter">Hoặc nhập URL ảnh bìa</Label>
                                <Input
                                    placeholder="https://example.com/image.jpg"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="h-8 text-xs border-slate-200"
                                />
                                <p className="text-[10px] text-slate-400">Hoặc sử dụng tính năng tải ảnh lên (Backend required).</p>
                            </div>
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
                                    {/* SỬA TẠI ĐÂY: Bỏ asChild hoặc kiểm tra lại Label trong UI component */}
                                    <Label htmlFor="isHot" className="text-base font-bold text-slate-900">Truyện Hot</Label>
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
                                    {/* SỬA TẠI ĐÂY: Thay "Mới" bằng &quot;Mới&quot; để an toàn tuyệt đối */}
                                    <Label htmlFor="isNew" className="text-base font-bold text-slate-900">Truyện Mới</Label>
                                    <p className="text-xs text-slate-500">Gắn nhãn &quot;Mới&quot; cho truyện.</p>
                                </div>
                                <Switch
                                    id="isNew"
                                    checked={formData.is_new}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}