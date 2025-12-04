import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, PartyPopper, Rocket, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface OnboardingTransferProps {
  userId: string;
  instagramHandle: string;
  onComplete: () => void;
}

export const OnboardingTransfer = ({ userId, instagramHandle, onComplete }: OnboardingTransferProps) => {
  const [progress, setProgress] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'transfer' | 'complete'>('intro');
  const navigate = useNavigate();

  useEffect(() => {
    const transferEvents = async () => {
      // Phase intro pendant 1.5s
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase('transfer');

      try {
        // Appeler la fonction de transfert
        const { data, error } = await supabase.rpc('claim_venue_events', {
          p_venue_id: userId,
          p_instagram_handle: instagramHandle
        });

        if (error) {
          console.error('Transfer error:', error);
          throw error;
        }

        const claimed = data?.[0]?.claimed_count || 0;
        setTotalCount(claimed);

        // Animer le compteur progressivement
        if (claimed > 0) {
          const delay = Math.max(50, Math.min(100, 1500 / claimed)); // Entre 50ms et 100ms par event
          for (let i = 0; i <= claimed; i++) {
            await new Promise(resolve => setTimeout(resolve, delay));
            setDisplayCount(i);
            setProgress((i / claimed) * 100);
          }
        } else {
          // Pas d'events, simuler une petite progression
          for (let i = 0; i <= 100; i += 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setProgress(i);
          }
        }

        // Marquer l'onboarding comme terminé
        await supabase
          .from('business_details')
          .update({ onboarding_completed: true })
          .eq('id', userId);

        setPhase('complete');
        setIsComplete(true);
      } catch (err) {
        console.error('Transfer error:', err);
        // En cas d'erreur, marquer quand même comme terminé
        await supabase
          .from('business_details')
          .update({ onboarding_completed: true })
          .eq('id', userId);
        setPhase('complete');
        setIsComplete(true);
      }
    };

    transferEvents();
  }, [userId, instagramHandle]);

  const handleContinue = () => {
    onComplete();
    navigate('/business');
  };

  // Confetti particles
  const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 z-50 flex items-center justify-center overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-30"
            style={{
              background: confettiColors[i % confettiColors.length],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Confetti explosion on complete */}
      <AnimatePresence>
        {isComplete && totalCount > 0 && (
          <>
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={`confetti-${i}`}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  background: confettiColors[i % confettiColors.length],
                  left: '50%',
                  top: '40%',
                }}
                initial={{ scale: 0, x: 0, y: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1, 1, 0],
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 2,
                  ease: 'easeOut',
                  delay: i * 0.02,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center px-6 max-w-2xl relative z-10">
        {/* Phase: Intro */}
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2 
                }}
              >
                <Rocket className="w-24 h-24 text-yellow-400" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-white text-center mt-8"
              >
                Préparation de votre compte...
              </motion.h1>
            </motion.div>
          )}

          {/* Phase: Transfer */}
          {phase === 'transfer' && (
            <motion.div
              key="transfer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center w-full"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15
                }}
              >
                <Sparkles className="w-20 h-20 text-yellow-400" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-white text-center mt-6 mb-2"
              >
                Bienvenue sur Wouli ! ✨
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/80 text-center mb-8"
              >
                Nous importons vos événements...
              </motion.p>

              {/* Progress bar */}
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-md mb-6"
              >
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>

              {/* Counter */}
              {totalCount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/70 text-lg"
                >
                  <span className="text-4xl font-bold text-white">{displayCount}</span>
                  <span className="ml-2">événement{displayCount > 1 ? 's' : ''} trouvé{displayCount > 1 ? 's' : ''}</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase: Complete */}
          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 10 
                }}
                className="relative"
              >
                {totalCount > 0 ? (
                  <PartyPopper className="w-24 h-24 text-yellow-400" />
                ) : (
                  <Check className="w-24 h-24 text-green-400" />
                )}
                
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{ background: totalCount > 0 ? 'rgba(255, 215, 0, 0.4)' : 'rgba(74, 222, 128, 0.4)' }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-white text-center mt-8 mb-4"
              >
                {totalCount > 0 ? (
                  <>🎉 {totalCount} événement{totalCount > 1 ? 's' : ''} importé{totalCount > 1 ? 's' : ''} !</>
                ) : (
                  <>Compte configuré ! 🚀</>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-white/80 text-center mb-8 max-w-md"
              >
                {totalCount > 0 
                  ? "Vos événements passés ont été automatiquement récupérés. Votre dashboard vous attend !"
                  : "Aucun événement trouvé pour l'instant. Créez votre premier événement !"}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  size="lg"
                  onClick={handleContinue}
                  className="bg-white text-purple-900 hover:bg-white/90 font-semibold px-8 py-6 text-lg shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105"
                >
                  {totalCount > 0 
                    ? "Découvrir mon dashboard 🚀" 
                    : "Commencer 🚀"}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default OnboardingTransfer;
