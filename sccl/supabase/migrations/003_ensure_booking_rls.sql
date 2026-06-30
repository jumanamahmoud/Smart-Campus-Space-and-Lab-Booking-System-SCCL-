-- Run in Supabase SQL Editor if bookings exist in the dashboard but do not
-- appear in the student history or admin availability grid.
-- API routes use the anon/publishable key unless SUPABASE_SERVICE_ROLE_KEY is set.

alter table public.booking_requests enable row level security;

drop policy if exists "Anon can view booking requests" on public.booking_requests;
create policy "Anon can view booking requests"
  on public.booking_requests for select to anon using (true);

drop policy if exists "Anon can insert booking requests" on public.booking_requests;
create policy "Anon can insert booking requests"
  on public.booking_requests for insert to anon with check (true);

drop policy if exists "Anon can update booking requests" on public.booking_requests;
create policy "Anon can update booking requests"
  on public.booking_requests for update to anon using (true);
