create extension if not exists "pgcrypto";

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  result_a_text text not null,
  result_b_text text not null,
  result_c_text text not null,
  result_d_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  "order" integer not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_questions_topic_order on public.questions(topic_id, "order");

alter table public.topics enable row level security;
alter table public.questions enable row level security;

create policy "Allow public read topics" on public.topics for select using (true);
create policy "Allow public read questions" on public.questions for select using (true);
create policy "Allow public write topics" on public.topics for all using (true) with check (true);
create policy "Allow public write questions" on public.questions for all using (true) with check (true);
