import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo/Icon */}
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8 shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <Sparkles className="w-12 h-12 text-white" />
      </motion.div>

      {/* Title */}
      <motion.h1 
        className="text-4xl font-bold mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Bienvenue sur{' '}
        <span className="text-gradient-primary">Wouli</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p 
        className="text-lg text-muted-foreground mb-8 max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Découvre les meilleures sorties à Lyon, personnalisées juste pour toi.
      </motion.p>

      {/* Features list */}
      <motion.div 
        className="space-y-3 mb-10 text-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[
          '🎯 Des recommandations sur-mesure',
          '👥 Vois où vont tes amis',
          '⚡ Des sorties de dernière minute'
        ].map((feature, index) => (
          <motion.div
            key={feature}
            className="flex items-center gap-3 text-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <span className="text-lg">{feature}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-xs"
      >
        <Button
          onClick={onNext}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold py-6 text-lg rounded-full shadow-lg"
        >
          C'est parti !
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>

      {/* Skip hint */}
      <motion.p
        className="mt-4 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        30 secondes pour personnaliser ton expérience
      </motion.p>
    </motion.div>
  );
};

export default WelcomeStep;
