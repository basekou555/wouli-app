-- Registre des lieux lyonnais : source de vérité pour le profil d'énergie.
-- profile = comportement dominant du lieu :
--   'scene'   -> toujours SCENE (salle de concert / spectacle)
--   'club'    -> toujours CLUB (clubbing / DJ)
--   'mixte'   -> les deux : l'énergie se tranche au niveau de l'event
--   'journee' -> activités de jour (marché, expo, atelier...)
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  aliases text[] not null default '{}',
  profile text not null check (profile in ('scene','club','mixte','journee')),
  instagram text,
  address text,
  -- confirmed = profil validé par un humain (vs proposé par l'extracteur)
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists venues_aliases_gin on public.venues using gin (aliases);

alter table public.venues enable row level security;

drop policy if exists "venues_read_all" on public.venues;
create policy "venues_read_all" on public.venues for select using (true);

-- Seed : les 17 lieux réels de la base, profils validés manuellement.
insert into public.venues (name, aliases, profile, confirmed) values
  ('La Rayonne',                array['la rayonne'],                                  'scene', true),
  ('Kraspek Myzik',             array['kraspek myzik','kraspek'],                     'scene', true),
  ('Le Transbordeur',           array['le transbordeur','transbordeur'],              'mixte', true),
  ('Barrio Club',               array['barrio club','barrio'],                        'club',  true),
  ('Halle Tony Garnier',        array['halle tony garnier','tony garnier'],           'scene', true),
  ('Le Radiant',                array['le radiant','radiant','radiant-bellevue'],     'scene', true),
  ('LDLC Arena',                array['ldlc arena','ldlc'],                           'scene', true),
  ('Ninkasi Cordeliers',        array['ninkasi cordeliers','ninkasi'],                'mixte', true),
  ('Sonic Lyon',                array['sonic lyon','sonic'],                          'mixte', true),
  ('La Maison M',               array['la maison m','maison m'],                      'mixte', true),
  ('Le Marché Gare',            array['le marché gare','marché gare','marche gare'],  'scene', true),
  ('Théâtre Antique de Vienne', array['théâtre antique de vienne','théâtre antique de vienne, vienne'], 'scene', true),
  ('La Clef de Voûte',          array['la clef de voûte','clef de voûte','clef de voute'], 'scene', true),
  ('Sound Club',                array['sound club','sonic club'],                     'club',  true),
  ('La Feria',                  array['la feria','la feria lyon'],                    'club',  true)
on conflict (name) do nothing;
