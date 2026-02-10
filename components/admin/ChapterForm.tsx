'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Story, Chapter } from '@/types';
import { updateChapter, createChapter } from '@/lib/api';
import { Save, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Gem } from 'lucide-react';

interface ChapterFormProps {
    story: Story;
    chapter: Chapter;
}

export default function ChapterForm({ story, chapter }: ChapterFormProps) {
    const router = useRouter();
    const [chapterData, setChapterData] = useState({
        title: chapter.title || '',
        content: chapter.content || '',
        is_vip: chapter.is_vip || false,
        price: chapter.price || 10
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = (chapter.id
                ? await updateChapter(chapter.id, chapterData)
                : await createChapter({
                    ...chapterData,
                    story_id: story.id,
                    number: chapter.number
                })) as any;

            if (result.success || result.data) {
                router.refresh();
                router.push(`/admin/stories/${story.id}/chapters`);
            } else {
                alert('Lỗi: ' + ((result as any).error?.message || 'Không thể lưu chương'));
            }
        } catch (error) {
            console.error('Error in handleSave:', error);
            alert('Đã có lỗi xảy ra');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="border-b">
                <CardTitle className="text-xl font-bold">Chương {chapter.number}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        Tiêu đề chương
                    </Label>
                    <Input
                        id="title"
                        type="text"
                        value={chapterData.title}
                        onChange={(e) => setChapterData({ ...chapterData, title: e.target.value })}
                        placeholder={`Ví dụ: Chương ${chapter.number}: Tiết lộ bất ngờ`}
                        className="border-slate-200"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-8 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_vip"
                            checked={chapterData.is_vip}
                            onCheckedChange={(checked) => setChapterData({ ...chapterData, is_vip: !!checked })}
                        />
                        <Label
                            htmlFor="is_vip"
                            className="text-sm font-bold uppercase tracking-wider text-slate-700 cursor-pointer flex items-center gap-2"
                        >
                            Chương VIP
                            <Gem className={`h-4 w-4 ${chapterData.is_vip ? 'text-orange-500' : 'text-slate-400'}`} />
                        </Label>
                    </div>

                    {chapterData.is_vip && (
                        <div className="flex items-center gap-3 animate-in zoom-in-95 duration-200">
                            <Label htmlFor="price" className="text-sm font-bold text-slate-600 whitespace-nowrap">
                                Giá Linh Thạch:
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                min={0}
                                value={chapterData.price}
                                onChange={(e) => setChapterData({ ...chapterData, price: parseInt(e.target.value) || 0 })}
                                className="w-24 h-9 border-slate-200 text-center font-bold"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        Nội dung chương
                    </Label>
                    <Textarea
                        id="content"
                        rows={20}
                        value={chapterData.content}
                        onChange={(e) => setChapterData({ ...chapterData, content: e.target.value })}
                        className="border-slate-200 resize-none font-serif text-base leading-relaxed"
                        placeholder="Nhập nội dung chương tại đây..."
                    />
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700">
                            Mẹo: Sử dụng phím Enter để xuống dòng. Nội dung sẽ tự động căn lề khi hiển thị cho người đọc.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" asChild className="border-slate-200 shadow-sm">
                        <Link href={`/admin/stories/${story.id}/chapters`}>Huỷ bỏ</Link>
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                    >
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {isSaving ? 'Đang lưu...' : 'Lưu chương'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
