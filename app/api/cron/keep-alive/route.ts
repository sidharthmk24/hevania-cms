import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const startTime = Date.now();

  // Optional: check CRON_SECRET for authorized invocation if configured (e.g., from Vercel)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized cron request" },
      { status: 401 }
    );
  }

  try {
    const supabase = createApiSupabaseClient();

    // Query lightweight table to actively generate database and PostgREST traffic
    const { data, error, count } = await supabase
      .from("newsletter_campaigns")
      .select("id", { count: "exact", head: true });

    const latencyMs = Date.now() - startTime;

    if (error && error.code !== "42P01") {
      // If error is something other than missing table (which still hit DB)
      return NextResponse.json(
        {
          success: false,
          message: "Supabase contacted but returned database error",
          error: error.message,
          latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Supabase keep-alive ping successful. Inactivity timer reset.",
      rowCount: count ?? 0,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to ping Supabase",
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
