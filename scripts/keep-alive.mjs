#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to manually load .env file if environment variables aren't already set
function loadEnvFile() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

console.log('----------------------------------------------------');
console.log('⏰ Supabase Keep-Alive Cron Ping');
console.log(`📅 Timestamp: ${new Date().toISOString()}`);
console.log(`🌐 Supabase URL: ${supabaseUrl || 'NOT SET'}`);
console.log('----------------------------------------------------');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials!');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

async function pingSupabase() {
  const startTime = Date.now();
  const tablesToTry = ['newsletter_campaigns', 'leads', 'subscribers', ''];
  let successful = false;

  for (const table of tablesToTry) {
    const targetUrl = table
      ? `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}?select=*&limit=1`
      : `${supabaseUrl.replace(/\/$/, '')}/rest/v1/`;

    console.log(`📡 Sending ping request to: ${targetUrl} ...`);

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: 'count=exact',
        },
      });

      const latency = Date.now() - startTime;
      console.log(`📥 Received response (HTTP ${response.status}) in ${latency}ms`);

      // Any HTTP response from the Supabase infrastructure (200, 206, 400, etc.)
      // counts as active traffic to the database gateway and resets the pause timer!
      if (response.status >= 200 && response.status < 500) {
        console.log(`✅ Success! Supabase received the keep-alive ping on table: ${table || 'root'}.`);
        console.log(`🛡️ 7-Day inactivity timer has been reset.`);
        successful = true;
        break;
      } else {
        const bodyText = await response.text();
        console.warn(`⚠️ Table '${table}' returned HTTP ${response.status}: ${bodyText.slice(0, 100)}`);
      }
    } catch (err) {
      if (err.code === 'ENOTFOUND' || (err.cause && err.cause.code === 'ENOTFOUND')) {
        console.error(`\n❌ Network / DNS Error: Could not resolve hostname for ${supabaseUrl}`);
        console.error('👉 If your project was already paused by Supabase:');
        console.error('   1. Go to https://supabase.com/dashboard');
        console.error('   2. Select your project and click "Restore project" or "Unpause".');
        console.error('   3. Once restored, this cron job will prevent it from ever pausing again!\n');
        process.exit(1);
      }
      console.warn(`⚠️ Ping to ${table || 'root'} failed: ${err.message}`);
    }
  }

  if (!successful) {
    console.error('❌ Failed to establish an active connection with any endpoint.');
    process.exit(1);
  }
}

pingSupabase();
