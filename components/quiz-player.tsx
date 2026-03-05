"use client";

import { useMemo, useState } from "react";
import type { AnswerOption, Question, Topic } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";

type Props = {
  topic: Topic;
  questions: Question[];
};

const optionKeys: AnswerOption[] = ["A", "B", "C", "D"];

export function QuizPlayer({ topic, questions }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(AnswerOption | null)[]>(Array(questions.length).fill(null));
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const current = questions[index];
  const currentValue = answers[index];
  const progress = ((index + 1) / questions.length) * 100;

  const result = useMemo(() => {
    if (!complete) return null;
    const counts: Record<AnswerOption, number> = { A: 0, B: 0, C: 0, D: 0 };
    answers.forEach((a) => {
      if (a) counts[a] += 1;
    });

    let mode: AnswerOption = "A";
    optionKeys.forEach((key) => {
      if (counts[key] > counts[mode]) mode = key;
    });

    if (mode === "A") return topic.result_a_text;
    if (mode === "B") return topic.result_b_text;
    if (mode === "C") return topic.result_c_text;
    return topic.result_d_text;
  }, [answers, complete, topic]);

  async function onNext() {
    if (!currentValue) return;
    if (index === questions.length - 1) {
      setSubmitting(true);
      setSubmitError(null);
      const finalAnswers = answers.filter(Boolean) as AnswerOption[];
      const questionIds = questions.map((q) => q.id);
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: topic.id,
          answers: finalAnswers,
          questionIds
        })
      });
      if (!res.ok) {
        const json = await res.json();
        setSubmitError(json.error || "Failed to save quiz response.");
      }
      setSubmitting(false);
      setComplete(true);
      return;
    }
    setIndex((prev) => prev + 1);
  }

  function onRestart() {
    setIndex(0);
    setAnswers(Array(questions.length).fill(null));
    setComplete(false);
  }

  if (questions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-12">
        <Card className="border-brand-copper/20 shadow-warm-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-brand-sand rounded-full flex items-center justify-center mb-4 text-brand-copper">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif text-brand-dark mb-2">No questions found</h3>
            <p className="text-brand-dark/60">This topic exists but doesn't have any questions yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (complete && result) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 animate-fade-in pb-12">
        <Card className="border-brand-copper/20 shadow-warm-lg bg-white overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-brand-copper via-brand-gold to-brand-olive" />
          <CardHeader className="pt-10 pb-6 text-center border-b border-brand-copper/10 bg-brand-sand/10">
            <div className="mx-auto inline-flex items-center justify-center p-3 bg-white rounded-full shadow-warm-sm border border-brand-copper/20 mb-5">
              <Sparkles className="w-6 h-6 text-brand-copper" />
            </div>
            <CardDescription className="text-xs uppercase tracking-widest font-semibold text-brand-copper mb-2">Your Results</CardDescription>
            <CardTitle className="text-3xl font-serif text-brand-dark leading-tight">{topic.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <div className="prose prose-brand max-w-none text-brand-dark/80 text-[17px] leading-relaxed">
              <p className="whitespace-pre-wrap">{result}</p>
            </div>

            {submitError ? (
              <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center">
                {submitError}
              </div>
            ) : null}

            <div className="mt-10 flex justify-center">
              <Button onClick={onRestart} variant="outline" className="border-brand-copper/30 text-brand-dark hover:bg-brand-sand/50 h-12 px-8">
                <RotateCcw className="w-4 h-4 mr-2" /> Take Quiz Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 pb-12">
      {/* Quiz Header & Progress */}
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl font-serif text-brand-dark text-center tracking-tight mb-2">{topic.heading || topic.title}</h2>

        <div className="flex items-center justify-between text-[13px] font-medium text-brand-dark/50 px-1">
          <span>Question {index + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Completed</span>
        </div>
        <Progress value={progress} className="h-2.5 bg-brand-sand shadow-inner" />
      </div>

      <div className="relative">
        <Card className="border-brand-copper/20 shadow-warm-md bg-white relative z-10 transition-all duration-300">
          <CardHeader className="pt-8 pb-6 px-8 border-b border-brand-copper/10">
            <CardTitle className="text-2xl font-serif text-brand-dark leading-snug">{current.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <RadioGroup
              value={currentValue || undefined}
              onValueChange={(value) => {
                if (!optionKeys.includes(value as AnswerOption)) return;
                const clone = [...answers];
                clone[index] = value as AnswerOption;
                setAnswers(clone);
              }}
              className="space-y-3.5"
            >
              {[
                { id: "A", text: current.option_a },
                { id: "B", text: current.option_b },
                { id: "C", text: current.option_c },
                { id: "D", text: current.option_d }
              ].map((opt) => (
                <Label
                  key={opt.id}
                  htmlFor={opt.id}
                  className={`
                    flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer w-full group
                    ${currentValue === opt.id
                      ? "border-brand-olive bg-brand-olive/5 text-brand-dark shadow-warm-sm"
                      : "border-brand-copper/15 hover:border-brand-copper/40 hover:bg-brand-sand/30 text-brand-dark/80"}
                  `}
                >
                  <div className="flex items-center justify-center w-5 h-5 mr-4 relative flex-shrink-0">
                    <RadioGroupItem value={opt.id} id={opt.id} className="w-5 h-5 border-[1.5px] border-brand-copper/40 text-brand-olive fill-brand-olive data-[state=checked]:border-brand-olive" />
                  </div>
                  <span className="text-[16px] leading-relaxed font-medium">{opt.text}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Decorative backdrop cards for depth */}
        <div className="absolute top-3 left-3 right-[-12px] bottom-[-12px] bg-brand-sand/50 rounded-xl border border-brand-copper/10 -z-10" />
        <div className="absolute top-6 left-6 right-[-24px] bottom-[-24px] bg-brand-copper/5 rounded-xl border border-brand-copper/10 -z-20" />
      </div>

      <div className="mt-10 flex justify-between items-center px-2">
        <Button
          variant="ghost"
          onClick={() => setIndex(prev => Math.max(0, prev - 1))}
          disabled={index === 0}
          className="text-brand-dark/60 hover:text-brand-dark hover:bg-brand-sand/50 disabled:opacity-30"
        >
          ← Previous
        </Button>
        <Button
          disabled={!currentValue || submitting}
          onClick={onNext}
          className="h-12 px-8 bg-brand-dark hover:bg-brand-olive text-white shadow-warm-md group transition-all"
        >
          {index === questions.length - 1 ? (
            submitting ? "Finishing..." : "See Results"
          ) : (
            <>Next Question <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
