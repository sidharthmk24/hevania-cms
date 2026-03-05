import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = createApiSupabaseClient();
  const { data, error } = await supabase.from("topics").select("*").order("title", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = String(body?.title || "").trim();
  const heading = String(body?.heading || "").trim();
  const description = String(body?.description || "").trim();

  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const supabase = createApiSupabaseClient();
  const payload = {
    title,
    heading: heading || title,
    description: description || "",
    result_a_text: "Result A",
    result_b_text: "Result B",
    result_c_text: "Result C",
    result_d_text: "Result D"
  };

  const { data, error } = await supabase.from("topics").insert(payload).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
