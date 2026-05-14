import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import EventCard from '@/components/EventCard';
import { UnifiedEvent } from '@/types/unified';

const SWIPE_THRESHOLD = 80;    // px to trigger swipe
const VELOCITY_THRESHOLD = 400; // px/s to trigger swipe on fast flick

interface SwipeCardProps {
  event: UnifiedEvent;
  isFirstEvent: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onParticipate: () => void;
  onShare?: () => void;
  onEstablishmentClick?: () => void;
  onMapClick?: () => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  event,
  isFirstEvent,
  onSwipeLeft,
  onSwipeRight,
  onParticipate,
  onShare,
  onEstablishmentClick,
  onMapClick,
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-280, 0, 280], [-12, 0, 12]);

  // Overlays appear progressively as the card is dragged
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);

  const flyOut = (direction: 'left' | 'right', callback: () => void) => {
    const target = direction === 'right'
      ? window.innerWidth + 300
      : -window.innerWidth - 300;

    animate(x, target, {
      type: 'tween',
      duration: 0.28,
      ease: [0.25, 0.46, 0.45, 0.94],
      onComplete: callback,
    });
  };

  const snapBack = () => {
    animate(x, 0, { type: 'spring', stiffness: 380, damping: 28 });
  };

  const handleDragEnd = (
    _: unknown,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const { offset, velocity } = info;

    if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) {
      flyOut('right', onSwipeRight);
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) {
      flyOut('left', onSwipeLeft);
    } else {
      snapBack();
    }
  };

  // Button handlers trigger the same fly-out animation as a gesture swipe
  const handleButtonLeft = () => flyOut('left', onSwipeLeft);
  const handleButtonRight = () => flyOut('right', onSwipeRight);

  return (
    // Entrance animation wrapper — fades in each new card
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute inset-0"
    >
      {/* Draggable layer */}
      <motion.div
        drag="x"
        dragMomentum={false}
        style={{ x, rotate }}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 will-change-transform cursor-grab active:cursor-grabbing"
      >
        {/* LIKE overlay — appears when dragging right */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-16 left-5 z-20 pointer-events-none select-none"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl px-5 py-2 -rotate-12 shadow-xl">
            <span className="text-white font-black text-2xl tracking-wide flex items-center gap-2">
              ❤️ Chaud !
            </span>
          </div>
        </motion.div>

        {/* NOPE overlay — appears when dragging left */}
        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-16 right-5 z-20 pointer-events-none select-none"
        >
          <div className="bg-gray-900/90 backdrop-blur rounded-2xl px-5 py-2 rotate-12 shadow-xl">
            <span className="text-white font-black text-2xl tracking-wide flex items-center gap-2">
              ✕ Passe
            </span>
          </div>
        </motion.div>

        {/* Card content — buttons still work via tap */}
        <EventCard
          event={event}
          isFirstEvent={isFirstEvent}
          onBack={() => {}}
          onDislike={handleButtonLeft}
          onLike={handleButtonRight}
          onParticipate={onParticipate}
          onShare={onShare}
          onEstablishmentClick={onEstablishmentClick}
          onMapClick={onMapClick}
        />
      </motion.div>
    </motion.div>
  );
};

export default SwipeCard;
