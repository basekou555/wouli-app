import { UnifiedEvent } from '@/types/unified';
import { supabase } from '@/integrations/supabase/client';

// Types for recommendation scoring
interface UserPreferences {
  category_scores: Record<string, number>;
  keyword_scores: Record<string, number>;
  preferred_times: string[];
  preferred_days: number[];
  avg_decision_time_ms: number;
  like_rate: number;
  confidence_level: number;
}

interface SocialContext {
  friendsParticipating: string[];
  friendsLiked: string[];
  totalFriendsCount: number;
}

interface RecommendationScore {
  eventId: string;
  totalScore: number;
  breakdown: {
    preferences: number;
    social: number;
    urgency: number;
    discovery: number;
    context: number;
  };
  penalties: {
    repetition: number;
    price: number;
    distance: number;
  };
  badges: string[];
}

// Score weights as per specs
const WEIGHTS = {
  preferences: 0.40,
  social: 0.25,
  urgency: 0.15,
  discovery: 0.10,
  context: 0.10
};

// Penalty weights
const PENALTY_WEIGHTS = {
  repetition: 0.15,
  price: 0.10,
  distance: 0.05
};

export class WouliRecommendationEngine {
  private userPreferences: UserPreferences | null = null;
  private recentInteractions: Set<string> = new Set();
  private userId: string | null = null;

  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    await this.loadUserPreferences();
    await this.loadRecentInteractions();
  }

  private async loadUserPreferences(): Promise<void> {
    if (!this.userId) return;

    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (data) {
      this.userPreferences = {
        category_scores: (data.category_scores as Record<string, number>) || {},
        keyword_scores: (data.keyword_scores as Record<string, number>) || {},
        preferred_times: (data.preferred_times as unknown as string[]) || [],
        preferred_days: (data.preferred_days as unknown as number[]) || [],
        avg_decision_time_ms: data.avg_decision_time || 3000,
        like_rate: data.like_rate || 0.5,
        confidence_level: 0 // Calculated from interaction count
      };
    }
  }

  private async loadRecentInteractions(): Promise<void> {
    if (!this.userId) return;

    const { data } = await supabase
      .from('event_interactions')
      .select('event_id')
      .eq('user_id', this.userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (data) {
      this.recentInteractions = new Set(data.map(d => d.event_id));
    }
  }

  // Main scoring function
  calculateScore(event: UnifiedEvent, socialContext?: SocialContext): RecommendationScore {
    const preferencesScore = this.calculatePreferencesScore(event);
    const socialScore = this.calculateSocialScore(event, socialContext);
    const urgencyScore = this.calculateUrgencyScore(event);
    const discoveryScore = this.calculateDiscoveryScore(event);
    const contextScore = this.calculateContextScore(event);

    const penalties = this.calculatePenalties(event);

    // Calculate weighted total
    const rawScore = 
      preferencesScore * WEIGHTS.preferences +
      socialScore * WEIGHTS.social +
      urgencyScore * WEIGHTS.urgency +
      discoveryScore * WEIGHTS.discovery +
      contextScore * WEIGHTS.context;

    // Apply penalties
    const penaltyTotal = 
      penalties.repetition * PENALTY_WEIGHTS.repetition +
      penalties.price * PENALTY_WEIGHTS.price +
      penalties.distance * PENALTY_WEIGHTS.distance;

    const totalScore = Math.max(0, rawScore - penaltyTotal);

    // Generate badges
    const badges = this.generateBadges(event, {
      preferencesScore,
      socialScore,
      urgencyScore,
      socialContext
    });

    return {
      eventId: event.id,
      totalScore,
      breakdown: {
        preferences: preferencesScore,
        social: socialScore,
        urgency: urgencyScore,
        discovery: discoveryScore,
        context: contextScore
      },
      penalties,
      badges
    };
  }

  // 1. Preferences Score (40%)
  private calculatePreferencesScore(event: UnifiedEvent): number {
    if (!this.userPreferences) return 50; // Neutral score for new users

    let score = 0;
    let factors = 0;

    // Category match (0-100)
    const categoryScore = this.userPreferences.category_scores[event.category] || 50;
    score += categoryScore;
    factors++;

    // Keywords match from title/description
    const eventText = `${event.title} ${event.description || ''}`.toLowerCase();
    const keywordMatches = Object.entries(this.userPreferences.keyword_scores)
      .filter(([keyword]) => eventText.includes(keyword.toLowerCase()))
      .map(([, score]) => score);
    
    if (keywordMatches.length > 0) {
      const avgKeywordScore = keywordMatches.reduce((a, b) => a + b, 0) / keywordMatches.length;
      score += avgKeywordScore;
      factors++;
    }

    return factors > 0 ? score / factors : 50;
  }

  // 2. Social Score (25%)
  private calculateSocialScore(event: UnifiedEvent, socialContext?: SocialContext): number {
    if (!socialContext || socialContext.totalFriendsCount === 0) return 0;

    const participatingRatio = socialContext.friendsParticipating.length / Math.max(socialContext.totalFriendsCount, 1);
    const likedRatio = socialContext.friendsLiked.length / Math.max(socialContext.totalFriendsCount, 1);

    // Participating weighs more than liked
    const score = (participatingRatio * 70 + likedRatio * 30);
    
    // Bonus for multiple friends
    const friendBonus = Math.min(socialContext.friendsParticipating.length * 10, 30);
    
    return Math.min(100, score + friendBonus);
  }

  // 3. Urgency Score (15%)
  private calculateUrgencyScore(event: UnifiedEvent): number {
    const eventDate = new Date(event.date);
    const now = new Date();
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Tonight: maximum urgency
    if (hoursUntilEvent >= 0 && hoursUntilEvent <= 8) return 100;
    // Tomorrow: high urgency
    if (hoursUntilEvent > 8 && hoursUntilEvent <= 32) return 80;
    // This weekend: medium urgency
    if (hoursUntilEvent > 32 && hoursUntilEvent <= 96) return 60;
    // This week: low urgency
    if (hoursUntilEvent > 96 && hoursUntilEvent <= 168) return 40;
    // Later: minimal urgency
    return 20;
  }

  // 4. Discovery Score (10%)
  private calculateDiscoveryScore(event: UnifiedEvent): number {
    if (!this.userPreferences) return 50;

    // Lower score for categories user hasn't explored
    const categoryScore = this.userPreferences.category_scores[event.category];
    
    // If user hasn't seen this category much, it's a discovery opportunity
    if (categoryScore === undefined) return 70;
    
    // If user has interacted with this category but not too much
    const interactionCount = Object.values(this.userPreferences.category_scores).length;
    if (interactionCount < 10) return 60;
    
    // Balance: some discovery, mostly familiar
    return 40;
  }

  // 5. Context Score (10%)
  private calculateContextScore(event: UnifiedEvent): number {
    if (!this.userPreferences) return 50;

    let score = 50;
    const eventDate = new Date(event.date);
    const eventHour = eventDate.getHours();
    const eventDay = eventDate.getDay();

    // Time preference match
    const timeSlot = this.getTimeSlot(eventHour);
    if (this.userPreferences.preferred_times.includes(timeSlot)) {
      score += 25;
    }

    // Day preference match
    if (this.userPreferences.preferred_days.includes(eventDay)) {
      score += 25;
    }

    return Math.min(100, score);
  }

  private getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 14) return 'lunch';
    if (hour >= 14 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  // Calculate penalties
  private calculatePenalties(event: UnifiedEvent): { repetition: number; price: number; distance: number } {
    return {
      repetition: this.calculateRepetitionPenalty(event),
      price: this.calculatePricePenalty(event),
      distance: this.calculateDistancePenalty(event)
    };
  }

  private calculateRepetitionPenalty(event: UnifiedEvent): number {
    // If user has already interacted with this event
    if (this.recentInteractions.has(event.id)) {
      return 100; // Full penalty
    }
    return 0;
  }

  private calculatePricePenalty(event: UnifiedEvent): number {
    if (!this.userPreferences) return 0;

    // Extract price from price_text
    const priceText = event.price_text || '';
    const priceMatch = priceText.match(/(\d+)/);
    const price = priceMatch ? parseInt(priceMatch[1], 10) : 0;
    
    // Penalty for expensive events if user tends to prefer free/cheap
    if (price > 30) return 50;
    if (price > 20) return 30;
    if (price > 10) return 10;
    return 0;
  }

  private calculateDistancePenalty(event: UnifiedEvent): number {
    // For now, no distance penalty since we're Lyon-focused
    // Can be enhanced with geolocation later
    return 0;
  }

  // Generate recommendation badges
  private generateBadges(
    event: UnifiedEvent, 
    scores: { 
      preferencesScore: number; 
      socialScore: number; 
      urgencyScore: number;
      socialContext?: SocialContext;
    }
  ): string[] {
    const badges: string[] = [];

    // Urgency badge: "Ce soir"
    const eventDate = new Date(event.date);
    const now = new Date();
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilEvent >= 0 && hoursUntilEvent <= 8) {
      badges.push('🔥 Ce soir');
    }

    // Social badge: "X amis y vont"
    if (scores.socialContext && scores.socialContext.friendsParticipating.length > 0) {
      const count = scores.socialContext.friendsParticipating.length;
      badges.push(`👥 ${count} ami${count > 1 ? 's' : ''}`);
    }

    // Preference match badge: "Pour toi"
    if (scores.preferencesScore >= 70) {
      badges.push('❤️ Pour toi');
    }

    // Trending badge
    if ((event.views || 0) > 100 || (event.likes || 0) > 20) {
      badges.push('📈 Populaire');
    }

    return badges;
  }

  // Rank events by recommendation score
  rankEvents(events: UnifiedEvent[], socialContexts?: Map<string, SocialContext>): Array<UnifiedEvent & { recommendationScore: RecommendationScore }> {
    const scoredEvents = events.map(event => ({
      ...event,
      recommendationScore: this.calculateScore(event, socialContexts?.get(event.id))
    }));

    // Sort by total score descending
    return scoredEvents.sort((a, b) => b.recommendationScore.totalScore - a.recommendationScore.totalScore);
  }
}

// Singleton instance
let engineInstance: WouliRecommendationEngine | null = null;

export const getRecommendationEngine = async (userId: string): Promise<WouliRecommendationEngine> => {
  if (!engineInstance || engineInstance['userId'] !== userId) {
    engineInstance = new WouliRecommendationEngine();
    await engineInstance.initialize(userId);
  }
  return engineInstance;
};

export const resetRecommendationEngine = (): void => {
  engineInstance = null;
};
