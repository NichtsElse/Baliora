import fs from 'fs';

let envText = '';
try {
  envText = fs.readFileSync('.env.local', 'utf-8');
} catch (e) {
  try {
    envText = fs.readFileSync('local', 'utf-8');
  } catch (e2) {
    console.error('Error: Could not read .env.local or local file');
    process.exit(1);
  }
}

const env = {};
envText.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const parts = trimmed.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }
});

const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY is missing in configuration');
  process.exit(1);
}

console.log('Connecting to Supabase at:', SUPABASE_URL);

async function checkTable(tableName) {
  console.log(`Checking table ${tableName}...`);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log(`\x1b[32m✅ Table ${tableName} exists. Records found: ${data.length}\x1b[0m`);
    } else {
      console.error(`\x1b[31m❌ Table ${tableName} status: ${res.status}\x1b[0m`, await res.text());
    }
  } catch (err) {
    console.error(`\x1b[31m❌ Connection to ${tableName} failed:\x1b[0m`, err.message);
  }
}

async function run() {
  await checkTable('ba_reservations');
  await checkTable('ba_guests');
  await checkTable('ba_communication_logs');
}

run().catch(console.error);
