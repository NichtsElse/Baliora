/**
 * Purpose: Seeds BALIORA demo Supabase Auth users for the dashboard authenticator list.
 * Used by: one-off local migration step when preparing Supabase demo auth data.
 * Main dependencies: .env.local values for Supabase URL and service role key.
 * Public functions: main seed runner when executed with Node.js.
 * Side effects: Reads .env.local, queries Supabase Auth Admin REST, and creates missing auth users.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const USERS = [
  {
    email: 'admin@baliora.local',
    password: 'Admin@2026',
    full_name: 'BALIORA Admin',
    role: 'admin',
  },
  {
    email: 'villa.manager@baliora.local',
    password: 'Villa@2026',
    full_name: 'Villa Manager',
    role: 'villa_manager',
  },
  {
    email: 'reservation.staff@baliora.local',
    password: 'Booking@2026',
    full_name: 'Reservation Staff',
    role: 'reservation_staff',
  },
  {
    email: 'content.manager@baliora.local',
    password: 'Content@2026',
    full_name: 'Content Manager',
    role: 'content_manager',
  },
  {
    email: 'user@baliora.local',
    password: 'User@2026',
    full_name: 'Read Only User',
    role: 'user',
  },
];

const envPath = path.resolve(process.cwd(), '.env.local');
const authBaseUrl = (baseUrl) => `${baseUrl.replace(/\/$/, '')}/auth/v1`;

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

const buildHeaders = (serviceRoleKey) => ({
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
});

const listExistingUsers = async (baseUrl, headers) => {
  const allUsers = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const result = await fetchJson(
      `${authBaseUrl(baseUrl)}/admin/users?per_page=${perPage}&page=${page}`,
      { headers },
    );

    const users = result?.users || [];
    allUsers.push(...users);

    if (users.length < perPage) {
      break;
    }

    page += 1;
  }

  return allUsers;
};

const main = async () => {
  const { url, serviceRoleKey } = await getConfig();

  if (!url || !serviceRoleKey) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const headers = buildHeaders(serviceRoleKey);
  const existingUsers = await listExistingUsers(url, headers);
  const existingEmails = new Set(existingUsers.map((user) => user.email?.toLowerCase()).filter(Boolean));
  const missingUsers = USERS.filter((user) => !existingEmails.has(user.email.toLowerCase()));

  if (missingUsers.length === 0) {
    console.log('All demo auth users already exist in Supabase Auth.');
    return;
  }

  for (const user of missingUsers) {
    await fetchJson(`${authBaseUrl(url)}/admin/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        },
      }),
    });
  }

  console.log(`Inserted ${missingUsers.length} missing auth users.`);
};

main().catch((error) => {
  console.error('Seed failed:', error.message || error);
  process.exit(1);
});
