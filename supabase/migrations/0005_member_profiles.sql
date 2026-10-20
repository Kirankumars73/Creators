-- Member profiles ("creator kit", 2026-10-20): a public page per member at /m/<handle>.
--
-- Members who joined before this agreed to the wall showing only name, handle and room, so the
-- new details (district, crafts, what they do, portfolio) need their own consent:
-- profile_public, off by default. It is set by the join form or from /me, through server
-- actions only (members still have no UPDATE grant).
--
-- Both read functions are security definer and return named columns only: email, user ids and
-- avatar URLs stay unreachable from the browser.

alter table public.members add column profile_public boolean not null default false;

alter table public.brand_briefs
  add column for_instagram text check (for_instagram is null or for_instagram ~ '^[a-zA-Z0-9._]{1,30}$');

create function public.member_directory(max_rows int default 500)
returns table (
  display_name text,
  instagram text,
  role public.member_role,
  created_at timestamptz,
  city text,
  tags text[],
  has_profile boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    m.display_name,
    m.instagram,
    m.role,
    m.created_at,
    case when m.profile_public then m.city end,
    case when m.profile_public then m.tags else '{}'::text[] end,
    m.profile_public
  from public.members m
  where m.show_on_wall and m.status = 'active'
  order by m.created_at desc
  limit least(greatest(coalesce(max_rows, 500), 0), 2000)
$$;

create function public.member_profile(handle text)
returns table (
  display_name text,
  instagram text,
  role public.member_role,
  role_other_text text,
  created_at timestamptz,
  city text,
  tags text[],
  portfolio_url text,
  has_profile boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    m.display_name,
    m.instagram,
    m.role,
    case when m.profile_public then m.role_other_text end,
    m.created_at,
    case when m.profile_public then m.city end,
    case when m.profile_public then m.tags else '{}'::text[] end,
    case when m.profile_public then m.portfolio_url end,
    m.profile_public
  from public.members m
  where lower(m.instagram) = lower(handle) and m.show_on_wall and m.status = 'active'
  order by m.created_at
  limit 1
$$;

revoke all on function public.member_directory(int) from public;
revoke all on function public.member_profile(text) from public;
grant execute on function public.member_directory(int) to anon, authenticated, service_role;
grant execute on function public.member_profile(text) to anon, authenticated, service_role;
