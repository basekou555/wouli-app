// extract-event — Extraction structurée d'un événement scrapé.
//
// Remplace l'approche "deviner à l'affichage" par une vraie extraction à la source :
// lit la description + le flyer (vision) et renvoie TOUS les champs structurés
// (energy, music_style, heure réelle, prix, lineup, type...) avec une confiance.
//
// "L'image fait le travail" : si un champ manque dans la description, on le lit sur le flyer.
//
// L'énergie est tranchée par le REGISTRE DE LIEUX quand le lieu est déterministe
// (scene / club), et seulement par l'event quand le lieu est mixte/inconnu.
//
// Fournisseur configurable :
//   EXTRACT_PROVIDER = "gemini" (défaut, free tier Google) | "anthropic"
//   EXTRACT_MODEL    = surcharge du modèle (défaut gemini-2.5-flash / claude-opus-4-8)
// Fallback Haiku = mettre EXTRACT_PROVIDER=anthropic + EXTRACT_MODEL=claude-haiku-4-5.
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

// Préfixe des URLs d'images persistées en Storage (les seules fiables pour la vision ;
// les URLs Instagram expirent).
const STORAGE_PUBLIC_PREFIX =
  `${Deno.env.get("SUPABASE_URL") ?? ""}/storage/v1/object/public/`;

const SYSTEM_PROMPT = `Tu es l'extracteur de données de "Wouli", une app de découverte d'événements à Lyon (public 18-28 ans).

À partir du contenu BRUT d'un post (texte de description + flyer image quand fourni), tu extrais des données STRUCTURÉES propres. Tu n'inventes jamais : si une info est absente du texte ET de l'image, tu mets null.

PRIORITÉ DES SOURCES : lis d'abord la description. Pour tout champ manquant ou douteux, lis le FLYER (date, heure, prix, lineup, lieu y figurent presque toujours). Indique dans "source_used" d'où vient l'essentiel de l'info.

ÉNERGIE (energy) — 3 ambiances :
- "CLUB"    : clubbing, DJ sets, soirée dansante, techno/house/électro en club.
- "SCENE"   : concert / live / spectacle assis ou debout (groupe, artiste, salle, théâtre).
- "JOURNEE" : activité de jour (marché, expo, atelier, brunch, festival diurne, visite).
On te donne le PROFIL DU LIEU issu d'un registre validé :
- profil "scene" ou "club" => l'énergie est IMPOSÉE par le lieu, recopie-la (SCENE / CLUB).
- profil "mixte" ou "inconnu" => tranche toi-même via le titre, la description et le flyer
  (concert/live/tournée => SCENE ; dj/clubbing/soirée dansante => CLUB ; sinon JOURNEE).
Le style musical est une TENDANCE, jamais une preuve : tout style peut tomber dans tout lieu.

NETTOYAGE TEXTE : titre <= 60 caractères, accrocheur, sans hashtags ni @mentions ni "lien en bio". Description aérée, sans spam Instagram. Conserve les vraies infos.

HEURE : ne renvoie une heure QUE si elle est explicitement écrite (format "HH:MM"). N'invente jamais une heure.
PRIX : nombre en euros si écrit ; "prix libre"/"gratuit" => is_free=true, price_eur=0 ; sinon null.

Réponds UNIQUEMENT par un objet JSON conforme au schéma demandé, sans texte autour.`;

// Champs attendus, dans l'ordre (sert au schéma des deux fournisseurs).
const FIELDS = [
  "title", "subtitle", "description", "energy", "energy_reason",
  "venue_name", "music_style", "artists", "time", "price_eur",
  "is_free", "event_type", "is_recurring", "source_used", "confidence",
] as const;

// Schéma JSON Schema (Anthropic).
const ANTHROPIC_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    subtitle: { type: ["string", "null"] },
    description: { type: "string" },
    energy: { type: "string", enum: ["CLUB", "SCENE", "JOURNEE"] },
    energy_reason: { type: "string" },
    venue_name: { type: ["string", "null"] },
    music_style: { type: ["string", "null"] },
    artists: { type: "array", items: { type: "string" } },
    time: { type: ["string", "null"] },
    price_eur: { type: ["number", "null"] },
    is_free: { type: "boolean" },
    event_type: { type: ["string", "null"] },
    is_recurring: { type: "boolean" },
    source_used: { type: "string", enum: ["description", "image", "both", "none"] },
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
    energy: { type: "STRING", enum: ["CLUB", "SCENE", "JOURNEE"] },
    energy_reason: { type: "STRING" },
    venue_name: { type: "STRING", nullable: true },
    music_style: { type: "STRING", nullable: true },
    artists: { type: "ARRAY", items: { type: "STRING" } },
    time: { type: "STRING", nullable: true },
    price_eur: { type: "NUMBER", nullable: true },
    is_free: { type: "BOOLEAN" },
    event_type: { type: "STRING", nullable: true },
    is_recurring: { type: "BOOLEAN" },
    source_used: { type: "STRING", enum: ["description", "image", "both", "none"] },
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
      // IMPORTANT : .neq écarte les lignes où parsing_method est NULL (NULL <> x => NULL).
      // On veut justement les non-extraits (NULL), d'où le .or(...).
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
    .select("id, title, description, location, image_url, account_username")
    .eq("id", id)
    .single();
  if (error || !ev) throw new Error(`event ${id} introuvable`);

  // Profil du lieu via le registre (source de vérité pour l'énergie).
  const { data: profileRow } = await supabase.rpc("venue_profile", { loc: ev.location ?? "" });
  const profile: string | null = profileRow ?? null;

  // On ne passe le flyer à la vision QUE s'il est persisté en Storage (URL fiable).
  const hasUsableImage =
    typeof ev.image_url === "string" && ev.image_url.startsWith(STORAGE_PUBLIC_PREFIX);

  const userText =
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

  // Revue manuelle si : lieu inconnu (à taguer au registre) ou confiance basse.
  const reasons: string[] = [];
  if (!profile) reasons.push("lieu_inconnu");
  if (typeof out.confidence === "number" && out.confidence < 0.5) reasons.push("confiance_basse");

  const price = out.is_free ? 0 : (typeof out.price_eur === "number" ? out.price_eur : null);
  const time = /^\d{2}:\d{2}$/.test(out.time ?? "") ? out.time : null;

  const update: Record<string, unknown> = {
    title: (out.title ?? ev.title ?? "").slice(0, 100),
    subtitle: out.subtitle ?? null,
    description: out.description ?? ev.description,
    energy,
    music_style: out.music_style ?? null,
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

  if (dryRun) {
    return {
      id, ok: true, dryRun: true,
      venue_profile: profile,
      location: ev.location,
      energy,
      energy_model: out.energy,
      energy_reason: out.energy_reason,
      title_avant: ev.title,
      title_apres: update.title,
      music_style: out.music_style,
      time, price,
      event_type: out.event_type,
      source_used: out.source_used,
      confidence: out.confidence,
      review: reasons,
    };
  }

  const { error: upErr } = await supabase.from("events").update(update).eq("id", id);
  if (upErr) throw upErr;

  return {
    id, ok: true, energy,
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
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: GEMINI_SCHEMA,
      },
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`${resp.status} ${JSON.stringify(data?.error ?? data)}`);
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
    max_tokens: 1500,
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
