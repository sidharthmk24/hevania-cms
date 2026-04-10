const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const sql = fs.readFileSync('supabase/migrations/20260408_create_gallery_table.sql', 'utf8');
  
  // Supabase JS doesn't have a direct 'execute sql' method for general migrations,
  // but we can try to create the bucket at least.
  
  console.log("Creating/Ensuring storage bucket 'gallery' exists...");
  const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('gallery', { public: true });
  
  if (bucketError) {
    console.log("Bucket note:", bucketError.message);
  } else {
    console.log("Bucket 'gallery' created!");
  }
  
  console.log("Note: Database tables should be created via the Supabase SQL editor using the provided migration file.");
}

main().catch(console.error);
