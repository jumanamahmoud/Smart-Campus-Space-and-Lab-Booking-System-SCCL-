-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  capacity integer not null check (capacity > 0),
  type text not null,
  status text not null default 'available' check (status in ('available', 'maintenance')),
  created_at timestamptz not null default now()
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  space_id uuid not null references public.spaces(id) on delete cascade,
  booking_date date not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied', 'canceled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_booking_requests_space_date
  on public.booking_requests (space_id, booking_date);

create index if not exists idx_booking_requests_student
  on public.booking_requests (student_id);

-- Prevent duplicate approved bookings for the same space and date
create unique index if not exists idx_unique_approved_booking
  on public.booking_requests (space_id, booking_date)
  where status = 'approved';

alter table public.spaces enable row level security;
alter table public.booking_requests enable row level security;

create policy "Anyone can view spaces"
  on public.spaces for select using (true);

create policy "Students can view own booking requests"
  on public.booking_requests for select
  using (auth.uid() = student_id);

create policy "Students can create booking requests"
  on public.booking_requests for insert
  with check (auth.uid() = student_id);

create policy "Students can cancel own requests"
  on public.booking_requests for update
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- Temporary policies for server API routes using the anon key without a browser session.
-- Replace with authenticated policies once Supabase cookie auth is implemented.
create policy "Anon can view spaces"
  on public.spaces for select to anon using (true);

create policy "Anon can view booking requests"
  on public.booking_requests for select to anon using (true);

create policy "Anon can insert booking requests"
  on public.booking_requests for insert to anon with check (true);

create policy "Anon can update booking requests"
  on public.booking_requests for update to anon using (true);

-- Sample spaces for development
insert into public.spaces (name, location, capacity, type, status) values
  ('Computer Lab A', 'Block A, Level 2', 30, 'Lab', 'available'),
  ('Research Lab B', 'Block B, Level 1', 15, 'Lab', 'available'),
  ('Meeting Room 101', 'Admin Building', 12, 'Meeting Room', 'available'),
  ('Innovation Hub', 'Block C, Ground Floor', 50, 'Multi-purpose', 'available'),
  ('Electronics Lab', 'Engineering Wing', 20, 'Lab', 'maintenance')
on conflict do nothing;
