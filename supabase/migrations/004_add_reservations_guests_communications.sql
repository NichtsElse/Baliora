-- Create Reservations, Guests, and Communication Logs tables for Supabase

-- 1. Create Tables
create table if not exists public.ba_reservations (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid references public.ba_villa_listings(id) on delete set null,
  villa_name text not null,
  guest_name text not null,
  email text not null,
  whatsapp text,
  check_in date,
  check_out date,
  guests integer,
  total_price numeric(10,2),
  status text not null default 'confirmed' check (status in ('confirmed', 'checked_in', 'checked_out', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('paid', 'partially_paid', 'unpaid')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  whatsapp text,
  nationality text,
  notes text,
  total_bookings integer not null default 0,
  total_spent numeric(10,2) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_communication_logs (
  id uuid primary key default gen_random_uuid(),
  recipient_name text not null,
  recipient_email text not null,
  channel text not null check (channel in ('Email', 'WhatsApp')),
  subject text,
  message text not null,
  status text not null default 'sent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create Indexes
create index if not exists reservations_status_idx on public.ba_reservations (status);
create index if not exists reservations_email_idx on public.ba_reservations (email);
create index if not exists guests_status_idx on public.ba_guests (status);
create index if not exists guests_email_idx on public.ba_guests (email);
create index if not exists communication_logs_channel_idx on public.ba_communication_logs (channel);

-- 3. Set up triggers for updated_at
drop trigger if exists set_updated_at_reservations on public.ba_reservations;
create trigger set_updated_at_reservations
  before update on public.ba_reservations
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_guests on public.ba_guests;
create trigger set_updated_at_guests
  before update on public.ba_guests
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_communication_logs on public.ba_communication_logs;
create trigger set_updated_at_communication_logs
  before update on public.ba_communication_logs
  for each row execute function public.set_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.ba_reservations enable row level security;
alter table public.ba_guests enable row level security;
alter table public.ba_communication_logs enable row level security;

-- 5. RLS Policies (Admins only for select, insert, update, delete)
drop policy if exists "Admins manage reservations" on public.ba_reservations;
create policy "Admins manage reservations"
  on public.ba_reservations
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins manage guests" on public.ba_guests;
create policy "Admins manage guests"
  on public.ba_guests
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins manage communication logs" on public.ba_communication_logs;
create policy "Admins manage communication logs"
  on public.ba_communication_logs
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());
