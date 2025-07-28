import React from 'react';
import FriendsAvatars from './FriendsAvatars';

interface Friend {
  name: string;
  avatar: string;
  id: string;
}

interface SocialProofProps {
  friendsParticipating: Friend[];
  totalParticipants: number;
}

const SocialProof: React.FC<SocialProofProps> = ({ friendsParticipating, totalParticipants }) => {
  const getSocialText = () => {
    if (friendsParticipating.length > 0) {
      return `${friendsParticipating.length} amis, ${totalParticipants} total`;
    } else if (totalParticipants > 0) {
      return `${totalParticipants} personnes intéressées`;
    } else {
      return "Sois le premier";
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