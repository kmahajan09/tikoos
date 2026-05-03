-- Run in Supabase: Dashboard → SQL Editor (single script)
--
-- If your owner column is user_id (not created_by), replace created_by in:
--   - policies below
--   - insert_event(...) INSERT column list
-- and set NEXT_PUBLIC_EVENTS_OWNER_COLUMN=user_id in .env.local

alter table public.events enable row level security;

do $$
declare
  p text;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'events'
  loop
    execute format('drop policy if exists %I on public.events', p);
  end loop;
end $$;

grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.events to service_role;

create policy "events_select_own"
  on public.events
  for select
  to authenticated
  using (created_by::text = auth.uid()::text);

create policy "events_insert_own"
  on public.events
  for insert
  to authenticated
  with check (created_by::text = auth.uid()::text);

create policy "events_update_own"
  on public.events
  for update
  to authenticated
  using (created_by::text = auth.uid()::text)
  with check (created_by::text = auth.uid()::text);

create policy "events_delete_own"
  on public.events
  for delete
  to authenticated
  using (created_by::text = auth.uid()::text);

-- Inserts from the app use this RPC so RLS on INSERT cannot block a valid JWT.
-- auth.uid() is still the signed-in user; the function only runs with DEFINER rights on the table.
drop function if exists public.insert_event(text, text, text, text, int, text, text, text);

create or replace function public.insert_event(
  p_title text,
  p_subtitle text,
  p_event_date text,
  p_venue text,
  p_guest_count int,
  p_theme text,
  p_timezone text,
  p_notes text
)
returns public.events
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.events;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.events (
    title,
    subtitle,
    event_date,
    venue,
    guest_count,
    theme,
    timezone,
    notes,
    created_by
  ) values (
    p_title,
    coalesce(p_subtitle, ''),
    case
      when p_event_date is null or btrim(p_event_date) = '' then null
      else p_event_date::date
    end,
    coalesce(p_venue, ''),
    coalesce(p_guest_count, 0),
    coalesce(nullif(btrim(p_theme), ''), 'Garden Enchantment'),
    coalesce(nullif(btrim(p_timezone), ''), 'America/New_York'),
    coalesce(p_notes, ''),
    uid
  )
  returning * into strict r;

  return r;
end;
$$;

revoke all on function public.insert_event(text, text, text, text, int, text, text, text) from public;
grant execute on function public.insert_event(text, text, text, text, int, text, text, text) to authenticated;
grant execute on function public.insert_event(text, text, text, text, int, text, text, text) to service_role;

notify pgrst, 'reload schema';
