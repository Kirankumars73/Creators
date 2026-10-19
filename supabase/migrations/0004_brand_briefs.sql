-- Brand briefs: the "For brands" form on the landing page (redesign, 2026-10-20).
-- Public, unauthenticated form → a server action validates and inserts with the service role.
-- Nobody else can touch this table: brand contact details must not be readable with the public
-- key, so RLS is on with no policies, and anon/authenticated hold no grants at all.

create type public.brief_status as enum ('new', 'read', 'archived');

create table public.brand_briefs (
  id           uuid primary key default gen_random_uuid(),
  brand        text not null check (char_length(brand) between 2 and 80),
  contact_name text not null check (char_length(contact_name) between 2 and 60),
  email        text not null check (char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone        text check (phone is null or phone ~ '^\+?[0-9 ()-]{7,20}$'),
  brief        text check (brief is null or char_length(brief) <= 1500),
  status       public.brief_status not null default 'new',
  created_at   timestamptz not null default now()
);

create index brand_briefs_created_idx on public.brand_briefs (created_at desc);

alter table public.brand_briefs enable row level security;
revoke all on public.brand_briefs from anon, authenticated;
grant select, insert, update on public.brand_briefs to service_role;
