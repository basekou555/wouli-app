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
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Vérifier les privilèges admin
    const { data: isAdmin, error: adminErr } = await userClient.rpc("is_admin_user");
    if (adminErr) throw adminErr;
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { limit = 50 } = await req.json().catch(() => ({ limit: 50 }));

    // Récupérer tous les événements avec des URLs Instagram/fbcdn
    const { data: events, error: fetchError } = await serviceClient
      .from('events')
      .select('id, image_url')
      .or('image_url.ilike.%instagram%,image_url.ilike.%fbcdn%')
      .eq('status', 'pending')
      .limit(limit);

    if (fetchError) throw fetchError;

    let migrated = 0;
    let failed = 0;
    const processed: string[] = [];

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          migrated, 
          failed, 
          processed, 
          message: "No events to migrate" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const event of events) {
      if (!event.image_url) continue;
      
      try {
        // Appeler la fonction proxy-image pour migrer l'image
        const { data } = await serviceClient.functions.invoke('proxy-image', {
          body: { imageUrl: event.image_url, eventId: event.id }
        });
        
        if (data?.url) {
          migrated++;
          processed.push(event.id);
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Migration failed for event ${event.id}:`, error);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        migrated, 
        failed, 
        processed, 
        message: `Migration completed: ${migrated}/${events.length} images migrated, ${failed} failed` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("migrate-images error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});