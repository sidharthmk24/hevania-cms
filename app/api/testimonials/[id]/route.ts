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
