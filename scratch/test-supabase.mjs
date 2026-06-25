// No import needed for fetch in Node v25

const SUPABASE_URL = 'https://ovhknejyttlxokirwkps.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92aGtuZWp5dHRseG9raXJ3a3BzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjcxNjQsImV4cCI6MjA5NzY0MzE2NH0.hPNjPWxjuRyWxG0laXk4_IqZn3NXPh-ml32Lso5HlKs';

async function testInsert() {
  const table = 'ba_owner_inquiries';
  console.log(`Testing insert into ${table}...`);
  
  const payload = {
    name: 'Test Name',
    email: 'test@example.com',
    message: 'test message'
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  });

  const status = response.status;
  const text = await response.text();
  console.log('Status:', status);
  console.log('Response:', text);
}

testInsert().catch(console.error);
