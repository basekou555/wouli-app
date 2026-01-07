import { supabase } from '@/integrations/supabase/client';

interface UserBehaviorPatterns {
  category_scores: Record<string, number>;
  keyword_scores: Record<string, number>;
  preferred_times: number[];
  preferred_days: string[];
  avg_decision_time: number;
  like_rate: number;
}

/**
 * Analyse les interactions d'un utilisateur pour calculer ses patterns comportementaux
 */
export const analyzeUserPatterns = async (userId: string): Promise<UserBehaviorPatterns | null> => {
  try {
    // Récupérer les 100 dernières interactions
    const { data: interactions, error } = await supabase
      .from('event_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !interactions || interactions.length === 0) {
      return null;
    }

    // Calculer les scores par catégorie
    const categoryStats: Record<string, { likes: number; total: number }> = {};
    const keywordStats: Record<string, { likes: number; total: number }> = {};
    const hourStats: Record<number, number> = {};
    const dayStats: Record<string, number> = {};
    const decisionTimes: number[] = [];
    let totalLikes = 0;
    let totalViews = 0;

    interactions.forEach((interaction) => {
      const snapshot = interaction.event_snapshot as any;
      if (!snapshot) return;

      const category = snapshot.category;
      const tags = snapshot.tags || [];
      const createdAt = new Date(interaction.created_at);
      const hour = createdAt.getHours();
      const day = createdAt.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      // Track views
      if (interaction.action === 'view') {
        totalViews++;
      }

      // Track likes par catégorie
      if (category) {
        if (!categoryStats[category]) {
          categoryStats[category] = { likes: 0, total: 0 };
        }
        categoryStats[category].total++;
        if (interaction.action === 'like' || interaction.action === 'participate') {
          categoryStats[category].likes++;
        }
      }

      // Track likes par keyword/tag
      tags.forEach((tag: string) => {
        if (!keywordStats[tag]) {
          keywordStats[tag] = { likes: 0, total: 0 };
        }
        keywordStats[tag].total++;
        if (interaction.action === 'like' || interaction.action === 'participate') {
          keywordStats[tag].likes++;
        }
      });

      // Track heures préférées (basé sur les likes)
      if (interaction.action === 'like' || interaction.action === 'participate') {
        totalLikes++;
        hourStats[hour] = (hourStats[hour] || 0) + 1;
        dayStats[day] = (dayStats[day] || 0) + 1;
      }

      // Track temps de décision
      if (interaction.duration_ms && interaction.duration_ms > 0) {
        decisionTimes.push(interaction.duration_ms);
      }
    });

    // Calculer les scores normalisés
    const categoryScores: Record<string, number> = {};
    Object.entries(categoryStats).forEach(([cat, stats]) => {
      categoryScores[cat] = stats.total > 0 ? stats.likes / stats.total : 0;
    });

    const keywordScores: Record<string, number> = {};
    Object.entries(keywordStats).forEach(([keyword, stats]) => {
      keywordScores[keyword] = stats.total > 0 ? stats.likes / stats.total : 0;
    });

    // Trouver les heures préférées (top 3)
    const preferredTimes = Object.entries(hourStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Trouver les jours préférés (top 3)
    const preferredDays = Object.entries(dayStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    // Calculer la moyenne du temps de décision
    const avgDecisionTime = decisionTimes.length > 0
      ? Math.round(decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length)
      : 0;

    // Calculer le taux de like
    const likeRate = totalViews > 0 ? totalLikes / totalViews : 0;

    return {
      category_scores: categoryScores,
      keyword_scores: keywordScores,
      preferred_times: preferredTimes,
      preferred_days: preferredDays,
      avg_decision_time: avgDecisionTime,
      like_rate: likeRate
    };
  } catch (error) {
    console.error('Error analyzing user patterns:', error);
    return null;
  }
};

/**
 * Met à jour les préférences utilisateur basées sur l'analyse comportementale
 */
export const updateUserPreferencesFromBehavior = async (userId: string): Promise<boolean> => {
  try {
    const patterns = await analyzeUserPatterns(userId);
    if (!patterns) return false;

    const { error } = await supabase
      .from('user_preferences')
      .update({
        category_scores: patterns.category_scores,
        keyword_scores: patterns.keyword_scores,
        preferred_times: patterns.preferred_times,
        preferred_days: patterns.preferred_days,
        avg_decision_time: patterns.avg_decision_time,
        like_rate: patterns.like_rate,
        last_calculated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating preferences from behavior:', error);
    return false;
  }
};

/**
 * Calcule le score de confiance basé sur le nombre d'interactions
 */
export const calculateConfidenceLevel = (interactionCount: number): number => {
  // 0-10 interactions: low confidence (0.3)
  // 10-30 interactions: medium confidence (0.5)
  // 30-100 interactions: good confidence (0.7)
  // 100+ interactions: high confidence (0.9)
  if (interactionCount < 10) return 0.3;
  if (interactionCount < 30) return 0.5;
  if (interactionCount < 100) return 0.7;
  return 0.9;
};
