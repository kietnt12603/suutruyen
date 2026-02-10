'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import type { Story } from '@/types';
import StoryListItem from './StoryListItem';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface StoryListRealtimeProps {
    initialStories: Story[];
}

export default function StoryListRealtime({ initialStories }: StoryListRealtimeProps) {
    const [stories, setStories] = useState<Story[]>(initialStories);
    const [newUpdates, setNewUpdates] = useState<string[]>([]); // Track IDs of newly updated stories for highlighting
    const supabase = createSupabaseClient();

    useEffect(() => {
        const channel = supabase
            .channel('realtime-stories')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'stories'
            }, async (payload: RealtimePostgresChangesPayload<any>) => {
                // Determine if we should handle this event
                // We care about INSERT and UPDATE
                if (payload.eventType === 'DELETE') {
                    setStories(prev => prev.filter(s => s.id !== payload.old.id));
                    return;
                }

                const newRecord = payload.new as any;
                const storyId = newRecord.id;

                // Fetch full story details to get categories
                const { data, error } = await supabase
                    .from('stories')
                    .select('*, story_categories(categories(name, slug))')
                    .eq('id', storyId)
                    .single();

                if (error || !data) {
                    console.error('Error fetching updated story:', error);
                    return;
                }

                // Transform to Story type matching types/index.ts
                const fullStory: Story = {
                    ...data,
                    categories: data.story_categories?.map((sc: any) => sc.categories?.name).filter(Boolean) || []
                };

                // Update state
                setStories(prev => {
                    // Remove existing instance if any
                    const filtered = prev.filter(s => s.id !== fullStory.id);
                    // Add to top
                    return [fullStory, ...filtered];
                });

                // Trigger highlight/notification
                setNewUpdates(prev => [...prev, fullStory.id.toString()]);
                setTimeout(() => {
                    setNewUpdates(prev => prev.filter(id => id !== fullStory.id.toString()));
                }, 3000);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <div className="section-stories-new__list relative flex flex-col">
            {stories.map((story) => (
                <div
                    key={story.id}
                    className={`transition-all duration-700 rounded-lg ${newUpdates.includes(story.id.toString())
                            ? 'bg-blue-500/10 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]'
                            : 'bg-transparent'
                        }`}
                >
                    <StoryListItem story={story} />
                </div>
            ))}
        </div>
    );
}
