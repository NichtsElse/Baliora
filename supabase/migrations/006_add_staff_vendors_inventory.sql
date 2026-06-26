-- Create Staff, Vendors, and Inventory tables for Supabase

-- 1. Create Tables
create table if not exists public.ba_ops_staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  contact_number text,
  shift text not null default 'Morning',
  assigned_villas text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_vendors (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  service_type text not null,
  contact_person text,
  phone text,
  email text,
  rating integer not null default 5 check (rating between 1 and 5),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_inventory_items (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  villa_id uuid references public.ba_villa_listings(id) on delete set null,
  villa_name text not null,
  category text not null,
  stock_level integer not null default 0 check (stock_level >= 0),
  minimum_required integer not null default 5 check (minimum_required >= 0),
  last_restocked date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create Indexes
create index if not exists ops_staff_status_idx on public.ba_ops_staff (status);
create index if not exists vendors_status_idx on public.ba_vendors (status);
create index if not exists inventory_items_villa_idx on public.ba_inventory_items (villa_id);

-- 3. Set up triggers for updated_at
drop trigger if exists set_updated_at_ops_staff on public.ba_ops_staff;
create trigger set_updated_at_ops_staff
  before update on public.ba_ops_staff
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_vendors on public.ba_vendors;
create trigger set_updated_at_vendors
  before update on public.ba_vendors
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_inventory_items on public.ba_inventory_items;
create trigger set_updated_at_inventory_items
  before update on public.ba_inventory_items
  for each row execute function public.set_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.ba_ops_staff enable row level security;
alter table public.ba_vendors enable row level security;
alter table public.ba_inventory_items enable row level security;

-- 5. RLS Policies (Admins only)
drop policy if exists "Admins manage ops staff" on public.ba_ops_staff;
create policy "Admins manage ops staff"
  on public.ba_ops_staff
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins manage vendors" on public.ba_vendors;
create policy "Admins manage vendors"
  on public.ba_vendors
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins manage inventory items" on public.ba_inventory_items;
create policy "Admins manage inventory items"
  on public.ba_inventory_items
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());
