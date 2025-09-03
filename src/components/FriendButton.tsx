
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus, Clock, Check, X, Users } from 'lucide-react';
import { useFriendships } from '@/hooks/useFriendships';
import { useAuth } from '@/contexts/AuthContext';

interface FriendButtonProps {
  targetUserId: string;
  targetUsername?: string;
  className?: string;
}

const FriendButton: React.FC<FriendButtonProps> = ({ 
  targetUserId, 
  targetUsername,
  className = "" 
}) => {
  const { user } = useAuth();
  const { 
    friends, 
    incomingRequests, 
    outgoingRequests, 
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend
  } = useFriendships();

  const [relationshipStatus, setRelationshipStatus] = useState<'none' | 'friends' | 'pending-sent' | 'pending-received'>('none');
  const [relationshipId, setRelationshipId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || targetUserId === user.id) return;

    // Vérifier si c'est un ami
    const friendRelation = friends.find(f => 
      (f.user_id === targetUserId || f.friend_id === targetUserId)
    );
    if (friendRelation) {
      setRelationshipStatus('friends');
      setRelationshipId(friendRelation.id);
      return;
    }

    // Vérifier les demandes reçues
    const incomingRequest = incomingRequests.find(r => r.user_id === targetUserId);
    if (incomingRequest) {
      setRelationshipStatus('pending-received');
      setRelationshipId(incomingRequest.id);
      return;
    }

    // Vérifier les demandes envoyées
    const outgoingRequest = outgoingRequests.find(r => r.friend_id === targetUserId);
    if (outgoingRequest) {
      setRelationshipStatus('pending-sent');
      setRelationshipId(outgoingRequest.id);
      return;
    }

    setRelationshipStatus('none');
    setRelationshipId(null);
  }, [user, targetUserId, friends, incomingRequests, outgoingRequests]);

  // Ne pas afficher le bouton pour soi-même
  if (!user || targetUserId === user.id) {
    return null;
  }

  const handleAction = async () => {
    switch (relationshipStatus) {
      case 'none':
        await sendFriendRequest(targetUserId);
        break;
      case 'pending-received':
        if (relationshipId) await acceptFriendRequest(relationshipId);
        break;
      case 'pending-sent':
        if (relationshipId) await rejectFriendRequest(relationshipId);
        break;
      case 'friends':
        if (relationshipId) await unfriend(relationshipId);
        break;
    }
  };

  const handleReject = async () => {
    if (relationshipStatus === 'pending-received' && relationshipId) {
      await rejectFriendRequest(relationshipId);
    }
  };

  const getButtonConfig = () => {
    switch (relationshipStatus) {
      case 'none':
        return {
          text: 'Ajouter',
          icon: <UserPlus className="h-4 w-4" />,
          variant: 'default' as const,
          showReject: false
        };
      case 'pending-sent':
        return {
          text: 'En attente',
          icon: <Clock className="h-4 w-4" />,
          variant: 'outline' as const,
          showReject: false
        };
      case 'pending-received':
        return {
          text: 'Accepter',
          icon: <Check className="h-4 w-4" />,
          variant: 'default' as const,
          showReject: true
        };
      case 'friends':
        return {
          text: 'Amis',
          icon: <Users className="h-4 w-4" />,
          variant: 'secondary' as const,
          showReject: false
        };
      default:
        return {
          text: 'Ajouter',
          icon: <UserPlus className="h-4 w-4" />,
          variant: 'default' as const,
          showReject: false
        };
    }
  };

  const config = getButtonConfig();

  if (relationshipStatus === 'pending-received') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button
          size="sm"
          variant={config.variant}
          onClick={handleAction}
          className="flex items-center space-x-1"
        >
          {config.icon}
          <span className="hidden sm:inline">{config.text}</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReject}
          className="flex items-center"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Refuser</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant={config.variant}
      onClick={handleAction}
      className={`flex items-center space-x-1 ${className}`}
      disabled={relationshipStatus === 'pending-sent'}
    >
      {config.icon}
      <span className="hidden sm:inline">{config.text}</span>
    </Button>
  );
};

export default FriendButton;
