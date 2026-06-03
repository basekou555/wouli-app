-- Résout un nom de lieu scrapé vers le profil du registre (insensible casse/article).
create or replace function public.venue_profile(loc text)
returns text language sql stable as $$
  select v.profile
  from public.venues v
  where lower(btrim(loc)) = any (v.aliases)
     or lower(btrim(loc)) = lower(v.name)
  limit 1;
$$;

-- Recréation additive de active_events : ordre original conservé À L'IDENTIQUE,
-- nouvelles colonnes structurées ajoutées UNIQUEMENT à la fin (contrainte CREATE OR REPLACE).
create or replace view public.active_events as
 SELECT e.id,
    e.title,
    e.description,
    e.date,
    e.end_date,
    e."time",
    e.end_time,
    e.location,
    e.address,
    e.category,
    e.tags,
    e.image_url,
    e.external_url,
    e.price,
    e.max_participants,
    e.created_by,
    e.created_by_type,
    e.status,
    e.views,
    e.likes,
    e.participants,
    e.search_appearances,
    e.actual_participants,
    e.no_show_count,
    e.archived_at,
    e.created_at,
    e.updated_at,
    e.music_style,
    ( SELECT count(*) AS count
           FROM events e2
          WHERE lower(btrim(e2.title)) = lower(btrim(e.title)) AND e2.created_by = e.created_by) AS title_occurrences,
    ( SELECT count(*) AS count
           FROM events e3
          WHERE lower(btrim(e3.title)) = lower(btrim(e.title)) AND e3.created_by = e.created_by AND e3.date <= e.date) AS edition_number,
    -- ===== NOUVELLES COLONNES (ajout en fin) =====
    e.subtitle,
    e.image_focus_position,
    e.color_card,
    e.energy,
    e.event_type,
    e.ambiance,
    e.activity_type,
    e.venue_category,
    e.target_audience,
    e.social_intensity,
    e.event_format,
    e.is_unique,
    e.is_recurring,
    e.venue_id,
    e.account_username,
    e.parsing_confidence,
    e.parsing_method,
    public.venue_profile(e.location) AS venue_profile
   FROM events e
  WHERE (e.status = ANY (ARRAY['active'::text, 'validated'::text])) AND e.archived_at IS NULL AND e.date >= now();
