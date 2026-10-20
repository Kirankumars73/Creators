-- Mirrors the parts of a Supabase database our migrations and RLS depend on,
-- so PGlite can run the real migration files. Keep in step with Supabase:
--   auth.uid()/auth.jwt() read the `request.jwt.claims` GUC set by PostgREST;
--   anon/authenticated/service_role exist and service_role bypasses RLS;
--   new public tables are granted to all three roles by default (RLS is the guard).

create schema if not exists auth;

create table auth.users (
  id uuid primary key,
  email text
);

create or replace function auth.jwt() returns jsonb
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid
$$;

create or replace function auth.role() returns text
language sql stable as $$
  select auth.jwt() ->> 'role'
$$;

create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- Supabase Storage, as far as our migrations touch it: the buckets table.
create schema if not exists storage;
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false
);
