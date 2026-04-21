alter table public.week_plans
  add column if not exists source text not null default 'user';

alter table public.meal_plans
  add column if not exists source text not null default 'user';

alter table public.training_plans
  add column if not exists source text not null default 'user';
