-- Persiste le motif de rejet d'un événement, choisi via les boutons de raison
-- de la fenêtre de rejet (Validation admin).

alter table public.events
  add column if not exists rejection_reason text;

-- Remplace reject_pending_event pour accepter un motif optionnel et le persister.
-- L'ancienne signature (uuid) est supprimée pour éviter toute ambiguïté de surcharge
-- côté PostgREST.
drop function if exists public.reject_pending_event(uuid);

create or replace function public.reject_pending_event(p_event_id uuid, p_reason text default null)
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
    rejection_reason = nullif(btrim(p_reason), ''),
    validated_at = now(),
    validated_by = auth.uid()
  where id = p_event_id
    and status = 'pending';

  if not found then
    raise exception 'Pending event not found or already processed';
  end if;
end;
$$;

grant execute on function public.reject_pending_event(uuid, text) to authenticated;
