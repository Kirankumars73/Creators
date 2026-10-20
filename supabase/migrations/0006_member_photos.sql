-- Member photos (2026-10-20): one photo per member, shown on their pass, their page and the
-- directory only when they switch it on.
--
-- The bucket is PRIVATE: files are never reachable by URL. The site reads them with the service
-- role and serves them itself, and only when photo_public is set, so switching it off really
-- hides the photo (a public bucket could not). storage.objects keeps Supabase's default of RLS
-- on with no policies, so the browser keys can't list, read or write anything in it.
--
-- photo_path is never returned by the read functions below: only a has_photo flag.

alter table public.members
  add column photo_path text,
  add column photo_public boolean not null default false;

insert into storage.buckets (id, name, public) values ('member-photos', 'member-photos', false)
on conflict (id) do nothing;

drop function public.member_directory(int);
create function public.member_directory(max_rows int default 500)
returns table (
  display_name text,
  instagram text,
  role public.member_role,
  created_at timestamptz,
  city text,
  tags text[],
  has_profile boolean,
  has_photo boolean
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
    m.profile_public,
    (m.photo_public and m.photo_path is not null)
  from public.members m
  where m.show_on_wall and m.status = 'active'
  order by m.created_at desc
  limit least(greatest(coalesce(max_rows, 500), 0), 2000)
$$;

drop function public.member_profile(text);
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
  has_profile boolean,
  has_photo boolean
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
    m.profile_public,
    (m.photo_public and m.photo_path is not null)
  from public.members m
  where lower(m.instagram) = lower(handle) and m.show_on_wall and m.status = 'active'
  order by m.created_at
  limit 1
$$;

revoke all on function public.member_directory(int) from public;
revoke all on function public.member_profile(text) from public;
grant execute on function public.member_directory(int) to anon, authenticated, service_role;
grant execute on function public.member_profile(text) to anon, authenticated, service_role;
