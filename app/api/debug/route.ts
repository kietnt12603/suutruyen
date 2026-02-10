import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        projectId: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].split('//')[1],
        nodeEnv: process.env.NODE_ENV
    });
}
