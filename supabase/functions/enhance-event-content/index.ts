import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { title, description, location } = await req.json();

    if (!title || !location) {
      throw new Error('Titre et lieu requis');
    }

    const systemPrompt = `Tu es un assistant spécialisé dans l'amélioration du contenu d'événements pour une plateforme événementielle lyonnaise appelée "Wouli".

MISSION : Améliorer le titre et la description d'événements pour qu'ils soient plus attractifs et professionnels, tout en restant fidèles au contenu original.

RÈGLES STRICTES :
1. TITRE : Max 80 caractères, accrocheur, clair, sans émojis excessifs
2. DESCRIPTION : Max 1000 caractères, structure claire, informative
3. HEURE : Si tu détectes une heure dans le texte original, extrais-la au format HH:MM
4. Conserver l'essence et les informations importantes de l'événement original
5. Supprimer les éléments parasites (likes, commentaires, mentions non pertinentes)
6. Utiliser un ton professionnel mais chaleureux, adapté au public lyonnais
7. Ne pas inventer d'informations qui ne sont pas dans le contenu original

FORMAT DE RÉPONSE : JSON uniquement
{
  "title": "Titre amélioré",
  "description": "Description améliorée et structurée",
  "time": "HH:MM" // optionnel, seulement si détecté dans le texte original
}`;

    const userPrompt = `Événement à améliorer :
TITRE ACTUEL : ${title}
LIEU : ${location}
DESCRIPTION ACTUELLE : ${description || 'Aucune description fournie'}

Améliore ce contenu selon les règles données.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 800,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
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

    console.log('Enhanced content:', enhancedContent);

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