import { supabase } from './supabase';
import { createSupabaseServerClient } from './supabase-server';
import type { Chapter } from '@/types';
// Re-export shared functions from api.ts to keep this as a single source for server components
export { getStoryBySlug, getChapters, incrementStoryViews } from './api';

export async function getChapter(storyId: number, number: number) {
    const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', storyId)
        .eq('number', number)
        .single();

    if (error) {
        console.error(`Error fetching chapter ${number} for story ${storyId}:`, error);
        return null;
    }

    const chapter = data as Chapter;

    // Check VIP access on server
    if (chapter.is_vip) {
        const authClient = await createSupabaseServerClient();
        const { data: { user } } = await authClient.auth.getUser();

        let hasAccess = false;
        if (user) {
            const { data: access } = await authClient
                .from('user_chapter_access')
                .select('*')
                .eq('user_id', user.id)
                .eq('chapter_id', chapter.id)
                .single();
            if (access) hasAccess = true;
        }

        if (!hasAccess) {
            return {
                ...chapter,
                content: '', // Hide content
                is_locked: true
            };
        }
    }

    return {
        ...chapter,
        is_locked: false
    };
}
