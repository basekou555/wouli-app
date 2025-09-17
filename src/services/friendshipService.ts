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

// Mock localStorage pour simuler la persistance
const FRIENDS_STORAGE_KEY = 'wouli_friendships_mock';
const REQUESTS_STORAGE_KEY = 'wouli_requests_mock';

interface MockStorage {
  friendships: Friendship[];
  lastId: number;
}

class FriendshipService {
  private getStorage(): MockStorage {
    const stored = localStorage.getItem(FRIENDS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Erreur lecture localStorage friendships');
      }
    }
    return { friendships: [], lastId: 0 };
  }

  private saveStorage(storage: MockStorage) {
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(storage));
  }

  private generateId(): string {
    const storage = this.getStorage();
    storage.lastId++;
    this.saveStorage(storage);
    return `friendship-${storage.lastId}`;
  }

  async sendFriendRequest(friendId: string) {
    console.log('🤝 Envoi demande ami à:', friendId);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storage = this.getStorage();
    const newFriendship: Friendship = {
      id: this.generateId(),
      user_id: 'current-user-id', // Sera remplacé par l'ID réel
      friend_id: friendId,
      status: 'pending',
      requested_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    storage.friendships.push(newFriendship);
    this.saveStorage(storage);
    
    return { success: true, data: { id: newFriendship.id } };
  }

  async acceptFriendRequest(friendshipId: string) {
    console.log('✅ Acceptation demande ami:', friendshipId);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storage = this.getStorage();
    const friendship = storage.friendships.find(f => f.id === friendshipId);
    
    if (friendship) {
      friendship.status = 'accepted';
      friendship.accepted_at = new Date().toISOString();
      friendship.updated_at = new Date().toISOString();
      this.saveStorage(storage);
    }
    
    return { success: true, data: true };
  }

  async rejectFriendRequest(friendshipId: string) {
    console.log('❌ Rejet demande ami:', friendshipId);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storage = this.getStorage();
    storage.friendships = storage.friendships.filter(f => f.id !== friendshipId);
    this.saveStorage(storage);
    
    return { success: true, data: true };
  }

  async blockUser(friendshipId: string) {
    console.log('🚫 Blocage utilisateur:', friendshipId);
    const storage = this.getStorage();
    const friendship = storage.friendships.find(f => f.id === friendshipId);
    
    if (friendship) {
      friendship.status = 'blocked';
      friendship.updated_at = new Date().toISOString();
      this.saveStorage(storage);
    }
    
    return { success: true, data: true };
  }

  async cancelFriendRequest(friendshipId: string) {
    return this.rejectFriendRequest(friendshipId);
  }

  async getAcceptedFriends(userId: string) {
    console.log('👥 Récupération amis acceptés pour:', userId);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Données mockées avec profils
    const mockFriends: FriendshipWithProfile[] = [
      {
        id: 'friendship-1',
        user_id: userId,
        friend_id: 'friend-marie',
        status: 'accepted',
        requested_at: '2024-01-15T10:00:00Z',
        accepted_at: '2024-01-15T12:00:00Z',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T12:00:00Z',
        friend_profile: {
          id: 'friend-marie',
          username: 'marie_lyon',
          avatar_url: '',
          city: 'Lyon',
          type: 'user',
          created_at: '2024-01-10T00:00:00Z'
        }
      },
      {
        id: 'friendship-2',
        user_id: userId,
        friend_id: 'friend-thomas',
        status: 'accepted',
        requested_at: '2024-01-10T15:00:00Z',
        accepted_at: '2024-01-10T16:30:00Z',
        created_at: '2024-01-10T15:00:00Z',
        updated_at: '2024-01-10T16:30:00Z',
        friend_profile: {
          id: 'friend-thomas',
          username: 'thomas_dev',
          avatar_url: '',
          city: 'Villeurbanne',
          type: 'user',
          created_at: '2024-01-05T00:00:00Z'
        }
      }
    ];
    
    return { success: true, data: mockFriends };
  }

  async getReceivedRequests(userId: string) {
    console.log('📥 Récupération demandes reçues pour:', userId);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock: une demande reçue
    const mockRequests: FriendshipWithProfile[] = [
      {
        id: 'request-1',
        user_id: 'friend-paul',
        friend_id: userId,
        status: 'pending',
        requested_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_profile: {
          id: 'friend-paul',
          username: 'paul_music',
          avatar_url: '',
          city: 'Lyon 7ème',
          type: 'user',
          created_at: '2024-01-01T00:00:00Z'
        }
      }
    ];
    
    return { success: true, data: mockRequests };
  }

  async getSentRequests(userId: string) {
    console.log('📤 Récupération demandes envoyées pour:', userId);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock: une demande envoyée
    const mockSent: FriendshipWithProfile[] = [
      {
        id: 'sent-1',
        user_id: userId,
        friend_id: 'friend-julie',
        status: 'pending',
        requested_at: new Date(Date.now() - 86400000).toISOString(), // Il y a 1 jour
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        friend_profile: {
          id: 'friend-julie',
          username: 'julie_photo',
          avatar_url: '',
          city: 'Lyon 2ème',
          type: 'user',
          created_at: '2023-12-15T00:00:00Z'
        }
      }
    ];
    
    return { success: true, data: mockSent };
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

      if (error) {
        console.error('Erreur recherche utilisateurs:', error);
        return { success: false, error, data: [] };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Erreur recherche:', error);
      
      // Fallback mock si Supabase ne fonctionne pas
      if (query.length >= 2) {
        const mockUsers = [
          {
            id: 'mock-user-1',
            username: 'alex_photo',
            avatar_url: '',
            city: 'Lyon',
            type: 'user' as const,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 'mock-user-2', 
            username: 'sophie_design',
            avatar_url: '',
            city: 'Villeurbanne',
            type: 'user' as const,
            created_at: '2024-01-02T00:00:00Z'
          }
        ].filter(u => u.username.toLowerCase().includes(query.toLowerCase()));
        
        return { success: true, data: mockUsers };
      }
      
      return { success: true, data: [] };
    }
  }

  async getFriendshipStatus(userId: string, otherUserId: string) {
    console.log('📋 Vérification statut amitié entre:', userId, 'et', otherUserId);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock: quelques statuts différents selon l'ID
    if (otherUserId === 'friend-marie' || otherUserId === 'friend-thomas') {
      return { success: true, status: 'friends', data: null };
    }
    if (otherUserId === 'friend-paul') {
      return { success: true, status: 'received', data: null };
    }
    if (otherUserId === 'friend-julie') {
      return { success: true, status: 'sent', data: null };
    }
    
    return { success: true, status: 'none', data: null };
  }

  async countPendingRequests(userId: string) {
    console.log('🔢 Comptage demandes en attente pour:', userId);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock: 1 demande en attente
    return { success: true, count: 1 };
  }

  async getFriendsParticipatingInEvent(userId: string, eventId: string) {
    console.log('🎉 Récupération amis participant à événement:', eventId);
    
    // Mock: parfois des amis participent
    const randomFriends = Math.random() > 0.5 ? [
      {
        id: 'friend-marie',
        username: 'marie_lyon',
        avatar_url: ''
      }
    ] : [];
    
    return { success: true, data: randomFriends };
  }
}

export const friendshipService = new FriendshipService();