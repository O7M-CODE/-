-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_admin boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Drop existing policies if any
drop policy if exists "users_read_own_profile" on public.profiles;
drop policy if exists "admins_read_all_profiles" on public.profiles;
drop policy if exists "admins_update_all_profiles" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;

-- Helper function to check admin status
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
end;
$$;

-- Profiles RLS policies
create policy "users_read_own_profile" on public.profiles
  for select using (auth.uid() = id);

create policy "admins_read_all_profiles" on public.profiles
  for select using (public.is_admin());

create policy "admins_update_all_profiles" on public.profiles
  for update using (public.is_admin());

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
