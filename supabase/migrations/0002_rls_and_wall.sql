-- Row-level security and the public read surface (brief §8 RLS, plan Departures 3 & 4).
--
-- members: the browser may read its own row and nothing else. All writes go through
--   server actions using the service role, which validate input first. A client-side
--   update policy would let a flagged member run `set status = 'active'` with the public key.
-- link_reveals: service role only.
-- The member wall and counts are security-definer functions exposing only safe columns,
--   so email is unreachable from any client.

alter table public.members enable row level security;
alter table public.link_reveals enable row level security;

revoke all on public.members from anon, authenticated;
revoke all on public.link_reveals from anon, authenticated;
revoke all on sequence public.link_reveals_id_seq from anon, authenticated;

grant select on public.members to authenticated;

create policy members_select_own on public.members
  for select to authenticated
  using (user_id = (select auth.uid()));

create function public.member_wall(max_rows int default 200)
returns table (display_name text, instagram text, role public.member_role, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select m.display_name, m.instagram, m.role, m.created_at
  from public.members m
  where m.show_on_wall and m.status = 'active'
  order by m.created_at desc
  limit least(greatest(coalesce(max_rows, 200), 0), 500)
$$;

create function public.member_counts()
returns table (total int, creators int, editors int, other int)
language sql
stable
security definer
set search_path = ''
as $$
  select
    count(*)::int,
    (count(*) filter (where m.role = 'creator'))::int,
    (count(*) filter (where m.role = 'editor'))::int,
    (count(*) filter (where m.role = 'other'))::int
  from public.members m
  where m.status = 'active'
$$;

revoke all on function public.member_wall(int) from public;
revoke all on function public.member_counts() from public;
grant execute on function public.member_wall(int) to anon, authenticated, service_role;
grant execute on function public.member_counts() to anon, authenticated, service_role;
