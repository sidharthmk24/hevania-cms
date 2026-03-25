"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Send, Plus, X, CheckCircle, AlertCircle, Clock, MailCheck, Loader2, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Campaign = {
  id: string;
  subject: string;
  html_content: string;
  sent_at: string | null;
  status: "draft" | "sending" | "sent" | "failed";
};

type SendStatus = "idle" | "confirm" | "sending" | "success" | "error";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compose form state
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Preview state
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);

  // Send state
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [sendMessage, setSendMessage] = useState("");

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter/campaigns");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load campaigns");
      setCampaigns(json.data || []);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  async function handleSaveDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) { setFormError("Subject is required."); return; }
    if (!body.trim()) { setFormError("Body is required."); return; }
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch("/api/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html_content: body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      setShowForm(false);
      setSubject("");
      setBody("");
      fetchCampaigns();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSend(campaign: Campaign) {
    if (sendStatus === "confirm") {
      // Confirmed — proceed
      setSendStatus("sending");
      try {
        const res = await fetch("/api/newsletter/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId: campaign.id }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Send failed");
        setSendStatus("success");
        setSendMessage(json.message || "Campaign sent!");
        fetchCampaigns();
      } catch (err: unknown) {
        setSendStatus("error");
        setSendMessage((err as Error).message);
      }
    } else {
      // Ask for confirmation
      setSendingId(campaign.id);
      setSendStatus("confirm");
      setSendMessage("");
    }
  }

  function resetSend() {
    setSendingId(null);
    setSendStatus("idle");
    setSendMessage("");
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  const statusBadge = (s: Campaign["status"]) => {
    const map = {
      draft:   { label: "Draft",   cls: "bg-brand-sand text-brand-dark/60",   Icon: Clock },
      sending: { label: "Sending", cls: "bg-blue-100 text-blue-700",           Icon: Loader2 },
      sent:    { label: "Sent",    cls: "bg-brand-olive/10 text-brand-olive", Icon: MailCheck },
      failed:  { label: "Failed",  cls: "bg-destructive/10 text-destructive", Icon: AlertCircle },
    };
    const { label, cls, Icon } = map[s] || map.draft;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
        <Icon className={`w-3 h-3 ${s === "sending" ? "animate-spin" : ""}`} />
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col p-4 md:px-6 border-b border-brand-copper/10 pb-6 bg-white/40 rounded-t-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm gap-3">
        <Link
          href="/admin/newsletter"
          className="inline-flex items-center gap-1.5 text-xs text-brand-dark/50 hover:text-brand-copper transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Newsletter
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-brand-dark tracking-tight">Campaigns</h1>
            <p className="text-brand-dark/60 mt-1">Compose and send email campaigns to all active subscribers.</p>
          </div>
          <Button
            onClick={() => { setShowForm(true); resetSend(); }}
            className="bg-brand-copper hover:bg-brand-copper/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Compose Form */}
      {showForm && (
        <div className="px-6">
          <Card className="border-brand-copper/20 bg-white">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-serif text-xl text-brand-dark">New Campaign</h2>
                <button onClick={() => { setShowForm(false); setSubject(""); setBody(""); setFormError(""); }}
                  className="text-brand-dark/40 hover:text-brand-dark transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDraft} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-brand-copper mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. This week in SoulWealth Studio…"
                    className="w-full border border-brand-copper/20 rounded-lg px-3 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-1 focus:ring-brand-copper/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-brand-copper mb-2">
                    Email Body <span className="normal-case font-normal text-brand-dark/40"></span>
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={12}
                    placeholder={"eg: Hello, Here's what I've been thinking about this week…"}
                    className="w-full border border-brand-copper/20 rounded-lg px-3 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 font-mono resize-y focus:outline-none focus:ring-1 focus:ring-brand-copper/40"
                  />
                  <p className="mt-1 text-xs text-brand-dark/40">Tip: write HTML for rich formatting, or paste plain text for a simple email.</p>
                </div>

                {formError && (
                  <p className="text-sm text-destructive">{formError}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setSubject(""); setBody(""); }}
                    className="border-brand-copper/20 text-brand-dark/60 hover:bg-brand-sand/50">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}
                    className="bg-brand-copper hover:bg-brand-copper/90 text-white">
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : "Save as Draft"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-6 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Campaigns List */}
      <div className="px-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-brand-sand/40 animate-pulse" />
          ))
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 text-brand-dark/40">
            <Send className="w-8 h-8 mx-auto mb-2 text-brand-copper/30" />
            <p>No campaigns yet. Create your first one above.</p>
          </div>
        ) : (
          campaigns.map((c) => (
            <Card key={c.id} className="border-brand-copper/10 bg-white hover:shadow-warm-sm transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-serif text-brand-dark truncate">{c.subject}</p>
                    {statusBadge(c.status)}
                  </div>
                  <p className="text-xs text-brand-dark/40 mt-1">
                    {c.status === "sent" ? `Sent on ${formatDate(c.sent_at)}` : "Not yet sent"}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Preview */}
                  <Button variant="outline" size="sm"
                    onClick={() => setPreviewCampaign(c)}
                    className="border-brand-copper/20 text-brand-dark/60 hover:bg-brand-sand/50">
                    <Eye className="w-4 h-4" />
                  </Button>

                  {/* Send / Confirm / Status */}
                  {c.status === "sent" ? (
                    <span className="inline-flex items-center gap-1 text-xs text-brand-olive font-semibold">
                      <CheckCircle className="w-4 h-4" /> Sent
                    </span>
                  ) : (
                    <>
                      {sendingId === c.id && sendStatus === "confirm" && (
                        <span className="text-xs text-brand-dark/60">Send to all subscribers?</span>
                      )}
                      {sendingId === c.id && sendStatus === "success" && (
                        <span className="text-xs text-brand-olive font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> {sendMessage}
                        </span>
                      )}
                      {sendingId === c.id && sendStatus === "error" && (
                        <span className="text-xs text-destructive font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {sendMessage}
                        </span>
                      )}
                      {sendingId === c.id && sendStatus === "confirm" && (
                        <Button variant="outline" size="sm" onClick={resetSend}
                          className="border-brand-copper/20 text-brand-dark/60 hover:bg-brand-sand/50">
                          Cancel
                        </Button>
                      )}
                      <Button
                        size="sm"
                        disabled={sendingId === c.id && (sendStatus === "sending" || sendStatus === "success")}
                        onClick={() => handleSend(c)}
                        className={`text-white ${sendingId === c.id && sendStatus === "confirm"
                          ? "bg-brand-olive hover:bg-brand-olive/90"
                          : "bg-brand-copper hover:bg-brand-copper/90"
                        }`}
                      >
                        {sendingId === c.id && sendStatus === "sending"
                          ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Sending…</>
                          : sendingId === c.id && sendStatus === "confirm"
                          ? <><Send className="w-4 h-4 mr-1" />Confirm Send</>
                          : <><Send className="w-4 h-4 mr-1" />Send</>}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] relative flex flex-col">
            {/* Close button - floating top right */}
            <button 
              onClick={() => setPreviewCampaign(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full border border-brand-copper/10 text-brand-dark/40 hover:bg-brand-sand/50 hover:text-brand-dark transition-all z-10 shadow-sm"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth">
              <div className="mx-auto max-w-full overflow-wrap-break-word">
                <p className="text-[10px] uppercase tracking-widest text-brand-copper font-semibold mb-6">Email Preview</p>
                <h1 className="text-2xl font-serif text-brand-dark mb-8 border-b border-brand-copper/10 pb-4">{previewCampaign.subject}</h1>
                <div
                  className="text-brand-dark leading-relaxed whitespace-pre-wrap break-words space-y-4"
                  dangerouslySetInnerHTML={{ __html: previewCampaign.html_content }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
