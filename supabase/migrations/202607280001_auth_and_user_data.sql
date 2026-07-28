create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  display_name text not null default '',
  role text not null default 'user' check (role in ('admin', 'user')),
  disabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_states (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('planner', 'finance')),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind)
);

alter table public.profiles enable row level security;
alter table public.user_states enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and disabled = false
  );
$$;

create or replace function public.is_active_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target_user_id = auth.uid() and exists (
    select 1 from public.profiles
    where id = auth.uid() and disabled = false
  );
$$;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "user_states_own_select" on public.user_states;
create policy "user_states_own_select"
on public.user_states for select
to authenticated
using (public.is_active_user(user_id));

drop policy if exists "user_states_own_insert" on public.user_states;
create policy "user_states_own_insert"
on public.user_states for insert
to authenticated
with check (public.is_active_user(user_id));

drop policy if exists "user_states_own_update" on public.user_states;
create policy "user_states_own_update"
on public.user_states for update
to authenticated
using (public.is_active_user(user_id))
with check (public.is_active_user(user_id));

drop policy if exists "user_states_own_delete" on public.user_states;
create policy "user_states_own_delete"
on public.user_states for delete
to authenticated
using (public.is_active_user(user_id));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  first_role text;
begin
  select case when exists (select 1 from public.profiles) then 'user' else 'admin' end
    into first_role;
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1)),
    first_role
  );
  return new;
end;
$$;

create or replace function public.protect_admin_invariants()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'admin' and (new.role <> 'admin' or new.disabled = true) then
    if (select count(*) from public.profiles where role = 'admin' and disabled = false) <= 1 then
      raise exception 'The last active administrator cannot be removed or disabled';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_admin_invariants on public.profiles;
create trigger protect_admin_invariants
  before update of role, disabled on public.profiles
  for each row execute procedure public.protect_admin_invariants();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, role, disabled, updated_at) on public.profiles to authenticated;
grant select, insert, update, delete on public.user_states to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_active_user(uuid) to authenticated;

create index if not exists user_states_user_id_idx on public.user_states(user_id);
create index if not exists profiles_role_idx on public.profiles(role);
