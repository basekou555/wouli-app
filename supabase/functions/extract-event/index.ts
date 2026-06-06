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
// Fallback Haiku = EXTRACT_PROVIDER=anthropic + EXTRACT_MODEL=claude-haiku-4-5.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import Anthropic from "npm:@anthropic-ai/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
- "soirees"   : soirées, clubbing, concerts, lives, spectacles du soir.
- "a-boire"   : bars, dégustations, afterworks, événements centrés boisson.
- "a-manger"  : food, brunch, marché gourmand, restauration.
- "activites" : ateliers, expos, sport, jeux, visites, activités de jour.

== DATE & HEURE (le plus important) ==
- "date" : date de DÉBUT au format "YYYY-MM-DD". RÈGLE D'ANNÉE : si l'année n'est pas
  écrite, utilise l'ANNÉE COURANTE fournie en entrée. Si elle est écrite, respecte-la.
- "date_confidence" : "explicit" (date clairement écrite), "inferred" (déduite d'un jour
  type "vendredi 8" sans année), "none" (introuvable).
- "date_source_text" : le texte brut de la date trouvé (ex: "VEN 8 MAI"), sinon null.
- "time" : heure de DÉBUT "HH:MM" si écrite, sinon null. N'invente jamais.
- "end_time" : heure de FIN "HH:MM" si écrite, sinon null.

== LINEUP / ARTISTES ==
- "lineup" : artistes / DJs / groupes qui SE PRODUISENT réellement (concert live ou aux platines), noms propres. N'inclus PAS les artistes seulement cités comme référence musicale : une soirée "classiques 90s" qui passe du Beyoncé / 50 Cent => lineup VIDE. Sinon [].

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
  "date", "date_confidence", "date_source_text", "time", "end_time",
  "music_style", "lineup", "venue_name", "address",
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
    date_confidence: { type: "string", enum: DATE_CONF },
    date_source_text: { type: ["string", "null"] },
    time: { type: ["string", "null"] },
    end_time: { type: ["string", "null"] },
    music_style: { type: ["string", "null"] },
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
    date_confidence: { type: "STRING", enum: DATE_CONF },
    date_source_text: { type: "STRING", nullable: true },
    time: { type: "STRING", nullable: true },
    end_time: { type: "STRING", nullable: true },
    music_style: { type: "STRING", nullable: true },
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
      let q = supabase
        .from("events")
        .select("id")
        .or("parsing_method.is.null,parsing_method.neq.claude-vision-v1");
      if (body.all !== true) {
        q = q
          .in("status", ["active", "validated"])
          .is("archived_at", null)
          .gte("date", new Date().toISOString());
      }
      const { data, error } = await q.order("created_at", { ascending: false }).limit(limit);
      if (error) throw error;
      ids = (data ?? []).map((r: { id: string }) => r.id);
    }

    const results = [];
    for (const id of ids) {
      try {
        results.push(await extractOne(supabase, id, dryRun));
      } catch (e) {
        results.push({ id, ok: false, error: String(e?.message ?? e) });
      }
    }

    return json({ processed: results.length, provider: PROVIDER, model: MODEL, dryRun, results }, 200);
  } catch (error) {
    console.error("extract-event error:", error);
    return json({ error: String((error as Error)?.message ?? error) }, 500);
  }
});

async function extractOne(supabase: any, id: string, dryRun = false) {
  const { data: ev, error } = await supabase
    .from("events")
    .select("id, title, description, location, image_url, account_username, date")
    .eq("id", id)
    .single();
  if (error || !ev) throw new Error(`event ${id} introuvable`);

  const { data: profileRow } = await supabase.rpc("venue_profile", { loc: ev.location ?? "" });
  const profile: string | null = profileRow ?? null;

  const hasUsableImage =
    typeof ev.image_url === "string" && ev.image_url.startsWith(STORAGE_PUBLIC_PREFIX);

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const year = now.getUTCFullYear();

  const userText =
    `DATE DU JOUR : ${today} (année courante ${year} — si l'année n'est pas écrite, utilise ${year})\n` +
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

  // Normalisations.
  const time = /^\d{2}:\d{2}$/.test(out.time ?? "") ? out.time : null;
  const endTime = /^\d{2}:\d{2}$/.test(out.end_time ?? "") ? out.end_time : null;
  const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(out.date ?? "") ? out.date : null;
  const price = out.is_free ? 0 : (typeof out.price_eur === "number" ? out.price_eur : null);
  const lineup = Array.isArray(out.lineup) ? out.lineup.filter((s: any) => typeof s === "string") : [];

  // Revue manuelle.
  const reasons: string[] = [];
  if (!profile) reasons.push("lieu_inconnu");
  if (typeof out.confidence === "number" && out.confidence < 0.5) reasons.push("confiance_basse");
  if (!isoDate || out.date_confidence === "none") reasons.push("date_incertaine");

  if (dryRun) {
    return {
      id, ok: true, dryRun: true,
      venue_profile: profile,
      location: ev.location,
      energy, energy_model: out.energy, category: out.category,
      title_avant: ev.title, title_apres: (out.title ?? "").slice(0, 100),
      subtitle: out.subtitle,
      date_avant: ev.date, date_apres: isoDate,
      date_confidence: out.date_confidence, date_source_text: out.date_source_text,
      time, end_time: endTime,
      music_style: out.music_style, lineup,
      venue_name: out.venue_name, address: out.address,
      price, event_type: out.event_type, is_recurring: out.is_recurring,
      source_used: out.source_used, confidence: out.confidence,
      review: reasons,
    };
  }

  // Écriture (passe réelle). NB : date/end_time/lineup câblés à part une fois la
  // colonne lineup créée + le fuseau horaire géré (étape suivante).
  const update: Record<string, unknown> = {
    title: (out.title ?? ev.title ?? "").slice(0, 100),
    subtitle: out.subtitle ?? null,
    description: out.description ?? ev.description,
    category: out.category,
    energy,
    music_style: out.music_style ?? null,
    address: out.address ?? null,
    event_type: out.event_type ?? null,
    is_recurring: !!out.is_recurring,
    is_unique: !out.is_recurring,
    parsing_confidence: typeof out.confidence === "number" ? out.confidence : null,
    parsing_method: "claude-vision-v1",
    needs_manual_image: !hasUsableImage,
    manual_review_reason: reasons.length ? reasons.join(",") : null,
  };
  if (time) update.time = time;
  if (price !== null) update.price = price;

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

  // Retry avec backoff sur les surcharges du free tier (503/429/500).
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
    await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt))); // 1s, 2s, 4s
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
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
