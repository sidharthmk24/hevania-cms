const { createClient } = require('@supabase/supabase-js');

const url = 'https://shibhckktucphvxwmjnu.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoaWJoY2trdHVjcGh2eHdtam51Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU5MzEzNiwiZXhwIjoyMDkxMTY5MTM2fQ.EfwWNV8zcmR0zMK13IeSL2kLG-t_kxkHBot7IvNat1o';

const supabase = createClient(url, serviceKey);

async function runMigration() {
    console.log('Checking if leads table exists...');

    const { data, error } = await supabase.from('leads').select('id').limit(1);

    if (error && (error.code === '42P01' || error.message.includes('Could not find the table'))) {
        console.log('Table does not exist. Creating via Supabase Management API...');

        const sql = `
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    message TEXT,
    venue TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public insert leads"
    ON leads FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated write leads"
    ON leads FOR ALL USING (true) WITH CHECK (true);
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
    } else if (error) {
        console.log('Unexpected error:', error.message);
    } else {
        console.log('Table already exists! Row count:', data?.length || 0);
    }
}

runMigration().catch(console.error);
