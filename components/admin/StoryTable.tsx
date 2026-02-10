'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';
import { getStoryById } from '@/lib/api';
import type { Story, Category } from '@/types';
import AdminImage from '@/components/admin/AdminImage';
import DeleteStoryBtn from '@/components/admin/DeleteStoryBtn';
import { ListOrdered, Pencil, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface StoryTableProps {
    initialStories: Story[];
}

export default function StoryTable({ initialStories }: StoryTableProps) {
    const [stories, setStories] = useState<Story[]>(initialStories);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const supabase = createSupabaseClient();

    // Effect to update stories when initialStories change (e.g. pagination/search updates from parent)
    useEffect(() => {
        setStories(initialStories);
    }, [initialStories]);

    useEffect(() => {
        const channel = supabase
            .channel('realtime-admin-stories')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'stories'
            }, async (payload: RealtimePostgresChangesPayload<any>) => {
                if (payload.eventType === 'DELETE') {
                    setStories(prev => prev.filter(s => s.id !== payload.old.id));
                    return;
                }

                const newRecord = payload.new as any;

                // For INSERT, fetch the full data including categories
                if (payload.eventType === 'INSERT') {
                    const fullStory = await getStoryById(newRecord.id);
                    if (fullStory) {
                        setStories(prev => [fullStory, ...prev]);
                        setHighlightedId(fullStory.id);
                        setTimeout(() => setHighlightedId(null), 3000);
                    }
                    return;
                }

                // For UPDATE, we update the existing record in place to preserve order
                if (payload.eventType === 'UPDATE') {
                    setStories(prev => prev.map(s => {
                        if (s.id === newRecord.id) {
                            return {
                                ...s,
                                ...newRecord,
                                categories: s.categories // Preserve existing categories
                            };
                        }
                        return s;
                    }));
                    setHighlightedId(newRecord.id);
                    setTimeout(() => setHighlightedId(null), 3000);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="w-[40%] pl-6">Tên Truyện</TableHead>
                            <TableHead className="text-center">Số Chương</TableHead>
                            <TableHead className="text-center">Lượt Xem</TableHead>
                            <TableHead className="text-center">Trạng Thái</TableHead>
                            <TableHead className="text-right pr-6">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stories.map((story) => {
                            const isHighlighted = highlightedId === story.id;
                            return (
                                <TableRow
                                    key={story.id}
                                    className={`group transition-all duration-500 ${isHighlighted ? 'bg-emerald-50 ring-1 ring-inset ring-emerald-200' : 'hover:bg-slate-50/50'}`}
                                >
                                    <TableCell className="pl-6 font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded border bg-slate-50 shadow-sm transition-transform group-hover:scale-105">
                                                <AdminImage
                                                    src={story.image}
                                                    alt={story.name}
                                                    className="h-full w-full object-cover"
                                                />
                                                {isHighlighted && (
                                                    <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center anime-pulse">
                                                        <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold truncate" title={story.name}>
                                                    {story.name}
                                                    {story.is_new && <span className="badge-new">New</span>}
                                                    {story.status?.toLowerCase() === 'full' && <span className="badge-full">Full</span>}
                                                    {story.is_hot && <span className="badge-hot">Hot</span>}
                                                </div>
                                                <div className="text-xs text-slate-500 truncate">{story.author}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="font-normal bg-slate-50 transition-all duration-300">
                                            {story.chapters_count || 0} chương
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-sm text-slate-600">
                                        {story.views?.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className={
                                            story.status?.toLowerCase() === 'full'
                                                ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                                : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100"
                                        }>
                                            {story.status?.toLowerCase() === 'full' ? 'Full' : 'Đang ra'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" title="Quản lý chương" asChild>
                                                <Link href={`/admin/stories/${story.id}/chapters`}>
                                                    <ListOrdered className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" title="Chỉnh sửa" asChild>
                                                <Link href={`/admin/stories/${story.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DeleteStoryBtn
                                                storyId={story.id}
                                                storyName={story.name}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {stories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <BookOpen className="h-8 w-8 text-slate-300" />
                                        <span>Không tìm thấy truyện nào phù hợp.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
