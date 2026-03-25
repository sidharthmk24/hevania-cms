import { NextRequest, NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createApiSupabaseClient();
    const { data, error, count } = await supabase
      .from("newsletter_campaigns")
      .select("*", { count: "exact" })
      .order("status", { ascending: true }) // drafts first
      .order("sent_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data, total: count ?? 0 });
  } catch (err: unknown) {
    console.error("[newsletter/campaigns GET]", err);
    return NextResponse.json({ error: "Failed to fetch campaigns." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { subject, html_content } = await req.json();
    if (!subject?.trim() || !html_content?.trim()) {
      return NextResponse.json(
        { error: "Subject and body are required." },
        { status: 400 }
      );
    }

    const supabase = createApiSupabaseClient();
    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .insert({ subject: subject.trim(), html_content: html_content.trim(), status: "draft" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: unknown) {
    console.error("[newsletter/campaigns POST]", err);
    return NextResponse.json({ error: "Failed to create campaign." }, { status: 500 });
  }
}
