import { NextResponse } from 'next/server';
import { createApiSupabaseClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createApiSupabaseClient();

    // Fetch messages ordered by newest first
    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}
