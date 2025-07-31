import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Friend } from '@/types/unified';

interface FriendsAvatarsProps {
  friends: Friend[];
  maxDisplay?: number;
}

const FriendsAvatars: React.FC<FriendsAvatarsProps> = ({ friends, maxDisplay = 3 }) => {
  const displayedFriends = friends.slice(0, maxDisplay);

  if (displayedFriends.length === 0) return null;

  return (
    <div className="flex -space-x-2">
      {displayedFriends.map((friend, index) => (
        <Avatar 
          key={friend.id} 
          className="w-6 h-6 border-2 border-white shadow-sm"
          style={{ zIndex: maxDisplay - index }}
        >
          <AvatarImage src={friend.avatar || ''} alt={friend.name} />
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {friend.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
};

export default FriendsAvatars;