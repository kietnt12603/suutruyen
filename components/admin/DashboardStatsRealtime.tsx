'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import {
    BookOpen,
    FileText,
    List,
    Eye,
} from 'lucide-react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';

interface Stats {
    totalStories: number;
    totalChapters: number;
    totalCategories: number;
    totalViews: number;
}

interface StatsCardData {
    name: string;
    value: string | number;
    icon: any;
    color: string;
    bgColor: string;
}

interface DashboardStatsRealtimeProps {
    initialStats: Stats;
}

export default function DashboardStatsRealtime({ initialStats }: DashboardStatsRealtimeProps) {
    const [stats, setStats] = useState<Stats>(initialStats);
    const [updatedStat, setUpdatedStat] = useState<string | null>(null);
    const supabase = createSupabaseClient();

    useEffect(() => {
        // Subscribe to stories table changes
        const storiesChannel = supabase
            .channel('realtime-dashboard-stories')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'stories'
            }, async (payload: RealtimePostgresChangesPayload<any>) => {
                if (payload.eventType === 'INSERT') {
                    setStats(prev => ({
                        ...prev,
                        totalStories: prev.totalStories + 1,
                        totalViews: prev.totalViews + (payload.new.views || 0)
                    }));
                    highlightStat('totalStories');
                } else if (payload.eventType === 'DELETE') {
                    setStats(prev => ({
                        ...prev,
                        totalStories: prev.totalStories - 1,
                        totalViews: Math.max(0, prev.totalViews - (payload.old.views || 0))
                    }));
                    highlightStat('totalStories');
                } else if (payload.eventType === 'UPDATE') {
                    // For updates, we need to recalculate total views
                    // Fetch the total from DB to be accurate
                    const { data } = await supabase
                        .from('stories')
                        .select('views');

                    if (data) {
                        const totalViews = data.reduce((sum, story) => sum + (story.views || 0), 0);
                        setStats(prev => ({ ...prev, totalViews }));
                        highlightStat('totalViews');
                    }
                }
            })
            .subscribe();

        // Subscribe to chapters table changes
        const chaptersChannel = supabase
            .channel('realtime-dashboard-chapters')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chapters'
            }, (payload: RealtimePostgresChangesPayload<any>) => {
                if (payload.eventType === 'INSERT') {
                    setStats(prev => ({ ...prev, totalChapters: prev.totalChapters + 1 }));
                    highlightStat('totalChapters');
                } else if (payload.eventType === 'DELETE') {
                    setStats(prev => ({ ...prev, totalChapters: Math.max(0, prev.totalChapters - 1) }));
                    highlightStat('totalChapters');
                }
            })
            .subscribe();

        // Subscribe to categories table changes
        const categoriesChannel = supabase
            .channel('realtime-dashboard-categories')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'categories'
            }, (payload: RealtimePostgresChangesPayload<any>) => {
                if (payload.eventType === 'INSERT') {
                    setStats(prev => ({ ...prev, totalCategories: prev.totalCategories + 1 }));
                    highlightStat('totalCategories');
                } else if (payload.eventType === 'DELETE') {
                    setStats(prev => ({ ...prev, totalCategories: Math.max(0, prev.totalCategories - 1) }));
                    highlightStat('totalCategories');
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(storiesChannel);
            supabase.removeChannel(chaptersChannel);
            supabase.removeChannel(categoriesChannel);
        };
    }, [supabase]);

    const highlightStat = (statKey: string) => {
        setUpdatedStat(statKey);
        setTimeout(() => setUpdatedStat(null), 2000);
    };

    const statsCards: StatsCardData[] = [
        {
            name: 'Tổng số Truyện',
            value: stats.totalStories,
            icon: BookOpen,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            name: 'Tổng số Chương',
            value: stats.totalChapters.toLocaleString(),
            icon: FileText,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100'
        },
        {
            name: 'Thể loại',
            value: stats.totalCategories,
            icon: List,
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-100'
        },
        {
            name: 'Tổng lượt xem',
            value: stats.totalViews.toLocaleString(),
            icon: Eye,
            color: 'text-amber-600',
            bgColor: 'bg-amber-100'
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat, idx) => {
                const Icon = stat.icon;
                const statKey = idx === 0 ? 'totalStories' :
                    idx === 1 ? 'totalChapters' :
                        idx === 2 ? 'totalCategories' : 'totalViews';
                const isUpdated = updatedStat === statKey;

                return (
                    <Card
                        key={stat.name}
                        className={`border-none shadow-sm transition-all duration-500 hover:shadow-md hover:translate-y-[-2px] ${isUpdated ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-200' : ''
                            }`}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor} transition-all duration-500 ${isUpdated ? 'scale-110' : ''
                                    }`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.name}</p>
                                    <h3 className={`text-xl font-bold transition-all duration-500 ${isUpdated ? 'scale-110 text-emerald-600' : ''
                                        }`}>
                                        {stat.value}
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
