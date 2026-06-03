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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Anthropic from "npm:@anthropic-ai/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Modèle surchargeable (par défaut le plus capable). Mettre EXTRACT_MODEL=claude-haiku-4-5
// dans les secrets pour réduire le coût sur du gros volume.
const MODEL = Deno.env.get("EXTRACT_MODEL") ?? "claude-opus-4-8";

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
PRIX : nombre en euros si écrit ; "prix libre"/"gratuit" => is_free=true, price_eur=0 ; sinon null.`;

// Schéma de sortie structurée.
const SCHEMA = {
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
  required: [
    "title", "subtitle", "description", "energy", "energy_reason",
    "venue_name", "music_style", "artists", "time", "price_eur",
    "is_free", "event_type", "is_recurring", "source_used", "confidence",
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!req.headers.get("Authorization")) {
      return json({ error: "Authorization required" }, 401);
    }
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const body = await req.json().catch(() => ({}));

    // Mode batch : traite les N événements les plus récents pas encore extraits.
    let ids: string[];
    if (body.eventId) {
      ids = [body.eventId];
    } else {
      const limit = Math.min(Number(body.limit) || 10, 50);
      const { data, error } = await supabase
        .from("events")
        .select("id")
        .neq("parsing_method", "claude-vision-v1")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      ids = (data ?? []).map((r: { id: string }) => r.id);
    }

    const results = [];
    for (const id of ids) {
      try {
        results.push(await extractOne(supabase, anthropic, id));
      } catch (e) {
        results.push({ id, ok: false, error: String(e?.message ?? e) });
      }
    }

    return json({ processed: results.length, results }, 200);
  } catch (error) {
    console.error("extract-event error:", error);
    return json({ error: String((error as Error)?.message ?? error) }, 500);
  }
});

async function extractOne(supabase: any, anthropic: Anthropic, id: string) {
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

  const userContent: any[] = [];
  if (hasUsableImage) {
    userContent.push({ type: "image", source: { type: "url", url: ev.image_url } });
  }
  userContent.push({
    type: "text",
    text:
      `PROFIL DU LIEU (registre) : ${profile ?? "inconnu"}\n` +
      `LIEU : ${ev.location ?? "(non renseigné)"}\n` +
      `COMPTE SOURCE : @${ev.account_username ?? "?"}\n` +
      `FLYER FOURNI : ${hasUsableImage ? "oui" : "non"}\n\n` +
      `TITRE BRUT : ${ev.title ?? ""}\n` +
      `DESCRIPTION BRUTE :\n${ev.description ?? "(aucune)"}`,
  });

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: SCHEMA },
    },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userContent }],
  } as any);

  const textBlock = resp.content.find((b: any) => b.type === "text") as any;
  if (!textBlock?.text) throw new Error("réponse vide du modèle");
  const out = JSON.parse(textBlock.text);

  // Réconciliation de l'énergie : le registre prime sur le modèle pour les lieux déterministes.
  let energy: string = out.energy;
  if (profile === "scene") energy = "SCENE";
  else if (profile === "club") energy = "CLUB";
  else if (profile === "journee") energy = "JOURNEE";
  // profil "mixte" ou inconnu => on garde la décision du modèle.

  // Revue manuelle si : lieu inconnu (à taguer au registre) ou confiance basse.
  const reasons: string[] = [];
  if (!profile) reasons.push("lieu_inconnu");
  if (typeof out.confidence === "number" && out.confidence < 0.5) reasons.push("confiance_basse");

  const price =
    out.is_free ? 0 : (typeof out.price_eur === "number" ? out.price_eur : null);

  // time : on n'écrit que si "HH:MM" valide explicitement détecté.
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

  const { error: upErr } = await supabase.from("events").update(update).eq("id", id);
  if (upErr) throw upErr;

  return {
    id,
    ok: true,
    energy,
    venue_profile: profile,
    source_used: out.source_used,
    confidence: out.confidence,
    review: reasons,
  };
}

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
