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
  // Version mock pour le développement - remplacer par les RPC quand disponibles
  async sendFriendRequest(friendId: string) {
    console.log('Envoi demande ami à:', friendId);
    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: { id: 'mock-friendship-id' } };
  }

  async acceptFriendRequest(friendshipId: string) {
    console.log('Acceptation demande ami:', friendshipId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: true };
  }

  async rejectFriendRequest(friendshipId: string) {
    console.log('Rejet demande ami:', friendshipId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: true };
  }

  async blockUser(friendshipId: string) {
    return this.rejectFriendRequest(friendshipId);
  }

  async cancelFriendRequest(friendshipId: string) {
    return this.rejectFriendRequest(friendshipId);
  }

  async getAcceptedFriends(userId: string) {
    console.log('Récupération amis acceptés pour:', userId);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Données mockées
    const mockFriends = [
      {
        id: 'friendship-1',
        user_id: userId,
        friend_id: 'friend-1',
        status: 'accepted' as const,
        requested_at: '2024-01-15T10:00:00Z',
        accepted_at: '2024-01-15T12:00:00Z',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T12:00:00Z',
        friend_profile: {
          id: 'friend-1',
          username: 'marie_lyon',
          avatar_url: null,
          city: 'Lyon',
          type: 'user' as const,
          created_at: '2024-01-10T00:00:00Z'
        }
      }
    ];
    
    return { success: true, data: mockFriends };
  }

  async getReceivedRequests(userId: string) {
    console.log('Récupération demandes reçues pour:', userId);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: [] };
  }

  async getSentRequests(userId: string) {
    console.log('Récupération demandes envoyées pour:', userId);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: [] };
  }

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

  async getFriendshipStatus(userId: string, otherUserId: string) {
    console.log('Vérification statut amitié entre:', userId, 'et', otherUserId);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock: retourner "none" par défaut
    return { success: true, status: 'none', data: null };
  }

  async countPendingRequests(userId: string) {
    console.log('Comptage demandes en attente pour:', userId);
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true, count: 0 };
  }

  async getFriendsParticipatingInEvent(userId: string, eventId: string) {
    console.log('Récupération amis participant à événement:', eventId);
    return { success: true, data: [] };
  }
}

export const friendshipService = new FriendshipService();