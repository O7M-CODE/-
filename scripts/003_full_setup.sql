-- Drop existing policies safely
drop policy if exists "users_read_own_profile" on public.profiles;
drop policy if exists "admins_read_all_profiles" on public.profiles;
drop policy if exists "admins_update_all_profiles" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "admins_read_codes" on public.activation_codes;
drop policy if exists "admins_insert_codes" on public.activation_codes;
drop policy if exists "admins_update_codes" on public.activation_codes;
drop policy if exists "admins_delete_codes" on public.activation_codes;
drop policy if exists "anyone_read_unused_codes" on public.activation_codes;
drop policy if exists "anyone_update_unused_codes" on public.activation_codes;

-- Drop existing trigger
drop trigger if exists on_auth_user_created on auth.users;

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_admin boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

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

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, is_admin, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    false,
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Activation codes table
create table if not exists public.activation_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  created_by uuid references auth.users(id) on delete set null,
  used_by uuid references auth.users(id) on delete set null,
  is_used boolean default false,
  created_at timestamp with time zone default now(),
  used_at timestamp with time zone
);

alter table public.activation_codes enable row level security;

-- Activation codes RLS: admins full CRUD
create policy "admins_read_codes" on public.activation_codes
  for select using (public.is_admin());

create policy "admins_insert_codes" on public.activation_codes
  for insert with check (public.is_admin());

create policy "admins_update_codes" on public.activation_codes
  for update using (public.is_admin());

create policy "admins_delete_codes" on public.activation_codes
  for delete using (public.is_admin());

-- Allow anyone to read unused codes (for activation during signup)
create policy "anyone_read_unused_codes" on public.activation_codes
  for select using (is_used = false);

-- Allow anyone to update unused codes (for marking as used during signup)
create policy "anyone_update_unused_codes" on public.activation_codes
  for update using (is_used = false);
