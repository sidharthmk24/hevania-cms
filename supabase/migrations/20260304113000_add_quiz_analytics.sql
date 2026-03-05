create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  answers jsonb not null,
  result_option text not null check (result_option in ('A','B','C','D')),
  created_at timestamptz not null default now()
);

create table if not exists public.question_option_counts (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_key text not null check (option_key in ('A','B','C','D')),
  count integer not null default 0,
  unique(question_id, option_key)
);

create index if not exists idx_quiz_attempts_topic_id on public.quiz_attempts(topic_id);
create index if not exists idx_question_option_counts_question_id on public.question_option_counts(question_id);

alter table public.quiz_attempts enable row level security;
alter table public.question_option_counts enable row level security;

create policy "public read quiz_attempts" on public.quiz_attempts for select using (true);
create policy "public insert quiz_attempts" on public.quiz_attempts for insert with check (true);
create policy "public read question_option_counts" on public.question_option_counts for select using (true);
create policy "public write question_option_counts" on public.question_option_counts for all using (true) with check (true);
