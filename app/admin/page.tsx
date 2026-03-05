"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, ArrowRight, FileText } from "lucide-react";
import type { Topic } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const defaultResults = {
  result_a_text: "Result A",
  result_b_text: "Result B",
  result_c_text: "Result C",
  result_d_text: "Result D"
};

export default function AdminDashboardPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [title, setTitle] = useState("");
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function loadTopics() {
    const res = await fetch("/api/topics", { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) {
      setErrorMessage(`Failed to load topics: ${json.error || "Unknown error"}`);
      return;
    }
    const data = json.data as Topic[];
    if (data) setTopics(data);
  }

  useEffect(() => {
    loadTopics();
  }, []);

  async function onCreateTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    const res = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        heading: heading.trim(),
        description: description.trim(),
        ...defaultResults
      })
    });
    const json = await res.json();

    setLoading(false);
    if (res.ok) {
      setTitle("");
      setHeading("");
      setDescription("");
      setSuccessMessage("Topic created successfully.");
      loadTopics();
      return;
    }
    setErrorMessage(`Create topic failed: ${json.error || "Unknown error"}`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.5fr,1fr]">
        <Card className="border-brand-copper/20 bg-white/60 backdrop-blur-sm shadow-warm-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-brand-dark font-serif font-medium tracking-tight">Topics Dashboard</CardTitle>
            <CardDescription className="text-brand-dark/60 text-base">Create and manage quiz topics from one workspace.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-brand-dark/70 sm:grid-cols-3">
            <div className="rounded-xl border border-brand-copper/10 bg-brand-sand/30 p-4 transition-colors hover:bg-brand-sand/50">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <FileText className="h-4 w-4 text-brand-copper" />
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-copper">Total Topics</p>
              </div>
              <p className="text-3xl font-light text-brand-dark">{topics.length}</p>
            </div>
            <div className="rounded-xl border border-brand-copper/10 bg-brand-sand/30 p-4 sm:col-span-2 transition-colors hover:bg-brand-sand/50">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-copper opacity-80">Quick Help</p>
              <p className="text-[14px] leading-relaxed text-brand-dark/80">Use the topic cards below to quickly jump into editing questions, adjusting flow, or modifying the result copy for each test.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-copper/20 bg-white shadow-warm-sm">
          <CardHeader>
            <CardTitle className="text-lg text-brand-dark font-serif font-medium">Create Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreateTopic} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-brand-dark/80">Topic Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Founder Mindset Quiz" className="border-brand-copper/20 focus-visible:ring-brand-copper" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heading" className="text-brand-dark/80">Topic Heading</Label>
                <Input
                  id="heading"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="e.g. Discover Your Founder Archetype"
                  className="border-brand-copper/20 focus-visible:ring-brand-copper"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-brand-dark/80">Topic Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short intro shown before the quiz starts"
                  className="border-brand-copper/20 focus-visible:ring-brand-copper"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-brand-olive text-white shadow-warm-sm hover:bg-brand-green">
                <Plus className="mr-2 h-4 w-4" />
                Create Topic
              </Button>
              {errorMessage ? <p className="text-sm text-destructive font-medium">{errorMessage}</p> : null}
              {successMessage ? <p className="text-sm text-brand-green font-medium">{successMessage}</p> : null}
            </form>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-brand-copper/10 pb-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-copper">All Topics</h2>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-sand/80 text-xs font-medium text-brand-dark/80">{topics.length}</span>
        </div>

        {topics.length === 0 ? (
          <Card className="border-dashed border-brand-copper/30 bg-brand-sand/10 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-brand-sand p-3 text-brand-copper">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-lg text-brand-dark font-serif">No topics yet</p>
              <p className="mt-2 text-sm text-brand-dark/60 max-w-[250px]">Create your first topic using the panel above to start generating quizzes.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {topics.map((topic) => (
              <Card key={topic.id} className="group relative overflow-hidden border-brand-copper/20 bg-white shadow-warm-sm transition-all hover:translate-y-[-2px] hover:shadow-card-hover">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-copper opacity-80" />
                <CardHeader className="pl-6">
                  <CardTitle className="line-clamp-2 text-lg font-serif text-brand-dark group-hover:text-brand-copper transition-colors">{topic.title}</CardTitle>
                  <CardDescription className="text-brand-dark/60">Manage questions and result copy.</CardDescription>
                </CardHeader>
                <CardContent className="pl-6 pt-2">
                  <Link href={`/admin/topics/${topic.id}`}>
                    <Button variant="outline" className="w-full justify-between border-brand-copper/20 text-brand-dark/80 hover:bg-brand-sand/40 hover:text-brand-dark">
                      Open Editor <ArrowRight className="ml-2 h-4 w-4 opacity-50 transition-transform group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-brand-copper" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
