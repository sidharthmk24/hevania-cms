import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createApiSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("topic_id", params.id)
    .order("order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const payload = {
    topic_id: params.id,
    question_text: String(body?.question_text || ""),
    option_a: String(body?.option_a || ""),
    option_b: String(body?.option_b || ""),
    option_c: String(body?.option_c || ""),
    option_d: String(body?.option_d || ""),
    order: Number(body?.order || 1)
  };

  if (!payload.question_text || !payload.option_a || !payload.option_b) {
    return NextResponse.json({ error: "Question text, Option A, and Option B are required." }, { status: 400 });
  }

  const supabase = createApiSupabaseClient();
  const { data, error } = await supabase.from("questions").insert(payload).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
