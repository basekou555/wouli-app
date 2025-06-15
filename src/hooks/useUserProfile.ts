
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type Profile = Tables<'profiles'>;

interface UserStats {
  eventsParticipated: number;
  eventsLiked: number;
  eventsCreated: number;
  weeklyActivity: number;
}

interface UserActivity {
  id: string;
  type: 'participation' | 'like' | 'creation';
  event: string;
  date: string;
  venue: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    eventsParticipated: 0,
    eventsLiked: 0,
    eventsCreated: 0,
    weeklyActivity: 0
  });
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Récupérer le profil utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(profileData);

      // Récupérer les statistiques utilisateur (maintenant corrigées pour inclure business_events)
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_stats', { user_uuid: user.id });

      if (statsError) throw statsError;

      if (statsData && statsData.length > 0) {
        const stats = statsData[0];
        setUserStats({
          eventsParticipated: stats.events_participated,
          eventsLiked: stats.events_liked,
          eventsCreated: stats.events_created,
          weeklyActivity: 3 // Mock pour le moment
        });
      }

      // Récupérer les activités récentes - chercher dans les deux tables
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [userEventLikes, businessEventLikes, userEventParticipations, businessEventParticipations] = await Promise.all([
        // Likes sur les événements users
        supabase
          .from('event_likes')
          .select(`
            created_at,
            events!inner (title, location)
          `)
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Likes sur les événements business
        supabase
          .from('event_likes')
          .select(`
            created_at,
            business_events!inner (title, venue)
          `)
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Participations sur les événements users
        supabase
          .from('event_participants')
          .select(`
            created_at,
            events!inner (title, location)
          `)
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Participations sur les événements business
        supabase
          .from('event_participants')
          .select(`
            created_at,
            business_events!inner (title, venue)
          `)
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      const activities: UserActivity[] = [];

      // Ajouter les likes d'événements users
      userEventLikes.data?.forEach(like => {
        if (like.events) {
          activities.push({
            id: `like-user-${like.created_at}`,
            type: 'like',
            event: like.events.title,
            venue: like.events.location,
            date: like.created_at || ''
          });
        }
      });

      // Ajouter les likes d'événements business
      businessEventLikes.data?.forEach(like => {
        if (like.business_events) {
          activities.push({
            id: `like-business-${like.created_at}`,
            type: 'like',
            event: like.business_events.title,
            venue: like.business_events.venue || 'Lieu non spécifié',
            date: like.created_at || ''
          });
        }
      });

      // Ajouter les participations d'événements users
      userEventParticipations.data?.forEach(participation => {
        if (participation.events) {
          activities.push({
            id: `participation-user-${participation.created_at}`,
            type: 'participation',
            event: participation.events.title,
            venue: participation.events.location,
            date: participation.created_at || ''
          });
        }
      });

      // Ajouter les participations d'événements business
      businessEventParticipations.data?.forEach(participation => {
        if (participation.business_events) {
          activities.push({
            id: `participation-business-${participation.created_at}`,
            type: 'participation',
            event: participation.business_events.title,
            venue: participation.business_events.venue || 'Lieu non spécifié',
            date: participation.created_at || ''
          });
        }
      });

      // Trier par date décroissante et limiter à 5
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivities(activities.slice(0, 5));

      console.log('📊 Activités récentes récupérées:', activities.length);

    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger votre profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  return {
    profile,
    userStats,
    recentActivities,
    loading,
    refetch: fetchUserProfile
  };
};
