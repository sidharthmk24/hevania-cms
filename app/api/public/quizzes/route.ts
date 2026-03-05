import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = createApiSupabaseClient();
  const { data, error } = await supabase
    .from("topics")
    .select("id,title,heading,description")
    .order("title", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}
