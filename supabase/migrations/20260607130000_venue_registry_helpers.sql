-- Aides au registre de lieux : lister les lieux inconnus + les classer (admin only).
-- classify_venue écrit dans venues (RLS bloque l'écriture directe) → security definer + is_admin().

-- Lieux d'events absents du registre, triés par volume. Lecture seule, non sensible.
create or replace function public.unknown_venues(p_days int default 400)
returns table(location text, n_events bigint)
language sql
stable
as $$
  select e.location, count(*)::bigint as n_events
  from events e
  where e.location is not null and length(btrim(e.location)) > 0
    and e.status in ('active', 'validated', 'pending') and e.archived_at is null
    and e.date >= now() - make_interval(days => p_days)
    and public.venue_profile(e.location) is null
  group by e.location
  order by count(*) desc, e.location;
$$;

-- Classe (ou reclasse) un lieu dans le registre. Admin uniquement.
create or replace function public.classify_venue(p_name text, p_profile text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_alias text := lower(btrim(p_name));
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only';
  end if;
  if coalesce(btrim(p_name), '') = '' then
    raise exception 'nom de lieu vide';
  end if;
  if p_profile not in ('scene', 'club', 'mixte', 'journee') then
    raise exception 'profil invalide: %', p_profile;
  end if;

  select id into v_id from public.venues
   where lower(name) = v_alias or v_alias = any(aliases)
   limit 1;

  if v_id is null then
    insert into public.venues (name, aliases, profile, confirmed)
    values (btrim(p_name), array[v_alias], p_profile, true);
  else
    update public.venues
       set profile = p_profile,
           confirmed = true,
           updated_at = now(),
           aliases = (select array(select distinct a from unnest(aliases || array[v_alias]) a))
     where id = v_id;
  end if;
end;
$$;

grant execute on function public.unknown_venues(int) to authenticated;
grant execute on function public.classify_venue(text, text) to authenticated;
