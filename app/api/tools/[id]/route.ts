import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createApiSupabaseClient();
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();

  const supabase = createApiSupabaseClient();
  const { data, error } = await supabase
    .from("tools")
    .update(body)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createApiSupabaseClient();
  const { error } = await supabase.from("tools").delete().eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
