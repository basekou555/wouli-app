import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SignalInterpretation } from './useSmartTracking';
import { UnifiedEvent } from '@/types/unified';

// Delta appliqué aux scores selon le signal (échelle 0-100)
const SIGNAL_DELTAS: Record<SignalInterpretation, number> = {
  instant_love:    +30,
  quick_positive:  +20,
  normal_positive: +10,
  hesitation:       +5,
  instant_commit:  +40,
  planned_commit:  +25,
  quick_negative:  -20,
  considered_skip: -10,
  slow_negative:    -5,
  view_only:         0,
};

const clamp = (v: number) => Math.max(0, Math.min(100, v));

// Accumule les mises à jour pendant la session, flush à intervalles
export const usePreferenceLearning = () => {
  const { user } = useAuth();

  // Scores locaux en mémoire — flushés en batch
  const pendingCategoryDeltas = useRef<Record<string, number>>({});
  const pendingKeywordDeltas = useRef<Record<string, number>>({});
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactionCount = useRef(0);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    // Flush après 4s d'inactivité ou immédiatement si 5+ interactions
    const delay = interactionCount.current >= 5 ? 0 : 4000;
    flushTimer.current = setTimeout(() => flushPreferences(), delay);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const flushPreferences = useCallback(async () => {
    if (!user) return;
    const catDeltas = { ...pendingCategoryDeltas.current };
    const kwDeltas = { ...pendingKeywordDeltas.current };

    if (Object.keys(catDeltas).length === 0 && Object.keys(kwDeltas).length === 0) return;

    // Reset accumulateurs
    pendingCategoryDeltas.current = {};
    pendingKeywordDeltas.current = {};
    interactionCount.current = 0;

    // Lire les scores actuels
    const { data } = await supabase
      .from('user_preferences')
      .select('category_scores, keyword_scores, total_interactions')
      .eq('user_id', user.id)
      .single();

    const currentCat = (data?.category_scores as Record<string, number>) || {};
    const currentKw = (data?.keyword_scores as Record<string, number>) || {};
    const totalInteractions = (data?.total_interactions || 0) + interactionCount.current;

    // Appliquer les deltas (EMA légère : nouveau score = clamp(old + delta))
    const newCat = { ...currentCat };
    for (const [cat, delta] of Object.entries(catDeltas)) {
      newCat[cat] = clamp((newCat[cat] ?? 50) + delta);
    }

    const newKw = { ...currentKw };
    for (const [kw, delta] of Object.entries(kwDeltas)) {
      newKw[kw] = clamp((newKw[kw] ?? 50) + delta);
    }

    await supabase
      .from('user_preferences')
      .update({
        category_scores: newCat,
        keyword_scores: newKw,
        total_interactions: totalInteractions,
        last_calculated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
  }, [user]);

  // Appelé après chaque interaction dans UserApp
  const learnFromInteraction = useCallback((
    signal: SignalInterpretation,
    event: UnifiedEvent
  ) => {
    const delta = SIGNAL_DELTAS[signal];
    if (delta === 0) return;

    // Catégorie principale
    if (event.category) {
      pendingCategoryDeltas.current[event.category] =
        (pendingCategoryDeltas.current[event.category] ?? 0) + delta;
    }

    // Mots-clés (tags + mots du titre)
    const keywords = [
      ...(event.tags || []),
      ...event.title.toLowerCase().split(/\s+/).filter(w => w.length > 4),
    ];
    for (const kw of keywords) {
      pendingKeywordDeltas.current[kw] =
        (pendingKeywordDeltas.current[kw] ?? 0) + delta;
    }

    interactionCount.current++;
    scheduleFlush();
  }, [scheduleFlush]);

  // Flush explicite à la fin de session (beforeunload ou démontage)
  const flushNow = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    return flushPreferences();
  }, [flushPreferences]);

  return { learnFromInteraction, flushNow };
};
