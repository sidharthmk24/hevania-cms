import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const supabase = createApiSupabaseClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const body = await request.json();
  const name = String(body?.name || "").trim();
  const comment = String(body?.comment || "").trim();
  const rating = Number(body?.rating) || 5;
  const image_url = body?.image_url || null;

  if (!name || !comment) {
    return NextResponse.json({ error: "Name and comment are required." }, { status: 400 });
  }

  const supabase = createApiSupabaseClient();
  const payload = {
    name,
    comment,
    rating,
    image_url,
  };

  const { data, error } = await supabase
    .from("testimonials")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
