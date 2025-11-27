import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    // 🔐 Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated
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

    console.log(`Authenticated user: ${user.id}`);

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const { title, description, location } = await req.json();

    if (!title || !location) {
      throw new Error('Titre et lieu requis');
    }

    const systemPrompt = `Tu es un expert en rédaction événementielle pour "Wouli", la plateforme de découverte d'événements à Lyon.

MISSION : Transformer du contenu brut (souvent issu d'Instagram/réseaux sociaux) en descriptions d'événements professionnelles, attractives et bien structurées.

OBJECTIFS DE RÉÉCRITURE :
1. **LISIBILITÉ** : Aérer le texte avec paragraphes, listes, espaces
2. **ATTRACTIVITÉ** : Rendre l'événement désirable sans en faire trop
3. **CLARTÉ** : Informations essentielles facilement repérables
4. **PROFESSIONNALISME** : Ton chaleureux mais soigné, adapté au public jeune lyonnais

RÈGLES DE TRANSFORMATION :
- **TITRE** : Max 60 caractères, impactant, sans émojis excessifs
- **DESCRIPTION** : 150-800 caractères, structurée en paragraphes courts
- **HEURE** : Extraire et normaliser au format HH:MM si présente
- **NETTOYAGE** : Supprimer hashtags, mentions @, éléments parasites
- **STRUCTURE** : Intro accrocheuse → Détails pratiques → Call-to-action si pertinent
- **CONSERVATION** : Garder l'âme et les infos importantes de l'original
- **ENRICHISSEMENT** : Ajouter de la structure sans inventer de contenu

STYLE WOULI :
- Ton décontracté mais informatif
- Émojis avec parcimonie (max 2-3 pertinents)
- Phrases courtes et impactantes
- Focus sur l'expérience utilisateur

FORMAT DE RÉPONSE : JSON uniquement
{
  "title": "Titre restructuré et attractif",
  "description": "Description réécrite avec structure claire",
  "time": "HH:MM" // optionnel, seulement si détecté
}`;

    const userMessage = `CONTENU À RÉÉCRIRE :

📍 LIEU : ${location}
📝 TITRE ACTUEL : ${title}
📄 DESCRIPTION ACTUELLE : ${description || 'Aucune description fournie'}

MISSION : Réécris complètement ce contenu en appliquant les règles Wouli.`;

    console.log('Calling Anthropic API for user:', user.id);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userMessage }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.content[0].text;
    
    let enhancedContent;
    try {
      enhancedContent = JSON.parse(generatedContent);
    } catch (e) {
      console.error('Failed to parse JSON response:', generatedContent);
      throw new Error('Invalid JSON response from AI');
    }

    // Validation des résultats
    if (!enhancedContent.title || enhancedContent.title.length > 100) {
      enhancedContent.title = title.substring(0, 100);
    }

    if (!enhancedContent.description || enhancedContent.description.length > 1200) {
      enhancedContent.description = (description || '').substring(0, 1200);
    }

    // Validation du format de l'heure
    if (enhancedContent.time && !/^\d{2}:\d{2}$/.test(enhancedContent.time)) {
      delete enhancedContent.time;
    }

    console.log('Enhanced content generated for user:', user.id);

    return new Response(JSON.stringify(enhancedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhance-event-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      title: null,
      description: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
