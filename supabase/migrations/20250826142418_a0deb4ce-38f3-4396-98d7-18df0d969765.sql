
-- 1) Table de logs de modération
create table if not exists public.event_moderation_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  action text not null, -- 'approve' | 'reject' | 'revert' | 'edit' | 'unapprove' | 'unreject'
  from_status text,
  to_status text,
  reason text,
  admin_id uuid not null,
  changed_fields jsonb,
  created_at timestamptz not null default now()
);

-- FK optionnelle (on évite la contrainte dure si vous préférez)
-- alter table public.event_moderation_logs
--   add constraint event_moderation_logs_event_id_fkey
--   foreign key (event_id) references public.events(id) on delete cascade;

alter table public.event_moderation_logs enable row level security;

-- Politiques: admin lecture intégrale
create policy if not exists "Admins can read all moderation logs"
  on public.event_moderation_logs
  for select
  using (public.is_admin_user());

-- Les créateurs peuvent lire les logs de leurs propres événements
create policy if not exists "Creators can read their own event logs"
  on public.event_moderation_logs
  for select
  using (
    exists (
      select 1 from public.events e
      where e.id = event_moderation_logs.event_id
        and e.created_by = auth.uid()
    )
  );

-- Insert réservé aux admins (les RPC sont SECURITY DEFINER, mais on limite quand même)
create policy if not exists "Admins can insert moderation logs"
  on public.event_moderation_logs
  for insert
  with check (public.is_admin_user());

-- Pas d'UPDATE/DELETE direct sur les logs


-- 2) Donner aux admins le droit d'UPDATE sur tous les events (utile si on fait des updates directs côté client)
-- (Public peut déjà SELECT; les créateurs ont déjà ALL sur leurs events)
create policy if not exists "Admins can update any event"
  on public.events
  for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- 3) RPC pour changer le statut (single)
create or replace function public.admin_set_event_status(
  p_event_id uuid,
  p_status text,
  p_reason text default null
) returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_old_status text;
  v_action text;
begin
  if not public.is_admin_user() then
    raise exception 'Not authorized';
  end if;

  if p_status not in ('pending','active','rejected') then
    raise exception 'Invalid status %', p_status;
  end if;

  select status into v_old_status from public.events where id = p_event_id;
  if not found then
    raise exception 'Event not found';
  end if;

  -- Déterminer l'action pour le log
  if v_old_status = 'pending' and p_status = 'active' then
    v_action := 'approve';
  elsif v_old_status = 'pending' and p_status = 'rejected' then
    v_action := 'reject';
  elsif v_old_status = 'active' and p_status = 'pending' then
    v_action := 'unapprove';
  elsif v_old_status = 'rejected' and p_status = 'pending' then
    v_action := 'unreject';
  else
    v_action := 'revert';
  end if;

  update public.events
  set
    status = p_status,
    validated_at = case when p_status in ('active','rejected') then now() else null end,
    validated_by = case when p_status in ('active','rejected') then auth.uid() else null end,
    updated_at = now()
  where id = p_event_id;

  insert into public.event_moderation_logs(event_id, action, from_status, to_status, reason, admin_id)
  values (p_event_id, v_action, v_old_status, p_status, p_reason, auth.uid());
end;
$$;

-- 4) RPC pour changer le statut en bulk
create or replace function public.admin_bulk_set_event_status(
  p_event_ids uuid[],
  p_status text,
  p_reason text default null
) returns integer
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_id uuid;
  v_count int := 0;
begin
  if not public.is_admin_user() then
    raise exception 'Not authorized';
  end if;

  foreach v_id in array p_event_ids loop
    perform public.admin_set_event_status(v_id, p_status, p_reason);
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- 5) RPC pour éditer les champs d'un event (seulement ceux fournis)
create or replace function public.admin_update_event_fields(
  p_event_id uuid,
  p_title text default null,
  p_description text default null,
  p_date timestamptz default null,
  p_end_time timestamptz default null,
  p_location text default null,
  p_address text default null,
  p_category event_category default null,
  p_price numeric default null,
  p_image_url text default null,
  p_external_url text default null,
  p_reason text default null
) returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_old_status text;
  v_changed jsonb;
begin
  if not public.is_admin_user() then
    raise exception 'Not authorized';
  end if;

  -- JSON des champs fournis (sans nulls)
  v_changed := jsonb_strip_nulls(jsonb_build_object(
    'title', p_title,
    'description', p_description,
    'date', to_char(p_date, 'YYYY-MM-DD"T"HH24:MI:SSOF'),
    'end_time', to_char(p_end_time, 'YYYY-MM-DD"T"HH24:MI:SSOF'),
    'location', p_location,
    'address', p_address,
    'category', p_category,
    'price', p_price,
    'image_url', p_image_url,
    'external_url', p_external_url
  ));

  update public.events
  set
    title = coalesce(p_title, title),
    description = coalesce(p_description, description),
    date = coalesce(p_date, date),
    end_time = coalesce(p_end_time, end_time),
    location = coalesce(p_location, location),
    address = coalesce(p_address, address),
    category = coalesce(p_category, category),
    price = coalesce(p_price, price),
    image_url = coalesce(p_image_url, image_url),
    external_url = coalesce(p_external_url, external_url),
    updated_at = now()
  where id = p_event_id;

  insert into public.event_moderation_logs(event_id, action, from_status, to_status, reason, admin_id, changed_fields)
  values (p_event_id, 'edit', null, null, p_reason, auth.uid(), nullif(v_changed, '{}'::jsonb));
end;
$$;
