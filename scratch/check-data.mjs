import fs from 'fs';

const SUPABASE_URL = 'https://tzopfeekvuztbabqbtmh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b3BmZWVrdnV6dGJhYnFidG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMjIyNzIsImV4cCI6MjA0NDU5ODI3Mn0.Kj9pntXas4VdPmcrhVvINCTmjZEQlFTE50OtpVWkH-k';

const tables = [
  'ba_app_users',
  'ba_villa_listings',
  'ba_booking_inquiries',
  'ba_owner_inquiries',
  'ba_villa_assessments',
  'ba_villa_owners',
  'ba_blog_posts',
  'ba_faqs',
  'ba_testimonials',
  'ba_website_settings',
  'ba_activity_logs'
];

async function check() {
  for (const table of tables) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'count=exact'
        }
      });
      const countHeader = res.headers.get('content-range');
      if (countHeader) {
          const total = countHeader.split('/')[1];
          console.log(`${table}: ${total} rows`);
      } else {
          console.log(`${table}: Error fetching count (status: ${res.status})`);
      }
    } catch(e) {
      console.error(e);
    }
  }
}
check();
