import React from 'react';
import { Users, Sparkles } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';

interface EventSocialProofProps {
  event: UnifiedEvent;
}

const EventSocialProof: React.FC<EventSocialProofProps> = ({ event }) => {
  // Génération d'avatars placeholder pour les participants
  const generateAvatars = (count: number) => {
    const avatars = [];
    const displayCount = Math.min(count, 3);
    
    for (let i = 0; i < displayCount; i++) {
      avatars.push(
        <div 
          key={i} 
          className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
          style={{ 
            backgroundColor: `hsl(${(i * 137.5) % 360}, 65%, 75%)`,
            color: `hsl(${(i * 137.5) % 360}, 65%, 25%)`
          }}
        >
          {String.fromCharCode(65 + i)}
        </div>
      );
    }
    
    if (count > 3) {
      avatars.push(
        <div key="more" className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-xs font-medium text-purple-700">
          +{count - 3}
        </div>
      );
    }
    
    return avatars;
  };

  return (
    <div className="px-6 py-4 border-b bg-white">
      {/* Cas 1 : Participants actuels */}
      {event.participants > 0 ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Photos des participants */}
            <div className="flex -space-x-2">
              {generateAvatars(event.participants)}
            </div>
            <p className="font-medium text-sm">
              {event.participants} {event.participants === 1 ? 'participant' : 'participants'}
            </p>
          </div>
          
          {/* Stats rapides */}
          <div className="flex gap-3 text-sm text-gray-500">
            <span>{event.views} vues</span>
            <span>{event.likes} ❤️</span>
          </div>
        </div>
      ) : (
        /* Cas 2 : Pas de participants - Afficher encouragement */
        <div>
          {/* Première édition */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-900">
                Première édition ! Sois parmi les pionniers
              </p>
              {event.views > 0 && (
                <p className="text-xs text-purple-700 mt-1">
                  {event.views} personnes ont déjà regardé
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventSocialProof;