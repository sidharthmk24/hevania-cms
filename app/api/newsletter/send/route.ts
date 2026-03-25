import { NextRequest, NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  let campaignId: string | undefined;

  try {
    const body = await req.json();
    campaignId = body.campaignId;

    if (!campaignId) {
      return NextResponse.json({ error: "campaignId is required." }, { status: 400 });
    }

    // --- Env Check ---
    const requiredEnv = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "SMTP_HOST",
      "SMTP_USER",
      "SMTP_PASSWORD",
    ];
    const missing = requiredEnv.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      console.error("[newsletter/send] Missing environment variables:", missing);
      return NextResponse.json(
        { error: `Server configuration error: missing ${missing.join(", ")}` },
        { status: 500 }
      );
    }

    const supabase = createApiSupabaseClient();

    // --- Fetch the campaign ---
    const { data: campaign, error: campaignErr } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignErr || !campaign) {
      console.error("[newsletter/send] Campaign not found:", campaignId, campaignErr);
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    }

    if (campaign.status === "sent") {
      return NextResponse.json(
        { error: "This campaign has already been sent." },
        { status: 409 }
      );
    }

    // --- Fetch all active subscribers ---
    const { data: subscribers, error: subErr } = await supabase
      .from("subscribers")
      .select("email")
      .eq("status", "active");

    if (subErr) {
      console.error("[newsletter/send] Error fetching subscribers:", subErr);
      throw subErr;
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers to send to." },
        { status: 400 }
      );
    }

    // --- Mark as 'sending' ---
    const { error: updateErr } = await supabase
      .from("newsletter_campaigns")
      .update({ status: "sending" })
      .eq("id", campaignId);

    if (updateErr) {
      console.error("[newsletter/send] Error updating campaign status to sending:", updateErr);
      throw updateErr;
    }

    // --- Send emails in BCC batches of 50 ---
    const emails = subscribers.map((s) => s.email);
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "";
    const BATCH_SIZE = 50;

    console.log(`[newsletter/send] Sending campaign '${campaign.subject}' to ${emails.length} subscribers in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const bcc = emails.slice(i, i + BATCH_SIZE);
      try {
        await sendEmail({
          to: fromEmail,         // "To" = sender's own address; recipients are BCC'd
          subject: campaign.subject,
          html: campaign.html_content,
          bcc,
        });
      } catch (mailErr) {
        console.error(`[newsletter/send] Failed to send email batch ${i / BATCH_SIZE + 1}:`, mailErr);
        throw new Error("Failed to send email via SMTP. Please check your credentials.");
      }
    }

    // --- Mark as sent ---
    const { error: finalErr } = await supabase
      .from("newsletter_campaigns")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", campaignId);

    if (finalErr) {
      console.error("[newsletter/send] Error updating campaign status tracking:", finalErr);
      // We don't throw here because emails WERE sent
    }

    return NextResponse.json({
      message: `Campaign sent successfully to ${emails.length} subscriber${emails.length !== 1 ? "s" : ""}.`,
      count: emails.length,
    });
  } catch (err: unknown) {
    console.error("[newsletter/send]", err);

    // Best-effort: mark campaign as failed
    if (campaignId) {
      try {
        const supabase = createApiSupabaseClient();
        await supabase
          .from("newsletter_campaigns")
          .update({ status: "failed" })
          .eq("id", campaignId);
      } catch { /* ignore */ }
    }

    const message = err instanceof Error ? err.message : "Failed to send campaign. Please try again.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
