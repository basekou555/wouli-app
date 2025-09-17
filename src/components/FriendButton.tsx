import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserCheck, Clock, UserX, Send } from 'lucide-react';
import { useFriendshipStatus, useFriendships } from '@/hooks/useFriendships';

interface FriendButtonProps {
  userId: string;
  username?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

const FriendButton: React.FC<FriendButtonProps> = ({ 
  userId, 
  username, 
  size = 'default', 
  variant = 'default' 
}) => {
  const { status, loading: statusLoading, refetch } = useFriendshipStatus(userId);
  const { sendFriendRequest } = useFriendships();

  const handleSendRequest = async () => {
    const success = await sendFriendRequest(userId);
    if (success) {
      refetch();
    }
  };

  if (statusLoading) {
    return (
      <Button size={size} variant="outline" disabled>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      </Button>
    );
  }

  switch (status) {
    case 'friends':
      return (
        <Badge variant="secondary" className="px-3 py-1">
          <UserCheck className="h-4 w-4 mr-2" />
          Amis
        </Badge>
      );

    case 'sent':
      return (
        <Badge variant="outline" className="px-3 py-1">
          <Clock className="h-4 w-4 mr-2" />
          Envoyée
        </Badge>
      );

    case 'received':
      return (
        <Badge variant="default" className="px-3 py-1">
          <Send className="h-4 w-4 mr-2" />
          À accepter
        </Badge>
      );

    case 'blocked':
      return (
        <Badge variant="destructive" className="px-3 py-1">
          <UserX className="h-4 w-4 mr-2" />
          Bloqué
        </Badge>
      );

    case 'none':
    default:
      return (
        <Button 
          size={size} 
          variant={variant}
          onClick={handleSendRequest}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter en ami
        </Button>
      );
  }
};

export default FriendButton;