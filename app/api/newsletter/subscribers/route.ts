import { NextRequest, NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

const PAGE_LIMIT = 20;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Number(searchParams.get("limit") || PAGE_LIMIT));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = createApiSupabaseClient();
    const { data, error, count } = await supabase
      .from("subscribers")
      .select("id, email, subscribed_at, status", { count: "exact" })
      .order("subscribed_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      data,
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (err: unknown) {
    console.error("[newsletter/subscribers GET]", err);
    return NextResponse.json({ error: "Failed to fetch subscribers." }, { status: 500 });
  }
}
