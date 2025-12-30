import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProfileStats {
  favoritesCount: number;
  participationsCount: number;
  memoriesCount: number;
  viewedCount: number;
}

export const useProfileStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    favoritesCount: 0,
    participationsCount: 0,
    memoriesCount: 0,
    viewedCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Lancer toutes les requêtes en parallèle
        const [
          favoritesResult,
          participationsResult,
          memoriesResult,
          viewedResult
        ] = await Promise.all([
          // Favoris (event_likes)
          supabase
            .from('event_likes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),

          // Participations futures
          supabase
            .from('event_participants')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),

          // Souvenirs (participations à des events passés)
          supabase
            .from('event_memories')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),

          // Events vus (user_event_views)
          supabase
            .from('user_event_views')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
        ]);

        setStats({
          favoritesCount: favoritesResult.count || 0,
          participationsCount: participationsResult.count || 0,
          memoriesCount: memoriesResult.count || 0,
          viewedCount: viewedResult.count || 0
        });
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

  const refetch = async () => {
    setLoading(true);
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const [
        favoritesResult,
        participationsResult,
        memoriesResult,
        viewedResult
      ] = await Promise.all([
        supabase
          .from('event_likes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('event_memories')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('user_event_views')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
      ]);

      setStats({
        favoritesCount: favoritesResult.count || 0,
        participationsCount: participationsResult.count || 0,
        memoriesCount: memoriesResult.count || 0,
        viewedCount: viewedResult.count || 0
      });
    } catch (error) {
      console.error('Erreur lors du refetch des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch };
};
