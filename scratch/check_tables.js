import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

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

const main = async () => {
  const fileText = await readFile(envPath, 'utf8').catch(() => '');
  const parsed = parseEnvFile(fileText);
  const url = process.env.VITE_SUPABASE_URL || parsed.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || parsed.SUPABASE_SERVICE_ROLE_KEY;

  console.log('URL:', url);
  
  const res = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });
  
  const data = await res.json();
  console.log('Available tables/paths:');
  if (data.paths) {
    Object.keys(data.paths).forEach(p => console.log(p));
  } else {
    console.log(data);
  }
};

main().catch(console.error);
