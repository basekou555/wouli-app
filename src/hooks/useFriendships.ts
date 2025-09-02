
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  requested_at: string;
  accepted_at?: string;
  friend_profile?: {
    id: string;
    username: string;
    avatar_url?: string;
    city?: string;
  };
  user_profile?: {
    id: string;
    username: string;
    avatar_url?: string;
    city?: string;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  city?: string;
}

export const useFriendships = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Friendship[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Charger les amitiés
  const loadFriendships = useCallback(async () => {
    if (!user) return;

    try {
      // Étape 1: Récupérer les relations d'amitié
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .order('requested_at', { ascending: false });

      if (friendshipsError) throw friendshipsError;
      if (!friendships || friendships.length === 0) {
        setFriends([]);
        setIncomingRequests([]);
        setOutgoingRequests([]);
        setLoading(false);
        return;
      }

      // Étape 2: Récupérer les profils des utilisateurs impliqués
      const userIds = new Set<string>();
      friendships.forEach(f => {
        userIds.add(f.user_id);
        userIds.add(f.friend_id);
      });

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, city')
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      // Étape 3: Associer les profils aux amitiés
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const enrichedFriendships = friendships.map(friendship => ({
        ...friendship,
        user_profile: profilesMap.get(friendship.user_id),
        friend_profile: profilesMap.get(friendship.friend_id)
      }));

      const acceptedFriends: Friendship[] = [];
      const incoming: Friendship[] = [];
      const outgoing: Friendship[] = [];

      enrichedFriendships.forEach((friendship: any) => {
        if (friendship.status === 'accepted') {
          acceptedFriends.push(friendship as Friendship);
        } else if (friendship.status === 'pending') {
          if (friendship.friend_id === user.id) {
            incoming.push(friendship as Friendship);
          } else {
            outgoing.push(friendship as Friendship);
          }
        }
      });

      setFriends(acceptedFriends);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (error) {
      console.error('Error loading friendships:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste d'amis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Rechercher des utilisateurs
  const searchUsers = useCallback(async (query: string) => {
    if (!user || !query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Récupérer les IDs des relations existantes pour les exclure
      const { data: existingRelations } = await (supabase as any)
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      const excludeIds = new Set<string>([user.id]);
      existingRelations?.forEach((rel: any) => {
        excludeIds.add(rel.user_id);
        excludeIds.add(rel.friend_id);
      });

      const excluded = Array.from(excludeIds);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, city')
        .ilike('username', `%${query}%`)
        .not('id', 'in', `(${excluded.join(',')})`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  }, [user]);

  // Envoyer une demande d'ami
  const sendFriendRequest = useCallback(async (friendId: string) => {
    if (!user) return false;

    try {
      const { error } = await (supabase as any)
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "✨ Demande envoyée !",
        description: "Votre demande d'ami a été envoyée"
      });

      await loadFriendships();
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, loadFriendships]);

  // Accepter une demande
  const acceptFriendRequest = useCallback(async (friendshipId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "🎉 Nouvel ami !",
        description: "Vous êtes maintenant amis"
      });

      await loadFriendships();
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la demande",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, loadFriendships]);

  // Refuser/Annuler une demande
  const rejectFriendRequest = useCallback(async (friendshipId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Demande supprimée",
        description: "La demande d'ami a été supprimée"
      });

      await loadFriendships();
      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la demande",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, loadFriendships]);

  // Supprimer un ami
  const unfriend = useCallback(async (friendshipId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Ami supprimé",
        description: "Cette personne n'est plus dans vos amis"
      });

      await loadFriendships();
      return true;
    } catch (error) {
      console.error('Error unfriending:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer cet ami",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, loadFriendships]);

  // Obtenir les amis participants à un événement
  const getFriendsParticipating = useCallback(async (eventId: string) => {
    if (!user || friends.length === 0) return [];

    try {
      const friendIds = friends.map(f =>
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      // Étape 1: Récupérer les participants de l'événement
      const { data: participants, error: participantsError } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', eventId)
        .in('user_id', friendIds);

      if (participantsError) throw participantsError;
      if (!participants || participants.length === 0) return [];

      // Étape 2: Récupérer les profils des participants
      const participantIds = participants.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', participantIds);

      if (profilesError) throw profilesError;

      return (profiles || []).map((profile: any) => ({
        id: profile.id,
        name: profile.username,
        avatar: profile.avatar_url
      }));
    } catch (error) {
      console.error('Error getting friends participating:', error);
      return [];
    }
  }, [user, friends]);

  // Écouter les notifications en temps réel (acceptation de demande)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`friendship-notifications-${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const notification: any = (payload as any).new;
          if (notification?.type === 'friend_request_accepted') {
            const { data: friendProfile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', (notification.payload as any).friend_id)
              .maybeSingle();

            toast({
              title: "🎉 Demande acceptée !",
              description: `${friendProfile?.username || "Quelqu'un"} a accepté votre demande d'ami`
            });

            await loadFriendships();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, loadFriendships]);

  // Charger les données au montage
  useEffect(() => {
    loadFriendships();
  }, [loadFriendships]);

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    loading,
    searchResults,
    searchLoading,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend,
    getFriendsParticipating,
    refetch: loadFriendships
  };
};
