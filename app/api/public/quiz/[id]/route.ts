import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createApiSupabaseClient();

  const [{ data: topic, error: topicError }, { data: questions, error: questionsError }] = await Promise.all([
    supabase
      .from("topics")
      .select("id,title,heading,description,result_a_text,result_b_text,result_c_text,result_d_text")
      .eq("id", params.id)
      .single(),
    supabase
      .from("questions")
      .select("id,topic_id,question_text,option_a,option_b,option_c,option_d,order")
      .eq("topic_id", params.id)
      .order("order", { ascending: true })
  ]);

  if (topicError) return NextResponse.json({ error: topicError.message }, { status: 404 });
  if (questionsError) return NextResponse.json({ error: questionsError.message }, { status: 500 });

  return NextResponse.json({
    data: {
      topic,
      questions: questions || []
    }
  });
}
