-- Creators Kootam — members schema (brief §8), plus:
--   one_role_change: the "change lane once" rule from /me, enforced in the database;
--   link_reveals index for the per-member rate limit;
--   updated_at trigger.
-- No `admins` table: ADMIN_EMAILS is the single admin list (plan Departure 5).

create type public.member_role as enum ('creator', 'editor', 'other');
create type public.member_status as enum ('active', 'flagged', 'removed');

create table public.members (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  email           text not null,
  display_name    text not null check (char_length(display_name) between 2 and 60),
  avatar_url      text,
  instagram       text not null check (instagram ~ '^[a-zA-Z0-9._]{1,30}$'),
  role            public.member_role not null,
  role_other_text text,
  city            text not null,
  tags            text[] not null default '{}',
  portfolio_url   text,
  show_on_wall    boolean not null default true,
  accepted_code   boolean not null default false,
  status          public.member_status not null default 'active',
  role_changes    smallint not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint other_needs_text check (
    role <> 'other' or (role_other_text is not null and char_length(role_other_text) between 2 and 60)
  ),
  constraint must_accept_code check (accepted_code = true),
  constraint one_role_change check (role_changes between 0 and 1)
);

create table public.link_reveals (
  id          bigserial primary key,
  member_id   uuid not null references public.members(id) on delete cascade,
  link_key    text not null,
  revealed_at timestamptz not null default now()
);

create index members_role_idx on public.members (role) where status = 'active';
create index members_wall_idx on public.members (created_at desc) where show_on_wall and status = 'active';
create index link_reveals_member_idx on public.link_reveals (member_id, revealed_at desc);

create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger members_set_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();
