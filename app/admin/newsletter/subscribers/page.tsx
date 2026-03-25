"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Users, ChevronLeft, ChevronRight, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Subscriber = {
  id: string;
  email: string;
  subscribed_at: string;
  status: "active" | "unsubscribed";
};

type ApiResponse = {
  data: Subscriber[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const LIMIT = 20;

export default function SubscribersPage() {
  const [data, setData] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscribers = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/newsletter/subscribers?page=${p}&limit=${LIMIT}`);
      const json: ApiResponse = await res.json();
      if (!res.ok) throw new Error((json as unknown as { error: string }).error || "Failed to load");
      setData(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
      setPage(json.page);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscribers(1); }, [fetchSubscribers]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1 p-4 md:px-6 border-b border-brand-copper/10 pb-6 bg-white/40 rounded-t-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm">
        <Link
          href="/admin/newsletter"
          className="inline-flex items-center gap-1.5 text-xs text-brand-dark/50 hover:text-brand-copper transition-colors mb-3 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Newsletter
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-brand-dark tracking-tight">Subscribers</h1>
            <p className="text-brand-dark/60 mt-1">
              {loading ? "Loading…" : `${total.toLocaleString()} total subscriber${total !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSubscribers(page)}
            disabled={loading}
            className="border-brand-copper/20 text-brand-dark/60 hover:bg-brand-sand/50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="px-6">
        <Card className="border-brand-copper/20 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-copper/10 bg-brand-sand/30">
                    <th className="text-left px-4 py-3 font-semibold text-brand-dark/70 uppercase tracking-wider text-xs">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-dark/70 uppercase tracking-wider text-xs">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-dark/70 uppercase tracking-wider text-xs">Subscribed On</th>
                    <th className="text-center px-4 py-3 font-semibold text-brand-dark/70 uppercase tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-brand-copper/5">
                        <td className="px-4 py-3"><div className="h-4 w-8 bg-brand-sand/60 rounded animate-pulse" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-48 bg-brand-sand/60 rounded animate-pulse" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-24 bg-brand-sand/60 rounded animate-pulse" /></td>
                        <td className="px-4 py-3 flex justify-center"><div className="h-5 w-16 bg-brand-sand/60 rounded-full animate-pulse" /></td>
                      </tr>
                    ))
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-brand-dark/40">
                        <Users className="w-8 h-8 mx-auto mb-2 text-brand-copper/30" />
                        No subscribers yet.
                      </td>
                    </tr>
                  ) : (
                    data.map((sub, idx) => (
                      <tr
                        key={sub.id}
                        className="border-b border-brand-copper/5 hover:bg-brand-sand/20 transition-colors"
                      >
                        <td className="px-4 py-3 text-brand-dark/40 font-mono text-xs">
                          {(page - 1) * LIMIT + idx + 1}
                        </td>
                        <td className="px-4 py-3 text-brand-dark font-medium">{sub.email}</td>
                        <td className="px-4 py-3 text-brand-dark/60">{formatDate(sub.subscribed_at)}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              sub.status === "active"
                                ? "bg-brand-olive/10 text-brand-olive"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {sub.status === "active" ? "Active" : "Unsubscribed"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="px-6 flex items-center justify-between">
          <p className="text-sm text-brand-dark/50">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => fetchSubscribers(page - 1)}
              className="border-brand-copper/20 text-brand-dark/60 hover:bg-brand-sand/50"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => fetchSubscribers(page + 1)}
              className="border-brand-copper/20 text-brand-dark/60 hover:bg-brand-sand/50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
