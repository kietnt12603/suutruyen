import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Static client (for cases where cookies aren't available or needed)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Browser-side client singleton
let browserSupabaseInstance: any = null;

export function createSupabaseClient() {
    if (typeof window === 'undefined') {
        return supabase;
    }

    if (!browserSupabaseInstance) {
        browserSupabaseInstance = createBrowserClient(
            supabaseUrl,
            supabaseAnonKey
        );
    }

    return browserSupabaseInstance;
}
