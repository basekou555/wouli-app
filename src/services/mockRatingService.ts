// Mock service for rating functionality until database is updated
import { UnifiedEvent } from '@/types/unified';

export interface EventRating {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  attended: boolean;
  created_at: string;
  updated_at: string;
}

export const mockRatingService = {
  /**
   * Check if a user needs to rate an event (mock)
   */
  async shouldTriggerRating(eventId: string, userId: string): Promise<boolean> {
    // Mock: return false for now
    return false;
  },

  /**
   * Get all events that need rating by a user (mock)
   */
  async getEventsNeedingRating(userId: string): Promise<UnifiedEvent[]> {
    // Mock: return empty array for now
    return [];
  },

  /**
   * Submit a rating for an event (mock)
   */
  async submitRating(
    eventId: string, 
    userId: string, 
    rating: number, 
    comment?: string, 
    attended: boolean = true
  ): Promise<boolean> {
    // Mock: simulate successful submission
    console.log('Mock rating submitted:', { eventId, userId, rating, comment, attended });
    return true;
  },

  /**
   * Update a rating (within 24h) (mock)
   */
  async updateRating(
    eventId: string,
    userId: string,
    rating: number,
    comment?: string
  ): Promise<boolean> {
    // Mock: simulate successful update
    console.log('Mock rating updated:', { eventId, userId, rating, comment });
    return true;
  },

  /**
   * Get ratings for an event (mock)
   */
  async getEventRatings(eventId: string): Promise<EventRating[]> {
    // Mock: return empty array for now
    return [];
  }
};