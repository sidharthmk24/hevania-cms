const postgres = require('postgres');

const sql = postgres('postgresql://postgres:NWMM2g169FRCmVCl@db.shibhckktucphvxwmjnu.supabase.co:5432/postgres', { ssl: 'require' });

async function createTable() {
    try {
        console.log('Creating leads table...');
        
        await sql`
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
        `;

        console.log('Table leads created or already exists.');

        console.log('Enabling RLS...');
        await sql`ALTER TABLE leads ENABLE ROW LEVEL SECURITY;`;
        
        console.log('Creating policies...');
        await sql`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Public insert leads'
                ) THEN
                    CREATE POLICY "Public insert leads" ON leads FOR INSERT WITH CHECK (true);
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Authenticated write leads'
                ) THEN
                    CREATE POLICY "Authenticated write leads" ON leads FOR ALL USING (true) WITH CHECK (true);
                END IF;
            END
            $$;
        `;
        
        console.log('Setup complete!');
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        await sql.end();
    }
}

createTable();
