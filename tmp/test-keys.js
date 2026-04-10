const https = require('https');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', '');
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Testing URL:", url);
console.log("Testing Key Starts With:", anonKey.substring(0, 10));

const options = {
  hostname: url,
  path: '/rest/v1/',
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  }
};

const req = https.get(options, (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error("Request Error:", e.message);
});
