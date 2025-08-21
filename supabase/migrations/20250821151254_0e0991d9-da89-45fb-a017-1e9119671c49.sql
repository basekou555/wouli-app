
-- 1) Helper: détecter un admin
create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path to 'public','pg_temp'
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.type = 'admin'
  );
$$;

grant execute on function public.is_admin_user() to authenticated;

-- 2) Étendre les RLS pour inclure les admins sur events_pending
alter table public.events_pending enable row level security;

drop policy if exists "Admins can view pending events" on public.events_pending;
create policy "Admins can view pending events"
on public.events_pending
for select
to authenticated
using (public.is_admin_user());

drop policy if exists "Admins can update pending events" on public.events_pending;
create policy "Admins can update pending events"
on public.events_pending
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Admins can delete pending events" on public.events_pending;
create policy "Admins can delete pending events"
on public.events_pending
for delete
to authenticated
using (public.is_admin_user());

-- On conserve vos politiques existantes pour les users "business"

-- 3) Brancher les triggers utiles
drop trigger if exists trg_set_events_pending_validation on public.events_pending;
create trigger trg_set_events_pending_validation
before update on public.events_pending
for each row
execute function public.set_events_pending_validation();

-- Validation basique d’URL si fournie
drop trigger if exists trg_validate_external_url_events_pending on public.events_pending;
create trigger trg_validate_external_url_events_pending
before insert or update of external_url
on public.events_pending
for each row
execute function public.validate_external_url();

drop trigger if exists trg_validate_external_url_events on public.events;
create trigger trg_validate_external_url_events
before insert or update of external_url
on public.events
for each row
execute function public.validate_external_url();

-- 4) RPC: approuver et publier l’événement
create or replace function public.approve_pending_event(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $$
declare
  rec public.events_pending%rowtype;
begin
  if not public.is_admin_user() then
    raise exception 'Not authorized';
  end if;

  select *
  into rec
  from public.events_pending
  where id = p_event_id
    and status = 'pending'
  for update;

  if not found then
    raise exception 'Pending event not found or already processed';
  end if;

  -- Marquer approuvé + tamponner
  update public.events_pending
  set status = 'approved',
      validated_at = now(),
      validated_by = auth.uid()
  where id = p_event_id;

  -- Publier dans events (en s’appuyant sur les defaults pour le reste)
  insert into public.events (
    date, title, description, location, address, category, price, image_url, external_url, created_by, status
  ) values (
    rec.date, rec.title, rec.description, rec.location, rec.address, rec.category, rec.price, rec.image_url, rec.external_url, auth.uid(), 'active'
  );
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

  update public.events_pending
  set status = 'rejected',
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
