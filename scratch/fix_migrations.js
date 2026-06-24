import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const TABLES = [
  'app_users',
  'villa_listings',
  'booking_inquiries',
  'owner_inquiries',
  'villa_assessments',
  'villa_owners',
  'blog_posts',
  'faqs',
  'testimonials',
  'website_settings',
  'activity_logs'
];

const filesToFix = [
  'supabase/migrations/001_init.sql',
  'supabase/schema.sql',
  'supabase/seed.sql'
];

const main = async () => {
  for (const relPath of filesToFix) {
    const fullPath = path.resolve(process.cwd(), relPath);
    let content = await readFile(fullPath, 'utf8');
    
    // Replace table names with prefix ba_
    for (const table of TABLES) {
      // Avoid doubling prefix if already run or contains ba_
      // Use regex to find table references like public.tablename or table tablename
      const regex1 = new RegExp(`public\.${table}\\b`, 'g');
      content = content.replace(regex1, `public.ba_${table}`);
      
      const regex2 = new RegExp(`on public\.ba_${table}\\b`, 'g'); // prevent doubling
      // Actually, simple replacement of \bapp_users\b with ba_app_users works well if we target word boundaries
      const regexWord = new RegExp(`\\b${table}\\b`, 'g');
      content = content.replace(regexWord, `ba_${table}`);
      
      // Let's clean up any double prefixes like ba_ba_
      const doublePrefixRegex = new RegExp(`\\bba_ba_${table}\\b`, 'g');
      content = content.replace(doublePrefixRegex, `ba_${table}`);
    }
    
    await writeFile(fullPath, content, 'utf8');
    console.log(`Updated ${relPath} successfully.`);
  }
};

main().catch(console.error);
