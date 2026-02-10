import { supabase, createSupabaseClient } from './supabase';
import type { Story, Category, Chapter, Profile } from '@/types';
import { generateSlug } from './slug';

export async function getCategories(options?: { page?: number, pageSize?: number }) {
    let query = supabase
        .from('categories')
        .select('*', { count: 'exact' });

    if (options?.page && options?.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
    }

    const { data, error, count } = await query.order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return { data: [], count: 0 };
    }
    return { data: data as Category[], count: count || 0 };
}

export async function getStories(options?: {
    hot?: boolean,
    isNew?: boolean,
    status?: string,
    categoryName?: string,
    categorySlug?: string,
    search?: string,
    limit?: number,
    page?: number,
    pageSize?: number,
    sortBy?: 'updated_at' | 'view' | 'rating' | 'newest'
}) {
    let selectString = '*, story_categories(categories(name, slug))';
    if (options?.categorySlug || options?.categoryName) {
        selectString = '*, story_categories!inner(categories!inner(name, slug))';
    }

    let query = supabase
        .from('stories')
        .select(selectString, { count: 'exact' });

    if (options?.hot) {
        query = query.eq('is_hot', true);
    }

    if (options?.isNew) {
        query = query.eq('is_new', true);
    }

    if (options?.status) {
        query = query.ilike('status', options.status);
    }

    if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,author.ilike.%${options.search}%`);
    }

    if (options?.categorySlug) {
        query = query.eq('story_categories.categories.slug', options.categorySlug);
    } else if (options?.categoryName) {
        query = query.eq('story_categories.categories.name', options.categoryName);
    }

    if (options?.page && options?.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
    }

    // Sorting logic
    if (options?.sortBy === 'updated_at') {
        query = query.order('updated_at', { ascending: false });
    } else if (options?.sortBy === 'view') {
        query = query.order('views', { ascending: false });
    } else if (options?.sortBy === 'rating') {
        query = query.order('rating', { ascending: false });
    } else {
        // Default to newest (ID desc)
        query = query.order('id', { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching stories:', error);
        return { data: [], count: 0 };
    }

    const typedData = data as any[];

    // Deduplicate by ID in case of join issues
    const uniqueIds = new Set();
    const uniqueData = typedData.filter(s => {
        if (uniqueIds.has(s.id)) return false;
        uniqueIds.add(s.id);
        return true;
    });

    let results = uniqueData.map(s => ({
        ...s,
        categories: s.story_categories?.map((sc: any) => sc.categories?.name).filter(Boolean) || []
    })) as Story[];

    if (options?.limit) {
        results = results.slice(0, options.limit);
    }

    return { data: results, count: count || results.length };
}

export async function getStoryBySlug(slug: string) {
    const { data, error } = await supabase
        .from('stories')
        .select('*, story_categories(categories(name, slug))')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`Error fetching story ${slug}:`, error);
        return null;
    }

    return {
        ...data,
        categories: data.story_categories.map((sc: any) => sc.categories?.name).filter(Boolean)
    } as Story;
}

export async function getChapters(storyId: number, options?: { page?: number, pageSize?: number, search?: string }) {
    let query = supabase
        .from('chapters')
        .select('id, number, title, created_at, is_vip, price', { count: 'exact' })
        .eq('story_id', storyId);

    if (options?.search) {
        const search = options.search.trim();
        // Check if search is "Chương X" or just "X"
        const chapterNumberMatch = search.match(/(?:chương\s*)?(\d+)/i);
        if (chapterNumberMatch) {
            const num = chapterNumberMatch[1];
            query = query.or(`title.ilike.%${search}%,number.eq.${num}`);
        } else {
            query = query.ilike('title', `%${search}%`);
        }
    }

    if (options?.page && options?.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
    }

    const { data, error, count } = await query.order('number', { ascending: true });

    if (error) {
        console.error(`Error fetching chapters for story ${storyId}:`, error);
        return { data: [], count: 0 };
    }
    return { data: data || [], count: count || 0 };
}

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

    // Check VIP access
    if (chapter.is_vip) {
        // browser-only auth check
        const authClient = createSupabaseClient();
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

export async function getStoryById(id: number) {
    const { data, error } = await supabase
        .from('stories')
        .select('*, story_categories(categories(name, slug))')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching story ${id}:`, error);
        return null;
    }

    return {
        ...data,
        categories: data.story_categories.map((sc: any) => sc.categories?.name).filter(Boolean)
    } as Story;
}

export async function getStoriesByCategory(categorySlug: string) {
    const { data, error } = await supabase
        .from('categories')
        .select('*, story_categories(stories(*, story_categories(categories(name, slug))))')
        .eq('slug', categorySlug)
        .single();

    if (error || !data) {
        console.error(`Error fetching stories for category ${categorySlug}:`, error);
        return [];
    }

    return data.story_categories.map((sc: any) => ({
        ...sc.stories,
        categories: sc.stories.story_categories.map((innerSc: any) => innerSc.categories?.name).filter(Boolean)
    })) as Story[];
}

export async function getTotalStats() {
    const [
        { count: totalStories },
        { count: totalCategories },
        { data: chapterData },
        { data: storiesData }
    ] = await Promise.all([
        supabase.from('stories').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('chapters').select('id', { count: 'exact', head: true }),
        supabase.from('stories').select('views')
    ]);

    const totalChapters = chapterData ? (chapterData as any).length : 0; // Fallback if count head doesn't work as expected or just count all
    // Better way for chapters count if needed
    const { count: chapCount } = await supabase.from('chapters').select('*', { count: 'exact', head: true });

    const totalViews = storiesData?.reduce((acc, s) => acc + (s.views || 0), 0) || 0;

    return {
        totalStories: totalStories || 0,
        totalCategories: totalCategories || 0,
        totalChapters: chapCount || 0,
        totalViews
    };
}

export async function updateStory(id: number, storyData: Partial<Story>) {
    const supabaseBrowser = createSupabaseClient();
    const { categories, ...rest } = storyData;

    // 1. Update story table
    const { error: storyError } = await supabaseBrowser
        .from('stories')
        .update({
            name: rest.name,
            author: rest.author,
            image: rest.image,
            description: rest.description,
            status: rest.status,
            is_hot: rest.is_hot,
            is_new: rest.is_new,
            slug: rest.name ? generateSlug(rest.name) : undefined
        })
        .eq('id', id);

    if (storyError) {
        console.error(`Error updating story ${id}:`, storyError);
        return { error: storyError };
    }

    // 2. Update categories if provided
    if (categories) {
        // Delete existing relationships
        await supabaseBrowser.from('story_categories').delete().eq('story_id', id);

        // Get category IDs
        const { data: catData } = await supabaseBrowser
            .from('categories')
            .select('id, name')
            .in('name', categories);

        if (catData && catData.length > 0) {
            const relations = catData.map((cat: any) => ({
                story_id: id,
                category_id: cat.id
            }));
            await supabaseBrowser.from('story_categories').insert(relations);
        }
    }

    return { success: true };
}

export async function createStory(storyData: any) {
    const supabaseBrowser = createSupabaseClient();
    const { categories, ...rest } = storyData;
    const slug = rest.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-z0-9]/g, '-');

    const { data: story, error: storyError } = await supabaseBrowser
        .from('stories')
        .insert([{
            ...rest,
            slug,
            chapters_count: 0,
            views: 0,
            rating: 5
        }])
        .select()
        .single();

    if (storyError) {
        console.error('Error creating story:', storyError);
        return { error: storyError };
    }

    if (categories && categories.length > 0) {
        const { data: catData } = await supabaseBrowser
            .from('categories')
            .select('id, name')
            .in('name', categories);

        if (catData && catData.length > 0) {
            const relations = catData.map((cat: any) => ({
                story_id: story.id,
                category_id: cat.id
            }));
            await supabaseBrowser.from('story_categories').insert(relations);
        }
    }

    return { data: story };
}

export async function deleteStory(id: number) {
    const supabaseBrowser = createSupabaseClient();
    // Note: story_categories and chapters should have CASCADE delete in DB
    // But we'll do it manually just in case
    await supabaseBrowser.from('chapters').delete().eq('story_id', id);
    await supabaseBrowser.from('story_categories').delete().eq('story_id', id);

    const { error } = await supabaseBrowser
        .from('stories')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`Error deleting story ${id}:`, error);
        return { error };
    }
    return { success: true };
}

export async function updateChapter(id: number, chapterData: any) {
    const supabaseBrowser = createSupabaseClient();
    const { error } = await supabaseBrowser
        .from('chapters')
        .update(chapterData)
        .eq('id', id);

    if (error) {
        console.error(`Error updating chapter ${id}:`, error);
        return { error };
    }
    return { success: true };
}

export async function createChapter(chapterData: any) {
    const supabaseBrowser = createSupabaseClient();
    const { data, error } = await supabaseBrowser
        .from('chapters')
        .insert([chapterData])
        .select()
        .single();

    if (error) {
        console.error('Error creating chapter:', error);
        return { error };
    }

    // Update story chapters_count
    await supabaseBrowser.rpc('increment_chapters_count', { story_id_param: chapterData.story_id });

    return { data };
}

export async function deleteChapter(id: number, storyId: number) {
    const supabaseBrowser = createSupabaseClient();
    const { error } = await supabaseBrowser
        .from('chapters')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`Error deleting chapter ${id}:`, error);
        return { error };
    }

    // Update story chapters_count
    await supabaseBrowser.rpc('decrement_chapters_count', { story_id_param: storyId });

    return { success: true };
}


export async function createCategory(categoryData: any) {
    const supabaseBrowser = createSupabaseClient();
    const slug = categoryData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-z0-9]/g, '-');

    const { data, error } = await supabaseBrowser
        .from('categories')
        .insert([{ ...categoryData, slug }])
        .select()
        .single();

    if (error) {
        console.error('Error creating category:', error);
        return { error };
    }
    return { data };
}

export async function updateCategory(id: number, categoryData: any) {
    const supabaseBrowser = createSupabaseClient();
    // If slug is explicitly provided, use it. Otherwise, if name is changed, regenerate slug.
    console.log('[DEBUG] updateCategory input:', { id, categoryData });
    const slug = categoryData.slug || (categoryData.name ? generateSlug(categoryData.name) : undefined);
    console.log('[DEBUG] updateCategory computed slug:', slug);

    const { error } = await supabaseBrowser
        .from('categories')
        .update({ ...categoryData, ...(slug ? { slug } : {}) })
        .eq('id', id);

    if (error) {
        console.error(`Error updating category ${id}:`, error);
        return { error };
    }
    return { success: true };
}

export async function deleteCategory(id: number) {
    const supabaseBrowser = createSupabaseClient();
    // Relationships should be handled by DB or manually
    await supabaseBrowser.from('story_categories').delete().eq('category_id', id);

    const { error } = await supabaseBrowser
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`Error deleting category ${id}:`, error);
        return { error };
    }
    return { success: true };
}

// Upload story cover image to Supabase Storage
export async function uploadStoryImage(file: File): Promise<{ success: boolean; url?: string; error?: any }> {
    try {
        // Validate file size (max 2MB)
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > MAX_FILE_SIZE) {
            return {
                success: false,
                error: { message: 'File size must be less than 2MB' }
            };
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            return {
                success: false,
                error: { message: 'Only JPG and PNG files are allowed' }
            };
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}-${randomString}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('story-covers')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading image:', error);
            return { success: false, error };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('story-covers')
            .getPublicUrl(fileName);

        return {
            success: true,
            url: publicUrl
        };
    } catch (error) {
        console.error('Unexpected error uploading image:', error);
        return { success: false, error };
    }
}

export async function incrementStoryViews(storyId: number) {
    const { error } = await supabase.rpc('increment_story_views', { story_id: storyId });
    if (error) {
        console.error('Error incrementing views:', error);
        return false;
    }
    return true;
}

export async function getProfile(userId?: string) {
    const browserSupabase = createSupabaseClient();

    let targetUserId = userId;
    if (!targetUserId) {
        const { data: { user } } = await browserSupabase.auth.getUser();
        if (!user) {
            console.log('[api/getProfile] No user found in session');
            return null;
        }
        targetUserId = user.id;
    }

    console.log('[api/getProfile] Fetching profile for:', targetUserId);
    const { data, error } = await browserSupabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

    if (error) {
        console.error('[api/getProfile] Error fetching profile:', error);
        return null;
    }
    console.log('[api/getProfile] Profile result:', data);
    return data as any;
}

export async function purchaseChapter(chapterId: number) {
    const browserSupabase = createSupabaseClient();
    const { data, error } = await browserSupabase.rpc('purchase_chapter', {
        p_chapter_id: chapterId
    });

    if (error) {
        return { success: false, error: error.message };
    }
    return data as { success: boolean; message: string };
}
export async function bulkUpdateChapters(chapterIds: number[], updates: { is_vip: boolean, price: number }) {
    const { data, error } = await supabase.rpc('bulk_update_chapters', {
        chapter_ids: chapterIds,
        new_is_vip: updates.is_vip,
        new_price: updates.price
    });

    if (error) {
        console.error('Error in bulkUpdateChapters:', error);
        return { success: false, error };
    }

    return { success: true, data };
}
export async function updateProfile(updates: Partial<Profile>) {
    const browserSupabase = createSupabaseClient();
    const { data: { user } } = await browserSupabase.auth.getUser();

    if (!user) return { success: false, error: 'User not found' };

    const { data, error } = await browserSupabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true, data };
}
