import { NextResponse } from 'next/server';

export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectId = url.includes('//') ? url.split('.')[0].split('//')[1] : null;

    return NextResponse.json({
        url: url,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        projectId: projectId,
        nodeEnv: process.env.NODE_ENV
    });
}
