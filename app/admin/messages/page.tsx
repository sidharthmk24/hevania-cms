"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Mail, User, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ContactMessage = {
    id: string;
    full_name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
};

export default function MessagesAdminPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadMessages() {
        try {
            const res = await fetch("/api/messages");
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load messages");
            setMessages(json.data || []);
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMessages();
    }, []);

    return (
        <div className="space-y-6 pb-12 w-full animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between border-b border-brand-copper/10 pb-6 rounded-t-xl bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm px-6">
                <div>
                    <h1 className="text-3xl font-serif text-brand-dark tracking-tight">Contact Messages</h1>
                    <p className="text-brand-dark/60 mt-1">Review inquiries submitted through the Studio contact form.</p>
                </div>
            </div>

            {/* Error Feedback */}
            {error && (
                <div className="mx-6 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
                    {error}
                </div>
            )}

            {/* Messages List */}
            <div className="px-6">
                <Card className="border-brand-copper/20 shadow-warm-lg bg-white overflow-hidden">
                    <div className="h-1.5 w-full bg-gradient-to-r from-brand-copper via-brand-gold to-brand-olive" />
                    <CardHeader className="bg-brand-sand/10 border-b border-brand-copper/10 pb-4">
                        <div className="flex items-center gap-2 text-brand-dark">
                            <MessageSquare className="w-5 h-5 text-brand-copper" />
                            <CardTitle className="text-lg font-serif">Inbox ({messages.length})</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center text-brand-dark/50">Loading messages…</div>
                        ) : messages.length === 0 ? (
                            <div className="p-16 text-center text-brand-dark/50 flex flex-col items-center">
                                <CheckCircle className="w-8 h-8 opacity-40 mb-3 text-brand-olive" />
                                <p>You're all caught up! No messages yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-brand-copper/10">
                                {messages.map((message) => (
                                    <div key={message.id} className="p-6 hover:bg-brand-sand/5 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">

                                            {/* Sender Info */}
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-serif text-lg text-brand-dark">{message.full_name}</h3>
                                                    <span className="text-xs uppercase tracking-widest font-bold text-brand-copper bg-brand-copper/10 px-2 py-0.5 rounded border border-brand-copper/20">
                                                        {message.subject}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-brand-dark/60">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        <a href={`mailto:${message.email}`} className="hover:text-brand-copper transition-colors">
                                                            {message.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Date */}
                                            <div className="flex items-center gap-1.5 text-xs text-brand-dark/40 font-mono">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(message.created_at).toLocaleString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                                                })}
                                            </div>

                                        </div>

                                        {/* Message Body */}
                                        <div className="bg-white p-4 rounded-lg border border-brand-copper/10 shadow-sm">
                                            <p className="text-brand-dark/80 whitespace-pre-wrap text-sm leading-relaxed">
                                                {message.message}
                                            </p>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
