-- Rejette en un appel tous les événements en attente dont la date est déjà passée.
-- Renvoie le nombre d'événements traités. Évite la limite de pagination côté client
-- (le bouton « Rejeter les N (Date passée) » ne traitait que la page chargée).

create or replace function public.reject_past_pending_events(p_reason text default 'Date passée')
returns integer
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $$
declare
  affected integer;
begin
  if not public.is_admin_user() then
    raise exception 'Not authorized';
  end if;

  update public.events
  set
    status = 'rejected',
    rejection_reason = nullif(btrim(p_reason), ''),
    validated_at = now(),
    validated_by = auth.uid()
  where status = 'pending'
    and events.date < now();

  get diagnostics affected = row_count;
  return affected;
end;
$$;

grant execute on function public.reject_past_pending_events(text) to authenticated;
