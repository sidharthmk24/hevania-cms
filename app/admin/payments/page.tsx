"use client";

import { useEffect, useState } from "react";
import { CreditCard, ArrowDownToLine, CheckCircle2, Clock, XCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PaymentRow = {
    id?: string;
    phone: string;
    tool_name: string;
    amount: number;
    payment_id: string;
    status: string;
    created_at: string;
    email_sent: boolean;
};

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        
        async function loadPayments() {
            try {
                // cache: 'no-store' ensures we always fetch the latest data from the server
                const res = await fetch("/api/payments", { cache: "no-store" });
                if (!res.ok) {
                    throw new Error("Failed to fetch payments");
                }
                const json = await res.json();
                if (isMounted) {
                    setPayments(json.data || []);
                    setError(null);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        // Initial load
        loadPayments();

        // Set up polling interval to fetch live results every 10 seconds
        const intervalId = setInterval(loadPayments, 10000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    // Summary Metrics
    const totalRevenue = payments.reduce((acc, p) => (p.status === "successful" ? acc + Number(p.amount) : acc), 0);
    const successfulPayments = payments.filter(p => p.status === "successful").length;
    const pendingPayments = payments.filter(p => !p.status || p.status === "initiated" || p.status === "pending" || p.status === "failed" || p.status === "NULL").length;

    return (
        <div className="space-y-6 pb-12 w-full animate-fade-in">
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between border-b border-brand-copper/10 pb-6 rounded-t-xl bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm px-6">
                <div>
                    <h1 className="text-3xl font-serif text-brand-dark tracking-tight">Payments Log</h1>
                    <p className="text-brand-dark/60 mt-1">Review transactions and digital product purchases.</p>
                </div>
            </div>

            <div className="px-6 grid gap-4 md:grid-cols-3">
                {/* Metric Cards */}
                <Card className="border-brand-copper/20 bg-gradient-to-br from-white to-brand-sand/30 shadow-warm-sm hover:shadow-warm-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 text-brand-olive mb-2">
                            <div className="p-2 bg-brand-olive/10 rounded-lg"><ArrowDownToLine className="w-5 h-5" /></div>
                            <p className="text-xs font-semibold uppercase tracking-widest">Total Revenue</p>
                        </div>
                        <p className="text-4xl font-light text-brand-dark">₹{totalRevenue.toLocaleString()}</p>
                    </CardContent>
                </Card>

                <Card className="border-brand-copper/20 bg-gradient-to-br from-white to-brand-sand/30 shadow-warm-sm hover:shadow-warm-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 text-brand-green mb-2">
                            <div className="p-2 bg-brand-green/10 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
                            <p className="text-xs font-semibold uppercase tracking-widest">Successful</p>
                        </div>
                        <p className="text-4xl font-light text-brand-dark">{successfulPayments}</p>
                    </CardContent>
                </Card>

                <Card className="border-brand-copper/20 bg-gradient-to-br from-white to-brand-sand/30 shadow-warm-sm hover:shadow-warm-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 text-brand-copper mb-2">
                            <div className="p-2 bg-brand-copper/10 rounded-lg"><Clock className="w-5 h-5" /></div>
                            <p className="text-xs font-semibold uppercase tracking-widest">Pending / Failed</p>
                        </div>
                        <p className="text-4xl font-light text-brand-dark">{pendingPayments}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="px-6">
                <Card className="border-brand-copper/20 shadow-warm-lg bg-white overflow-hidden">
                    <div className="h-1.5 w-full bg-gradient-to-r from-brand-copper via-brand-gold to-brand-olive" />
                    <CardHeader className="bg-brand-sand/10 border-b border-brand-copper/10 pb-4">
                        <div className="flex items-center gap-2 text-brand-dark">
                            <CreditCard className="w-5 h-5 text-brand-copper" />
                            <CardTitle className="text-lg font-serif">Transaction History</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center text-brand-dark/50">Loading payments...</div>
                        ) : error ? (
                            <div className="p-12 text-center text-destructive">{error}</div>
                        ) : payments.length === 0 ? (
                            <div className="p-16 text-center text-brand-dark/50 flex flex-col items-center">
                                <FileText className="w-8 h-8 opacity-40 mb-3" />
                                <p>No payment records found yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="text-[11px] uppercase tracking-widest text-brand-copper bg-brand-sand/20 border-b border-brand-copper/10">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Date</th>
                                            <th className="px-6 py-4 font-semibold">Phone</th>
                                            <th className="px-6 py-4 font-semibold">Product</th>
                                            <th className="px-6 py-4 font-semibold">Amount</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 font-semibold">Payment ID</th>
                                            <th className="px-6 py-4 font-semibold">Email Delivered</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-copper/10 text-brand-dark/80">
                                        {payments.map((p, i) => {
                                            const isSuccess = p.status === "successful";
                                            const isFail = p.status === "failed";

                                            return (
                                                <tr key={i} className="hover:bg-brand-sand/10 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-brand-dark">
                                                        {new Date(p.created_at).toLocaleDateString(undefined, {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                        <span className="block text-xs font-normal opacity-60">
                                                            {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs">{p.phone || "—"}</td>
                                                    <td className="px-6 py-4 text-[13px]">{p.tool_name || "—"}</td>
                                                    <td className="px-6 py-4 font-semibold text-brand-dark">
                                                        {p.amount ? `₹${p.amount}` : "—"}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${isSuccess ? "bg-brand-green/10 text-brand-green border border-brand-green/20"
                                                            : isFail ? "bg-destructive/10 text-destructive border border-destructive/20"
                                                                : "bg-brand-copper/10 text-brand-copper border border-brand-copper/20"
                                                            }`}>
                                                            {p.status || "PENDING"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs opacity-70">
                                                        {p.payment_id || "—"}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {p.email_sent === true ? (
                                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Sent
                                                            </span>
                                                        ) : p.status === 'successful' && p.email_sent === false ? (
                                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                                                                <XCircle className="w-3.5 h-3.5" /> Failed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark/40">
                                                                <Clock className="w-3.5 h-3.5" /> —
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
