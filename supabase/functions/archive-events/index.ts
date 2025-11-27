import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 🔐 Authentication check - require admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated and is admin
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError?.message || 'No user found');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin using the new is_admin function
    const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin');
    
    if (roleError || !isAdmin) {
      console.error('Admin check failed:', roleError?.message || 'User is not admin');
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin user ${user.id} triggering archive process`);

    // Use service role for the actual archiving operation
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    console.log('Starting event archiving process...');

    // Récupérer les événements à archiver (finis depuis +2h)
    const { data: eventsToArchive, error: fetchError } = await adminClient
      .from('events')
      .select('*')
      .neq('status', 'archived')
      .lt('date', twoHoursAgo.toISOString());

    if (fetchError) {
      console.error('Error fetching events to archive:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${eventsToArchive?.length || 0} events to archive`);

    let archivedCount = 0;

    for (const event of eventsToArchive || []) {
      try {
        // Calculer métriques finales
        const { count: actualParticipants } = await adminClient
          .from('event_participants')
          .select('*', { count: 'exact' })
          .eq('event_id', event.id);

        const noShowCount = Math.max(0, (event.participants || 0) - (actualParticipants || 0));

        // Archiver l'événement
        const { error: updateError } = await adminClient
          .from('events')
          .update({
            status: 'archived',
            archived_at: now.toISOString(),
            actual_participants: actualParticipants || 0,
            no_show_count: noShowCount
          })
          .eq('id', event.id);

        if (updateError) {
          console.error(`Error archiving event ${event.id}:`, updateError);
        } else {
          archivedCount++;
          console.log(`Archived event: ${event.title} (${event.id})`);
        }
      } catch (eventError) {
        console.error(`Error processing event ${event.id}:`, eventError);
      }
    }

    console.log(`Successfully archived ${archivedCount} events by admin ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Archived ${archivedCount} events`,
        processed: eventsToArchive?.length || 0,
        archived: archivedCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in archive-events function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
