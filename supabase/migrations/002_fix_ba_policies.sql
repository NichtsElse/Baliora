-- 1. Fix the public.is_admin_user() helper function to check ba_app_users
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

-- 2. Enable Row Level Security on ba_ tables if not already enabled
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
alter table public.ba_app_users enable row level security;

-- 3. Apply RLS Policies for ba_ tables

-- ba_villa_listings
drop policy if exists "Public can read villas" on public.ba_villa_listings;
create policy "Public can read villas"
  on public.ba_villa_listings
  for select
  using (status = 'available' or public.is_admin_user());

drop policy if exists "Admins manage villas" on public.ba_villa_listings;
create policy "Admins manage villas"
  on public.ba_villa_listings
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ba_booking_inquiries
drop policy if exists "Anyone can submit booking inquiries" on public.ba_booking_inquiries;
create policy "Anyone can submit booking inquiries"
  on public.ba_booking_inquiries
  for insert
  with check (true);

drop policy if exists "Admins manage booking inquiries" on public.ba_booking_inquiries;
create policy "Admins manage booking inquiries"
  on public.ba_booking_inquiries
  for select
  using (public.is_admin_user());

drop policy if exists "Admins update booking inquiries" on public.ba_booking_inquiries;
create policy "Admins update booking inquiries"
  on public.ba_booking_inquiries
  for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins delete booking inquiries" on public.ba_booking_inquiries;
create policy "Admins delete booking inquiries"
  on public.ba_booking_inquiries
  for delete
  using (public.is_admin_user());

-- ba_owner_inquiries
drop policy if exists "Anyone can submit owner inquiries" on public.ba_owner_inquiries;
create policy "Anyone can submit owner inquiries"
  on public.ba_owner_inquiries
  for insert
  with check (true);

drop policy if exists "Admins manage owner inquiries" on public.ba_owner_inquiries;
create policy "Admins manage owner inquiries"
  on public.ba_owner_inquiries
  for select
  using (public.is_admin_user());

drop policy if exists "Admins update owner inquiries" on public.ba_owner_inquiries;
create policy "Admins update owner inquiries"
  on public.ba_owner_inquiries
  for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins delete owner inquiries" on public.ba_owner_inquiries;
create policy "Admins delete owner inquiries"
  on public.ba_owner_inquiries
  for delete
  using (public.is_admin_user());

-- ba_villa_assessments
drop policy if exists "Anyone can submit villa assessments" on public.ba_villa_assessments;
create policy "Anyone can submit villa assessments"
  on public.ba_villa_assessments
  for insert
  with check (true);

drop policy if exists "Admins manage villa assessments" on public.ba_villa_assessments;
create policy "Admins manage villa assessments"
  on public.ba_villa_assessments
  for select
  using (public.is_admin_user());

drop policy if exists "Admins update villa assessments" on public.ba_villa_assessments;
create policy "Admins update villa assessments"
  on public.ba_villa_assessments
  for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins delete villa assessments" on public.ba_villa_assessments;
create policy "Admins delete villa assessments"
  on public.ba_villa_assessments
  for delete
  using (public.is_admin_user());

-- ba_villa_owners
drop policy if exists "Public can read owners" on public.ba_villa_owners;
create policy "Public can read owners"
  on public.ba_villa_owners
  for select
  using (public.is_admin_user());

drop policy if exists "Admins manage owners" on public.ba_villa_owners;
create policy "Admins manage owners"
  on public.ba_villa_owners
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ba_blog_posts
drop policy if exists "Public can read published blog posts" on public.ba_blog_posts;
create policy "Public can read published blog posts"
  on public.ba_blog_posts
  for select
  using (status = 'published' or public.is_admin_user());

drop policy if exists "Admins manage blog posts" on public.ba_blog_posts;
create policy "Admins manage blog posts"
  on public.ba_blog_posts
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ba_faqs
drop policy if exists "Public can read faqs" on public.ba_faqs;
create policy "Public can read faqs"
  on public.ba_faqs
  for select
  using (status = 'active' or public.is_admin_user());

drop policy if exists "Admins manage faqs" on public.ba_faqs;
create policy "Admins manage faqs"
  on public.ba_faqs
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ba_testimonials
drop policy if exists "Public can read testimonials" on public.ba_testimonials;
create policy "Public can read testimonials"
  on public.ba_testimonials
  for select
  using (status = 'active' or public.is_admin_user());

drop policy if exists "Admins manage testimonials" on public.ba_testimonials;
create policy "Admins manage testimonials"
  on public.ba_testimonials
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ba_website_settings
drop policy if exists "Public can read website settings" on public.ba_website_settings;
create policy "Public can read website settings"
  on public.ba_website_settings
  for select
  using (true);

drop policy if exists "Admins manage website settings" on public.ba_website_settings;
create policy "Admins manage website settings"
  on public.ba_website_settings
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ba_activity_logs
drop policy if exists "Admins read activity logs" on public.ba_activity_logs;
create policy "Admins read activity logs"
  on public.ba_activity_logs
  for select
  using (public.is_admin_user());

drop policy if exists "Admins manage activity logs" on public.ba_activity_logs;
create policy "Admins manage activity logs"
  on public.ba_activity_logs
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ba_app_users
drop policy if exists "Users can read own app profile" on public.ba_app_users;
create policy "Users can read own app profile"
  on public.ba_app_users
  for select
  using (lower(email) = public.current_app_email() or public.is_admin_user());

drop policy if exists "Users can update own app profile" on public.ba_app_users;
create policy "Users can update own app profile"
  on public.ba_app_users
  for update
  using (lower(email) = public.current_app_email() or public.is_admin_user())
  with check (lower(email) = public.current_app_email() or public.is_admin_user());

drop policy if exists "Users can insert own app profile" on public.ba_app_users;
create policy "Users can insert own app profile"
  on public.ba_app_users
  for insert
  with check (lower(email) = public.current_app_email() or public.is_admin_user());

drop policy if exists "Admins manage app users" on public.ba_app_users;
create policy "Admins manage app users"
  on public.ba_app_users
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());
