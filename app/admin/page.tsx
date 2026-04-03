"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    CreditCard,
    IndianRupee,
    MessageSquare,
    Wrench,
    BookOpen,
    ArrowRight,
    TrendingUp,
    Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DashboardStats = {
    revenue: number;
    sales: number;
    tools: {
        total: number;
        active: number;
    };
    topicsCount: number;
    recentMessages: number;
};

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/dashboard');
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Failed to fetching dashboard data');
                setStats(json.data);
            } catch (err: unknown) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="space-y-6 pb-12 w-full animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between border-b border-brand-copper/10 pb-6 rounded-t-xl bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm px-6">
                <div>
                    <h1 className="text-3xl font-serif text-brand-dark tracking-tight">Overview</h1>
                    <p className="text-brand-dark/60 mt-1">Welcome back. Here's what's happening across SoulWealth Studio.</p>
                </div>
            </div>

            {error ? (
                <div className="mx-6 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    {error}
                </div>
            ) : (
                <>
                    {/* Top Metrics Row */}
                    <div className="px-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

                        {/* Total Revenue */}
                        <Card className="border-brand-copper/20 bg-white/60 backdrop-blur-sm shadow-warm-sm hover:shadow-warm-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-semibold uppercase tracking-widest text-brand-copper">Total Revenue</p>
                                    <div className="p-2 bg-brand-sand/40 rounded-lg">
                                        <IndianRupee className="w-5 h-5 text-brand-copper" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-light text-brand-dark">
                                        {loading ? "—" : `₹${stats?.revenue?.toLocaleString('en-IN') || 0}`}
                                    </span>
                                </div>
                                <p className="text-xs text-brand-dark/50 mt-2 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> Life-time earnings
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Sales */}
                        <Card className="border-brand-copper/20 bg-white/60 backdrop-blur-sm shadow-warm-sm hover:shadow-warm-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-semibold uppercase tracking-widest text-brand-copper">Tool Purchases</p>
                                    <div className="p-2 bg-brand-sand/40 rounded-lg">
                                        <CreditCard className="w-5 h-5 text-brand-copper" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-light text-brand-dark">
                                        {loading ? "—" : stats?.sales || 0}
                                    </span>
                                </div>
                                <p className="text-xs text-brand-dark/50 mt-2">Successful transactions</p>
                            </CardContent>
                        </Card>

                        {/* Total Tools */}
                        <Card className="border-brand-copper/20 bg-white/60 backdrop-blur-sm shadow-warm-sm hover:shadow-warm-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-semibold uppercase tracking-widest text-brand-copper">Active Tools</p>
                                    <div className="p-2 bg-brand-sand/40 rounded-lg">
                                        <Wrench className="w-5 h-5 text-brand-copper" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-light text-brand-dark">
                                        {loading ? "—" : stats?.tools?.active || 0}
                                    </span>
                                    <span className="text-sm text-brand-dark/40 font-medium">/ {loading ? "—" : stats?.tools?.total || 0}</span>
                                </div>
                                <p className="text-xs text-brand-dark/50 mt-2">Tools available in Studio</p>
                            </CardContent>
                        </Card>

                        {/* New Messages / Topics */}
                        <Card className="border-brand-copper/20 bg-white/60 backdrop-blur-sm shadow-warm-sm hover:shadow-warm-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-semibold uppercase tracking-widest text-brand-copper">Recent Activity</p>
                                    <div className="p-2 bg-brand-sand/40 rounded-lg">
                                        <Activity className="w-5 h-5 text-brand-copper" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-light text-brand-dark flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-brand-dark/40" />
                                            {loading ? "—" : stats?.recentMessages || 0}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider text-brand-dark/40 font-semibold mt-1">Inquiries</span>
                                    </div>
                                    <div className="w-[1px] h-8 bg-brand-copper/20"></div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xl font-light text-brand-dark flex items-center gap-2">
                                            {loading ? "—" : stats?.topicsCount || 0}
                                            <BookOpen className="w-4 h-4 text-brand-dark/40" />
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider text-brand-dark/40 font-semibold mt-1">Quizzes</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        

                    </div>

                    {/* Quick Links Row */}
                    <div className="px-6 mt-8">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-copper mb-4 px-1">Quick Actions</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                            <Link href="/admin/tools" className="group">
                                <div className="flex items-center justify-between p-4 bg-white border border-brand-copper/10 rounded-xl shadow-sm hover:shadow-warm-sm hover:border-brand-copper/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-olive/10 text-brand-olive rounded-lg group-hover:bg-brand-olive group-hover:text-white transition-colors">
                                            <Wrench className="w-4 h-4" />
                                        </div>
                                        <span className="font-serif text-brand-dark">Manage Tools</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-brand-dark/30 group-hover:text-brand-copper group-hover:-translate-x-1 transition-all" />
                                </div>
                            </Link>

                            <Link href="/admin/topics" className="group">
                                <div className="flex items-center justify-between p-4 bg-white border border-brand-copper/10 rounded-xl shadow-sm hover:shadow-warm-sm hover:border-brand-copper/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-green/10 text-brand-green rounded-lg group-hover:bg-brand-green group-hover:text-white transition-colors">
                                            <BookOpen className="w-4 h-4" />
                                        </div>
                                        <span className="font-serif text-brand-dark">Edit Quizzes</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-brand-dark/30 group-hover:text-brand-copper group-hover:-translate-x-1 transition-all" />
                                </div>
                            </Link>

                            <Link href="/admin/payments" className="group">
                                <div className="flex items-center justify-between p-4 bg-white border border-brand-copper/10 rounded-xl shadow-sm hover:shadow-warm-sm hover:border-brand-copper/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-copper/10 text-brand-copper rounded-lg group-hover:bg-brand-copper group-hover:text-white transition-colors">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <span className="font-serif text-brand-dark">View Sales</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-brand-dark/30 group-hover:text-brand-copper group-hover:-translate-x-1 transition-all" />
                                </div>
                            </Link>

                            <Link href="/admin/messages" className="group">
                                <div className="flex items-center justify-between p-4 bg-white border border-brand-copper/10 rounded-xl shadow-sm hover:shadow-warm-sm hover:border-brand-copper/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-dark/10 text-brand-dark rounded-lg group-hover:bg-brand-dark group-hover:text-white transition-colors">
                                            <MessageSquare className="w-4 h-4" />
                                        </div>
                                        <span className="font-serif text-brand-dark">Read Messages</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-brand-dark/30 group-hover:text-brand-copper group-hover:-translate-x-1 transition-all" />
                                </div>
                            </Link>

                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
