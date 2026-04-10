import { NextResponse } from 'next/server';
import { createApiSupabaseClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const supabase = createApiSupabaseClient();

    try {
        // 1. Get total images
        const { count: totalImages, error: countError } = await supabase
            .from('gallery')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            // If table doesn't exist yet, return 0 instead of throwing
            console.warn("Gallery table may not exist yet:", countError.message);
        }

        // 2. Get recent uploads (past 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: recentUploads, error: recentError } = await supabase
            .from('gallery')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo);

        // 3. Get distinct sections count (simple estimate)
        const { data: sectionsData, error: sectionsError } = await supabase
            .from('gallery')
            .select('section');
        
        const distinctSections = new Set(sectionsData?.map(s => s.section) || []);

        return NextResponse.json({
            data: {
                totalImages: totalImages || 0,
                recentUploads: recentUploads || 0,
                sectionsCount: distinctSections.size || 0
            }
        });

    } catch (error: unknown) {
        console.error("Dashboard Stats API Error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Failed to fetch dashboard statistics" },
            { status: 500 }
        );
    }
}
