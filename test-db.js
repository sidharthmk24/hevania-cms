
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
  console.log("Checking Supabase connection...");
  try {
    const { data: campaigns, error: camErr, count: camCount } = await supabase
      .from('newsletter_campaigns')
      .select('*', { count: 'exact', head: true });
    
    if (camErr) {
      console.error("Error fetching newsletter_campaigns:", camErr);
    } else {
      console.log("newsletter_campaigns found. Count:", camCount);
    }

    const { data: subs, error: subErr, count: subCount } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true });

    if (subErr) {
      console.error("Error fetching subscribers:", subErr);
    } else {
      console.log("subscribers found. Count:", subCount);
    }

    const { data: activeSubs, error: actErr, count: actCount } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    if (actErr) {
      console.error("Error fetching active subscribers:", actErr);
    } else {
      console.log("Active subscribers count:", actCount);
    }

  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

check();
