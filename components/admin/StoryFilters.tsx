'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function StoryFilters({ categories }: { categories: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('q', searchTerm);
        if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus);

        router.push(`/admin/stories?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    return (
        <Card className="border-none shadow-sm mb-6">
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Tìm tên truyện, tác giả..."
                            className="pl-10 border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <div className="w-full md:w-48">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="border-slate-200">
                                <SelectValue placeholder="Tất cả Thể loại" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả Thể loại</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full md:w-48">
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="border-slate-200">
                                <SelectValue placeholder="Tất cả Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả Trạng thái</SelectItem>
                                <SelectItem value="full">Full</SelectItem>
                                <SelectItem value="ongoing">Đang ra</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={applyFilters} className="gap-2 bg-slate-900 hover:bg-slate-800">
                        <Filter className="h-4 w-4" /> Lọc
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
