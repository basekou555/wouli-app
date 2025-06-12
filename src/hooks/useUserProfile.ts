
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

      // Récupérer les statistiques utilisateur
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

      // Récupérer les activités récentes
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [likesData, participationsData] = await Promise.all([
        supabase
          .from('event_likes')
          .select(`
            created_at,
            events (title, location)
          `)
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(5),
        
        supabase
          .from('event_participants')
          .select(`
            created_at,
            events (title, location)
          `)
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const activities: UserActivity[] = [];

      // Ajouter les likes
      likesData.data?.forEach(like => {
        if (like.events) {
          activities.push({
            id: `like-${like.created_at}`,
            type: 'like',
            event: like.events.title,
            venue: like.events.location,
            date: like.created_at || ''
          });
        }
      });

      // Ajouter les participations
      participationsData.data?.forEach(participation => {
        if (participation.events) {
          activities.push({
            id: `participation-${participation.created_at}`,
            type: 'participation',
            event: participation.events.title,
            venue: participation.events.location,
            date: participation.created_at || ''
          });
        }
      });

      // Trier par date décroissante
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivities(activities.slice(0, 5));

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
