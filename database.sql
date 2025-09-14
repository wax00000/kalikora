-- SQL: Supabase setup
-- Enable extensions
create extension if not exists "pgcrypto";
create extension if not exists postgis;

-- Users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  role text check (role in ('rider','driver','admin')) not null,
  created_at timestamptz not null default now()
);

-- Drivers table
create table if not exists public.drivers (
  id uuid primary key references public.users(id) on delete cascade,
  full_name text,
  vehicle_make text,
  vehicle_model text,
  vehicle_color text,
  seats_total int not null check (seats_total between 1 and 8) default 4
);

-- Driver offers table
create table if not exists public.driver_offers (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete cascade,
  origin_city text not null,
  origin_point geography(point,4326) not null,
  destination_city text not null,
  destination_point geography(point,4326) not null,
  departure_time timestamptz not null,
  price_total numeric(10,2) not null,
  seats_total int not null,
  seats_available int not null,
  status text check (status in ('open','full','cancelled','completed')) not null default 'open',
  created_at timestamptz not null default now()
);

-- Bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.driver_offers(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  seats_reserved int not null check (seats_reserved between 1 and 8),
  price_paid numeric(10,2) not null,
  status text check (status in ('pending','confirmed','cancelled','refunded')) not null default 'pending',
  created_at timestamptz not null default now()
);

-- Rider requests table
create table if not exists public.rider_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  origin_city text not null,
  destination_city text not null,
  window_start timestamptz not null,
  window_end timestamptz not null,
  seats_needed int not null check (seats_needed between 1 and 8),
  price_offer numeric(10,2),
  status text check (status in ('open','matched','cancelled','expired')) not null default 'open',
  created_at timestamptz not null default now()
);

-- Events table for analytics
create table if not exists public.events (
  id bigserial primary key,
  event_type text not null,
  user_id uuid references public.users(id),
  payload jsonb,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.driver_offers enable row level security;
alter table public.bookings enable row level security;

-- RLS Policies
-- Public read policy on driver_offers (optional auth)
create policy "public_read" on public.driver_offers for select using (true) with check (true);

-- Driver can update own offers
create policy "driver_update_own" on public.driver_offers for update using (auth.uid() = driver_id);

-- Users select their own bookings
create policy "user_select_own" on public.bookings for select using (auth.uid() = user_id);

-- Sample PostgREST sanity check
-- select count(*) from driver_offers;

