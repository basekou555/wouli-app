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
  private async getCurrentUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  }

  async sendFriendRequest(friendId: string) {
    console.log('🤝 Envoi demande ami à:', friendId);
    
    try {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('Utilisateur non connecté');
      }

      if (currentUserId === friendId) {
        throw new Error('Impossible de s\'ajouter soi-même');
      }

      // Vérifier qu'il n'y a pas déjà une relation
      const { data: existing } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_id.eq.${currentUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUserId})`)
        .maybeSingle();

      if (existing) {
        throw new Error('Une relation existe déjà avec cet utilisateur');
      }

      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user_id: currentUserId,
          friend_id: friendId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur envoi demande ami:', error);
      return { success: false, error };
    }
  }

  async acceptFriendRequest(friendshipId: string) {
    console.log('✅ Acceptation demande ami:', friendshipId);
    
    try {
      const { data, error } = await supabase
        .from('friendships')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', friendshipId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur acceptation demande:', error);
      return { success: false, error };
    }
  }

  async rejectFriendRequest(friendshipId: string) {
    console.log('❌ Rejet demande ami:', friendshipId);
    
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      return { success: true, data: true };
    } catch (error) {
      console.error('Erreur rejet demande:', error);
      return { success: false, error };
    }
  }

  async blockUser(friendshipId: string) {
    console.log('🚫 Blocage utilisateur:', friendshipId);
    
    try {
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'blocked' })
        .eq('id', friendshipId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur blocage utilisateur:', error);
      return { success: false, error };
    }
  }

  async cancelFriendRequest(friendshipId: string) {
    return this.rejectFriendRequest(friendshipId);
  }

  async getAcceptedFriends(userId: string) {
    console.log('👥 Récupération amis acceptés pour:', userId);
    
    try {
      // Récupérer les amitiés acceptées où l'utilisateur est soit user_id soit friend_id
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (error) throw error;

      // Pour chaque amitié, récupérer le profil de l'ami
      const friendsWithProfiles: FriendshipWithProfile[] = [];
      
      for (const friendship of friendships || []) {
        const friendId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, city, type, created_at')
          .eq('id', friendId)
          .maybeSingle();

        friendsWithProfiles.push({
          ...friendship,
          status: friendship.status as 'pending' | 'accepted' | 'blocked',
          friend_profile: profile || undefined
        });
      }

      return { success: true, data: friendsWithProfiles };
    } catch (error) {
      console.error('Erreur récupération amis:', error);
      return { success: false, error, data: [] };
    }
  }

  async getReceivedRequests(userId: string) {
    console.log('📥 Récupération demandes reçues pour:', userId);
    
    try {
      const { data: requests, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      // Récupérer les profils des demandeurs
      const requestsWithProfiles: FriendshipWithProfile[] = [];
      
      for (const request of requests || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, city, type, created_at')
          .eq('id', request.user_id)
          .maybeSingle();

        requestsWithProfiles.push({
          ...request,
          status: request.status as 'pending' | 'accepted' | 'blocked',
          user_profile: profile || undefined
        });
      }

      return { success: true, data: requestsWithProfiles };
    } catch (error) {
      console.error('Erreur récupération demandes reçues:', error);
      return { success: false, error, data: [] };
    }
  }

  async getSentRequests(userId: string) {
    console.log('📤 Récupération demandes envoyées pour:', userId);
    
    try {
      const { data: requests, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      // Récupérer les profils des destinataires
      const requestsWithProfiles: FriendshipWithProfile[] = [];
      
      for (const request of requests || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, city, type, created_at')
          .eq('id', request.friend_id)
          .maybeSingle();

        requestsWithProfiles.push({
          ...request,
          status: request.status as 'pending' | 'accepted' | 'blocked',
          friend_profile: profile || undefined
        });
      }

      return { success: true, data: requestsWithProfiles };
    } catch (error) {
      console.error('Erreur récupération demandes envoyées:', error);
      return { success: false, error, data: [] };
    }
  }

  async searchUsers(query: string, currentUserId: string) {
    console.log('🔍 Recherche utilisateurs:', query);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, city, type, created_at')
        .ilike('username', `%${query}%`)
        .neq('id', currentUserId)
        .eq('type', 'user')
        .limit(10);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Erreur recherche utilisateurs:', error);
      return { success: false, error, data: [] };
    }
  }

  async getFriendshipStatus(userId: string, otherUserId: string) {
    console.log('📋 Vérification statut amitié entre:', userId, 'et', otherUserId);
    
    try {
      const { data: friendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${userId},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${userId})`)
        .maybeSingle();

      if (!friendship) {
        return { success: true, status: 'none', data: null };
      }

      if (friendship.status === 'accepted') {
        return { success: true, status: 'friends', data: friendship };
      }

      if (friendship.status === 'blocked') {
        return { success: true, status: 'blocked', data: friendship };
      }

      if (friendship.status === 'pending') {
        if (friendship.user_id === userId) {
          return { success: true, status: 'sent', data: friendship };
        } else {
          return { success: true, status: 'received', data: friendship };
        }
      }

      return { success: true, status: 'none', data: null };
    } catch (error) {
      console.error('Erreur vérification statut amitié:', error);
      return { success: false, error, status: 'none', data: null };
    }
  }

  async countPendingRequests(userId: string) {
    console.log('🔢 Comptage demandes en attente pour:', userId);
    
    try {
      const { count, error } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Erreur comptage demandes:', error);
      return { success: false, error, count: 0 };
    }
  }

  async getFriendsParticipatingInEvent(userId: string, eventId: string) {
    console.log('🎉 Récupération amis participant à événement:', eventId);
    
    try {
      // Récupérer les amis acceptés
      const friendsResult = await this.getAcceptedFriends(userId);
      if (!friendsResult.success) {
        return { success: false, data: [] };
      }

      const friendIds = friendsResult.data.map(f => f.friend_profile?.id).filter(Boolean);
      
      if (friendIds.length === 0) {
        return { success: true, data: [] };
      }

      // Vérifier lesquels participent à l'événement
      const { data: participants, error } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', eventId)
        .in('user_id', friendIds);

      if (error) throw error;

      const participatingFriendIds = participants?.map(p => p.user_id) || [];
      
      // Retourner les profils des amis qui participent
      const participatingFriends = friendsResult.data
        .filter(f => f.friend_profile && participatingFriendIds.includes(f.friend_profile.id))
        .map(f => ({
          id: f.friend_profile!.id,
          username: f.friend_profile!.username,
          avatar_url: f.friend_profile!.avatar_url || ''
        }));

      return { success: true, data: participatingFriends };
    } catch (error) {
      console.error('Erreur récupération amis participants:', error);
      return { success: false, error, data: [] };
    }
  }
}

export const friendshipService = new FriendshipService();