-- Create Housekeeping and Maintenance tables for Supabase

-- 1. Create Tables
create table if not exists public.ba_housekeeping_tasks (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid references public.ba_villa_listings(id) on delete set null,
  villa_name text not null,
  room_number text not null,
  task_type text not null,
  assigned_to text,
  scheduled_date date not null,
  status text not null default 'pending' check (status in ('pending', 'cleaning', 'clean', 'inspected')),
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ba_maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid references public.ba_villa_listings(id) on delete set null,
  villa_name text not null,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'emergency')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'resolved')),
  assigned_to text,
  estimated_cost numeric(10,2) not null default 0,
  reported_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create Indexes
create index if not exists housekeeping_tasks_status_idx on public.ba_housekeeping_tasks (status);
create index if not exists housekeeping_tasks_date_idx on public.ba_housekeeping_tasks (scheduled_date);
create index if not exists maintenance_tickets_status_idx on public.ba_maintenance_tickets (status);
create index if not exists maintenance_tickets_priority_idx on public.ba_maintenance_tickets (priority);

-- 3. Set up triggers for updated_at
drop trigger if exists set_updated_at_housekeeping_tasks on public.ba_housekeeping_tasks;
create trigger set_updated_at_housekeeping_tasks
  before update on public.ba_housekeeping_tasks
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_maintenance_tickets on public.ba_maintenance_tickets;
create trigger set_updated_at_maintenance_tickets
  before update on public.ba_maintenance_tickets
  for each row execute function public.set_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.ba_housekeeping_tasks enable row level security;
alter table public.ba_maintenance_tickets enable row level security;

-- 5. RLS Policies (Admins only)
drop policy if exists "Admins manage housekeeping tasks" on public.ba_housekeeping_tasks;
create policy "Admins manage housekeeping tasks"
  on public.ba_housekeeping_tasks
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins manage maintenance tickets" on public.ba_maintenance_tickets;
create policy "Admins manage maintenance tickets"
  on public.ba_maintenance_tickets
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());
