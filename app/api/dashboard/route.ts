import { NextResponse } from 'next/server';
import { createApiSupabaseClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createApiSupabaseClient();

    try {
        // 1. Get Tools stats
        const { data: tools, error: toolsError } = await supabase
            .from('tools')
            .select('id, is_active');

        if (toolsError) throw toolsError;

        // 2. Get Payment stats
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('amount, status, created_at');

        if (paymentsError) throw paymentsError;

        // 3. Get Messages stats
        const { data: messages, error: messagesError } = await supabase
            .from('contact_messages')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(10); // Just checking recent activity

        if (messagesError) throw messagesError;

        // 4. Get Quiz Topics stats
        const { count: topicsCount, error: topicsError } = await supabase
            .from('quiz_topics')
            .select('*', { count: 'exact', head: true });

        if (topicsError) throw topicsError;

        // Calculate aggregations
        const totalTools = tools?.length || 0;
        const activeTools = tools?.filter(t => t.is_active)?.length || 0;

        const successfulPayments = payments?.filter(p => p.status === 'successful') || [];
        const totalSales = successfulPayments.length;
        const totalRevenueResult = successfulPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        const recentMessagesCount = messages?.length || 0;

        return NextResponse.json({
            data: {
                revenue: totalRevenueResult,
                sales: totalSales,
                tools: {
                    total: totalTools,
                    active: activeTools
                },
                topicsCount: topicsCount || 0,
                recentMessages: recentMessagesCount
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
