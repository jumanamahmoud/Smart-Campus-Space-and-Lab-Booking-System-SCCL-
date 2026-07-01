-- Student profile fields and update policy for profile editing.

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text;

-- Allow API routes (anon key) to update student profiles
drop policy if exists "Anon can update profiles" on public.profiles;
create policy "Anon can update profiles"
  on public.profiles for update to anon using (true);
