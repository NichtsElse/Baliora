import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';

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
  const envText = await readFile('d:/magang/Baliora/.env.local', 'utf8');
  const env = parseEnvFile(envText);
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;

  console.log('Connecting to:', url);
  // Do NOT log the anon key to console output
  
  // Use anon key for standard supabase-js initialization
  const supabase = createClient(url, anonKey);

  console.log('Attempting to insert an owner_inquiry anonymously...');
  
  // Simulate the payload from Contact.jsx
  const payload = {
    name: "Anon Test",
    email: "anon@test.com",
    whatsapp: "+6288888",
    villa_location: "Ubud",
    bedroom_count: 2,
    current_status: "rental",
    message: "Test message",
    status: "new"
  };

  console.log("Payload:", payload);

  const { data, error } = await supabase
    .from('owner_inquiries')
    .insert([payload]);

  if (error) {
    console.error('Insert Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('Insert Success! Data:', JSON.stringify(data, null, 2));
  }
};

main().catch(console.error);
