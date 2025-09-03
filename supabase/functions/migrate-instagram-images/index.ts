import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function uploadToStorage(service: ReturnType<typeof createClient>, imageUrl: string, eventId: string) {
  const res = await fetch(imageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      Referer: "https://www.instagram.com/",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch image ${res.status} ${res.statusText}`);

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
    ? "webp"
    : contentType.includes("gif")
    ? "gif"
    : "jpg";

  const arrayBuffer = await res.arrayBuffer();
  const path = `events/${eventId}/${Date.now()}.${ext}`;
  const { data: uploadData, error: uploadError } = await service.storage
    .from("events-images")
    .upload(path, arrayBuffer, { contentType, cacheControl: "3600", upsert: false });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = service.storage.from("events-images").getPublicUrl(path);
  return { publicUrl: publicUrlData.publicUrl, path: uploadData?.path, contentType };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST")
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Check admin privileges
    const { data: isAdmin, error: adminErr } = await userClient.rpc("is_admin_user");
    if (adminErr) throw adminErr;
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { limit = 50, dryRun = false } = await req.json().catch(() => ({ limit: 50, dryRun: false }));

    // Fetch events with instagram/fbcdn image urls
    const { data: events, error: fetchError } = await serviceClient
      .from("events")
      .select("id,image_url")
      .or("image_url.ilike.%instagram.%,image_url.ilike.%fbcdn.%")
      .limit(limit);

    if (fetchError) throw fetchError;

    let migrated = 0;
    let failed = 0;
    const processed: string[] = [];

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ success: true, migrated, failed, processed, message: "No events to migrate" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const ev of events) {
      if (!ev.image_url) continue;
      try {
        if (dryRun) {
          processed.push(ev.id);
          continue;
        }
        const { publicUrl } = await uploadToStorage(serviceClient, ev.image_url, ev.id);
        const { error: updateErr } = await serviceClient
          .from("events")
          .update({ image_url: publicUrl })
          .eq("id", ev.id);
        if (updateErr) throw updateErr;
        migrated += 1;
        processed.push(ev.id);
      } catch (e) {
        console.error("Migration failed for", ev.id, e);
        failed += 1;
      }
    }

    return new Response(
      JSON.stringify({ success: true, migrated, failed, processed, message: `Migrated ${migrated}, failed ${failed}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("migrate-instagram-images error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});