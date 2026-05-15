const { createClient } = require('@supabase/supabase-js');

const url = 'https://shibhckktucphvxwmjnu.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoaWJoY2trdHVjcGh2eHdtam51Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU5MzEzNiwiZXhwIjoyMDkxMTY5MTM2fQ.EfwWNV8zcmR0zMK13IeSL2kLG-t_kxkHBot7IvNat1o';

const supabase = createClient(url, serviceKey);

async function createBlogsTable() {
    console.log('Creating blogs table...');

    const sql = `
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    author TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all actions for authenticated users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blogs' AND policyname = 'Allow authenticated users full access to blogs'
    ) THEN
        CREATE POLICY "Allow authenticated users full access to blogs" ON public.blogs
        FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blogs' AND policyname = 'Allow public read access to blogs'
    ) THEN
        CREATE POLICY "Allow public read access to blogs" ON public.blogs
        FOR SELECT TO public USING (true);
    END IF;
END $$;
    `;

    const response = await fetch('https://api.supabase.com/v1/projects/shibhckktucphvxwmjnu/database/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: sql }),
    });

    const result = await response.json();
    console.log('Management API response:', JSON.stringify(result, null, 2));
}

createBlogsTable().catch(console.error);
