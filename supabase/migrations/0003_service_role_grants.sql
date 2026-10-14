-- Server writes must not depend on a project's default privileges (final review).
-- Supabase normally grants service_role on new public tables, but not every project is set
-- up that way; without these, every member write would fail on launch day.
grant select, insert, update on public.members to service_role;
grant select, insert on public.link_reveals to service_role;
grant usage, select on sequence public.link_reveals_id_seq to service_role;
