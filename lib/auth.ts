import { createSupabaseClient } from './supabase';

// Sign up with email and password
export async function signUp(email: string, password: string, fullName?: string) {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        return { success: false, error };
    }

    return { success: true, data };
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { success: false, error };
    }

    return { success: true, data };
}

// Sign out
export async function signOut() {
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
        return { success: false, error };
    }

    return { success: true };
}

// Get current user
export async function getUser() {
    const supabase = createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        return { user: null, error };
    }

    return { user, error: null };
}

// Get current session
export async function getSession() {
    const supabase = createSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        return { session: null, error };
    }

    return { session, error: null };
}

// Subscribe to auth state changes
export function onAuthStateChange(callback: (event: any, session: any) => void) {
    const supabase = createSupabaseClient();
    return supabase.auth.onAuthStateChange(callback);
}
