<!--
Purpose: Explains how to apply the Supabase schema and seed for the BALIORA migration.
Used by: the developer or future maintainer before connecting the app to Supabase.
Main dependencies: supabase/migrations/001_init.sql and supabase/seed.sql.
Public functions: none.
Side effects: none.
-->

# BALIORA Supabase Migration

This folder contains the Base44-free database schema and seed data for Supabase.

## Files

- `supabase/migrations/001_init.sql` - creates tables, indexes, triggers, and RLS policies
- `supabase/seed.sql` - inserts demo data for villas, FAQs, testimonials, settings, and users
- `supabase/seed-auth-users.mjs` - creates demo Supabase Auth users for the dashboard authenticator list
- `supabase/seed-app-users.mjs` - syncs demo `app_users` role rows through the service role key

## How to use

1. Open the Supabase SQL editor.
2. Run `supabase/migrations/001_init.sql`.
3. Run `supabase/seed.sql`.
4. Run `node supabase/seed-auth-users.mjs` to seed Supabase Auth users.
5. Run `node supabase/seed-app-users.mjs` to sync `app_users` role records.
6. Create a public Storage bucket named `testimonials`.
7. Upload `test1.jpg` and `test2.jpg` into that bucket.
8. Replace the placeholder `YOUR_SUPABASE_PROJECT_REF` in `seed.sql` with your real project ref if you want to keep the testimonial image URLs in seed form.

## Notes

- The schema uses plain Supabase table names instead of Base44 entity names.
- Admin access is driven by `app_users.role`.
- Public site data is stored in `website_settings`, `faqs`, `testimonials`, `blog_posts`, and `villa_listings`.
