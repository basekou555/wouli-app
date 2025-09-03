import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { imageUrl, eventId } = await req.json();

    if (!imageUrl) {
      return new Response(JSON.stringify({ url: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    // Si c'est déjà une URL Supabase, la retourner directement
    if (imageUrl.includes('supabase.co')) {
      return new Response(JSON.stringify({ url: imageUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Télécharger l'image depuis Instagram (pas de CORS côté serveur)
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        Referer: "https://www.instagram.com/",
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
      ? "webp"
      : contentType.includes("gif")
      ? "gif"
      : "jpg";

    const arrayBuffer = await imageResponse.arrayBuffer();
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Générer un nom de fichier unique
    const fileName = `events/${eventId || 'event'}/${Date.now()}.${ext}`;

    // Uploader dans Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('events-images')
      .upload(fileName, arrayBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obtenir l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from('events-images')
      .getPublicUrl(fileName);

    // Mettre à jour l'événement avec la nouvelle URL si eventId fourni
    if (eventId) {
      const { error: updateError } = await supabase
        .from('events')
        .update({ image_url: publicUrlData.publicUrl })
        .eq('id', eventId);
      
      if (updateError) {
        // Non-fatal: on retourne quand même l'URL
        console.warn("Failed to update event image_url:", updateError.message);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      url: publicUrlData.publicUrl,
      path: uploadData?.path,
      contentType 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("proxy-image error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: (error as Error).message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});