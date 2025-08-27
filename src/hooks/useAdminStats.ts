
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useAdminStats = () => {
  const queryClient = useQueryClient();

  // Écouter les changements temps réel sur la table events
  useEffect(() => {
    const channel = supabase
      .channel('admin_stats_events_' + Math.random()) // Canal unique
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          console.log('🔄 Admin stats: Événement détecté, actualisation...');
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('admin_stats_profiles_' + Math.random()) // Canal unique séparé
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log('🔄 Admin stats: Profil détecté, actualisation...');
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      .subscribe();

    const businessChannel = supabase
      .channel('admin_stats_business_' + Math.random()) // Canal unique séparé
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_configs'
        },
        () => {
          console.log('🔄 Admin stats: Business config détecté, actualisation...');
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Admin stats: Nettoyage des canaux...');
      supabase.removeChannel(channel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(businessChannel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Compter les utilisateurs totaux
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Compter les événements actifs (statut 'active')
      const { count: activeEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Compter les établissements (profils business)
      const { count: businessCount } = await supabase
        .from('business_configs')
        .select('*', { count: 'exact', head: true });

      // Compter les événements en attente de validation
      const { count: pendingEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Récupérer l'activité récente (derniers événements créés)
      const { data: recentActivity } = await supabase
        .from('events')
        .select(`
          id,
          title,
          created_at,
          status,
          profiles!events_created_by_fkey (username)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculer les tendances (événements créés cette semaine vs semaine dernière)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: eventsThisWeek } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      const { count: eventsLastWeek } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', oneWeekAgo.toISOString());

      const weeklyGrowth = eventsLastWeek ? 
        Math.round(((eventsThisWeek || 0) - eventsLastWeek) / eventsLastWeek * 100) : 0;

      return {
        totalUsers: totalUsers || 0,
        activeEvents: activeEvents || 0,
        businessCount: businessCount || 0,
        pendingEvents: pendingEvents || 0,
        recentActivity: recentActivity || [],
        weeklyGrowth,
        systemHealth: 99.9 // Valeur fixe pour l'instant
      };
    },
    refetchInterval: 60000, // Refresh toutes les 60 secondes (backup)
    staleTime: 10000, // Considérer les données comme fraîches pendant 10 secondes
  });
};
