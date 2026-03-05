"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Topic } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight } from "lucide-react";

export default function QuizIndexPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const res = await fetch("/api/topics", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(`Failed to load quizzes: ${json.error || "Unknown error"}`);
        return;
      }
      const data = json.data as Topic[];
      if (data) setTopics(data);
    }
    run();
  }, []);

  return (
    <div className="container py-12 md:py-20 min-h-[calc(100vh-64px)] flex flex-col items-center">
      <div className="w-full max-w-5xl animate-fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-brand-sand rounded-xl mb-4 text-brand-copper border border-brand-copper/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="mb-4 text-4xl font-serif text-brand-dark tracking-tight">Available Quizzes</h1>
          <p className="text-brand-dark/60 text-lg max-w-xl mx-auto font-light">Select a topic below to preview the quiz experience.</p>
        </div>

        {errorMessage ? (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-center max-w-xl mx-auto">
            {errorMessage}
          </div>
        ) : null}

        {topics.length === 0 && !errorMessage ? (
          <div className="text-center py-16 bg-brand-sand/20 rounded-2xl border border-dashed border-brand-copper/30 max-w-2xl mx-auto">
            <p className="text-brand-dark/70 font-medium text-lg">No quizzes available yet.</p>
            <p className="text-brand-dark/50 mt-2">Create topics in the admin dashboard first.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <Card key={topic.id} className="group border-brand-copper/20 bg-white/80 backdrop-blur-sm shadow-warm-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover overflow-hidden flex flex-col h-full">
                <div className="h-1.5 w-full bg-gradient-to-r from-brand-copper/80 to-brand-gold/80 group-hover:from-brand-copper group-hover:to-brand-gold transition-colors" />
                <CardHeader className="flex-1 pt-6 px-6">
                  <CardTitle className="text-xl font-serif text-brand-dark line-clamp-2 leading-tight">
                    {topic.title}
                  </CardTitle>
                  {topic.description && (
                    <CardDescription className="text-brand-dark/60 line-clamp-3 mt-3">
                      {topic.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="mt-auto px-6 pb-6 pt-4">
                  <Link href={`/quiz/${topic.id}`} className="block w-full">
                    <Button className="w-full bg-brand-dark text-white hover:bg-brand-olive transition-colors group/btn h-12 shadow-warm-sm">
                      Start Quiz
                      <ChevronRight className="w-4 h-4 ml-1.5 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
