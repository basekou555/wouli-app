import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { friendshipService, Friendship, FriendshipWithProfile } from '@/services/friendshipService';
import { UserProfile } from '@/types/user';

export const useFriendships = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [acceptedFriends, setAcceptedFriends] = useState<FriendshipWithProfile[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendshipWithProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendshipWithProfile[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Charger toutes les données d'amitié
  const loadFriendships = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [friendsResult, receivedResult, sentResult, countResult] = await Promise.all([
        friendshipService.getAcceptedFriends(user.id),
        friendshipService.getReceivedRequests(user.id),
        friendshipService.getSentRequests(user.id),
        friendshipService.countPendingRequests(user.id)
      ]);

      if (friendsResult.success) {
        setAcceptedFriends(friendsResult.data as FriendshipWithProfile[]);
      }

      if (receivedResult.success) {
        setReceivedRequests(receivedResult.data as FriendshipWithProfile[]);
      }

      if (sentResult.success) {
        setSentRequests(sentResult.data as FriendshipWithProfile[]);
      }

      if (countResult.success) {
        setPendingCount(countResult.count);
      }

    } catch (error) {
      console.error('Erreur chargement amitiés:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'amitié",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    loadFriendships();
  }, [loadFriendships]);

  // Envoyer une demande d'ami
  const sendFriendRequest = async (friendId: string) => {
    if (!user?.id) return false;

    const result = await friendshipService.sendFriendRequest(friendId);
    
    if (result.success) {
      toast({
        title: "Demande envoyée !",
        description: "Votre demande d'ami a été envoyée."
      });
      loadFriendships();
      return true;
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande d'ami",
        variant: "destructive"
      });
      return false;
    }
  };

  // Accepter une demande d'ami
  const acceptFriendRequest = async (friendshipId: string, friendName?: string) => {
    const result = await friendshipService.acceptFriendRequest(friendshipId);
    
    if (result.success) {
      toast({
        title: "🎉 Nouvel ami !",
        description: friendName ? `Vous êtes maintenant amis avec ${friendName}` : "Demande d'ami acceptée"
      });
      loadFriendships();
      return true;
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la demande d'ami",
        variant: "destructive"
      });
      return false;
    }
  };

  // Rejeter une demande d'ami
  const rejectFriendRequest = async (friendshipId: string) => {
    const result = await friendshipService.rejectFriendRequest(friendshipId);
    
    if (result.success) {
      toast({
        title: "Demande rejetée",
        description: "La demande d'ami a été rejetée"
      });
      loadFriendships();
      return true;
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande d'ami",
        variant: "destructive"
      });
      return false;
    }
  };

  // Bloquer un utilisateur
  const blockUser = async (friendshipId: string) => {
    const result = await friendshipService.blockUser(friendshipId);
    
    if (result.success) {
      toast({
        title: "Utilisateur bloqué",
        description: "L'utilisateur a été bloqué"
      });
      loadFriendships();
      return true;
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de bloquer l'utilisateur",
        variant: "destructive"
      });
      return false;
    }
  };

  // Annuler une demande envoyée
  const cancelFriendRequest = async (friendshipId: string) => {
    const result = await friendshipService.cancelFriendRequest(friendshipId);
    
    if (result.success) {
      toast({
        title: "Demande annulée",
        description: "Votre demande d'ami a été annulée"
      });
      loadFriendships();
      return true;
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la demande d'ami",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    acceptedFriends,
    receivedRequests,
    sentRequests,
    pendingCount,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    blockUser,
    cancelFriendRequest,
    refetch: loadFriendships
  };
};

// Hook pour la recherche d'utilisateurs
export const useUserSearch = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const searchUsers = async (searchQuery: string) => {
    if (!user?.id || searchQuery.trim().length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setQuery(searchQuery);

    try {
      const result = await friendshipService.searchUsers(searchQuery.trim(), user.id);
      
      if (result.success) {
        setUsers(result.data as UserProfile[]);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Erreur recherche utilisateurs:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setUsers([]);
    setQuery('');
  };

  return {
    users,
    loading,
    query,
    searchUsers,
    clearSearch
  };
};

// Hook pour vérifier le statut d'amitié avec un utilisateur
export const useFriendshipStatus = (otherUserId?: string) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [friendship, setFriendship] = useState<Friendship | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!user?.id || !otherUserId || user.id === otherUserId) {
      setStatus(null);
      return;
    }

    setLoading(true);
    
    try {
      const result = await friendshipService.getFriendshipStatus(user.id, otherUserId);
      
      if (result.success) {
        setStatus(result.status);
        setFriendship(result.data as Friendship);
      }
    } catch (error) {
      console.error('Erreur vérification statut amitié:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, otherUserId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    status, // 'none' | 'friends' | 'sent' | 'received' | 'blocked'
    friendship,
    loading,
    refetch: checkStatus
  };
};