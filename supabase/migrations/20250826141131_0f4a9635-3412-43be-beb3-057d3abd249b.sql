
-- 1) RPC: valider/rejeter directement dans public.events

create or replace function public.approve_pending_event(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $$
begin
  if not public.is_admin_user() then
    raise exception 'Not authorized';
  end if;

  -- On passe l’événement en "active" et on tamponne la validation
  update public.events
  set 
    status = 'active',
    validated_at = now(),
    validated_by = auth.uid()
  where id = p_event_id
    and status = 'pending';

  if not found then
    raise exception 'Pending event not found or already processed';
  end if;
end;
$$;

create or replace function public.reject_pending_event(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $$
begin
  if not public.is_admin_user() then
    raise exception 'Not authorized';
  end if;

  update public.events
  set 
    status = 'rejected',
    validated_at = now(),
    validated_by = auth.uid()
  where id = p_event_id
    and status = 'pending';

  if not found then
    raise exception 'Pending event not found or already processed';
  end if;
end;
$$;

grant execute on function public.approve_pending_event(uuid) to authenticated;
grant execute on function public.reject_pending_event(uuid) to authenticated;

-- 2) Proposer un événement public: insérer directement dans public.events en 'pending'
--    Note: auth requis (created_by est NOT NULL dans events)
create or replace function public.propose_event_public(
  p_title text,
  p_description text,
  p_location text,
  p_address text,
  p_date timestamptz,
  p_category event_category,
  p_price numeric DEFAULT 0,
  p_external_url text DEFAULT null,
  p_submitter_email text DEFAULT null
)
returns uuid
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $$
declare
  new_event_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  -- Rate limiting par email si fourni (sur les 24h)
  if p_submitter_email is not null then
    if (
      select count(*)
      from public.events
      where submitter_email = p_submitter_email
        and created_at > now() - interval '24 hours'
    ) >= 5 then
      raise exception 'Rate limit exceeded. Maximum 5 submissions per email per day.';
    end if;
  end if;

  insert into public.events (
    date, title, description, location, address, category, price,
    image_url, external_url, created_by, status, submitter_email
  ) values (
    p_date, p_title, p_description, p_location, p_address, p_category, p_price,
    null, p_external_url, auth.uid(), 'pending', p_submitter_email
  )
  returning id into new_event_id;

  return new_event_id;
end;
$$;

grant execute on function public.propose_event_public(
  text, text, text, text, timestamptz, event_category, numeric, text, text
) to authenticated;

-- 3) S’assurer des triggers utiles côté public.events

-- Déclencheur pour renseigner validated_at/by quand status passe à approved ou rejected
-- (noter que notre RPC "approve" renseigne déjà ces champs en passant en 'active')
drop trigger if exists trg_set_events_validation on public.events;
create trigger trg_set_events_validation
before update on public.events
for each row
execute function public.set_events_pending_validation();

-- Validation d’URL pour external_url
drop trigger if exists trg_validate_external_url_events on public.events;
create trigger trg_validate_external_url_events
before insert or update of external_url
on public.events
for each row
execute function public.validate_external_url();

-- 4) Nettoyage events_pending: triggers, policies, table

-- Supprimer triggers éventuels
drop trigger if exists trg_set_events_pending_validation on public.events_pending;
drop trigger if exists trg_validate_external_url_events_pending on public.events_pending;

-- Supprimer RLS policies (si elles existent)
drop policy if exists "Admins can delete pending events" on public.events_pending;
drop policy if exists "Admins can update pending events" on public.events_pending;
drop policy if exists "Admins can view pending events" on public.events_pending;
drop policy if exists "Authenticated users can propose events" on public.events_pending;
drop policy if exists "Business can delete pending events" on public.events_pending;
drop policy if exists "Business can update pending events" on public.events_pending;
drop policy if exists "Business can view pending events" on public.events_pending;

-- Supprimer la table
drop table if exists public.events_pending;
