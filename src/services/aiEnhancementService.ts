import { supabase } from '@/integrations/supabase/client';

export interface EnhancementInput {
  title: string;
  description: string | null;
  location: string;
}

export interface EnhancementResult {
  title: string;
  description: string;
  time?: string;
}

export const enhanceEventContent = async (input: EnhancementInput): Promise<EnhancementResult> => {
  try {
    console.log('Calling enhance-event-content function with:', input);
    
    const { data, error } = await supabase.functions.invoke('enhance-event-content', {
      body: {
        title: input.title,
        description: input.description || '',
        location: input.location
      }
    });

    if (error) {
      console.error('Error calling enhance function:', error);
      throw new Error(`Enhancement function error: ${error.message || 'Unknown error'}`);
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    // Validation des données retournées
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from enhancement function');
    }

    const result: EnhancementResult = {
      title: data.title || input.title,
      description: data.description || input.description || '',
    };

    // Ajouter l'heure si elle est valide
    if (data.time && /^\d{2}:\d{2}$/.test(data.time)) {
      result.time = data.time;
    }

    console.log('Enhancement result:', result);
    return result;
  } catch (error) {
    console.error('Error in enhanceEventContent:', error);
    throw error;
  }
};

export const enhanceMultipleEvents = async (
  events: EnhancementInput[],
  onProgress?: (currentIndex: number, total: number) => void
): Promise<Record<string, EnhancementResult>> => {
  const results: Record<string, EnhancementResult> = {};
  
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    onProgress?.(i, events.length);
    
    try {
      const enhanced = await enhanceEventContent(event);
      results[`event_${i}`] = enhanced;
    } catch (error) {
      console.error(`Error enhancing event ${i}:`, error);
      // En cas d'erreur, garder le contenu original
      results[`event_${i}`] = {
        title: event.title,
        description: event.description || '',
      };
    }
    
    // Petite pause entre les appels pour éviter la surcharge
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
};

// Export par défaut pour compatibilité
export default {
  enhanceEventContent,
  enhanceMultipleEvents
};