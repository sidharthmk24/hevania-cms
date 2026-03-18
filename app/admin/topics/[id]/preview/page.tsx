"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Topic, Question } from "@/lib/types";

type AnswerOption = "A" | "B" | "C" | "D";

export default function QuizPreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const topicId = params.id;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz State
  const [answers, setAnswers] = useState<Record<string, AnswerOption>>({});
  const [resultOption, setResultOption] = useState<AnswerOption | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [topicRes, questionRes] = await Promise.all([
          fetch(`/api/topics/${topicId}`, { cache: "no-store" }),
          fetch(`/api/topics/${topicId}/questions`, { cache: "no-store" })
        ]);

        if (!topicRes.ok || !questionRes.ok) {
          throw new Error("Failed to load quiz data");
        }

        const topicJson = await topicRes.json();
        const questionJson = await questionRes.json();

        setTopic(topicJson.data);
        setQuestions(questionJson.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (topicId) loadData();
  }, [topicId]);

  const handleOptionSelect = (questionId: string, option: AnswerOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const calculateResult = () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before seeing results.");
      return;
    }

    const counts: Record<AnswerOption, number> = { A: 0, B: 0, C: 0, D: 0 };
    Object.values(answers).forEach((val) => {
      counts[val]++;
    });

    let mode: AnswerOption = "A";
    (["A", "B", "C", "D"] as AnswerOption[]).forEach((key) => {
      if (counts[key] > counts[mode]) mode = key;
    });

    setResultOption(mode);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-olive border-t-transparent mx-auto mb-4" />
          <p className="text-brand-dark/60 font-medium">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9] p-6">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-2xl border border-brand-copper/20 shadow-warm-lg">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-brand-dark mb-2">Preview Error</h1>
          <p className="text-brand-dark/60 mb-6">{error || "Could not find this quiz."}</p>
          <Button onClick={() => router.back()} variant="outline" className="border-brand-copper/20">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Editor
          </Button>
        </div>
      </div>
    );
  }

  const getResultContent = (option: AnswerOption) => {
    const text = topic[`result_${option.toLowerCase()}_text` as keyof Topic] as string;
    const desc = topic[`result_${option.toLowerCase()}_desc` as keyof Topic] as string;
    
    if (!text) return { title: "Your Result", description: "" };
    
    const lines = text.split("\n").filter(Boolean);
    return {
      title: lines[0] || "Your Result",
      description: desc || lines.slice(1).join(" ") || ""
    };
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2D2D2D] pb-20">
      {/* Admin Preview Header */}
      <div className="bg-brand-dark text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href={`/admin/topics/${topicId}`} className="text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <span className="text-sm font-medium tracking-wide uppercase opacity-70">Preview Mode</span>
          <span className="h-4 w-px bg-white/20 hidden sm:block" />
          <h1 className="font-serif text-lg hidden sm:block">{topic.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-brand-olive px-2 py-0.5 rounded border border-white/10 font-bold uppercase tracking-tighter">Live UI Mock</span>
        </div>
      </div>

      <main className="max-w-[800px] mx-auto px-6 pt-16 md:pt-24">
        {!showResults ? (
          <>
            <div className="text-center mb-16 animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6 text-[#1A1A1A] leading-tight text-center">
                {topic.heading || topic.title}
              </h1>
              <p className="text-[#6A6A6A] font-sans text-lg md:text-xl max-w-[600px] mx-auto leading-relaxed text-center">
                {topic.description || "This is a gentle check-in, not a test. Answer honestly. There are no right or wrong answers."}
              </p>
            </div>

            <div className="bg-white p-8 md:p-14 rounded-3xl border border-[#EBE8DF] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden mb-12">
              <div className="absolute top-0 left-0 w-full h-2 bg-brand-copper" />
              
              {questions.map((q, index) => (
                <div key={q.id} className="mb-14 last:mb-0 relative animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex gap-4 mb-6">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-copper/10 text-brand-copper flex items-center justify-center font-bold text-sm font-sans">
                      {index + 1}
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-[#1A1A1A] pt-0.5 leading-snug">
                      {q.question_text}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-12">
                    {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                      const optionText = q[`option_${opt}` as keyof Question] as string;
                      if (!optionText) return null;
                      
                      const optionKey = opt.toUpperCase() as AnswerOption;
                      const isSelected = answers[q.id] === optionKey;

                      return (
                        <button
                          key={opt}
                          onClick={() => handleOptionSelect(q.id, optionKey)}
                          className={`flex items-center text-left p-5 rounded-xl border-2 transition-all duration-200 text-sm md:text-base font-sans leading-relaxed cursor-pointer
                            ${isSelected
                              ? "border-brand-green bg-brand-green/5 text-[#1A1A1A] shadow-[0_4px_12px_rgba(107,142,35,0.15)] font-medium"
                              : "border-[#EBE8DF] bg-white text-[#4A4A4A] hover:border-brand-green/40 hover:bg-[#F9FBF5] shadow-sm hover:shadow-md"
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? "border-brand-green" : "border-[#D6D6D6]"}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-brand-green rounded-full" />}
                          </div>
                          <span>{optionText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-14 pt-8 border-t border-[#EBE8DF] flex justify-center">
                <button
                  onClick={calculateResult}
                  disabled={Object.keys(answers).length < questions.length}
                  className="w-full md:w-auto min-w-[240px] flex items-center justify-center gap-2 py-4 px-10 text-white font-bold bg-brand-copper hover:bg-brand-copper/90 transition-all rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-warm-sm hover:shadow-card-hover hover:-translate-y-0.5 duration-200 text-lg"
                >
                  See My Results
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            {/* Results Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-brand-green/10 border border-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-brand-green" />
              </div>
              <p className="text-xs font-sans font-bold text-brand-copper uppercase tracking-widest mb-3">
                Your Personalized Result
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1A1A] mb-4 leading-tight">
                {getResultContent(resultOption!).title}
              </h2>
              <div className="h-1.5 w-24 bg-brand-gold/30 mx-auto rounded-full mb-8" />
              
              <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#EBE8DF] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] text-left leading-relaxed text-[#4A4A4A] text-lg">
                {getResultContent(resultOption!).description || "No result description provided for this outcome."}
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => {
                    setAnswers({});
                    setResultOption(null);
                    setShowResults(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  variant="outline"
                  className="h-12 px-8 border-brand-copper/20 text-brand-dark"
                >
                  Retake Quiz
                </Button>
                <Link href={`/admin/topics/${topicId}`}>
                  <Button className="h-12 px-8 bg-brand-dark hover:bg-brand-dark text-white">
                    Return to Editor
                  </Button>
                </Link>
              </div>
            </div>

            {/* Answer Summary Reveal */}
            <div className="mt-20 border-t border-brand-copper/10 pt-12">
              <p className="text-xs font-sans font-semibold text-brand-copper uppercase tracking-widest mb-8 text-center opacity-60">
                Your Answer Summary
              </p>
              <div className="opacity-60 pointer-events-none">
                {questions.map((q, index) => (
                  <div key={q.id} className="mb-10 last:mb-0">
                    <p className="font-serif text-lg font-bold mb-4 flex gap-3">
                       <span className="text-brand-copper/50">{index + 1}.</span> {q.question_text}
                    </p>
                    <div className="grid gap-2 pl-7">
                      <div className="p-3 bg-brand-sand/30 border border-brand-copper/10 rounded-lg text-sm flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-brand-green" />
                        <span className="font-medium text-brand-dark">
                          {q[`option_${answers[q.id].toLowerCase()}` as keyof Question] as string}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
