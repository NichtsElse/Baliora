/**
 * Purpose: Seeds BALIORA demo role accounts into Supabase app_users.
 * Used by: one-off local migration step when preparing Supabase demo data.
 * Main dependencies: .env.local values for Supabase URL and service role key.
 * Public functions: main seed runner when executed with Node.js.
 * Side effects: Reads .env.local, queries Supabase REST, and inserts missing app_users rows.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROLES = [
  {
    email: 'admin@baliora.local',
    full_name: 'BALIORA Admin',
    role: 'admin',
    contact_number: '+62 812-3456-7890',
    status: 'active',
  },
  {
    email: 'villa.manager@baliora.local',
    full_name: 'Villa Manager',
    role: 'villa_manager',
    contact_number: '+62 812-3456-7891',
    status: 'active',
  },
  {
    email: 'reservation.staff@baliora.local',
    full_name: 'Reservation Staff',
    role: 'reservation_staff',
    contact_number: '+62 812-5555-1234',
    status: 'active',
  },
  {
    email: 'content.manager@baliora.local',
    full_name: 'Content Manager',
    role: 'content_manager',
    contact_number: '+62 813-2222-3344',
    status: 'active',
  },
  {
    email: 'user@baliora.local',
    full_name: 'Read Only User',
    role: 'user',
    contact_number: '+62 811-0000-0000',
    status: 'active',
  },
];

const envPath = path.resolve(process.cwd(), '.env.local');

const parseEnvFile = (text) =>
  text.split(/\r?\n/).reduce((accumulator, line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      return accumulator;
    }

    const equalsIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    accumulator[key] = value;
    return accumulator;
  }, {});

const getConfig = async () => {
  const fileText = await readFile(envPath, 'utf8').catch(() => '');
  const parsed = parseEnvFile(fileText);

  return {
    url: process.env.VITE_SUPABASE_URL || parsed.VITE_SUPABASE_URL || '',
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY || parsed.SUPABASE_SERVICE_ROLE_KEY || '',
  };
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new Error(typeof body === 'string' ? body : JSON.stringify(body));
  }

  return body;
};

const main = async () => {
  const { url, serviceRoleKey } = await getConfig();

  if (!url || !serviceRoleKey) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  const existingRows = await fetchJson(
    `${url}/rest/v1/ba_app_users?select=id,email,role&email=in.(${ROLES.map((role) => `"${role.email}"`).join(',')})`,
    { headers },
  );

  const existingEmails = new Set((existingRows || []).map((row) => row.email));
  const missingRoles = ROLES.filter((role) => !existingEmails.has(role.email));

  if (missingRoles.length === 0) {
    console.log('All demo roles already exist in Supabase ba_app_users.');
    return;
  }

  const inserted = await fetchJson(`${url}/rest/v1/ba_app_users`, {
    method: 'POST',
    headers,
    body: JSON.stringify(missingRoles),
  });

  console.log(`Inserted ${inserted?.length || missingRoles.length} missing role accounts.`);
};

main().catch((error) => {
  console.error('Seed failed:', error.message || error);
  process.exit(1);
});
