import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload: array expected" }, { status: 400 });
    }

    const supabase = createApiSupabaseClient();
    
    // Instead of upserting a single item, we resolve promises to update display_order
    const updatePromises = body.map((item) => 
      supabase
        .from("tools")
        .update({ display_order: item.display_order })
        .eq("id", item.id)
    );
    
    const results = await Promise.all(updatePromises);
    const errors = results.filter(r => r.error).map(r => r.error);
    
    if (errors.length > 0) {
      console.error("Errors reordering tools:", errors);
      return NextResponse.json({ error: "Some updates failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
