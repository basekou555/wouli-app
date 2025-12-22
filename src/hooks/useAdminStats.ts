
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useAdminStats = () => {
  const queryClient = useQueryClient();

  // Écouter les changements temps réel sur les tables
  useEffect(() => {
    const eventsChannel = supabase
      .channel('admin_stats_events_' + Math.random())
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
      .channel('admin_stats_profiles_' + Math.random())
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
      .channel('admin_stats_business_' + Math.random())
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

    const errorsChannel = supabase
      .channel('admin_stats_errors_' + Math.random())
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scraper_errors'
        },
        () => {
          console.log('🔄 Admin stats: Erreur scraper détectée, actualisation...');
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Admin stats: Nettoyage des canaux...');
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(businessChannel);
      supabase.removeChannel(errorsChannel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Compter les utilisateurs totaux
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Compter les événements actifs à venir (disponibles dans l'app)
      const now = new Date().toISOString();
      const { count: activeEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('date', now);

      // Compter les établissements (profils business)
      const { count: businessCount } = await supabase
        .from('business_configs')
        .select('*', { count: 'exact', head: true });

      // Compter les événements en attente de validation
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
      const { count: pendingEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .or(`and(end_time.is.null,date.gte.${fiveHoursAgo}),and(end_time.not.is.null,end_time.gte.${twoHoursAgo})`);

      // Compter les événements manual_review
      const { count: manualReviewEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'manual_review');

      // Compter les erreurs scraper
      const { count: scraperErrorsCount } = await supabase
        .from('scraper_errors')
        .select('*', { count: 'exact', head: true })
        .eq('retry_status', 'pending');

      // Compter les rejetés à venir (comme pour les actifs)
      const { count: rejectedEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected')
        .gte('date', now);

      // Récupérer l'activité récente
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

      // Calculer les taux
      const totalProcessed = (activeEvents || 0) + (rejectedEvents || 0);
      const validationRate = totalProcessed > 0 ? ((activeEvents || 0) / totalProcessed) * 100 : 0;
      const rejectionRate = totalProcessed > 0 ? ((rejectedEvents || 0) / totalProcessed) * 100 : 0;

      // Timeline 7 derniers jours
      const { data: timelineEvents } = await supabase
        .from('events')
        .select('status, created_at, updated_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const timelineData = last7Days.map(dateStr => {
        const dayStart = new Date(dateStr + 'T00:00:00');
        const dayEnd = new Date(dateStr + 'T23:59:59');

        const validatedCount = timelineEvents?.filter(e => 
          e.status === 'active' && 
          new Date(e.updated_at) >= dayStart && 
          new Date(e.updated_at) <= dayEnd
        ).length || 0;

        const rejectedCount = timelineEvents?.filter(e => 
          e.status === 'rejected' && 
          new Date(e.updated_at) >= dayStart && 
          new Date(e.updated_at) <= dayEnd
        ).length || 0;

        const createdCount = timelineEvents?.filter(e => 
          new Date(e.created_at) >= dayStart && 
          new Date(e.created_at) <= dayEnd
        ).length || 0;

        return {
          date: new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          validated: validatedCount,
          rejected: rejectedCount,
          created: createdCount
        };
      });

      // Détecter les comptes problématiques
      const { data: accountEvents } = await supabase
        .from('events')
        .select('account_username, created_at')
        .not('account_username', 'is', null)
        .order('created_at', { ascending: false });

      const accountsMap = new Map<string, Date>();
      accountEvents?.forEach(e => {
        if (e.account_username && !accountsMap.has(e.account_username)) {
          accountsMap.set(e.account_username, new Date(e.created_at));
        }
      });

      const problematicAccounts: Array<{ username: string; issue: string; lastScrape: string }> = [];
      accountsMap.forEach((lastDate, username) => {
        const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince > 7) {
          problematicAccounts.push({
            username,
            issue: `Pas de scraping depuis ${daysSince} jours`,
            lastScrape: lastDate.toISOString()
          });
        }
      });

      return {
        totalUsers: totalUsers || 0,
        activeEvents: activeEvents || 0,
        businessCount: businessCount || 0,
        pendingEvents: pendingEvents || 0,
        manualReviewEvents: manualReviewEvents || 0,
        scraperErrorsCount: scraperErrorsCount || 0,
        rejectedEvents: rejectedEvents || 0,
        recentActivity: recentActivity || [],
        weeklyGrowth,
        validationRate,
        rejectionRate,
        timelineData,
        problematicAccounts,
        systemHealth: 99.9
      };
    },
    refetchInterval: 60000,
    staleTime: 10000,
  });
};
