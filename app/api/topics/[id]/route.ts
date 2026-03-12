import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createApiSupabaseClient();
  const { data, error } = await supabase.from("topics").select("*").eq("id", params.id).single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const payload = {
    title: typeof body?.title === "string" ? body.title : undefined,
    heading: typeof body?.heading === "string" ? body.heading : undefined,
    description: typeof body?.description === "string" ? body.description : undefined,
    result_a_text: typeof body?.result_a_text === "string" ? body.result_a_text : undefined,
    result_b_text: typeof body?.result_b_text === "string" ? body.result_b_text : undefined,
    result_c_text: typeof body?.result_c_text === "string" ? body.result_c_text : undefined,
    result_d_text: typeof body?.result_d_text === "string" ? body.result_d_text : undefined
  };

  const supabase = createApiSupabaseClient();
  const { data, error } = await supabase.from("topics").update(payload).eq("id", params.id).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = createApiSupabaseClient();
  const { error } = await supabase.from("topics").delete().eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
