
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimationControls } from 'framer-motion';
import { Calendar, MapPin, Users, Heart, X, Star } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';
import { getCategoryName, getCategoryIcon } from '@/data/wouliCategories';

interface SwipeCardProps {
  event: UnifiedEvent;
  controls: AnimationControls;
  onSwipe: (event: MouseEvent | TouchEvent | PointerEvent, info: any) => void;
  onPass: () => void;
  onSave: () => void;
  onLike: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const SwipeCard: React.FC<SwipeCardProps> = ({
  event,
  controls,
  onSwipe,
  onPass,
  onSave,
  onLike
}) => {
  return (
    <motion.div
      className="absolute w-full max-w-md"
      animate={controls}
      initial={{ x: 0, opacity: 1 }}
      drag="x"
      dragConstraints={{ left: -10, right: 10 }}
      onDragEnd={onSwipe}
      whileTap={{ scale: 1.05 }}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
        {/* Card Image */}
        <div className="relative w-full h-96">
          <img
            src={event?.image_url || "https://picsum.photos/400/200?random=event"}
            alt={event?.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          {event?.source === 'business' && (
            <div className="absolute top-4 right-4">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                ★ Établissement
              </span>
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
              {getCategoryIcon(event?.category)} {getCategoryName(event?.category)}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h2 className="text-2xl font-bold mb-1">{event?.title}</h2>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{event?.location}</span>
            </div>
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm">{formatDate(event?.date)}</span>
            </div>
            <div className="flex items-center mt-1">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-sm">{event?.participants} participants</span>
            </div>
            <div className="flex items-center mt-1 text-xs text-gray-300">
              <span>Proposé par {event?.organizer}</span>
            </div>
          </div>
        </div>
        
        {/* Card Actions */}
        <div className="flex justify-center space-x-4 py-4">
          <Button 
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full border-2 border-red-400 text-red-500"
            onClick={onPass}
          >
            <X className="h-6 w-6" />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full border-2 border-blue-400 text-blue-500"
            onClick={onSave}
          >
            <Star className="h-6 w-6" />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full border-2 border-green-400 text-green-500"
            onClick={onLike}
          >
            <Heart className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
