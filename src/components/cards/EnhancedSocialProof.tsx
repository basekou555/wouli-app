
import React, { useEffect, useState } from 'react';
import FriendsAvatars from './FriendsAvatars';
import { Friend } from '@/types/unified';
import { useFriendships } from '@/hooks/useFriendships';

interface EnhancedSocialProofProps {
  eventId: string;
  totalParticipants: number;
}

const EnhancedSocialProof: React.FC<EnhancedSocialProofProps> = ({ 
  eventId, 
  totalParticipants 
}) => {
  const { getFriendsParticipating } = useFriendships();
  const [friendsParticipating, setFriendsParticipating] = useState<Friend[]>([]);

  useEffect(() => {
    const loadFriendsParticipating = async () => {
      const friends = await getFriendsParticipating(eventId);
      setFriendsParticipating(friends);
    };

    loadFriendsParticipating();
  }, [eventId, getFriendsParticipating]);

  const getSocialText = () => {
    if (friendsParticipating.length > 0) {
      if (friendsParticipating.length === 1) {
        const otherCount = totalParticipants - 1;
        return otherCount > 0 
          ? `${friendsParticipating[0].name} et ${otherCount} autre${otherCount > 1 ? 's' : ''}`
          : `${friendsParticipating[0].name} participe`;
      }
      const otherCount = totalParticipants - friendsParticipating.length;
      return otherCount > 0
        ? `${friendsParticipating.length} amis et ${otherCount} autre${otherCount > 1 ? 's' : ''}`
        : `${friendsParticipating.length} amis participent`;
    } else if (totalParticipants > 10) {
      return `${totalParticipants} personnes intéressées`;
    } else if (totalParticipants > 0) {
      return `${totalParticipants} ${totalParticipants === 1 ? 'personne' : 'personnes'} intéressées`;
    } else {
      return "Sois le premier de tes amis";
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {friendsParticipating.length > 0 && (
        <FriendsAvatars friends={friendsParticipating} maxDisplay={3} />
      )}
      <span className="text-xs text-muted-foreground">
        {getSocialText()}
      </span>
    </div>
  );
};

export default EnhancedSocialProof;
