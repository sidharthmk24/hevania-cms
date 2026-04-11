"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Image as ImageIcon,
    PlusCircle,
    ArrowRight,
    TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type DashboardStats = {
    totalImages: number;
    recentUploads: number;
    sectionsCount: number;
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
        <div className="space-y-6 pb-12 w-full animate-fade-in bg-transparent">
            {/* Header */}
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between border-b border-brand-green/10 pb-6 rounded-t-xl bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm px-6">
                <div>
                    <h1 className="text-3xl font-serif text-brand-forest tracking-tight">Overview</h1>
                    <p className="text-brand-forest/60 mt-1 italic">Welcome back. Manage HEVANIYA assets.</p>
                </div>
            </div>

            {error ? (
                <div className="mx-6 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    {error}
                </div>
            ) : (
                <>
                    {/* Top Metrics Row */}
                    <div className="px-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

                        <Card className="border-brand-green/20 bg-white/60 backdrop-blur-sm shadow-warm-sm hover:shadow-warm-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-semibold uppercase tracking-widest text-brand-forest/50">Total Images</p>
                                    <div className="p-2 bg-brand-green/10 rounded-lg">
                                        <ImageIcon className="w-5 h-5 text-brand-forest" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-light text-brand-forest">
                                        {loading ? "—" : stats?.totalImages || 0}
                                    </span>
                                </div>
                                <p className="text-xs text-brand-forest/40 mt-2 flex items-center gap-1 uppercase tracking-widest font-bold">
                                    Media Library
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-brand-green/20 bg-white/60 backdrop-blur-sm shadow-warm-sm hover:shadow-warm-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-semibold uppercase tracking-widest text-brand-forest/50">Recent Uploads</p>
                                    <div className="p-2 bg-brand-sage/20 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-brand-forest" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-light text-brand-forest">
                                        {loading ? "—" : stats?.recentUploads || 0}
                                    </span>
                                </div>
                                <p className="text-xs text-brand-forest/40 mt-2 uppercase tracking-widest font-bold">Past 7 days</p>
                            </CardContent>
                        </Card>

                        <Card className="border-brand-green/20 bg-white/60 backdrop-blur-sm shadow-warm-sm hover:shadow-warm-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-semibold uppercase tracking-widest text-brand-forest/50">Active Sections</p>
                                    <div className="p-2 bg-brand-gold/10 rounded-lg">
                                        <PlusCircle className="w-5 h-5 text-brand-gold" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-light text-brand-forest">
                                        {loading ? "—" : stats?.sectionsCount || 0}
                                    </span>
                                </div>
                                <p className="text-xs text-brand-forest/40 mt-2 uppercase tracking-widest font-bold">Site Modules</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Links Row */}
                    <div className="px-6 mt-8">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-forest/40 mb-4 px-1">Quick Actions</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                            <Link href="/admin/gallery" className="group">
                                <div className="flex items-center justify-between p-4 bg-white border border-brand-green/10 rounded-xl shadow-sm hover:shadow-warm-sm hover:border-brand-green/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-green/10 text-brand-forest rounded-lg group-hover:bg-brand-forest group-hover:text-white transition-colors">
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                        <span className="font-serif text-brand-forest">Media Gallery</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-brand-forest/30 group-hover:text-brand-gold group-hover:-translate-x-1 transition-all" />
                                </div>
                            </Link>

                            <Link href="/admin/gallery#upload" className="group">
                                <div className="flex items-center justify-between p-4 bg-white border border-brand-green/10 rounded-xl shadow-sm hover:shadow-warm-sm hover:border-brand-green/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                            <PlusCircle className="w-4 h-4" />
                                        </div>
                                        <span className="font-serif text-brand-forest">Upload New Media</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-brand-forest/30 group-hover:text-brand-gold group-hover:-translate-x-1 transition-all" />
                                </div>
                            </Link>

                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
