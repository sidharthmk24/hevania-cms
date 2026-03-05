import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type OptionKey = "A" | "B" | "C" | "D";

function isOptionKey(value: string): value is OptionKey {
  return value === "A" || value === "B" || value === "C" || value === "D";
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createApiSupabaseClient();

  const [{ data: questions, error: questionError }, { count: attemptsCount, error: attemptsError }] = await Promise.all([
    supabase.from("questions").select("id,question_text,order").eq("topic_id", params.id).order("order", { ascending: true }),
    supabase.from("quiz_attempts").select("id", { count: "exact", head: true }).eq("topic_id", params.id)
  ]);

  if (questionError) return NextResponse.json({ error: questionError.message }, { status: 500 });
  if (attemptsError) return NextResponse.json({ error: attemptsError.message }, { status: 500 });

  const questionIds = (questions || []).map((q) => q.id);
  if (questionIds.length === 0) {
    return NextResponse.json({ data: { attempts: attemptsCount ?? 0, questions: [] } });
  }

  const { data: counts, error: countsError } = await supabase
    .from("question_option_counts")
    .select("question_id,option_key,count")
    .in("question_id", questionIds);

  if (countsError) return NextResponse.json({ error: countsError.message }, { status: 500 });

  const byQuestion = new Map<string, { A: number; B: number; C: number; D: number }>();
  questionIds.forEach((id) => byQuestion.set(id, { A: 0, B: 0, C: 0, D: 0 }));

  (counts || []).forEach((row) => {
    const slot = byQuestion.get(row.question_id);
    if (!slot) return;
    if (isOptionKey(row.option_key)) {
      slot[row.option_key] = row.count || 0;
    }
  });

  const data = (questions || []).map((q) => ({
    ...q,
    counts: byQuestion.get(q.id) || { A: 0, B: 0, C: 0, D: 0 }
  }));

  return NextResponse.json({ data: { attempts: attemptsCount ?? 0, questions: data } });
}
