-- Run this in Supabase SQL Editor if admin space management or booking review fails.
-- Fixes: missing INSERT/UPDATE/DELETE policies on spaces table.

-- Spaces: allow API routes (anon key) to manage spaces
drop policy if exists "Anon can insert spaces" on public.spaces;
create policy "Anon can insert spaces"
  on public.spaces for insert to anon with check (true);

drop policy if exists "Anon can update spaces" on public.spaces;
create policy "Anon can update spaces"
  on public.spaces for update to anon using (true);

drop policy if exists "Anon can delete spaces" on public.spaces;
create policy "Anon can delete spaces"
  on public.spaces for delete to anon using (true);

-- Profiles: allow admin API to read student info for pending request review
drop policy if exists "Anon can view profiles" on public.profiles;
create policy "Anon can view profiles"
  on public.profiles for select to anon using (true);
