import { createServerSupabaseClient } from "@/lib/supabase-server";
import { QuizPlayer } from "@/components/quiz-player";

export default async function QuizPlayerPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const [{ data: topic }, { data: questions }] = await Promise.all([
    supabase.from("topics").select("*").eq("id", params.id).single(),
    supabase.from("questions").select("*").eq("topic_id", params.id).order("order", { ascending: true })
  ]);

  if (!topic) {
    return <div className="container py-12 text-slate-700">Quiz topic not found.</div>;
  }

  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">{topic.title}</h1>
      <QuizPlayer topic={topic} questions={questions || []} />
    </div>
  );
}
