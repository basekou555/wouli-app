import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UnifiedEvent } from '@/types/unified';

export interface Memory {
  event: UnifiedEvent;
  photo_url?: string;
  note?: string;
  rating?: number;
  created_at?: string;
  hasMemory: boolean;
}

export const useMemories = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMemories = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Récupérer les participations à des événements passés
        const { data: participations, error: partError } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', user.id);

        if (partError) throw partError;
        if (!participations?.length) {
          setMemories([]);
          setLoading(false);
          return;
        }

        const eventIds = participations.map(p => p.event_id);

        // Récupérer les événements passés
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds)
          .lt('date', new Date().toISOString())
          .order('date', { ascending: false });

        if (eventsError) throw eventsError;

        // Récupérer les souvenirs de l'utilisateur
        const { data: userMemories, error: memoriesError } = await supabase
          .from('event_memories')
          .select('*')
          .eq('user_id', user.id);

        if (memoriesError) throw memoriesError;

        // Mapper les événements avec leurs souvenirs
        const memoriesMap = new Map(userMemories?.map(m => [m.event_id, m]));

        const mappedMemories: Memory[] = (events || []).map(event => {
          const memory = memoriesMap.get(event.id);
          return {
            event: {
              id: event.id,
              title: event.title,
              description: event.description,
              date: event.date,
              time: event.time,
              location: event.location,
              address: event.address,
              category: event.category,
              image_url: event.image_url,
              price: event.price,
              views: event.views || 0,
              likes: event.likes || 0,
              participants: event.participants || 0,
              source: 'user' as const,
              organizer: '',
              organizer_type: 'user' as const,
              external_url: event.external_url,
              tags: event.tags,
            },
            photo_url: memory?.photo_url,
            note: memory?.note,
            rating: memory?.rating,
            created_at: memory?.created_at,
            hasMemory: !!memory
          };
        });

        setMemories(mappedMemories);
      } catch (error) {
        console.error('Erreur lors du chargement des souvenirs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMemories();
  }, [user?.id]);

  const saveMemory = async (eventId: string, data: { photo_url?: string; note?: string; rating?: number }) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('event_memories')
        .upsert({
          user_id: user.id,
          event_id: eventId,
          ...data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,event_id'
        });

      if (error) throw error;

      // Mettre à jour localement
      setMemories(prev => prev.map(m => {
        if (m.event.id === eventId) {
          return {
            ...m,
            ...data,
            hasMemory: true
          };
        }
        return m;
      }));

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du souvenir:', error);
      return false;
    }
  };

  const uploadMemoryPhoto = async (eventId: string, file: File): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${eventId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('event-memories')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-memories')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      return null;
    }
  };

  const refetch = async () => {
    setLoading(true);
    // Re-trigger useEffect
    if (user?.id) {
      try {
        const { data: participations } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', user.id);

        if (!participations?.length) {
          setMemories([]);
          setLoading(false);
          return;
        }

        const eventIds = participations.map(p => p.event_id);

        const { data: events } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds)
          .lt('date', new Date().toISOString())
          .order('date', { ascending: false });

        const { data: userMemories } = await supabase
          .from('event_memories')
          .select('*')
          .eq('user_id', user.id);

        const memoriesMap = new Map(userMemories?.map(m => [m.event_id, m]));

        const mappedMemories: Memory[] = (events || []).map(event => {
          const memory = memoriesMap.get(event.id);
          return {
            event: {
              id: event.id,
              title: event.title,
              description: event.description,
              date: event.date,
              time: event.time,
              location: event.location,
              address: event.address,
              category: event.category,
              image_url: event.image_url,
              price: event.price,
              views: event.views || 0,
              likes: event.likes || 0,
              participants: event.participants || 0,
              source: 'user' as const,
              organizer: '',
              organizer_type: 'user' as const,
              external_url: event.external_url,
              tags: event.tags,
            },
            photo_url: memory?.photo_url,
            note: memory?.note,
            rating: memory?.rating,
            created_at: memory?.created_at,
            hasMemory: !!memory
          };
        });

        setMemories(mappedMemories);
      } catch (error) {
        console.error('Erreur lors du refetch des souvenirs:', error);
      }
    }
    setLoading(false);
  };

  return { 
    memories, 
    loading, 
    saveMemory, 
    uploadMemoryPhoto,
    refetch,
    memoriesWithPhotos: memories.filter(m => m.photo_url),
    memoriesWithoutPhotos: memories.filter(m => !m.photo_url)
  };
};
