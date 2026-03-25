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

    const supabase = createApiSupabaseClient();

    // --- Fetch the campaign ---
    const { data: campaign, error: campaignErr } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignErr || !campaign) {
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

    if (subErr) throw subErr;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers to send to." },
        { status: 400 }
      );
    }

    // --- Mark as 'sending' ---
    await supabase
      .from("newsletter_campaigns")
      .update({ status: "sending" })
      .eq("id", campaignId);

    // --- Send emails in BCC batches of 50 ---
    const emails = subscribers.map((s) => s.email);
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "";
    const BATCH_SIZE = 50;

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const bcc = emails.slice(i, i + BATCH_SIZE);
      await sendEmail({
        to: fromEmail,         // "To" = sender's own address; recipients are BCC'd
        subject: campaign.subject,
        html: campaign.html_content,
        bcc,
      });
    }

    // --- Mark as sent ---
    await supabase
      .from("newsletter_campaigns")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", campaignId);

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

    return NextResponse.json(
      { error: "Failed to send campaign. Please try again." },
      { status: 500 }
    );
  }
}
