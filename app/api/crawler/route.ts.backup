import { NextRequest, NextResponse } from 'next/server';
import { TruyenFullCrawler } from '@/lib/crawler';
import { generateSlug } from '@/lib/slug';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    // Client for session verification (uses anon key)
    const authClient = await createSupabaseServerClient();
    const { data: { session } } = await authClient.auth.getSession();

    if (!session) {
        return NextResponse.json({ success: false, error: 'Phát hiện lỗi xác thực. Vui lòng đăng nhập lại.' }, { status: 401 });
    }

    // Admin client for DB operations (uses service role key if available)
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!svcKey) {
        console.warn('Crawler API: SUPABASE_SERVICE_ROLE_KEY is MISSING in environment variables.');
    } else {
        console.log(`Crawler API: Service Key detected (${svcKey.substring(0, 10)}...${svcKey.substring(svcKey.length - 10)})`);
    }

    const supabaseKey = svcKey || anonKey;
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const isServiceRole = !!svcKey;
    console.log(`Crawler API: Admin Action by ${session.user.email} (Bypass RLS: ${isServiceRole})`);

    try {
        const body = await req.json();
        const { url, action, storyData, storyId, sId, title, content } = body;
        const targetStoryId = storyId || sId; // Handle both variants for backward compatibility

        const crawler = new TruyenFullCrawler();
        // ... (rest of the action checks using body properties)

        if (action === 'fetch-info') {
            if (!url) return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
            const info = await crawler.getStoryInfo(url);
            return NextResponse.json({ success: true, data: info });
        }

        if (action === 'fetch-chapters') {
            const { storyName, storyAuthor } = body;
            if (!url) return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
            const chapters = await crawler.getChapterList(url);

            // Attempt to sync with existing chapters if story exists
            try {
                // Extract slug from TruyenFull URL: https://truyenfull.vision/linh-vu-thien-ha/
                const urlObj = new URL(url);
                const pathParts = urlObj.pathname.split('/').filter(p => !!p);
                const slugFromUrl = pathParts[pathParts.length - 1];

                let targetStoryId: number | null = null;

                // 1. Try by provided name (account for Unicode normalization)
                if (storyName) {
                    const nameNFC = storyName.normalize('NFC');
                    const nameNFD = storyName.normalize('NFD');

                    const { data: stories } = await supabase
                        .from('stories')
                        .select('id, name')
                        .or(`name.eq."${storyName}",name.eq."${nameNFC}",name.eq."${nameNFD}"`)
                        .limit(1);

                    if (stories && stories.length > 0) {
                        targetStoryId = stories[0].id;
                    }
                }

                // 2. Fallback: Exact slug check
                if (!targetStoryId && slugFromUrl) {
                    const { data: storyBySlug } = await supabase
                        .from('stories')
                        .select('id')
                        .eq('slug', slugFromUrl)
                        .maybeSingle();
                    if (storyBySlug) targetStoryId = storyBySlug.id;
                }

                // 3. Fallback: Keyword-based lookup on slug (unaccented and reliable)
                if (!targetStoryId && slugFromUrl) {
                    const keywords = slugFromUrl.split('-').filter(k => k.length > 1); // Use almost all keywords
                    if (keywords.length > 0) {
                        let slugQuery = supabase.from('stories').select('id');

                        // Search for slug containing all keywords
                        keywords.forEach(word => {
                            slugQuery = slugQuery.ilike('slug', `%${word}%`);
                        });

                        const { data: storiesBySlugMatch } = await slugQuery.limit(1);
                        if (storiesBySlugMatch && storiesBySlugMatch.length > 0) {
                            targetStoryId = storiesBySlugMatch[0].id;
                        }
                    }
                }

                if (targetStoryId) {
                    const { data: existingChapters } = await supabase
                        .from('chapters')
                        .select('title, number, source_url')
                        .eq('story_id', targetStoryId)
                        .limit(10000);

                    if (existingChapters && existingChapters.length > 0) {
                        // Helper to remove accents for ultra-robust matching
                        const removeAccents = (str: string) => {
                            return str.normalize('NFD')
                                .replace(/[\u0300-\u036f]/g, '')
                                .replace(/đ/g, 'd')
                                .replace(/Đ/g, 'D')
                                .toLowerCase();
                        };

                        // Helper to simplify strings for robust matching (lowercase, no accents, no symbols)
                        const robustSimplify = (s: string) => removeAccents(s.normalize('NFC')).replace(/[^a-z0-9]/g, '');

                        // Helper to normalize URLs (remove trailing slashes) for robust comparison
                        const normalizeUrl = (url: string) => url ? url.trim().replace(/\/$/, '') : '';

                        // Create sets for fast lookup of various formats
                        const exactTitles = new Set(existingChapters.map(c => c.title.normalize('NFC').toLowerCase()));
                        const simpleTitles = new Set(existingChapters.map(c => robustSimplify(c.title)));
                        const existingNumbers = new Set(existingChapters.map(c => c.number));
                        const existingUrls = new Set(existingChapters.map(c => normalizeUrl(c.source_url)).filter(Boolean));

                        // Mark chapters that already exist
                        const syncedChapters = chapters.map(chap => {
                            const rawTitle = chap.title.normalize('NFC').toLowerCase();
                            const cleanTitle = chap.title.replace(/^chương\s+\d+[:\s-]*/i, '').trim().normalize('NFC').toLowerCase();
                            const simpleTitle = robustSimplify(chap.title);
                            const simpleClean = robustSimplify(cleanTitle);
                            const normalizedChapUrl = normalizeUrl(chap.url);

                            // Precise matching logic:
                            // 1. URL match is absolute
                            // 2. If no URL, Title + Number must both match
                            // 3. Fallback to title-only ONLY if we don't have numbers at all
                            let isExisting = false;

                            if (normalizedChapUrl && existingUrls.has(normalizedChapUrl)) {
                                isExisting = true;
                            } else if (chap.number && existingNumbers.has(chap.number)) {
                                // If number matches, check if title is also a reasonable match 
                                // to avoid cross-matching if numbering systems differ
                                isExisting = exactTitles.has(rawTitle) ||
                                    exactTitles.has(cleanTitle) ||
                                    simpleTitles.has(simpleTitle) ||
                                    simpleTitles.has(simpleClean);
                            } else if (!chap.number) {
                                // No number available, rely on title (risky but necessary fallback)
                                isExisting = exactTitles.has(rawTitle) ||
                                    exactTitles.has(cleanTitle) ||
                                    simpleTitles.has(simpleTitle) ||
                                    simpleTitles.has(simpleClean);
                            }

                            return {
                                ...chap,
                                exists: isExisting
                            };
                        });

                        return NextResponse.json({
                            success: true,
                            data: syncedChapters,
                            debug: {
                                matchedStoryId: targetStoryId,
                                dbChapterCount: existingChapters.length
                            }
                        });
                    }
                }
            } catch (e) {
                console.error('Sync check failed:', e);
            }

            return NextResponse.json({ success: true, data: chapters });
        }

        if (action === 'fetch-chapter-content') {
            if (!url) return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
            const content = await crawler.getChapterContent(url);
            return NextResponse.json({ success: true, data: content });
        }

        if (action === 'save-story') {
            if (!storyData) return NextResponse.json({ success: false, error: 'Story data is required' }, { status: 400 });

            // Normalize names for consistent lookups
            const normalizedName = storyData.name.trim().normalize('NFC');
            const normalizedAuthor = storyData.author?.trim().normalize('NFC') || 'Unknown';
            const slug = generateSlug(normalizedName).normalize('NFC');

            // 1. Check if story exists by Name + Author (most reliable)
            let { data: existingStory } = await supabase
                .from('stories')
                .select('id')
                .eq('name', normalizedName)
                .eq('author', normalizedAuthor)
                .maybeSingle();

            // 2. Fallback: Check if story exists by Slug
            if (!existingStory) {
                const { data: storyBySlug } = await supabase
                    .from('stories')
                    .select('id')
                    .eq('slug', slug)
                    .maybeSingle();
                existingStory = storyBySlug;
            }

            let storyId: number;

            const storyToInsert = {
                name: normalizedName,
                slug: slug,
                author: normalizedAuthor,
                description: storyData.description?.normalize('NFC'),
                image: storyData.image,
                status: storyData.status || 'Đang ra',
                is_new: true,
                // Do not overwrite views/rating on update
            };

            if (existingStory) {
                const { data, error } = await supabase
                    .from('stories')
                    .update(storyToInsert)
                    .eq('id', existingStory.id)
                    .select()
                    .single();

                if (error) throw error;
                storyId = data.id;
            } else {
                const { data, error } = await supabase
                    .from('stories')
                    .insert({
                        ...storyToInsert,
                        views: 0,
                        rating: 0
                    })
                    .select()
                    .single();

                if (error) throw error;
                storyId = data.id;
            }

            // Handle Categories
            if (storyData.categories && storyData.categories.length > 0) {
                for (const catName of storyData.categories) {
                    const normalizedCatName = catName.trim().normalize('NFC');
                    const catSlug = generateSlug(normalizedCatName);

                    // Check if category exists by Slug OR Name (to prevent duplicates if slugs differ)
                    let { data: category } = await supabase
                        .from('categories')
                        .select('*')
                        .or(`slug.eq.${catSlug},name.ilike.${normalizedCatName}`)
                        .maybeSingle();

                    if (!category) {
                        const { data: newCat, error: catError } = await supabase
                            .from('categories')
                            .insert({ name: normalizedCatName, slug: catSlug })
                            .select()
                            .maybeSingle();
                        if (catError) console.error('Error creating category:', catError);
                        category = newCat;
                    }

                    if (category) {
                        // Link story to category if not already linked
                        const { data: existingLink } = await supabase
                            .from('story_categories')
                            .select('*')
                            .eq('story_id', storyId)
                            .eq('category_id', category.id)
                            .maybeSingle();

                        if (!existingLink) {
                            await supabase
                                .from('story_categories')
                                .insert({ story_id: storyId, category_id: category.id });
                        }
                    }
                }
            }

            return NextResponse.json({ success: true, data: { id: storyId, slug } });
        }

        if (action === 'save-chapter') {


            // Clean the title: remove "Chương XXX:" or "Chương XXX" prefix if it exists
            const { storyId, title, content, url: sourceUrl, number: explicitNumber } = body;
            const targetStoryId = storyId || body.targetStoryId;

            if (!targetStoryId || !title || !content) {
                return NextResponse.json({ success: false, error: 'Target story ID, title, and content are required' }, { status: 400 });
            }

            const cleanTitle = title.replace(/^chương\s+\d+[:\s-]*/i, '').trim();

            // Helper to normalize URL
            const normalizeUrl = (u: string) => u ? u.trim().replace(/\/$/, '') : '';
            const normalizedSourceUrl = normalizeUrl(sourceUrl);

            // 1. Try to find by URL (Precise Match) using a filter if possible, 
            // but for simplicity/performance in this context we might need to rely on the Exact Match unless we have a normalized column.
            // Since we can't easily normalize the DB column in the query, we'll try strict first.
            let existingId: string | null = null;

            if (sourceUrl) {
                // Try exact first
                const { data: existingByExactUrl } = await supabase
                    .from('chapters')
                    .select('id')
                    .eq('story_id', targetStoryId)
                    .eq('source_url', sourceUrl)
                    .maybeSingle();

                if (existingByExactUrl) existingId = existingByExactUrl.id;

                // If not found, try with/without trailing slash flip
                if (!existingId) {
                    const altUrl = sourceUrl.endsWith('/') ? sourceUrl.slice(0, -1) : sourceUrl + '/';
                    const { data: existingByAltUrl } = await supabase
                        .from('chapters')
                        .select('id')
                        .eq('story_id', targetStoryId)
                        .eq('source_url', altUrl)
                        .maybeSingle();
                    if (existingByAltUrl) existingId = existingByAltUrl.id;
                }
            }

            // 2. If not found by URL, check by Number (Authoritative for ordering)
            if (!existingId && explicitNumber) {
                const { data: existingByNumber } = await supabase
                    .from('chapters')
                    .select('id')
                    .eq('story_id', targetStoryId)
                    .eq('number', explicitNumber)
                    .maybeSingle();

                if (existingByNumber) existingId = existingByNumber.id;
            }

            // 3. Fallback to Title only if no Number (Legacy/Desperate)
            if (!existingId && !explicitNumber) {
                const { data: existingByTitle } = await supabase
                    .from('chapters')
                    .select('id')
                    .eq('story_id', targetStoryId)
                    .eq('title', cleanTitle)
                    .maybeSingle();
                if (existingByTitle) existingId = existingByTitle.id;
            }

            if (existingId) {
                // Resolve conflict: If we are updating the number, ensure no other chapter holds it
                if (explicitNumber) {
                    const { data: conflict } = await supabase
                        .from('chapters')
                        .select('id')
                        .eq('story_id', targetStoryId)
                        .eq('number', explicitNumber)
                        .neq('id', existingId) // Must be different chapter
                        .maybeSingle();

                    if (conflict) {
                        // Delete the conflicting chapter (it's likely a duplicate or outdated entry)
                        // to allow the authoritative update from the crawler to succeed.
                        await supabase.from('chapters').delete().eq('id', conflict.id);
                    }
                }

                // Update existing chapter (UPSERT behavior)
                const { data: updated, error: updateError } = await supabase
                    .from('chapters')
                    .update({
                        title: cleanTitle,
                        content: content,
                        source_url: sourceUrl,
                        // Update number only if explicit (though we found TO it, so it matches, but good for consistency)
                        ...(explicitNumber ? { number: explicitNumber } : {})
                    })
                    .eq('id', existingId)
                    .select()
                    .single();

                if (updateError) throw updateError;

                // Update story metadata
                const { count: realChapterCount } = await supabase
                    .from('chapters')
                    .select('id', { count: 'exact', head: true })
                    .eq('story_id', targetStoryId);

                await supabase
                    .from('stories')
                    .update({
                        updated_at: new Date().toISOString(),
                        chapters_count: realChapterCount || 0,
                        latest_chapter: cleanTitle
                    })
                    .eq('id', targetStoryId);

                return NextResponse.json({ success: true, data: updated, note: 'saved' });
            }

            // 4. Insert New
            let nextNumber = explicitNumber;
            if (!nextNumber) {
                const { data: chaptersData } = await supabase
                    .from('chapters')
                    .select('number')
                    .eq('story_id', targetStoryId)
                    .order('number', { ascending: false })
                    .limit(1);

                nextNumber = chaptersData && chaptersData.length > 0 ? chaptersData[0].number + 1 : 1;
            }

            const { data: chapter, error } = await supabase
                .from('chapters')
                .insert([{
                    story_id: targetStoryId,
                    title: cleanTitle,
                    content: content,
                    number: nextNumber,
                    source_url: sourceUrl
                }])
                .select()
                .single();

            if (error) throw error;

            return NextResponse.json({ success: true, data: chapter });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Crawler API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
