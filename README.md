# Quiz CMS + Player

## Setup

1. Install deps:

```bash
npm install
```

2. Configure env:

```bash
cp .env.example .env.local
```

Fill in Supabase values.

3. Run SQL migration in Supabase SQL editor:

- `supabase/migrations/20260303170000_create_quiz_tables.sql`

4. Start app:

```bash
npm run dev
```

## Routes

- `/admin` - Topics dashboard + create topic
- `/admin/topics/[id]` - Topic editor with question CRUD and Add Question modal
- `/quiz` - Topic picker for players
- `/quiz/[id]` - One-question-per-screen player with progress and mode-based result
