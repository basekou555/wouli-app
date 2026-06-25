/**
 * Design tokens — Carte Événement Wouli (§2 « Fondations » du design system carte).
 *
 * Architecture trois couches : primitive → semantic → component.
 * Source de vérité UNIQUE de la PALETTE FIXE de la carte. Les couleurs
 * ADAPTATIVES (dérivées de `color_card` au runtime via adjustColor/hexToRgba)
 * restent calculées en JS dans EventCard — elles n'ont pas de valeur figée.
 *
 * Miroir CSS dans src/index.css (préfixe `--wc-*`) pour le reste de l'app.
 */

// ── Layer 1 — Primitive (valeurs brutes §2, sans intention) ──────────────────
export const primitive = {
  // Crème → ocre : intensité croissante selon la luminosité de la photo (JOURNÉE)
  creme50: '#FAF7F0', // crème léger  (intensité la plus faible)
  creme100: '#F4EDE0', // crème moyen
  creme200: '#EDE3CC', // crème soutenu
  ocre300: '#EFD99A', // ocre léger
  ocre400: '#E5C878', // ocre moyen
  ocre500: '#D4B05A', // ocre soutenu (intensité la plus forte)

  // Accents sémantiques JOURNÉE (trait gauche + tag), par sous-type
  terracotta: '#C9683B', // à-manger
  ambre: '#D99A2B', // à-boire
  sauge: '#7E8C5A', // activités
  ocreSoft: '#B5853F', // fallback

  // Encres / neutres
  ink: '#1A1208', // encre JOURNÉE (texte sur fond clair)
  cremeInverse: '#F5F0E8', // texte crème sur CTA/prix encre (JOURNÉE inversé)
  darkFallback: '#1C1A1A', // fond CLUB/SCÈNE si color_card absent
  white: '#FFFFFF',
  nearBlack: '#0A0A0A', // texte sombre sur CTA blanc (CLUB/SCÈNE)
} as const;

// Triplets RGB pour composer des rgba(...) à opacité variable.
const INK_RGB = '26, 18, 8';
const WHITE_RGB = '255, 255, 255';
const BLACK_RGB = '0, 0, 0';

// ── Layer 2 — Semantic (aliases par intention) ───────────────────────────────
export const card = {
  journee: {
    bg: primitive.creme100,
    /** Échelle crème→ocre, indexable par niveau de luminosité (0 = clair → 5 = foncé). */
    bgScale: [
      primitive.creme50,
      primitive.creme100,
      primitive.creme200,
      primitive.ocre300,
      primitive.ocre400,
      primitive.ocre500,
    ] as const,
    ink: primitive.ink,
    inkInverse: primitive.cremeInverse,
    accentFallback: primitive.ocreSoft,
  },
  dark: {
    fallback: primitive.darkFallback,
    ink: primitive.white,
    ctaText: primitive.nearBlack,
  },
} as const;

/** Accent sémantique JOURNÉE par sous-type d'événement (§2). */
export const JOURNEE_ACCENTS: Record<string, string> = {
  'a-manger': primitive.terracotta,
  'a-boire': primitive.ambre,
  activites: primitive.sauge,
};

/** Accent JOURNÉE pour un sous-type, avec fallback ocre doux. */
export const journeeAccentFor = (subtype?: string | null): string =>
  JOURNEE_ACCENTS[subtype ?? ''] ?? card.journee.accentFallback;

// ── Helpers — encre / blanc / noir à opacité variable ────────────────────────
export const ink = (alpha: number): string => `rgba(${INK_RGB}, ${alpha})`;
export const white = (alpha: number): string => `rgba(${WHITE_RGB}, ${alpha})`;
export const black = (alpha: number): string => `rgba(${BLACK_RGB}, ${alpha})`;

/**
 * Sélectionne le fond JOURNÉE dans l'échelle crème→ocre selon la luminosité
 * de la photo (0-100). Photo claire → crème léger ; photo sombre → ocre soutenu.
 * (§4 JOURNÉE : « le fond va du crème léger à l'ocre soutenu selon la luminosité ».)
 */
export const journeeBgForLuminance = (luminance: number): string => {
  const scale = card.journee.bgScale;
  // Luminance haute (photo claire) → index bas (crème) ; basse → index haut (ocre).
  const clamped = Math.max(0, Math.min(100, luminance));
  const idx = Math.round(((100 - clamped) / 100) * (scale.length - 1));
  return scale[idx];
};
