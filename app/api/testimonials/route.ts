import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = createApiSupabaseClient();
  const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body?.name || "").trim();
  const comment = String(body?.comment || "").trim();
  const rating = Number(body?.rating) || 5;

  if (!name || !comment) {
    return NextResponse.json({ error: "Name and comment are required." }, { status: 400 });
  }

  const supabase = createApiSupabaseClient();
  const payload = {
    name,
    comment,
    rating,
  };

  const { data, error } = await supabase.from("testimonials").insert(payload).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
