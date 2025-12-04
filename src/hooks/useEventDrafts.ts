
import { useState, useEffect, useCallback } from 'react';

export interface EventDraft {
  id: string;
  title: string;
  date: string;
  end_date?: string;
  time: string;
  venue: string;
  custom_venue?: string;
  description: string;
  category: string;
  event_type: string;
  price: string;
  external_url: string;
  image_url: string;
  venue_photo_url?: string;
  ambiance_photo_url?: string;
  capacity?: string;
  is_recurring: boolean;
  avg_attendance?: string;
  total_editions?: string;
  venue_category?: string;
  activity_type?: string;
  music_style?: string;
  ambiance?: string;
  target_audience: string[];
  event_format?: string;
  social_intensity?: string;
  savedAt: string;
}

const DRAFTS_STORAGE_KEY = 'wouli_event_drafts';

export const useEventDrafts = () => {
  const [drafts, setDrafts] = useState<EventDraft[]>([]);

  // Load drafts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDrafts(parsed);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  }, []);

  // Save draft
  const saveDraft = useCallback((draftData: Omit<EventDraft, 'id' | 'savedAt'>) => {
    const newDraft: EventDraft = {
      ...draftData,
      id: `draft_${Date.now()}`,
      savedAt: new Date().toISOString()
    };

    setDrafts(prev => {
      const updated = [newDraft, ...prev].slice(0, 10); // Max 10 drafts
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return newDraft.id;
  }, []);

  // Update existing draft
  const updateDraft = useCallback((draftId: string, draftData: Partial<EventDraft>) => {
    setDrafts(prev => {
      const updated = prev.map(draft => 
        draft.id === draftId 
          ? { ...draft, ...draftData, savedAt: new Date().toISOString() }
          : draft
      );
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Delete draft
  const deleteDraft = useCallback((draftId: string) => {
    setDrafts(prev => {
      const updated = prev.filter(draft => draft.id !== draftId);
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get draft by id
  const getDraft = useCallback((draftId: string): EventDraft | undefined => {
    return drafts.find(draft => draft.id === draftId);
  }, [drafts]);

  // Clear all drafts
  const clearAllDrafts = useCallback(() => {
    setDrafts([]);
    localStorage.removeItem(DRAFTS_STORAGE_KEY);
  }, []);

  return {
    drafts,
    saveDraft,
    updateDraft,
    deleteDraft,
    getDraft,
    clearAllDrafts,
    hasDrafts: drafts.length > 0
  };
};
