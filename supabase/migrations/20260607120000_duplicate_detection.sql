-- Détection de doublons d'événements (NON destructive) : retourne des paires suspectes.
-- L'admin tranche ensuite (archivage réversible). Aucune donnée modifiée ici.
create extension if not exists pg_trgm with schema extensions;

-- Normalisation de titre : minuscules, accents repliés, ponctuation -> espaces, espaces compactés.
-- Immutable (pas de dépendance à unaccent) pour rester sûre et rapide.
create or replace function public.wouli_norm_title(t text)
returns text
language sql
immutable
as $$
  select trim(regexp_replace(
    regexp_replace(
      translate(lower(coalesce(t, '')),
        'àâäáãéèêëíìîïóòôöõúùûüçñ’''`-', 'aaaaaeeeeiiiiooooouuuucn    '),
      '[^a-z0-9 ]', ' ', 'g'),
    '\s+', ' ', 'g'));
$$;

-- Paires de doublons probables : même jour + même lieu + titre similaire (trgm) ou inclus.
create or replace function public.find_duplicate_pairs(p_days int default 120)
returns table(a jsonb, b jsonb, sim real)
language sql
stable
as $$
  with ev as (
    select id, title, date, location, image_url, account_username, status,
           parsing_method, created_at,
           public.wouli_norm_title(title) as nt,
           lower(trim(coalesce(location, ''))) as nloc
    from events
    where status in ('active', 'validated', 'pending')
      and archived_at is null
      and location is not null and length(trim(location)) > 0
      and date >= now() - make_interval(days => p_days)
  )
  select (to_jsonb(e1) - 'nt' - 'nloc'),
         (to_jsonb(e2) - 'nt' - 'nloc'),
         similarity(e1.nt, e2.nt) as sim
  from ev e1
  join ev e2
    on e1.id < e2.id
   and e1.date::date = e2.date::date
   and e1.nloc = e2.nloc
   and e1.nt <> '' and e2.nt <> ''
   and (
        similarity(e1.nt, e2.nt) >= 0.5
        or replace(e1.nt, ' ', '') like replace(e2.nt, ' ', '') || '%'
        or replace(e2.nt, ' ', '') like replace(e1.nt, ' ', '') || '%'
       )
  order by e1.date::date, similarity(e1.nt, e2.nt) desc;
$$;

grant execute on function public.find_duplicate_pairs(int) to authenticated;
grant execute on function public.wouli_norm_title(text) to authenticated;
