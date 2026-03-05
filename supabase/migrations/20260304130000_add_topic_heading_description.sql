alter table public.topics
  add column if not exists heading text,
  add column if not exists description text;

update public.topics
set heading = coalesce(heading, title),
    description = coalesce(description, '')
where heading is null or description is null;
