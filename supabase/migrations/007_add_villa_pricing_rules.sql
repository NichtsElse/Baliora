-- Purpose: Defines the table for seasonal and special pricing rules per villa.
-- Used by: Supabase SQL editor / migration runner.
-- Main dependencies: ba_villa_listings table.
-- Side effects: Creates the table, index, updated_at trigger, and row-level security policies.

create table if not exists public.ba_villa_pricing_rules (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid references public.ba_villa_listings(id) on delete cascade,
  villa_name text not null,
  rule_name text not null,
  start_date date not null,
  end_date date not null,
  rate_type text not null check (rate_type in ('fixed', 'multiplier')),
  value numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ba_villa_pricing_rules_villa_id_idx on public.ba_villa_pricing_rules(villa_id);

drop trigger if exists set_updated_at_villa_pricing_rules on public.ba_villa_pricing_rules;
create trigger set_updated_at_villa_pricing_rules
before update on public.ba_villa_pricing_rules
for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.ba_villa_pricing_rules enable row level security;

-- Policies
drop policy if exists "Allow read for authenticated users" on public.ba_villa_pricing_rules;
create policy "Allow read for authenticated users"
  on public.ba_villa_pricing_rules for select
  to authenticated
  using (true);

drop policy if exists "Allow all actions for admin/managers" on public.ba_villa_pricing_rules;
create policy "Allow all actions for admin/managers"
  on public.ba_villa_pricing_rules for all
  to authenticated
  using (public.is_admin_user());
