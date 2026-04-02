import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    console.log("Fetching latest payments from Supabase...");
    try {
        const supabase = createApiSupabaseClient();

        const { data, error } = await supabase
            .from("payments")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase error fetching payments:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error("Error in GET /api/payments:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
