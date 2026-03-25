
const https = require('https');

const url = "https://ikplfuggvgukakrramek.supabase.co/rest/v1/newsletter_campaigns?id=eq.0025d51b-a5f0-44ec-8ff0-c71b1412fef04&select=*";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcGxmdWdndmd1a2FrcnJhbWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUyODA3NywiZXhwIjoyMDg4MTA0MDc3fQ.mULql7cbPr3OXJbg302EOhfxaTgowqLB9gd5sbz51so";

const options = {
  headers: {
    'apikey': apikey,
    'Authorization': 'Bearer ' + apikey,
    'Prefer': 'count=exact'
  }
};

https.get(url, options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Body:', data);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
