// Normalisation à l'affichage du libellé "ambiance" d'une carte (issu de music_style brut).
// Objectif : un label court et propre sur le swipe, sans réécrire la base.
// - garde le 1er genre d'une liste ("folk, ambient, electro" -> "Folk")
// - met en casse Titre ("techno" -> "Techno", "électro" -> "Électro")
// - ignore les libellés génériques inutiles ("Musique", "Concert"...) -> fallback

const GENERIC = new Set([
  'musique', 'music', 'concert', 'soiree', 'event', 'evenement',
  'live', 'autre', 'divers', 'various', 'va', 'dj set', 'dj',
]);

const foldAccents = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const titleCase = (s: string) =>
  s
    .split(' ')
    .map((w) => (w ? w.charAt(0).toLocaleUpperCase('fr') + w.slice(1) : w))
    .join(' ');

// Extrait un genre propre d'une chaîne brute (1er segment), ou '' si vide/générique.
const pickGenre = (raw?: string | null): string => {
  if (!raw) return '';
  const first = raw.split(/[,/|•·;]/)[0].trim();
  if (!first) return '';
  if (GENERIC.has(foldAccents(first))) return '';
  return titleCase(first);
};

export function normalizeAmbiance(
  musicStyle?: string | null,
  tags?: string[] | null,
  fallback = '',
): string {
  return pickGenre(musicStyle) || pickGenre(tags?.[0]) || fallback;
}
