import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import data - We'll use a trick or just define the data here since we have it from the view_file
// To be safe and automated, I'll try to import it if tsx allows, or just use the data I've seen.
// Given I have the data, I'll define a subset or the whole thing.

const categoriesData = [
    { id: 1, name: "Ngôn Tình", slug: "ngon-tinh" },
    { id: 2, name: "Trọng Sinh", slug: "trong-sinh" },
    { id: 3, name: "Cổ Đại", slug: "co-dai" },
    { id: 4, name: "Tiên Hiệp", slug: "tien-hiep" },
    { id: 5, name: "Ngược", slug: "nguoc" },
    { id: 6, name: "Khác", slug: "khac" },
    { id: 7, name: "Dị Giới", slug: "di-gioi" },
    { id: 8, name: "Huyền Huyễn", slug: "huyen-huyen" },
    { id: 9, name: "Xuyên Không", slug: "xuyen-khong" },
    { id: 10, name: "Sủng", slug: "sung" },
    { id: 11, name: "Cung Đấu", slug: "cung-dau" },
    { id: 12, name: "Gia Đấu", slug: "gia-dau" },
    { id: 13, name: "Kiếm Hiệp", slug: "kiem-hiep" },
    { id: 14, name: "Hiện Đại", slug: "hien-dai" }
];

const storiesData = [
    { id: 1, name: "Tự Cẩm", slug: "tu-cam", image: "/images/tu_cam.jpg", author: "Cửu Lộ Phi Hương", description: "Tự Cẩm là một câu chuyện ngôn tình cổ đại đầy cảm động về tình yêu và hy sinh...", categories: ["Ngôn Tình", "Cổ Đại"], chapters: 120, status: "full", hot: true, new: true, views: 15000, rating: 4.8 },
    { id: 2, name: "Ngạo Thế Đan Thần", slug: "ngao-the-dan-than", image: "/images/ngao_the_dan_than.jpg", author: "Cô Đơn Phiêu Linh", description: "Thiếu niên chế đan, trở thành đan thần số một thiên hạ...", categories: ["Tiên Hiệp", "Huyền Huyễn", "Dị Giới"], chapters: 3500, status: "full", hot: true, new: true, views: 25000, rating: 4.9 },
    { id: 3, name: "Nàng Không Muốn Làm Hoàng Hậu", slug: "nang-khong-muon-lam-hoang-hau", image: "/images/nang_khong_muon_lam_hoang_hau.jpg", author: "Tây Tử Tình", description: "Xuyên không trở thành hoàng hậu nhưng chỉ muốn sống cuộc đời bình thường...", categories: ["Ngôn Tình", "Cổ Đại", "Xuyên Không"], chapters: 85, status: "full", hot: true, new: true, views: 18000, rating: 4.7 },
    { id: 4, name: "Kiều Sủng Vi Thượng", slug: "kieu-sung-vi-thuong", image: "/images/kieu_sung_vi_thuong.jpg", author: "Diệp Phi Dạ", description: "Tổng tài sủng chiều vợ nhỏ hết mức có thể...", categories: ["Ngôn Tình", "Sủng", "Hiện Đại"], chapters: 95, status: "full", hot: true, new: true, views: 12000, rating: 4.6 },
    { id: 5, name: "Linh Vũ Thiên Hạ", slug: "linh-vu-thien-ha", image: "/images/linh_vu_thien_ha.jpg", author: "Phong Thanh Dương", description: "Thiếu niên tu luyện, bước lên đỉnh cao võ đạo...", categories: ["Tiên Hiệp", "Dị Giới", "Huyền Huyễn"], chapters: 5024, status: "full", hot: true, new: true, views: 30000, rating: 5.0 },
    // ... adding more for the demo
];

async function migrate() {
    console.log('Starting migration...');

    // 1. Migrate Categories
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .upsert(categoriesData.map(c => ({ name: c.name, slug: c.slug })), { onConflict: 'slug' })
        .select();

    if (catError) {
        console.error('Error migrating categories:', catError);
        return;
    }
    console.log('Categories migrated.');

    // 2. Migrate Stories
    for (const story of storiesData) {
        const { data: storyRes, error: storyError } = await supabase
            .from('stories')
            .upsert({
                name: story.name,
                slug: story.slug,
                image: story.image,
                author: story.author,
                description: story.description,
                chapters_count: story.chapters,
                status: story.status,
                is_hot: story.hot,
                is_new: story.new,
                views: story.views,
                rating: story.rating
            }, { onConflict: 'slug' })
            .select()
            .single();

        if (storyError) {
            console.error(`Error migrating story ${story.name}:`, storyError);
            continue;
        }

        // 3. Link Categories
        const storyId = storyRes.id;
        const categoryIds = categories
            .filter(c => story.categories.includes(c.name))
            .map(c => c.id);

        for (const catId of categoryIds) {
            await supabase
                .from('story_categories')
                .upsert({ story_id: storyId, category_id: catId }, { onConflict: 'story_id,category_id' });
        }

        // 4. Generate Mock Chapters (5 per story)
        const mockContent = `
            <p>Mưa vào mùa hè thường kéo đến rất nhanh, rõ ràng vừa rồi trời quang mây tạnh, vậy mà chớp mắt, mây đen giăng kín, mưa rơi nặng hạt.</p>
            <div class="py-2"></div>
            <p>Trên mạn thuyền, nước mưa như những hạt châu nhảy múa, làm ướt tà váy màu thiên thanh. Vân Kiều nhìn về bến tàu gần đó, đến khi Nguyên Anh giục, nàng mới nhấc váy vào thuyền tránh mưa.</p>
            <div class="py-2"></div>
            <p>“Ta thấy mưa này nhanh đến nhanh đi, đến chiều sẽ tạnh thôi!” Nguyên Anh bình thản rót trà rồi đẩy đến trước mặt nàng, giọng điệu trêu chọc: “Ta biết ngươi muốn được gặp phu quân sớm, nhưng cũng không nên gấp gáp như vậy!”</p>
        `;

        for (let i = 1; i <= 5; i++) {
            await supabase
                .from('chapters')
                .upsert({
                    story_id: storyId,
                    number: i,
                    title: i === 1 ? 'Nàng không tin Yến Đình lại lừa nàng chuyện lớn đến vậy!' : `Chương ${i}`,
                    content: mockContent
                }, { onConflict: 'story_id,number' });
        }

        console.log(`Story ${story.name} and chapters migrated.`);
    }

    console.log('Migration finished.');
}

migrate();
