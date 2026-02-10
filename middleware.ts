import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If env variables are missing, bypass middleware to avoid 500
    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.next();
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: any) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const path = request.nextUrl.pathname;

    // Protect /admin routes (except /admin/login)
    if (path.startsWith('/admin') && path !== '/admin/login') {
        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Redirect to /admin if already logged in and trying to access admin login
    if (path === '/admin/login' && session) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Redirect to home if already logged in and trying to access user login
    if (path === '/dang-nhap' && session) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
}

export const config = {
    matcher: ['/admin/:path*', '/dang-nhap'],
};
