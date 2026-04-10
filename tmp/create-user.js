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
  const email = 'sidharthmk24@gmail.com';
  const password = '121212';

  console.log("Attempting to create/update user in new project:", email);

  const { data, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (createError) {
    console.log("Creation failed (maybe already exists), checking...");
    const { data: usersResult, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) throw listError;

    const user = usersResult.users.find(u => u.email === email);
    if (user) {
      console.log("User found, updating password...");
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password });
      if (updateError) throw updateError;
      console.log('User updated successfully!');
    } else {
      console.log('User not found and creation failed:', createError.message);
    }
  } else {
    console.log('User created successfully!');
  }
}

main().catch(console.error);
