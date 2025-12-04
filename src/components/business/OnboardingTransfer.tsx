import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, PartyPopper, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface OnboardingTransferProps {
  userId: string;
  instagramHandle: string;
  onComplete: () => void;
}

// Couleurs Wouli
const wouliColors = {
  orange: '#F97316',
  rose: '#EC4899',
  violet: '#8B5CF6',
  gold: '#FBBF24',
  pink: '#FB7185'
};

const confettiColors = [
  wouliColors.orange,
  wouliColors.rose,
  wouliColors.violet,
  wouliColors.gold,
  wouliColors.pink,
  '#FED7AA', // orange clair
  '#F5D0FE', // violet clair
];

export const OnboardingTransfer = ({ userId, instagramHandle, onComplete }: OnboardingTransferProps) => {
  const [progress, setProgress] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'transfer' | 'complete'>('intro');
  const navigate = useNavigate();

  useEffect(() => {
    const transferEvents = async () => {
      // Phase intro pendant 3 secondes
      await new Promise(resolve => setTimeout(resolve, 3000));
      setPhase('transfer');

      const startTime = Date.now();
      const minTransferTime = 2000; // Minimum 2 secondes pour la phase transfer

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
          const delay = Math.max(100, Math.min(150, 2000 / claimed)); // Entre 100ms et 150ms par event
          for (let i = 0; i <= claimed; i++) {
            await new Promise(resolve => setTimeout(resolve, delay));
            setDisplayCount(i);
            setProgress((i / claimed) * 100);
          }
        } else {
          // Pas d'events, simuler une progression fluide
          for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 150));
            setProgress(i);
          }
        }

        // Marquer l'onboarding comme terminé
        await supabase
          .from('business_details')
          .update({ onboarding_completed: true })
          .eq('id', userId);

        // Attendre le temps restant si nécessaire
        const elapsed = Date.now() - startTime;
        if (elapsed < minTransferTime) {
          await new Promise(resolve => setTimeout(resolve, minTransferTime - elapsed));
        }

        // Pause de 1.5 secondes avant la phase complete
        await new Promise(resolve => setTimeout(resolve, 1500));

        setPhase('complete');
        setIsComplete(true);
      } catch (err) {
        console.error('Transfer error:', err);
        // En cas d'erreur, marquer quand même comme terminé
        await supabase
          .from('business_details')
          .update({ onboarding_completed: true })
          .eq('id', userId);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${wouliColors.orange} 0%, ${wouliColors.rose} 50%, ${wouliColors.violet} 100%)`
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background: confettiColors[i % confettiColors.length],
              width: `${8 + Math.random() * 12}px`,
              height: `${8 + Math.random() * 12}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Confetti explosion on complete */}
      <AnimatePresence>
        {isComplete && totalCount > 0 && (
          <>
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={`confetti-${i}`}
                className="absolute rounded-sm"
                style={{
                  background: confettiColors[i % confettiColors.length],
                  width: `${6 + Math.random() * 8}px`,
                  height: `${6 + Math.random() * 8}px`,
                  left: '50%',
                  top: '35%',
                }}
                initial={{ scale: 0, x: 0, y: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1, 1, 0.5],
                  x: (Math.random() - 0.5) * 500,
                  y: (Math.random() - 0.5) * 500,
                  rotate: Math.random() * 720 - 360,
                }}
                transition={{
                  duration: 2.5,
                  ease: 'easeOut',
                  delay: i * 0.015,
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
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              {/* Logo W Wouli animé */}
              <motion.div
                className="relative"
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                  }}
                  animate={{
                    boxShadow: [
                      '0 20px 60px rgba(0, 0, 0, 0.3)',
                      '0 25px 80px rgba(249, 115, 22, 0.4)',
                      '0 20px 60px rgba(0, 0, 0, 0.3)',
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <span 
                    className="text-5xl font-black"
                    style={{ 
                      background: `linear-gradient(135deg, ${wouliColors.orange}, ${wouliColors.rose})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    W
                  </span>
                </motion.div>
                
                {/* Glow effect */}
                <motion.div
                  className="absolute -inset-4 rounded-full blur-2xl -z-10"
                  style={{ background: `rgba(249, 115, 22, 0.3)` }}
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-4xl font-bold text-white text-center mt-10"
                style={{ textShadow: '0 2px 20px rgba(0, 0, 0, 0.2)' }}
              >
                Préparation de votre compte...
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex gap-2 mt-6"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-white/80"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Phase: Transfer */}
          {phase === 'transfer' && (
            <motion.div
              key="transfer"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.5 }}
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
                <Sparkles className="w-20 h-20 text-white drop-shadow-lg" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-white text-center mt-6 mb-2"
                style={{ textShadow: '0 2px 20px rgba(0, 0, 0, 0.2)' }}
              >
                Bienvenue sur Wouli ! ✨
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/90 text-center mb-8"
              >
                Nous importons vos événements...
              </motion.p>

              {/* Progress bar avec gradient Wouli */}
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-md mb-6"
              >
                <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${wouliColors.gold}, ${wouliColors.orange}, ${wouliColors.rose})`
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>

              {/* Counter */}
              {totalCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white/90 text-lg"
                >
                  <span className="text-5xl font-bold text-white drop-shadow-lg">{displayCount}</span>
                  <span className="ml-3">événement{displayCount > 1 ? 's' : ''} trouvé{displayCount > 1 ? 's' : ''}</span>
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
              transition={{ duration: 0.5 }}
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
                  <PartyPopper className="w-28 h-28 text-white drop-shadow-lg" />
                ) : (
                  <Check className="w-28 h-28 text-white drop-shadow-lg" />
                )}
                
                {/* Glow effect */}
                <motion.div
                  className="absolute -inset-6 rounded-full blur-2xl -z-10"
                  style={{ background: 'rgba(255, 255, 255, 0.3)' }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-white text-center mt-8 mb-4"
                style={{ textShadow: '0 2px 20px rgba(0, 0, 0, 0.2)' }}
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
                className="text-xl text-white/90 text-center mb-10 max-w-md"
              >
                {totalCount > 0 
                  ? "Vos événements ont été automatiquement récupérés. Votre dashboard vous attend !"
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
                  className="font-semibold px-10 py-7 text-lg shadow-2xl transition-all duration-300 hover:scale-105 border-0"
                  style={{
                    background: `linear-gradient(135deg, ${wouliColors.orange}, ${wouliColors.rose})`,
                    color: 'white',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                  }}
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
