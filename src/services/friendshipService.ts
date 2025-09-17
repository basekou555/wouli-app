import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  requested_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FriendshipWithProfile extends Friendship {
  friend_profile?: UserProfile;
  user_profile?: UserProfile;
}

class FriendshipService {
  // Envoyer une demande d'ami  
  async sendFriendRequest(friendId: string) {
    const { data, error } = await supabase.rpc('send_friend_request', {
      p_friend_id: friendId
    });

    if (error) {
      console.error('Erreur envoi demande ami:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  // Accepter une demande d'ami
  async acceptFriendRequest(friendshipId: string) {
    const { data, error } = await supabase.rpc('accept_friend_request', {
      p_friendship_id: friendshipId
    });

    if (error) {
      console.error('Erreur acceptation ami:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  // Rejeter une demande d'ami
  async rejectFriendRequest(friendshipId: string) {
    const { data, error } = await supabase.rpc('reject_friend_request', {
      p_friendship_id: friendshipId
    });

    if (error) {
      console.error('Erreur rejet ami:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  // Bloquer un utilisateur
  async blockUser(friendshipId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'blocked' })
      .eq('id', friendshipId)
      .select()
      .single();

    if (error) {
      console.error('Erreur blocage utilisateur:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  // Annuler une demande envoyée
  async cancelFriendRequest(friendshipId: string) {
    return this.rejectFriendRequest(friendshipId);
  }

  // Récupérer les amis acceptés
  async getAcceptedFriends(userId: string) {
    const { data, error } = await supabase.rpc('get_accepted_friends', {
      p_user_id: userId
    });

    if (error) {
      console.error('Erreur récupération amis:', error);
      return { success: false, error, data: [] };
    }

    return { success: true, data: data || [] };
  }

  // Récupérer les demandes reçues
  async getReceivedRequests(userId: string) {
    const { data, error } = await supabase.rpc('get_received_requests', {
      p_user_id: userId
    });

    if (error) {
      console.error('Erreur récupération demandes reçues:', error);
      return { success: false, error, data: [] };
    }

    return { success: true, data: data || [] };
  }

  // Récupérer les demandes envoyées
  async getSentRequests(userId: string) {
    const { data, error } = await supabase.rpc('get_sent_requests', {
      p_user_id: userId
    });

    if (error) {
      console.error('Erreur récupération demandes envoyées:', error);
      return { success: false, error, data: [] };
    }

    return { success: true, data: data || [] };
  }

  // Rechercher des utilisateurs par username
  async searchUsers(query: string, currentUserId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, city, type, created_at')
      .ilike('username', `%${query}%`)
      .neq('id', currentUserId)
      .eq('type', 'user')
      .limit(10);

    if (error) {
      console.error('Erreur recherche utilisateurs:', error);
      return { success: false, error, data: [] };
    }

    return { success: true, data: data || [] };
  }

  // Vérifier le statut d'amitié avec un utilisateur
  async getFriendshipStatus(userId: string, otherUserId: string) {
    const { data, error } = await supabase.rpc('get_friendship_status', {
      p_user_id: userId,
      p_other_user_id: otherUserId
    });

    if (error) {
      console.error('Erreur vérification statut amitié:', error);
      return { success: false, error, status: null, data: null };
    }

    return { success: true, status: data?.status || 'none', data };
  }

  // Compter les demandes en attente
  async countPendingRequests(userId: string) {
    const { data, error } = await supabase.rpc('count_pending_requests', {
      p_user_id: userId
    });

    if (error) {
      console.error('Erreur comptage demandes en attente:', error);
      return { success: false, error, count: 0 };
    }

    return { success: true, count: data || 0 };
  }

  // Récupérer les amis qui participent à un événement
  async getFriendsParticipatingInEvent(userId: string, eventId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        friend_profile:profiles!friendships_friend_id_fkey(id, username, avatar_url),
        user_profile:profiles!friendships_user_id_fkey(id, username, avatar_url)
      `)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error || !data) {
      return { success: false, error, data: [] };
    }

    // Récupérer les IDs des amis
    const friendIds = data.map(friendship => 
      friendship.user_profile?.id === userId 
        ? friendship.friend_profile?.id 
        : friendship.user_profile?.id
    ).filter(Boolean);

    if (friendIds.length === 0) {
      return { success: true, data: [] };
    }

    // Vérifier qui participe à l'événement
    const { data: participants, error: participantError } = await supabase
      .from('event_participants')
      .select(`
        user_id,
        profiles:profiles(id, username, avatar_url)
      `)
      .eq('event_id', eventId)
      .in('user_id', friendIds);

    if (participantError) {
      console.error('Erreur récupération participants amis:', participantError);
      return { success: false, error: participantError, data: [] };
    }

    const friendsParticipating = participants?.map(p => p.profiles).filter(Boolean) || [];

    return { success: true, data: friendsParticipating };
  }
}

export const friendshipService = new FriendshipService();