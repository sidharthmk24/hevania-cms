const { createClient } = require('@supabase/supabase-js');

const url = 'https://shibhckktucphvxwmjnu.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoaWJoY2trdHVjcGh2eHdtam51Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU5MzEzNiwiZXhwIjoyMDkxMTY5MTM2fQ.EfwWNV8zcmR0zMK13IeSL2kLG-t_kxkHBot7IvNat1o';

const supabase = createClient(url, serviceKey);

async function runMigration() {
    console.log('Checking if section_content table exists...');

    // Try to select from the table
    const { data, error } = await supabase.from('section_content').select('id').limit(1);

    if (error && error.code === '42P01') {
        console.log('Table does not exist. Creating via Supabase Management API...');

        // Use the management API to run SQL
        const sql = `
CREATE TABLE IF NOT EXISTS section_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section TEXT NOT NULL,
    key TEXT NOT NULL,
    content_json JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section, key)
);

ALTER TABLE section_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public read section_content"
    ON section_content FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated write section_content"
    ON section_content FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_section_content_section ON section_content(section);
        `;

        // Try via pg_dump or we can just insert a test row to auto-create via API
        // Actually, let's use the Supabase management REST API
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
    } else if (error) {
        console.log('Unexpected error:', error.message);
    } else {
        console.log('Table already exists! Row count:', data?.length || 0);
        console.log('Migration not needed.');
    }
}

runMigration().catch(console.error);
