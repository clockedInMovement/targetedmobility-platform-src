-- =============================================================
-- The Targeted Mobility System - platform schema
-- Run this once in Supabase -> SQL Editor -> New query -> Run
-- =============================================================

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Member',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(split_part(new.email, '@', 1), 'Member'))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.purchases p
    where lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.is_admin
  );
$$;

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort int not null default 0
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  description text,
  video_embed_url text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  body text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;
alter table public.profiles  enable row level security;
alter table public.modules   enable row level security;
alter table public.lessons   enable row level security;
alter table public.posts     enable row level security;
alter table public.comments  enable row level security;

create policy "read own purchase" on public.purchases
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy "profiles readable by members" on public.profiles
  for select to authenticated using (public.is_member());
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "modules for members" on public.modules
  for select to authenticated using (public.is_member());
create policy "lessons for members" on public.lessons
  for select to authenticated using (public.is_member());

create policy "posts read" on public.posts
  for select to authenticated using (public.is_member());
create policy "posts create" on public.posts
  for insert to authenticated with check (public.is_member() and author_id = auth.uid());
create policy "posts update" on public.posts
  for update to authenticated using (author_id = auth.uid() or public.is_admin());
create policy "posts delete" on public.posts
  for delete to authenticated using (author_id = auth.uid() or public.is_admin());

create policy "comments read" on public.comments
  for select to authenticated using (public.is_member());
create policy "comments create" on public.comments
  for insert to authenticated with check (public.is_member() and author_id = auth.uid());
create policy "comments delete" on public.comments
  for delete to authenticated using (author_id = auth.uid() or public.is_admin());

insert into public.modules (title, sort) values
  ('Start Here', 0),
  ('The Locate Framework', 1),
  ('Knee Protocols', 2)
on conflict do nothing;

