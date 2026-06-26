-- Create Owner Contracts and Owner Revenue Entries tables for Supabase

-- 1. Create Tables
create table if not exists public.ba_owner_contracts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.ba_villa_owners(id) on delete cascade,
  owner_name text not null,
  villa_id uuid references public.ba_villa_listings(id) on delete cascade,
  villa_name text not null,
  contract_type text not null default 'Full Management' check (contract_type in ('Full Management', 'Rental Only', 'Maintenance Only', 'Custom')),
  start_date date not null,
  end_date date,
  revenue_share_percent numeric(5,2) not null check (revenue_share_percent between 0 and 100),
  management_fee_type text not null default 'percentage' check (management_fee_type in ('percentage', 'fixed')),
  status text not null default 'active' check (status in ('active', 'expired', 'pending', 'renewed')),
  signed_date date,
  notes text,
  document_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_owner_revenue_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.ba_villa_owners(id) on delete set null,
  owner_name text not null,
  villa_id uuid references public.ba_villa_listings(id) on delete cascade,
  villa_name text not null,
  period_month text not null, -- format: YYYY-MM
  gross_revenue numeric(12,2) not null default 0.00,
  management_fee numeric(12,2) not null default 0.00,
  net_payout numeric(12,2) not null default 0.00,
  occupancy_rate numeric(5,2),
  nights_booked integer,
  payment_status text not null default 'pending' check (payment_status in ('paid', 'pending')),
  payment_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create Indexes
create index if not exists owner_contracts_owner_id_idx on public.ba_owner_contracts (owner_id);
create index if not exists owner_contracts_villa_id_idx on public.ba_owner_contracts (villa_id);
create index if not exists owner_contracts_status_idx on public.ba_owner_contracts (status);
create index if not exists owner_revenue_owner_id_idx on public.ba_owner_revenue_entries (owner_id);
create index if not exists owner_revenue_villa_id_idx on public.ba_owner_revenue_entries (villa_id);
create index if not exists owner_revenue_period_month_idx on public.ba_owner_revenue_entries (period_month);

-- 3. Set up triggers for updated_at
drop trigger if exists set_updated_at_owner_contracts on public.ba_owner_contracts;
create trigger set_updated_at_owner_contracts
  before update on public.ba_owner_contracts
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_owner_revenue on public.ba_owner_revenue_entries;
create trigger set_updated_at_owner_revenue
  before update on public.ba_owner_revenue_entries
  for each row execute function public.set_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.ba_owner_contracts enable row level security;
alter table public.ba_owner_revenue_entries enable row level security;

-- 5. RLS Policies (Admins only for manage)
drop policy if exists "Admins manage owner contracts" on public.ba_owner_contracts;
create policy "Admins manage owner contracts"
  on public.ba_owner_contracts
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins manage owner revenue entries" on public.ba_owner_revenue_entries;
create policy "Admins manage owner revenue entries"
  on public.ba_owner_revenue_entries
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());
