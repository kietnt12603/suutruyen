export interface Story {
    id: number;
    name: string;
    slug: string;
    image: string;
    author?: string;
    description?: string;
    categories: string[];
    chapters_count: number;
    status: 'full' | 'ongoing';
    is_hot: boolean;
    is_new: boolean;
    views?: number;
    rating?: number;
    updated_at?: string;
    latest_chapter?: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface Chapter {
    id: number;
    story_id: number;
    number: number;
    title: string;
    content: string;
    created_at: string;
    is_vip?: boolean;
    price?: number;
    is_locked?: boolean;
}

export interface Profile {
    id: string;
    full_name: string;
    linh_thach: number;
    is_auto_buy: boolean;
    updated_at: string;
}
