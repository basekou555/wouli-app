import React from 'react';
import FriendsAvatars from './FriendsAvatars';
import { Friend } from '@/types/unified';

interface SocialProofProps {
  friendsParticipating: Friend[];
  totalParticipants: number;
}

const SocialProof: React.FC<SocialProofProps> = ({ friendsParticipating, totalParticipants }) => {
  const getSocialText = () => {
    if (friendsParticipating.length > 0) {
      if (friendsParticipating.length === 1) {
        return `${friendsParticipating[0].name} + ${totalParticipants - 1} autres`;
      }
      return `${friendsParticipating.length} amis + ${totalParticipants - friendsParticipating.length} autres`;
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
      <FriendsAvatars friends={friendsParticipating} />
      <span className="text-xs text-muted-foreground">
        {getSocialText()}
      </span>
    </div>
  );
};

export default SocialProof;