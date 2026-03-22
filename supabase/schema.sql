-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  daily_protein_goal  int not null default 150,
  daily_calorie_goal  int not null default 2000,
  seeded              boolean not null default false,
  updated_at          timestamptz default now()
);

create table public.foods (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  name                  text not null,
  serving_unit          text not null default '1 serving',
  calories_per_serving  numeric(8,2) not null default 0,
  protein_per_serving   numeric(8,2) not null default 0,
  created_at            timestamptz default now()
);

create unique index foods_user_name_unique on public.foods (user_id, lower(name));

create table public.daily_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  food_id     uuid not null references public.foods(id) on delete cascade,
  servings    numeric(6,2) not null default 1,
  logged_at   timestamptz not null default now(),
  notes       text,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────

create index daily_logs_user_logged_at_idx on public.daily_logs (user_id, logged_at desc);
create index foods_user_id_idx on public.foods (user_id);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

alter table public.profiles   enable row level security;
alter table public.foods       enable row level security;
alter table public.daily_logs  enable row level security;

-- profiles
create policy "profiles: owner select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = id);

-- foods
create policy "foods: owner select"
  on public.foods for select
  using (auth.uid() = user_id);

create policy "foods: owner insert"
  on public.foods for insert
  with check (auth.uid() = user_id);

create policy "foods: owner update"
  on public.foods for update
  using (auth.uid() = user_id);

create policy "foods: owner delete"
  on public.foods for delete
  using (auth.uid() = user_id);

-- daily_logs
create policy "daily_logs: owner select"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "daily_logs: owner insert"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "daily_logs: owner update"
  on public.daily_logs for update
  using (auth.uid() = user_id);

create policy "daily_logs: owner delete"
  on public.daily_logs for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- TRIGGER: auto-create profile row on signup
-- ─────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
