"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, Trash2, ChevronLeft, Save, LayoutTemplate, HelpCircle, BarChart3, ChevronDown, Eye } from "lucide-react";
import type { Question, Topic } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuizPreview } from "@/components/QuizPreview";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TopicEditorPage() {
  const params = useParams<{ id: string }>();
  const topicId = params.id;
  const [topic, setTopic] = useState<Topic | null>(null);
  const [topicForm, setTopicForm] = useState<Partial<Topic>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [edits, setEdits] = useState<Record<string, Question>>({});
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [questionStats, setQuestionStats] = useState<
    Array<{ id: string; question_text: string; order: number; counts: { A: number; B: number; C: number; D: number } }>
  >([]);
  const [numOptions, setNumOptions] = useState<number>(4);
  const [isNumOptionsOpen, setIsNumOptionsOpen] = useState(false);

  const nextOrder = useMemo(() => (questions.length ? Math.max(...questions.map((q) => q.order)) + 1 : 1), [questions]);

  async function loadData() {
    const [topicRes, questionRes] = await Promise.all([
      fetch(`/api/topics/${topicId}`, { cache: "no-store" }),
      fetch(`/api/topics/${topicId}/questions`, { cache: "no-store" })
    ]);
    const topicJson = await topicRes.json();
    const questionJson = await questionRes.json();

    if (!topicRes.ok) {
      setErrorMessage(`Failed to load topic: ${topicJson.error || "Unknown error"}`);
      return;
    }
    if (!questionRes.ok) {
      setErrorMessage(`Failed to load questions: ${questionJson.error || "Unknown error"}`);
      return;
    }
    const topicData = topicJson.data as Topic;
    const questionData = (questionJson.data || []) as Question[];
    if (topicData) {
      setTopic(topicData);
      setTopicForm(topicData);
    }
    if (questionData) {
      setQuestions(questionData);
      setEdits(
        questionData.reduce<Record<string, Question>>((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {})
      );
    }
  }

  useEffect(() => {
    if (topicId) loadData();
  }, [topicId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!(e.target as Element).closest(".num-options-dropdown")) {
        setIsNumOptionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadAnalytics() {
      const res = await fetch(`/api/topics/${topicId}/analytics`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(`Failed to load analytics: ${json.error || "Unknown error"}`);
        return;
      }
      setAttemptsCount(json.data?.attempts || 0);
      setQuestionStats(json.data?.questions || []);
    }
    if (topicId) loadAnalytics();
  }, [topicId, questions.length]);

  async function onAddQuestion(formData: FormData) {
    setErrorMessage(null);
    setSuccessMessage(null);
    const payload = {
      topic_id: topicId,
      question_text: String(formData.get("question_text") || ""),
      option_a: String(formData.get("option_a") || ""),
      option_b: numOptions >= 2 ? String(formData.get("option_b") || "") : "",
      option_c: numOptions >= 3 ? String(formData.get("option_c") || "") : "",
      option_d: numOptions >= 4 ? String(formData.get("option_d") || "") : "",
      order: Number(formData.get("order") || nextOrder)
    };

    const res = await fetch(`/api/topics/${topicId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (res.ok) {
      setOpen(false);
      setNumOptions(4); // Reset form state
      setSuccessMessage("Question added successfully.");
      loadData();
      return;
    }
    setErrorMessage(`Add question failed: ${json.error || "Unknown error"}`);
  }

  async function onDeleteQuestion(id: string) {
    setErrorMessage(null);
    setSuccessMessage(null);
    const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      setErrorMessage(`Delete question failed: ${json.error || "Unknown error"}`);
      return;
    }
    setSuccessMessage("Question deleted.");
    loadData();
  }

  async function onUpdateQuestion(id: string) {
    setErrorMessage(null);
    setSuccessMessage(null);
    const edit = edits[id];
    if (!edit) return;
    const res = await fetch(`/api/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_text: edit.question_text,
        option_a: edit.option_a,
        option_b: edit.option_b,
        option_c: edit.option_c,
        option_d: edit.option_d,
        order: edit.order
      })
    });
    const json = await res.json();
    if (!res.ok) {
      setErrorMessage(`Update question failed: ${json.error || "Unknown error"}`);
      return;
    }
    setSuccessMessage("Question updated.");
    loadData();
  }

  async function onSaveTopicResults() {
    setErrorMessage(null);
    setSuccessMessage(null);
    const res = await fetch(`/api/topics/${topicId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: topicForm.description || "",
        result_a_text: topicForm.result_a_text || "",
        result_b_text: topicForm.result_b_text || "",
        result_c_text: topicForm.result_c_text || "",
        result_d_text: topicForm.result_d_text || ""
      })
    });
    const json = await res.json();
    if (!res.ok) {
      setErrorMessage(`Save topic responses failed: ${json.error || "Unknown error"}`);
      return;
    }
    setTopic(json.data);
    setSuccessMessage("Result responses saved.");
  }

  if (showPreview) {
    return (
      <div className="container mx-auto py-6">
        <QuizPreview topicId={topicId} onBack={() => setShowPreview(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between border-b border-brand-copper/10 pb-6 rounded-t-xl bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm px-6">
        <div>
          <Link href="/admin/topics" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-copper hover:text-brand-dark transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Link>
          <h1 className="mt-2 text-3xl font-serif text-brand-dark tracking-tight">{topic?.title || "Topic Editor"}</h1>
        </div>

        <div className="flex items-center gap-3 md:w-auto w-full">
          <Button 
            variant="outline" 
            className="border-brand-copper/20 text-brand-dark bg-white hover:bg-brand-sand/40 w-full md:w-auto"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="mr-2 h-4 w-4" /> Preview Quiz
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-olive text-white hover:bg-brand-green shadow-warm-sm transition-all md:w-auto flex-1 group">
                <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" /> Add Question
              </Button>
            </DialogTrigger>
          <DialogContent className="border-brand-copper/20 shadow-warm-lg bg-brand-sand/10 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-brand-dark tracking-tight">Add New Question</DialogTitle>
              <DialogDescription className="text-brand-dark/60">Create a multiple choice question with up to 4 options.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                onAddQuestion(formData);
              }}
              className="grid gap-4 pt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="question_text" className="text-brand-dark font-medium">Question</Label>
                <Input id="question_text" name="question_text" required className="border-brand-copper/20 bg-white focus-visible:ring-brand-olive" placeholder="e.g. How do you feel about tracking expenses?" />
              </div>
              <div className="space-y-1.5 flex items-center justify-between relative">
                <div>
                  <Label htmlFor="num_options" className="text-brand-dark font-medium block">Number of Options</Label>
                  <span className="text-xs text-brand-dark/60">Choose between 2 to 4 options.</span>
                </div>
                <div className="relative num-options-dropdown">
                  <button
                    type="button"
                    onClick={() => setIsNumOptionsOpen(!isNumOptionsOpen)}
                    className="flex items-center justify-between border border-brand-copper/20 rounded-md py-2 px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-olive w-48 shadow-sm transition-colors hover:border-brand-copper/40"
                  >
                    <span className="font-medium text-brand-dark/90">{numOptions} Options <span className="text-brand-dark/50 font-normal ml-1">{numOptions === 2 ? "(A, B)" : numOptions === 3 ? "(A, B, C)" : "(A, B, C, D)"}</span></span>
                    <ChevronDown className={`w-4 h-4 text-brand-dark/50 transition-transform duration-200 ${isNumOptionsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isNumOptionsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-brand-copper/20 rounded-md shadow-lg overflow-hidden z-50 animate-fade-in origin-top">
                      {[2, 3, 4].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => { setNumOptions(num); setIsNumOptionsOpen(false); }}
                          className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${numOptions === num ? 'bg-brand-olive/10 text-brand-olive font-medium' : 'text-brand-dark hover:bg-brand-sand/40'}`}
                        >
                          {num} Options <span className={numOptions === num ? "text-brand-olive/60 font-normal ml-1" : "text-brand-dark/50 ml-1"}>{num === 2 ? "(A, B)" : num === 3 ? "(A, B, C)" : "(A, B, C, D)"}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {numOptions >= 1 && (
                  <div className="space-y-1.5">
                    <Label htmlFor="option_a" className="text-brand-dark/80 text-xs font-semibold uppercase tracking-wider">Option A</Label>
                    <Input id="option_a" name="option_a" required className="border-brand-copper/20 text-[13px]" placeholder="Type response A..." />
                  </div>
                )}
                {numOptions >= 2 && (
                  <div className="space-y-1.5">
                    <Label htmlFor="option_b" className="text-brand-dark/80 text-xs font-semibold uppercase tracking-wider">Option B</Label>
                    <Input id="option_b" name="option_b" required className="border-brand-copper/20 text-[13px]" placeholder="Type response B..." />
                  </div>
                )}
                {numOptions >= 3 && (
                  <div className="space-y-1.5">
                    <Label htmlFor="option_c" className="text-brand-dark/80 text-xs font-semibold uppercase tracking-wider">Option C</Label>
                    <Input id="option_c" name="option_c" required className="border-brand-copper/20 text-[13px]" placeholder="Type response C..." />
                  </div>
                )}
                {numOptions >= 4 && (
                  <div className="space-y-1.5">
                    <Label htmlFor="option_d" className="text-brand-dark/80 text-xs font-semibold uppercase tracking-wider">Option D</Label>
                    <Input id="option_d" name="option_d" required className="border-brand-copper/20 text-[13px]" placeholder="Type response D..." />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order" className="text-brand-dark font-medium">Display Order</Label>
                <Input id="order" name="order" type="number" defaultValue={nextOrder} required className="border-brand-copper/20 w-32" />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full bg-brand-olive hover:bg-brand-green">Save Question</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      <div className="px-6 space-y-3">
        {errorMessage ? <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg animate-fade-in">{errorMessage}</div> : null}
        {successMessage ? <div className="p-3 bg-brand-olive/10 border border-brand-olive/20 text-brand-olive text-sm font-medium rounded-lg animate-fade-in">{successMessage}</div> : null}
      </div>

      <div className="grid gap-6 px-6 lg:grid-cols-12">

        {/* Topic Settings (Left Column) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-brand-copper/20 bg-white shadow-warm-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-brand-copper to-brand-gold" />
            <CardHeader className="bg-brand-sand/20 border-b border-brand-copper/10 pb-4">
              <div className="flex items-center gap-2 text-brand-dark">
                <LayoutTemplate className="w-5 h-5 text-brand-copper" />
                <CardTitle className="text-lg font-serif">Quiz Content & Results</CardTitle>
              </div>
              <CardDescription className="text-brand-dark/60 mt-1">Configure the intro text and the personality result buckets.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6">

              <div className="space-y-1.5">
                <Label htmlFor="topic-description" className="text-brand-dark/80 font-medium">Quiz Description</Label>
                <Textarea
                  id="topic-description"
                  value={topicForm.description || ""}
                  onChange={(e) => setTopicForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description for this quiz topic"
                  className="border-brand-copper/20 focus-visible:ring-brand-copper min-h-[100px] resize-y"
                />
              </div>

              <div className="pt-4 pb-2 border-b border-brand-copper/10">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-copper">Result Responses</h3>
                <p className="text-[13px] text-brand-dark/60 mt-1 mb-4">What users will see based on their dominant option choices.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 p-4 rounded-xl border border-brand-copper/10 bg-brand-sand/10">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded bg-brand-dark text-white text-[11px] font-bold">A</span>
                    <Label htmlFor="result-a" className="text-brand-dark/90 font-medium">Type A Result</Label>
                  </div>
                  <Textarea
                    id="result-a"
                    value={topicForm.result_a_text || ""}
                    onChange={(e) => setTopicForm((prev) => ({ ...prev, result_a_text: e.target.value }))}
                    placeholder="Enter response shown for A-dominant result"
                    className="border-brand-copper/20 text-sm min-h-[120px]"
                  />
                </div>
                <div className="space-y-2 p-4 rounded-xl border border-brand-copper/10 bg-brand-sand/10">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded bg-brand-dark text-white text-[11px] font-bold">B</span>
                    <Label htmlFor="result-b" className="text-brand-dark/90 font-medium">Type B Result</Label>
                  </div>
                  <Textarea
                    id="result-b"
                    value={topicForm.result_b_text || ""}
                    onChange={(e) => setTopicForm((prev) => ({ ...prev, result_b_text: e.target.value }))}
                    placeholder="Enter response shown for B-dominant result"
                    className="border-brand-copper/20 text-sm min-h-[120px]"
                  />
                </div>
                <div className="space-y-2 p-4 rounded-xl border border-brand-copper/10 bg-brand-sand/10">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded bg-brand-dark text-white text-[11px] font-bold">C</span>
                    <Label htmlFor="result-c" className="text-brand-dark/90 font-medium">Type C Result</Label>
                  </div>
                  <Textarea
                    id="result-c"
                    value={topicForm.result_c_text || ""}
                    onChange={(e) => setTopicForm((prev) => ({ ...prev, result_c_text: e.target.value }))}
                    placeholder="Enter response shown for C-dominant result"
                    className="border-brand-copper/20 text-sm min-h-[120px]"
                  />
                </div>
                <div className="space-y-2 p-4 rounded-xl border border-brand-copper/10 bg-brand-sand/10">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded bg-brand-dark text-white text-[11px] font-bold">D</span>
                    <Label htmlFor="result-d" className="text-brand-dark/90 font-medium">Type D Result</Label>
                  </div>
                  <Textarea
                    id="result-d"
                    value={topicForm.result_d_text || ""}
                    onChange={(e) => setTopicForm((prev) => ({ ...prev, result_d_text: e.target.value }))}
                    placeholder="Enter response shown for D-dominant result"
                    className="border-brand-copper/20 text-sm min-h-[120px]"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={onSaveTopicResults} className="bg-brand-dark text-white hover:bg-brand-dark/90 pl-4 pr-5 group">
                  <Save className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Save Content & Results
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <div className="pt-6">
            <h2 className="text-xl font-serif text-brand-dark mb-4 px-1 flex items-center gap-2 border-b border-brand-copper/20 pb-3">
              <HelpCircle className="w-5 h-5 text-brand-olive" />
              Questions ({questions.length})
            </h2>
            <div className="grid gap-5">
              {questions.map((q) => (
                <Card key={q.id} className="border-brand-copper/10 bg-white shadow-warm-sm overflow-visible relative group">
                  <div className="absolute -left-3 top-6 h-6 w-6 rounded-full bg-brand-sand border border-brand-copper flex items-center justify-center text-xs font-bold text-brand-copper shadow-sm z-10 transition-transform group-hover:scale-110">
                    {q.order}
                  </div>
                  <CardHeader className="flex-row items-center justify-between pb-3 pl-8">
                    <CardTitle className="text-[15px] font-medium text-brand-dark/60 leading-tight pr-6">
                      Question Editor
                    </CardTitle>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 flex items-center justify-center text-destructive hover:bg-destructive hover:text-white hover:border-destructive border-brand-copper/20" onClick={() => onDeleteQuestion(q.id)} title="Delete Question">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="grid gap-5 pl-8 text-sm text-brand-dark/80 pb-5">
                    <Input
                      value={edits[q.id]?.question_text || ""}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [q.id]: { ...(prev[q.id] || q), question_text: e.target.value }
                        }))
                      }
                      placeholder="e.g. Which of these sounds most like you?"
                      className="border-b-2 border-x-0 border-t-0 border-brand-copper/30 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-brand-copper text-base font-medium placeholder:font-normal placeholder:opacity-60 bg-transparent"
                    />
                    <div className="grid gap-3 sm:grid-cols-2 pt-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-brand-copper uppercase">Opt A</span>
                        <Input
                          value={edits[q.id]?.option_a || ""}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [q.id]: { ...(prev[q.id] || q), option_a: e.target.value }
                            }))
                          }
                          placeholder="Option A text..."
                          className="pl-[3.25rem] border-brand-copper/20 focus-visible:ring-brand-copper bg-brand-sand/5"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-brand-copper uppercase">Opt B</span>
                        <Input
                          value={edits[q.id]?.option_b || ""}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [q.id]: { ...(prev[q.id] || q), option_b: e.target.value }
                            }))
                          }
                          placeholder="Option B text..."
                          className="pl-[3.25rem] border-brand-copper/20 focus-visible:ring-brand-copper bg-brand-sand/5"
                        />
                      </div>
                      {(edits[q.id]?.option_c || q.option_c || q.option_d) ? (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-brand-copper uppercase">Opt C</span>
                          <Input
                            value={edits[q.id]?.option_c || ""}
                            onChange={(e) =>
                              setEdits((prev) => ({
                                ...prev,
                                [q.id]: { ...(prev[q.id] || q), option_c: e.target.value }
                              }))
                            }
                            placeholder="Option C text..."
                            className="pl-[3.25rem] border-brand-copper/20 focus-visible:ring-brand-copper bg-brand-sand/5"
                          />
                        </div>
                      ) : null}
                      {(edits[q.id]?.option_d || q.option_d) ? (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-brand-copper uppercase">Opt D</span>
                          <Input
                            value={edits[q.id]?.option_d || ""}
                            onChange={(e) =>
                              setEdits((prev) => ({
                                ...prev,
                                [q.id]: { ...(prev[q.id] || q), option_d: e.target.value }
                              }))
                            }
                            placeholder="Option D text..."
                            className="pl-[3.25rem] border-brand-copper/20 focus-visible:ring-brand-copper bg-brand-sand/5"
                          />
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-1 border-t border-brand-copper/10">
                      <div className="flex items-center gap-3">
                        <Label htmlFor={`order-${q.id}`} className="text-xs font-semibold text-brand-dark/60 uppercase tracking-widest">Display Order</Label>
                        <Input
                          id={`order-${q.id}`}
                          type="number"
                          className="w-16 h-8 text-center border-brand-copper/20"
                          value={edits[q.id]?.order ?? q.order}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [q.id]: { ...(prev[q.id] || q), order: Number(e.target.value) }
                            }))
                          }
                          
                        />
                      </div>
                      <Button variant="outline" size="sm" className="border-brand-copper/30 text-brand-dark hover:bg-brand-olive hover:text-white hover:border-brand-olive transition-colors" onClick={() => onUpdateQuestion(q.id)}>
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Update Question
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {questions.length === 0 ? (
                <div className="text-center py-10 bg-brand-sand/20 rounded-xl border border-dashed border-brand-copper/30">
                  <HelpCircle className="w-10 h-10 mx-auto text-brand-copper/40 mb-3" />
                  <p className="text-brand-dark/70 font-medium">No questions created yet.</p>
                  <p className="text-sm text-brand-dark/50 mt-1">Add your first question to build this quiz.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Analytics (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-brand-copper/20 bg-white/80 shadow-warm-sm sticky top-[88px] backdrop-blur-md">
            <CardHeader className="bg-brand-sand/30 border-b border-brand-copper/10 py-5">
              <div className="flex items-center gap-2 text-brand-dark">
                <BarChart3 className="w-5 h-5 text-brand-olive" />
                <CardTitle className="text-lg font-serif">Quick Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-brand-sand/50 to-white rounded-xl border border-brand-copper/10 text-center">
                <p className="text-xs uppercase tracking-widest font-semibold text-brand-copper mb-1">Total Completions</p>
                <p className="text-4xl font-light text-brand-dark">{attemptsCount}</p>
              </div>

              <div className="pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-copper/80 mb-3 ml-1">Choice Breakdown</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {questionStats.map((q) => (
                    <div key={q.id} className="rounded-lg border border-brand-copper/10 bg-white p-3 shadow-warm-sm hover:border-brand-copper/30 transition-colors">
                      <p className="text-[13px] font-medium text-brand-dark leading-snug mb-3">
                        <span className="text-brand-copper font-bold mr-1">{q.order}.</span>
                        {q.question_text}
                      </p>

                      <div className="grid grid-cols-4 gap-1.5 h-16">
                        {['A', 'B', 'C', 'D'].map((opt) => {
                          const count = q.counts[opt as keyof typeof q.counts];
                          const total = Object.values(q.counts).reduce((a, b) => a + b, 0) || 1;
                          const percent = Math.round((count / total) * 100);

                          return (
                            <div key={opt} className="relative flex flex-col justify-end bg-brand-sand/20 rounded-md overflow-hidden group">
                              <div
                                className="absolute bottom-0 w-full bg-brand-olive/60 transition-all duration-500 rounded-b-md group-hover:bg-brand-olive"
                                style={{ height: `${percent}%`, minHeight: percent > 0 ? '4px' : '0' }}
                              />
                              <div className="relative z-10 p-1 flex flex-col items-center justify-end h-full">
                                <span className="text-[10px] font-bold text-brand-dark/80">{count}</span>
                                <span className="text-[9px] font-medium text-brand-dark/50">{opt}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {questionStats.length === 0 ? (
                    <div className="text-center p-4 bg-brand-sand/10 rounded-lg border border-brand-copper/10">
                      <p className="text-xs text-brand-dark/60">No response data collected yet.</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
