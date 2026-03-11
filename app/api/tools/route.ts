import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createApiSupabaseClient();
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = String(body?.title || "").trim();

  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const supabase = createApiSupabaseClient();
  const payload = {
    title,
    description: String(body?.description || "").trim(),
    price_inr: body?.price_inr ?? null,
    price_usd: String(body?.price_usd || "").trim() || null,
    is_free: Boolean(body?.is_free),
    button_text: String(body?.button_text || "Download").trim(),
    image_url: String(body?.image_url || "").trim() || null,
    bg_color: String(body?.bg_color || "bg-white").trim(),
    text_color: String(body?.text_color || "text-[#1A1A1A]").trim(),
    is_bundle: Boolean(body?.is_bundle),
    pdf_key: String(body?.pdf_key || "").trim() || null,
    display_order: Number(body?.display_order ?? 0),
    is_active: body?.is_active !== false,
  };

  const { data, error } = await supabase.from("tools").insert(payload).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
