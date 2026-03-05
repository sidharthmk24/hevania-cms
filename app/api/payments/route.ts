import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Make sure to use the service role key to bypass RLS for admin views if needed,
// or just standard client if RLS policies allow read access for authenticated users.
// Using standard client here, assuming auth matches standard config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = "force-dynamic";

export async function GET() {
    try {
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
