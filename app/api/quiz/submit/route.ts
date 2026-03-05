import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

type AnswerOption = "A" | "B" | "C" | "D";

export async function POST(request: Request) {
  const body = await request.json();
  const topicId = String(body?.topicId || "");
  const answers = Array.isArray(body?.answers) ? body.answers : [];
  const questionIds = Array.isArray(body?.questionIds) ? body.questionIds : [];

  if (!topicId || answers.length === 0 || answers.length !== questionIds.length) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const validOptions = new Set(["A", "B", "C", "D"]);
  if (!answers.every((x: unknown) => typeof x === "string" && validOptions.has(x))) {
    return NextResponse.json({ error: "Answers must be A/B/C/D." }, { status: 400 });
  }

  const counts: Record<AnswerOption, number> = { A: 0, B: 0, C: 0, D: 0 };
  (answers as AnswerOption[]).forEach((a) => {
    counts[a] += 1;
  });

  let mode: AnswerOption = "A";
  (["A", "B", "C", "D"] as AnswerOption[]).forEach((key) => {
    if (counts[key] > counts[mode]) mode = key;
  });

  const supabase = createApiSupabaseClient();

  const { error: attemptError } = await supabase.from("quiz_attempts").insert({
    topic_id: topicId,
    answers,
    result_option: mode
  });
  if (attemptError) return NextResponse.json({ error: attemptError.message }, { status: 500 });

  for (let i = 0; i < answers.length; i += 1) {
    const questionId = String(questionIds[i]);
    const optionKey = answers[i] as AnswerOption;

    const { data: existing, error: existingError } = await supabase
      .from("question_option_counts")
      .select("id,count")
      .eq("question_id", questionId)
      .eq("option_key", optionKey)
      .maybeSingle();

    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });

    if (!existing) {
      const { error: insertError } = await supabase.from("question_option_counts").insert({
        question_id: questionId,
        option_key: optionKey,
        count: 1
      });
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    } else {
      const { error: updateError } = await supabase
        .from("question_option_counts")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, resultOption: mode });
}
