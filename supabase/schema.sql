-- Purpose: Defines the Supabase schema for BALIORA without Base44 table names or demo-open policies.
-- Used by: Supabase SQL editor before connecting the app to Supabase.
-- Main dependencies: PostgreSQL / Supabase runtime, pgcrypto for UUIDs, and Supabase Auth JWT email claims.
-- Public objects: ba_app_users, ba_villa_listings, ba_booking_inquiries, ba_owner_inquiries, ba_villa_assessments, ba_villa_owners, ba_blog_posts, ba_faqs, ba_testimonials, ba_website_settings, ba_activity_logs.
-- Side effects: Creates tables, indexes, triggers, and row-level security policies.

create extension if not exists pgcrypto;

create table if not exists public.ba_app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  role text not null default 'user' check (role in ('admin', 'villa_manager', 'reservation_staff', 'content_manager', 'user')),
  contact_number text,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_app_email()
returns text
language sql
stable
security definer
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.ba_app_users u
    where lower(u.email) = public.current_app_email()
      and u.status = 'active'
      and u.role in ('admin', 'villa_manager', 'reservation_staff', 'content_manager')
  );
$$;

create table if not exists public.ba_villa_listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  location text not null,
  address_area text,
  bedrooms integer,
  bathrooms integer,
  max_guests integer,
  price_per_night numeric(10,2),
  short_description text,
  full_description text,
  amenities text[] not null default '{}'::text[],
  image_urls text[] not null default '{}'::text[],
  house_rules text[] not null default '{}'::text[],
  highlight_tags text[] not null default '{}'::text[],
  status text not null default 'available' check (status in ('available', 'hidden', 'maintenance')),
  rating numeric(3,2),
  review_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_booking_inquiries (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid references public.ba_villa_listings(id) on delete set null,
  villa_name text not null,
  guest_name text not null,
  email text not null,
  whatsapp text,
  check_in date,
  check_out date,
  guests integer,
  special_requests text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'cancelled', 'archived')),
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_owner_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  whatsapp text,
  villa_location text,
  bedroom_count integer,
  current_status text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed', 'archived')),
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_villa_assessments (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  contact text not null,
  villa_name text,
  location text not null,
  bedrooms integer,
  current_operation text,
  rental_platform text,
  average_occupancy numeric(5,2),
  monthly_revenue numeric(14,2),
  main_problem text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'scheduled', 'completed', 'archived')),
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_villa_owners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  whatsapp text,
  nationality text,
  contract_start date,
  contract_end date,
  revenue_share_percent numeric(5,2),
  management_fee_type text not null default 'percentage' check (management_fee_type in ('percentage', 'fixed')),
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive', 'prospect')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text,
  featured_image text,
  category text,
  tags text[] not null default '{}'::text[],
  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled')),
  seo_title text,
  seo_description text,
  author text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'General',
  sort_order integer not null default 0,
  status text not null default 'active' check (status in ('active', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_testimonials (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  country text,
  villa_name text,
  review text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  photo_url text,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  status text not null default 'active' check (status in ('active', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_website_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  label text not null,
  category text not null default 'General',
  type text not null default 'text',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_activity_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  action text not null,
  details text,
  user_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists villa_listings_status_idx on public.ba_villa_listings (status);
create index if not exists villa_listings_slug_idx on public.ba_villa_listings (slug);
create index if not exists booking_inquiries_status_idx on public.ba_booking_inquiries (status);
create index if not exists owner_inquiries_status_idx on public.ba_owner_inquiries (status);
create index if not exists villa_assessments_status_idx on public.ba_villa_assessments (status);
create index if not exists villa_owners_status_idx on public.ba_villa_owners (status);
create index if not exists villa_owners_email_idx on public.ba_villa_owners (email);
create index if not exists blog_posts_status_idx on public.ba_blog_posts (status);
create index if not exists blog_posts_slug_idx on public.ba_blog_posts (slug);
create index if not exists faqs_category_idx on public.ba_faqs (category);
create index if not exists faqs_sort_order_idx on public.ba_faqs (sort_order);
create index if not exists testimonials_status_idx on public.ba_testimonials (status);
create index if not exists testimonials_featured_idx on public.ba_testimonials (is_featured);
create index if not exists testimonials_sort_order_idx on public.ba_testimonials (sort_order);
create index if not exists website_settings_category_idx on public.ba_website_settings (category);
create index if not exists website_settings_key_idx on public.ba_website_settings (key);
create index if not exists activity_logs_entity_type_idx on public.ba_activity_logs (entity_type);
create index if not exists app_users_role_idx on public.ba_app_users (role);
create index if not exists app_users_status_idx on public.ba_app_users (status);

drop trigger if exists set_updated_at_app_users on public.ba_app_users;
create trigger set_updated_at_app_users
before update on public.ba_app_users
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_villa_listings on public.ba_villa_listings;
create trigger set_updated_at_villa_listings
before update on public.ba_villa_listings
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_booking_inquiries on public.ba_booking_inquiries;
create trigger set_updated_at_booking_inquiries
before update on public.ba_booking_inquiries
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_owner_inquiries on public.ba_owner_inquiries;
create trigger set_updated_at_owner_inquiries
before update on public.ba_owner_inquiries
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_villa_assessments on public.ba_villa_assessments;
create trigger set_updated_at_villa_assessments
before update on public.ba_villa_assessments
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_villa_owners on public.ba_villa_owners;
create trigger set_updated_at_villa_owners
before update on public.ba_villa_owners
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_blog_posts on public.ba_blog_posts;
create trigger set_updated_at_blog_posts
before update on public.ba_blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_faqs on public.ba_faqs;
create trigger set_updated_at_faqs
before update on public.ba_faqs
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_testimonials on public.ba_testimonials;
create trigger set_updated_at_testimonials
before update on public.ba_testimonials
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_website_settings on public.ba_website_settings;
create trigger set_updated_at_website_settings
before update on public.ba_website_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_activity_logs on public.ba_activity_logs;
create trigger set_updated_at_activity_logs
before update on public.ba_activity_logs
for each row execute function public.set_updated_at();

alter table public.ba_app_users enable row level security;
alter table public.ba_villa_listings enable row level security;
alter table public.ba_booking_inquiries enable row level security;
alter table public.ba_owner_inquiries enable row level security;
alter table public.ba_villa_assessments enable row level security;
alter table public.ba_villa_owners enable row level security;
alter table public.ba_blog_posts enable row level security;
alter table public.ba_faqs enable row level security;
alter table public.ba_testimonials enable row level security;
alter table public.ba_website_settings enable row level security;
alter table public.ba_activity_logs enable row level security;

drop policy if exists "Public can read villas" on public.ba_villa_listings;
create policy "Public can read villas"
  on public.ba_villa_listings
  for select
  to anon, authenticated
  using (status = 'available' or public.is_admin_user());

drop policy if exists "Admins manage villas" on public.ba_villa_listings;
create policy "Admins manage villas"
  on public.ba_villa_listings
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Anyone can submit booking inquiries" on public.ba_booking_inquiries;
create policy "Anyone can submit booking inquiries"
  on public.ba_booking_inquiries
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins read booking inquiries" on public.ba_booking_inquiries;
create policy "Admins read booking inquiries"
  on public.ba_booking_inquiries
  for select
  to authenticated
  using (public.is_admin_user());

drop policy if exists "Admins update booking inquiries" on public.ba_booking_inquiries;
create policy "Admins update booking inquiries"
  on public.ba_booking_inquiries
  for update
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins delete booking inquiries" on public.ba_booking_inquiries;
create policy "Admins delete booking inquiries"
  on public.ba_booking_inquiries
  for delete
  to authenticated
  using (public.is_admin_user());

drop policy if exists "Anyone can submit owner inquiries" on public.ba_owner_inquiries;
create policy "Anyone can submit owner inquiries"
  on public.ba_owner_inquiries
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins read owner inquiries" on public.ba_owner_inquiries;
create policy "Admins read owner inquiries"
  on public.ba_owner_inquiries
  for select
  to authenticated
  using (public.is_admin_user());

drop policy if exists "Admins update owner inquiries" on public.ba_owner_inquiries;
create policy "Admins update owner inquiries"
  on public.ba_owner_inquiries
  for update
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins delete owner inquiries" on public.ba_owner_inquiries;
create policy "Admins delete owner inquiries"
  on public.ba_owner_inquiries
  for delete
  to authenticated
  using (public.is_admin_user());

drop policy if exists "Anyone can submit villa assessments" on public.ba_villa_assessments;
create policy "Anyone can submit villa assessments"
  on public.ba_villa_assessments
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins read villa assessments" on public.ba_villa_assessments;
create policy "Admins read villa assessments"
  on public.ba_villa_assessments
  for select
  to authenticated
  using (public.is_admin_user());

drop policy if exists "Admins update villa assessments" on public.ba_villa_assessments;
create policy "Admins update villa assessments"
  on public.ba_villa_assessments
  for update
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins delete villa assessments" on public.ba_villa_assessments;
create policy "Admins delete villa assessments"
  on public.ba_villa_assessments
  for delete
  to authenticated
  using (public.is_admin_user());

drop policy if exists "Admins manage villa owners" on public.ba_villa_owners;
create policy "Admins manage villa owners"
  on public.ba_villa_owners
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Public can read published blog posts" on public.ba_blog_posts;
create policy "Public can read published blog posts"
  on public.ba_blog_posts
  for select
  to anon, authenticated
  using (status = 'published' or public.is_admin_user());

drop policy if exists "Admins manage blog posts" on public.ba_blog_posts;
create policy "Admins manage blog posts"
  on public.ba_blog_posts
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Public can read ba_faqs" on public.ba_faqs;
create policy "Public can read ba_faqs"
  on public.ba_faqs
  for select
  to anon, authenticated
  using (status = 'active' or public.is_admin_user());

drop policy if exists "Admins manage ba_faqs" on public.ba_faqs;
create policy "Admins manage ba_faqs"
  on public.ba_faqs
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Public can read ba_testimonials" on public.ba_testimonials;
create policy "Public can read ba_testimonials"
  on public.ba_testimonials
  for select
  to anon, authenticated
  using (status = 'active' or public.is_admin_user());

drop policy if exists "Admins manage ba_testimonials" on public.ba_testimonials;
create policy "Admins manage ba_testimonials"
  on public.ba_testimonials
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Public can read website settings" on public.ba_website_settings;
create policy "Public can read website settings"
  on public.ba_website_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage website settings" on public.ba_website_settings;
create policy "Admins manage website settings"
  on public.ba_website_settings
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins manage activity logs" on public.ba_activity_logs;
create policy "Admins manage activity logs"
  on public.ba_activity_logs
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Users can read own app profile" on public.ba_app_users;
create policy "Users can read own app profile"
  on public.ba_app_users
  for select
  to authenticated
  using (lower(email) = public.current_app_email() or public.is_admin_user());

drop policy if exists "Users can update own app profile" on public.ba_app_users;
create policy "Users can update own app profile"
  on public.ba_app_users
  for update
  to authenticated
  using (lower(email) = public.current_app_email() or public.is_admin_user())
  with check (lower(email) = public.current_app_email() or public.is_admin_user());

drop policy if exists "Users can insert own app profile" on public.ba_app_users;
create policy "Users can insert own app profile"
  on public.ba_app_users
  for insert
  to authenticated
  with check (lower(email) = public.current_app_email() or public.is_admin_user());

drop policy if exists "Admins manage app users" on public.ba_app_users;
create policy "Admins manage app users"
  on public.ba_app_users
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());
