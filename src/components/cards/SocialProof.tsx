
import React from 'react';
import EnhancedSocialProof from './EnhancedSocialProof';
import { Friend } from '@/types/unified';

interface SocialProofProps {
  eventId?: string;
  friendsParticipating?: Friend[];
  totalParticipants: number;
}

const SocialProof: React.FC<SocialProofProps> = ({ 
  eventId,
  friendsParticipating = [], 
  totalParticipants 
}) => {
  // Si on a un eventId, utiliser la version améliorée qui charge les amis réels
  if (eventId) {
    return <EnhancedSocialProof eventId={eventId} totalParticipants={totalParticipants} />;
  }

  // Sinon, garder la logique existante pour la compatibilité
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
      <span className="text-xs text-muted-foreground">
        {getSocialText()}
      </span>
    </div>
  );
};

export default SocialProof;
