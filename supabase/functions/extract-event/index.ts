// extract-event — Extraction structurée DENSE d'un événement scrapé.
//
// Remplace l'approche "deviner à l'affichage" par une vraie extraction à la source :
// lit la description + le flyer (vision) et remplit AU PROPRE tous les champs d'un
// événement (date réelle, heure, fin, lieu, lineup, prix, catégorie, énergie...).
//
// "L'image fait le travail" : si un champ manque dans la description, on le lit sur le flyer.
//
// L'énergie est tranchée par le REGISTRE DE LIEUX quand le lieu est déterministe
// (scene / club), et seulement par l'event quand le lieu est mixte/inconnu.
//
// Fournisseur configurable :
//   EXTRACT_PROVIDER = "gemini" (défaut, free tier Google) | "anthropic"
//   EXTRACT_MODEL    = surcharge du modèle (défaut gemini-2.5-flash / claude-opus-4-8)
//   EXTRACT_SECRET   = si défini, exigé via le header x-extract-secret (sécurise l'écriture)
// Fallback Haiku = EXTRACT_PROVIDER=anthropic + EXTRACT_MODEL=claude-haiku-4-5.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { decode, Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";
import Anthropic from "npm:@anthropic-ai/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-extract-secret",
};

// Petite pause utilitaire (espacement anti rate-limit + backoff).
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const PROVIDER = (Deno.env.get("EXTRACT_PROVIDER") ?? "gemini").toLowerCase();
const MODEL = Deno.env.get("EXTRACT_MODEL") ??
  (PROVIDER === "anthropic" ? "claude-opus-4-8" : "gemini-2.5-flash");

const STORAGE_PUBLIC_PREFIX =
  `${Deno.env.get("SUPABASE_URL") ?? ""}/storage/v1/object/public/`;

const SYSTEM_PROMPT = `Tu es l'extracteur de données de "Wouli", une app de découverte d'événements à Lyon (public 18-28 ans).

À partir du contenu BRUT d'un post (texte de description + flyer image quand fourni), tu remplis AU PROPRE tous les champs d'un événement. Tu n'inventes JAMAIS : si une info est absente du texte ET de l'image, tu mets null (ou [] pour une liste).

PRIORITÉ DES SOURCES : lis d'abord la description. Pour tout champ manquant ou douteux, lis le FLYER (date, heure, prix, lineup, lieu, adresse y figurent presque toujours). Renseigne "source_used" (d'où vient l'essentiel de l'info).

== ÉNERGIE (energy) — 3 ambiances ==
- "CLUB"    : clubbing, DJ sets, soirée dansante, techno/house/électro en club.
- "SCENE"   : concert / live / spectacle (groupe, artiste, salle, théâtre, impro).
- "JOURNEE" : activité de jour (marché, expo, atelier, brunch, festival diurne, visite).
PROFIL DU LIEU (registre validé) fourni en entrée :
- profil "scene" ou "club" => énergie IMPOSÉE par le lieu, recopie-la (SCENE / CLUB).
- profil "mixte" ou "inconnu" => tranche via titre, description et flyer.
Le style musical est une TENDANCE, jamais une preuve.

== CATÉGORIE (category) — exactement une valeur ==
Distinction clé : "soirees" = on vient FAIRE LA FÊTE / DANSER ; "activites" = on est SPECTATEUR / CONSOMMATEUR de quelque chose (on regarde, on assiste, on participe).
- "soirees"   : clubbing, soirée dansante, DJ set, soirée à thème festive.
- "activites" : concert, live, spectacle, impro, théâtre, expo, atelier, sport, jeu, projection, visite.
- "a-boire"   : bars, dégustations, afterworks centrés boisson.
- "a-manger"  : food, brunch, marché gourmand, restauration.

== DATE & HEURE (le plus important) ==
- "date" : date de DÉBUT au format "YYYY-MM-DD". RÈGLE D'ANNÉE : si l'année EST écrite, respecte-la.
  Si elle N'EST PAS écrite, choisis l'année qui rend la date FUTURE par rapport à la DATE DU JOUR :
  année courante si ce jour/mois n'est pas encore passé cette année, sinon année SUIVANTE.
  (Ex : on est en juin 2026, le flyer dit "7 janvier" sans année => 2027-01-07, car janvier 2026 est déjà passé.)
- "date_confidence" : "explicit" (date clairement écrite), "inferred" (déduite d'un jour
  type "vendredi 8" sans année), "none" (introuvable).
- "end_date" : pour un événement sur PLUSIEURS JOURS (ex: "du 4 au 9 mai", festival), date de FIN "YYYY-MM-DD" (même règle d'année). Pour un événement d'un seul jour => null.
- "date_source_text" : le texte brut de la date trouvé (ex: "VEN 8 MAI"), sinon null.
- "time" : heure de DÉBUT "HH:MM" si écrite, sinon null. N'invente jamais.
- "end_time" : heure de FIN "HH:MM" si écrite, sinon null.

== LINEUP / ARTISTES ==
- "lineup" : artistes / DJs / groupes qui SE PRODUISENT réellement (concert live ou aux platines), noms propres. N'inclus PAS les artistes seulement cités comme référence musicale : une soirée "classiques 90s" qui passe du Beyoncé / 50 Cent => lineup VIDE. Sinon [].
  INDICE FORT : les artistes présents sont souvent tagués par un @mention (ex: @djxxx). Un concert (SCENE) a souvent 1 artiste ; une soirée club peut en avoir 2-3. ATTENTION : tous les @ ne sont pas des artistes (le lieu, des partenaires, des sponsors sont aussi tagués) — ne garde que les artistes/DJs.

== TAGS ==
- "tags" : 3 à 6 mots-clés courts en minuscules qui caractérisent l'événement (ambiance, public, thème, style), ex: ["techno","gratuit","etudiants","rooftop"]. Pas de hashtags, pas de @. Sinon [].

== LIEU ==
- "venue_name" : nom du lieu tel que lisible (sert à enrichir le registre), sinon null.
- "address" : adresse postale si lisible sur le flyer, sinon null.

== PRIX ==
- nombre en euros si écrit ; "prix libre"/"gratuit"/"free"/"entrée libre" => is_free=true, price_eur=0 ; sinon null.

== NETTOYAGE TEXTE ==
- "title" : <= 60 caractères, accrocheur, SANS hashtags ni @mentions ni "lien en bio" ni date/heure ni nom du lieu (le lieu est affiché à part).
  Si le titre brut est inutilisable (juste une date, un emoji...), reconstruis-en un depuis la description.
- "subtitle" : sous-titre court (accroche d'une ligne) si pertinent, sinon null.
- "description" : aérée, sans spam Instagram, infos réelles conservées.

== DIVERS ==
- "is_recurring" : true si l'événement est récurrent (hebdo, "chaque jeudi"...), sinon false.
- "event_type" : type court et lisible (ex: "Concert", "Soirée DJ", "Atelier", "Impro").
- "confidence" : 0 à 1, ta confiance globale sur l'extraction.

Réponds UNIQUEMENT par un objet JSON conforme au schéma demandé, sans texte autour.`;

const FIELDS = [
  "title", "subtitle", "description", "category", "energy", "energy_reason",
  "date", "end_date", "date_confidence", "date_source_text", "time", "end_time",
  "music_style", "tags", "lineup", "venue_name", "address",
  "price_eur", "is_free", "event_type", "is_recurring", "source_used", "confidence",
] as const;

const ENERGY = ["CLUB", "SCENE", "JOURNEE"];
const CATEGORY = ["soirees", "a-boire", "a-manger", "activites"];
const DATE_CONF = ["explicit", "inferred", "none"];
const SOURCE = ["description", "image", "both", "none"];

// Schéma JSON Schema (Anthropic).
const ANTHROPIC_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    subtitle: { type: ["string", "null"] },
    description: { type: "string" },
    category: { type: "string", enum: CATEGORY },
    energy: { type: "string", enum: ENERGY },
    energy_reason: { type: "string" },
    date: { type: ["string", "null"] },
    end_date: { type: ["string", "null"] },
    date_confidence: { type: "string", enum: DATE_CONF },
    date_source_text: { type: ["string", "null"] },
    time: { type: ["string", "null"] },
    end_time: { type: ["string", "null"] },
    music_style: { type: ["string", "null"] },
    tags: { type: "array", items: { type: "string" } },
    lineup: { type: "array", items: { type: "string" } },
    venue_name: { type: ["string", "null"] },
    address: { type: ["string", "null"] },
    price_eur: { type: ["number", "null"] },
    is_free: { type: "boolean" },
    event_type: { type: ["string", "null"] },
    is_recurring: { type: "boolean" },
    source_used: { type: "string", enum: SOURCE },
    confidence: { type: "number" },
  },
  required: [...FIELDS],
};

// Schéma format Gemini (types MAJUSCULES, nullable, propertyOrdering).
const GEMINI_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    subtitle: { type: "STRING", nullable: true },
    description: { type: "STRING" },
    category: { type: "STRING", enum: CATEGORY },
    energy: { type: "STRING", enum: ENERGY },
    energy_reason: { type: "STRING" },
    date: { type: "STRING", nullable: true },
    end_date: { type: "STRING", nullable: true },
    date_confidence: { type: "STRING", enum: DATE_CONF },
    date_source_text: { type: "STRING", nullable: true },
    time: { type: "STRING", nullable: true },
    end_time: { type: "STRING", nullable: true },
    music_style: { type: "STRING", nullable: true },
    tags: { type: "ARRAY", items: { type: "STRING" } },
    lineup: { type: "ARRAY", items: { type: "STRING" } },
    venue_name: { type: "STRING", nullable: true },
    address: { type: "STRING", nullable: true },
    price_eur: { type: "NUMBER", nullable: true },
    is_free: { type: "BOOLEAN" },
    event_type: { type: "STRING", nullable: true },
    is_recurring: { type: "BOOLEAN" },
    source_used: { type: "STRING", enum: SOURCE },
    confidence: { type: "NUMBER" },
  },
  required: [...FIELDS],
  propertyOrdering: [...FIELDS],
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!req.headers.get("Authorization")) {
      return json({ error: "Authorization required" }, 401);
    }
    // Sécurité : si un secret est configuré, on l'exige (bloque la clé anon publique).
    const secret = Deno.env.get("EXTRACT_SECRET");
    if (secret && req.headers.get("x-extract-secret") !== secret) {
      return json({ error: "Forbidden: secret invalide ou manquant (header x-extract-secret)" }, 403);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;

    let ids: string[];
    if (body.eventId) {
      ids = [body.eventId];
    } else {
      const limit = Math.min(Number(body.limit) || 10, 50);
      // Cible : events pas encore enrichis par l'IA = color_card OU energy manquant.
      // (energy est toujours écrit lors de l'enrichissement ; color_card peut rester
      // null si l'image est inaccessible, on le retente donc tant qu'il manque.)
      let q = supabase
        .from("events")
        .select("id")
        .or("color_card.is.null,energy.is.null");
      if (body.pending === true) {
        // File d'attente du cron : events fraîchement scrapés (status "pending").
        // Pas de filtre sur la date (la date brute du scraper est peu fiable, c'est
        // justement extract-event qui la corrige).
        q = q.eq("status", "pending").is("archived_at", null);
      } else if (body.all !== true) {
        // Pipeline UNIFIÉ (fusion des 2 anciens workers) : on enrichit en une seule
        // passe les events `pending` (fraîchement scrapés -> PAS de filtre date, car
        // leur date brute est encore peu fiable) OU `active`/`validated` à venir.
        // Trié au plus récent ci-dessous, donc les fraîchement scrapés passent d'abord.
        const today = new Date().toISOString().slice(0, 10);
        q = q
          .in("status", ["active", "validated", "pending"])
          .is("archived_at", null)
          .or(`status.eq.pending,date.gte.${today}`);
      }
      const { data, error } = await q.order("created_at", { ascending: false }).limit(limit);
      if (error) throw error;
      ids = (data ?? []).map((r: { id: string }) => r.id);
    }

    const results = [];
    for (let i = 0; i < ids.length; i++) {
      // Espacement anti rate-limit : on lisse les appels modèle (free tier Gemini).
      if (i > 0) await sleep(4000);
      try {
        results.push(await extractOne(supabase, ids[i], dryRun));
      } catch (e) {
        results.push({ id: ids[i], ok: false, error: String(e?.message ?? e) });
      }
    }

    return json({ processed: results.length, provider: PROVIDER, model: MODEL, dryRun, results }, 200);
  } catch (error) {
    console.error("extract-event error:", error);
    return json({ error: String((error as Error)?.message ?? error) }, 500);
  }
});

// Ajuste luminosité + saturation d'une couleur hex (port exact du client EventCard.tsx).
// Sert à assombrir/désaturer la couleur dominante pour en faire un fond de zone lisible.
function adjustColor(hex: string, lightnessOffset: number, saturationOffset: number): string {
  const m = hex.replace("#", "");
  if (m.length !== 6) return hex;
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  let lPct = l * 100;
  const lOff = lPct < 30 ? lightnessOffset / 2 : lightnessOffset;
  lPct = Math.max(0, Math.min(100, lPct + lOff));
  const l2 = lPct / 100;
  let sPct = s * 100;
  sPct = Math.max(0, Math.min(100, sPct + saturationOffset));
  s = sPct / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r2: number;
  let g2: number;
  let b2: number;
  if (s === 0) {
    r2 = g2 = b2 = l2;
  } else {
    const q = l2 < 0.5 ? l2 * (1 + s) : l2 + s - l2 * s;
    const p = 2 * l2 - q;
    r2 = hue2rgb(p, q, h + 1 / 3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}

// Couleur dominante d'une image -> fond de carte adaptatif (color_card).
// Côté serveur (Deno), fetch n'a PAS de restriction CORS : marche même sur une
// URL Instagram brute, là où l'extraction côté navigateur échouait. Retourne null
// si l'image est inaccessible/indécodable (fallback gracieux : couleur par défaut).
async function computeColorCard(imageUrl: string | null | undefined): Promise<string | null> {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    const decoded = await decode(buf);
    // GIF -> on prend la première frame ; sinon Image directement.
    const image: Image = decoded instanceof Image ? decoded : (decoded as any)[0];
    if (!image) return null;
    const small = image.resize(10, 10);
    const bmp = small.bitmap; // RGBA, 8 bits/canal
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let i = 0; i < bmp.length; i += 4) {
      r += bmp[i];
      g += bmp[i + 1];
      b += bmp[i + 2];
      count++;
    }
    if (count === 0) return null;
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    const toHex = (x: number) => x.toString(16).padStart(2, "0");
    const avgHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    // Mêmes offsets que extractCardColor côté client (-25 lum, -20 sat).
    return adjustColor(avgHex, -25, -20);
  } catch {
    return null;
  }
}

// Persiste un flyer distant (URL Instagram, qui expire) dans le Storage Supabase.
// Rend l'URL stable -> l'IA peut lire le flyer, color_card fiable, image app pérenne.
// Retourne l'URL Storage publique, ou null si l'image est inaccessible (URL déjà expirée).
async function persistFlyer(supabase: any, id: string, srcUrl: string): Promise<string | null> {
  try {
    const res = await fetch(srcUrl);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const bytes = new Uint8Array(await res.arrayBuffer());
    const path = `events/event-${id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("events-images")
      .upload(path, bytes, { contentType, upsert: true });
    if (error) return null;
    return `${STORAGE_PUBLIC_PREFIX}events-images/${path}`;
  } catch {
    return null;
  }
}

async function extractOne(supabase: any, id: string, dryRun = false) {
  const { data: ev, error } = await supabase
    .from("events")
    .select("id, title, description, location, image_url, account_username, date, time, end_date, extraction_backup, color_card")
    .eq("id", id)
    .single();
  if (error || !ev) throw new Error(`event ${id} introuvable`);

  // Protège la donnée image : si le flyer n'est pas déjà dans notre Storage (URL
  // Instagram brute qui expire), on le télécharge et on l'y dépose. Tout le reste
  // (lecture IA du flyer, color_card, affichage app) utilise alors une URL stable.
  if (!dryRun && typeof ev.image_url === "string" && !ev.image_url.startsWith(STORAGE_PUBLIC_PREFIX)) {
    const stored = await persistFlyer(supabase, id, ev.image_url);
    if (stored) ev.image_url = stored;
  }

  const { data: profileRow } = await supabase.rpc("venue_profile", { loc: ev.location ?? "" });
  const profile: string | null = profileRow ?? null;

  const hasUsableImage =
    typeof ev.image_url === "string" && ev.image_url.startsWith(STORAGE_PUBLIC_PREFIX);

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const year = now.getUTCFullYear();

  const userText =
    `DATE DU JOUR : ${today} (année courante ${year})\n` +
    `PROFIL DU LIEU (registre) : ${profile ?? "inconnu"}\n` +
    `LIEU : ${ev.location ?? "(non renseigné)"}\n` +
    `COMPTE SOURCE : @${ev.account_username ?? "?"}\n` +
    `FLYER FOURNI : ${hasUsableImage ? "oui" : "non"}\n\n` +
    `TITRE BRUT : ${ev.title ?? ""}\n` +
    `DESCRIPTION BRUTE :\n${ev.description ?? "(aucune)"}`;

  const out = PROVIDER === "anthropic"
    ? await callAnthropic(userText, hasUsableImage ? ev.image_url : null)
    : await callGemini(userText, hasUsableImage ? ev.image_url : null);

  // Réconciliation de l'énergie : le registre prime sur le modèle pour les lieux déterministes.
  let energy: string = out.energy;
  if (profile === "scene") energy = "SCENE";
  else if (profile === "club") energy = "CLUB";
  else if (profile === "journee") energy = "JOURNEE";

  // Couleur de carte adaptative : calculée une fois à la source si absente.
  // Évite le fallback "couleur unique" à l'affichage (CORS Instagram côté navigateur).
  const colorCard = ev.color_card ?? (await computeColorCard(ev.image_url));

  // Normalisations.
  const time = /^\d{2}:\d{2}$/.test(out.time ?? "") ? out.time : null;
  const endTime = /^\d{2}:\d{2}$/.test(out.end_time ?? "") ? out.end_time : null;
  const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(out.date ?? "") ? out.date : null;
  const endDateIso = /^\d{4}-\d{2}-\d{2}$/.test(out.end_date ?? "") ? out.end_date : null;
  const price = out.is_free ? 0 : (typeof out.price_eur === "number" ? out.price_eur : null);
  const lineup = Array.isArray(out.lineup) ? out.lineup.filter((s: any) => typeof s === "string") : [];
  const tags = Array.isArray(out.tags) ? out.tags.filter((s: any) => typeof s === "string") : [];

  // Revue manuelle.
  const reasons: string[] = [];
  if (!profile) reasons.push("lieu_inconnu");
  if (typeof out.confidence === "number" && out.confidence < 0.5) reasons.push("confiance_basse");
  if (!isoDate || out.date_confidence === "none") reasons.push("date_incertaine");
  if (isoDate && isoDate < today) reasons.push("date_passee"); // garde-fou règle d'année

  if (dryRun) {
    return {
      id, ok: true, dryRun: true,
      venue_profile: profile,
      location: ev.location,
      energy, energy_model: out.energy, category: out.category,
      color_card: colorCard,
      title_avant: ev.title, title_apres: (out.title ?? "").slice(0, 100),
      subtitle: out.subtitle,
      date_avant: ev.date, date_apres: isoDate, end_date: endDateIso,
      date_confidence: out.date_confidence, date_source_text: out.date_source_text,
      time, end_time: endTime,
      music_style: out.music_style, tags, lineup,
      venue_name: out.venue_name, address: out.address,
      price, event_type: out.event_type, is_recurring: out.is_recurring,
      source_used: out.source_used, confidence: out.confidence,
      review: reasons,
    };
  }

  // Écriture (passe réelle).
  const update: Record<string, unknown> = {
    title: (out.title ?? ev.title ?? "").slice(0, 100),
    subtitle: out.subtitle ?? null,
    description: out.description ?? ev.description,
    category: out.category,
    energy,
    music_style: out.music_style ?? null,
    tags: tags.length ? tags : null,
    lineup: lineup.length ? lineup : null,
    address: out.address ?? null,
    event_type: out.event_type ?? null,
    is_recurring: !!out.is_recurring,
    is_unique: !out.is_recurring,
    parsing_confidence: typeof out.confidence === "number" ? out.confidence : null,
    parsing_method: "claude-vision-v1",
    needs_manual_image: !hasUsableImage,
    manual_review_reason: reasons.length ? reasons.join(",") : null,
  };
  if (price !== null) update.price = price;
  if (colorCard) update.color_card = colorCard;
  // Pointe l'event sur l'URL Storage stable si le flyer vient d'être persisté.
  if (typeof ev.image_url === "string" && ev.image_url.startsWith(STORAGE_PUBLIC_PREFIX)) {
    update.image_url = ev.image_url;
  }

  // Backup capture-once du brut scrapé (avant toute écriture IA).
  if (!ev.extraction_backup) {
    update.extraction_backup = {
      title: ev.title, description: ev.description,
      date: ev.date, time: ev.time, end_date: ev.end_date, location: ev.location,
    };
  }

  // Dates en fuseau Europe/Paris (DST-correct via helper SQL).
  if (isoDate) {
    const { data: ts } = await supabase.rpc("to_paris_ts", { d: isoDate, t: time });
    if (ts) update.date = ts;
  }
  if (endDateIso) {
    const { data: ets } = await supabase.rpc("to_paris_ts", { d: endDateIso, t: endTime });
    if (ets) update.end_date = ets;
  }
  if (time) update.time = time;
  if (endTime && (endDateIso || isoDate)) {
    const { data: ett } = await supabase.rpc("to_paris_ts", { d: endDateIso ?? isoDate, t: endTime });
    if (ett) update.end_time = ett;
  }

  const { error: upErr } = await supabase.from("events").update(update).eq("id", id);
  if (upErr) throw upErr;

  return {
    id, ok: true, energy, category: out.category,
    venue_profile: profile,
    source_used: out.source_used,
    confidence: out.confidence,
    review: reasons,
  };
}

// ---------- Fournisseur Gemini (free tier) ----------
async function callGemini(userText: string, imageUrl: string | null): Promise<any> {
  const key = Deno.env.get("GOOGLE_API_KEY") ?? Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("GOOGLE_API_KEY non configurée");

  const parts: any[] = [];
  if (imageUrl) {
    const imgResp = await fetch(imageUrl);
    if (!imgResp.ok) throw new Error(`flyer inaccessible (${imgResp.status})`);
    const bytes = new Uint8Array(await imgResp.arrayBuffer());
    const mimeType = imgResp.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    parts.push({ inlineData: { mimeType, data: encodeBase64(bytes) } });
  }
  parts.push({ text: userText });

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const reqBody = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: GEMINI_SCHEMA,
    },
  });

  // Retry sur les surcharges/limites du free tier (503/429/500). On respecte le
  // retryDelay renvoyé par l'API (RetryInfo), borné à 15s pour ne pas dépasser le
  // timeout de la fonction ; un event qui échoue sera repris au prochain cron.
  let resp: Response, data: any;
  for (let attempt = 0; ; attempt++) {
    resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: reqBody,
    });
    data = await resp.json();
    if (resp.ok) break;
    const retryable = resp.status === 503 || resp.status === 429 || resp.status === 500;
    if (!retryable || attempt >= 3) {
      throw new Error(`${resp.status} ${JSON.stringify(data?.error ?? data)}`);
    }
    // Lit le "retryDelay" (ex: "35s") de error.details (RetryInfo) si présent.
    const details = data?.error?.details;
    let suggested: number | null = null;
    if (Array.isArray(details)) {
      for (const dd of details) {
        const mm = typeof dd?.retryDelay === "string" ? dd.retryDelay.match(/([0-9.]+)s/) : null;
        if (mm) { suggested = Math.ceil(parseFloat(mm[1])); break; }
      }
    }
    const backoff = Math.min(suggested ?? Math.pow(2, attempt), 15); // borne 15s
    await sleep(backoff * 1000);
  }
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const reason = data?.promptFeedback?.blockReason ?? data?.candidates?.[0]?.finishReason ?? "vide";
    throw new Error(`réponse Gemini sans contenu (${reason})`);
  }
  return JSON.parse(text);
}

// ---------- Fournisseur Anthropic (fallback Haiku/Opus) ----------
async function callAnthropic(userText: string, imageUrl: string | null): Promise<any> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY non configurée");
  const anthropic = new Anthropic({ apiKey });

  const content: any[] = [];
  if (imageUrl) content.push({ type: "image", source: { type: "url", url: imageUrl } });
  content.push({ type: "text", text: userText });

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: ANTHROPIC_SCHEMA },
    },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content }],
  } as any);

  const textBlock = resp.content.find((b: any) => b.type === "text") as any;
  if (!textBlock?.text) throw new Error("réponse vide du modèle");
  return JSON.parse(textBlock.text);
}

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}
