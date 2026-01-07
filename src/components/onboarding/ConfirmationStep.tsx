import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Rocket, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ONBOARDING_KEYWORDS } from '@/data/onboardingKeywords';

interface ConfirmationStepProps {
  userName: string;
  selectedKeywords: string[];
  onComplete: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  userName,
  selectedKeywords,
  onComplete,
  onBack,
  isLoading
}) => {
  const selectedKeywordDetails = ONBOARDING_KEYWORDS.filter(k => 
    selectedKeywords.includes(k.id)
  );

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[80vh] px-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Success Icon */}
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8 shadow-lg"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}
      >
        <Sparkles className="w-12 h-12 text-white" />
      </motion.div>

      {/* Title */}
      <motion.h2 
        className="text-3xl font-bold mb-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Parfait, {userName} ! 🎉
      </motion.h2>

      {/* Subtitle */}
      <motion.p 
        className="text-muted-foreground mb-8 text-center max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        Ton feed personnalisé est prêt. Voici ce qu'on a retenu :
      </motion.p>

      {/* Selected Keywords */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mb-10 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {selectedKeywordDetails.map((keyword, index) => (
          <motion.span
            key={keyword.id}
            className={`
              px-4 py-2 rounded-full text-sm font-medium
              bg-gradient-to-r ${keyword.gradient} text-white shadow-sm
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + index * 0.05 }}
          >
            {keyword.emoji} {keyword.label}
          </motion.span>
        ))}
      </motion.div>

      {/* What's next */}
      <motion.div
        className="bg-secondary/50 rounded-2xl p-6 mb-8 max-w-sm w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-semibold mb-3 text-center">Ce qui t'attend :</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="text-primary">✨</span>
            Des événements triés sur le volet
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">🎯</span>
            Des recommandations qui s'améliorent
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">👥</span>
            Les sorties où vont tes amis
          </li>
        </ul>
      </motion.div>

      {/* Buttons */}
      <motion.div
        className="w-full max-w-sm space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          onClick={onComplete}
          disabled={isLoading}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold py-6 text-lg rounded-full shadow-lg"
        >
          {isLoading ? (
            <motion.div
              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
          ) : (
            <>
              Découvrir mon feed
              <Rocket className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>

        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Modifier mes choix
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationStep;
