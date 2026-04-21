create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  source text not null default 'user' check (source in ('user', 'import', 'generated', 'system')),
  version integer not null default 0 check (version >= 0),
  valid_from date not null,
  valid_to date not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint meal_plans_valid_range check (valid_from <= valid_to)
);

create index if not exists meal_plans_user_id_idx on public.meal_plans(user_id);
create index if not exists meal_plans_user_status_idx on public.meal_plans(user_id, status) where deleted_at is null;
create index if not exists meal_plans_user_range_idx on public.meal_plans(user_id, valid_from, valid_to) where deleted_at is null;
create index if not exists meal_plans_user_updated_idx on public.meal_plans(user_id, updated_at desc) where deleted_at is null;

drop trigger if exists meal_plans_set_updated_at on public.meal_plans;
create trigger meal_plans_set_updated_at
before update on public.meal_plans
for each row
execute function public.set_updated_at();

alter table public.meal_plans enable row level security;

drop policy if exists "meal_plans_select_own" on public.meal_plans;
create policy "meal_plans_select_own"
on public.meal_plans
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "meal_plans_insert_own" on public.meal_plans;
create policy "meal_plans_insert_own"
on public.meal_plans
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "meal_plans_update_own" on public.meal_plans;
create policy "meal_plans_update_own"
on public.meal_plans
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "meal_plans_delete_own" on public.meal_plans;
create policy "meal_plans_delete_own"
on public.meal_plans
for delete
to authenticated
using ((select auth.uid()) = user_id);
