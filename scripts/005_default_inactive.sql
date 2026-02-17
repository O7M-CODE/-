-- Migration: Set new users to inactive by default
-- New users must be activated by an admin before they can use the app.

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
    false  -- inactive by default, admin must activate
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
