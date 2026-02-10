'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { onAuthStateChange, getSession, signOut as signOutApi } from '@/lib/auth';
import { getProfile } from '@/lib/api';
import { createSupabaseClient } from '@/lib/supabase';
import { Profile } from '@/types';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    refreshProfile: async () => { },
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        console.log('[AuthContext] Fetching profile for:', userId);
        try {
            const data = await getProfile(userId);
            console.log('[AuthContext] Profile fetched:', data);
            setProfile(data);
        } catch (error) {
            console.error('[AuthContext] Error fetching profile:', error);
            setProfile(null);
        }
    };

    const refreshProfile = async () => {
        console.log('[AuthContext] refreshProfile called, current user:', user?.id);
        if (user) {
            await fetchProfile(user.id);
        }
    };

    const signOut = async () => {
        console.log('Initiating sign out...');
        try {
            setLoading(true);
            const { success, error } = await signOutApi();
            console.log('Sign out result:', { success, error });

            setUser(null);
            setSession(null);
            setProfile(null);

            console.log('States cleared, redirecting...');
            // Force a full reload to clear all states and cookies
            window.location.replace('/');
        } catch (error) {
            console.error('Error during sign out:', error);
            // Fallback: clear state and redirect anyway
            setUser(null);
            setSession(null);
            setProfile(null);
            window.location.replace('/');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        // Listen for auth changes
        const { data: { subscription } } = onAuthStateChange(async (event, currentSession) => {
            if (!mounted) return;

            console.log('Auth state change event:', event);

            try {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    await fetchProfile(currentSession.user.id);
                } else {
                    setProfile(null);
                }
            } catch (error) {
                console.error('Error handling auth state change:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        });

        // Initial session check
        const initSession = async () => {
            try {
                const { session: initialSession, error } = await getSession();
                if (!mounted) return;

                if (error) throw error;

                setSession(initialSession);
                setUser(initialSession?.user ?? null);

                if (initialSession?.user) {
                    await fetchProfile(initialSession.user.id);
                }
            } catch (error: any) {
                if (error.name !== 'AbortError' && error.message !== 'signal is aborted without reason') {
                    console.error('Error initializing session:', error);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initSession();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Real-time profile updates
    useEffect(() => {
        if (!user) return;

        const supabaseClient = createSupabaseClient();
        console.log('[AuthContext] Subscribing to realtime profile updates for:', user.id);

        const channel = supabaseClient
            .channel(`profile-updates-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                },
                async (payload: any) => {
                    console.log('[AuthContext] Realtime profile update event received:', payload.eventType);
                    console.log('[AuthContext] Payload details:', {
                        old: payload.old,
                        new: payload.new,
                        table: payload.table
                    });

                    // Instead of trust payload.new (which might be partial), re-fetch the full profile
                    console.log('[AuthContext] Re-fetching full profile to ensure data consistency...');
                    await refreshProfile();
                }
            )
            .subscribe((status: string) => {
                console.log(`[AuthContext] Realtime subscription status for user ${user.id}:`, status);
            });

        return () => {
            console.log('[AuthContext] Unsubscribing from realtime profile updates for:', user.id);
            supabaseClient.removeChannel(channel);
        };
    }, [user?.id]);

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, refreshProfile, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
