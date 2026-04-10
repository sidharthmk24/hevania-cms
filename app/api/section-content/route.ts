import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  const supabase = createApiSupabaseClient();

  let query = supabase.from("section_content").select("*").order("created_at", { ascending: true });

  if (section) {
    query = query.eq("section", section);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { section, key, content_json } = body;

  if (!section || !key || !content_json) {
    return NextResponse.json({ error: "section, key, and content_json are required." }, { status: 400 });
  }

  const supabase = createApiSupabaseClient();

  // Upsert: update if exists for this section+key, otherwise insert
  const { data, error } = await supabase
    .from("section_content")
    .upsert({ section, key, content_json }, { onConflict: "section,key" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = createApiSupabaseClient();
  const { error } = await supabase.from("section_content").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
