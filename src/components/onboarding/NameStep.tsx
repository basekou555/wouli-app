import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NameStepProps {
  userName: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}

const NameStep: React.FC<NameStepProps> = ({
  userName,
  onNameChange,
  onNext,
  onBack,
  canProceed
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed) {
      onNext();
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[80vh] px-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Icon */}
      <motion.div
        className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <User className="w-10 h-10 text-primary" />
      </motion.div>

      {/* Title */}
      <motion.h2 
        className="text-3xl font-bold mb-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        Comment tu t'appelles ?
      </motion.h2>

      {/* Subtitle */}
      <motion.p 
        className="text-muted-foreground mb-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Pour personnaliser ton expérience
      </motion.p>

      {/* Input */}
      <motion.div
        className="w-full max-w-sm mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className={`relative transition-all duration-200 ${isFocused ? 'scale-[1.02]' : ''}`}>
          <Input
            type="text"
            placeholder="Ton prénom"
            value={userName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`text-center text-xl py-6 rounded-2xl border-2 transition-all duration-200 ${
              isFocused 
                ? 'border-primary shadow-lg shadow-primary/20' 
                : 'border-border'
            }`}
            maxLength={30}
            autoFocus
          />
        </div>
        
        {userName.length > 0 && userName.length < 2 && (
          <motion.p
            className="text-sm text-muted-foreground mt-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Minimum 2 caractères
          </motion.p>
        )}
      </motion.div>

      {/* Buttons */}
      <motion.div
        className="w-full max-w-sm space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-white font-semibold py-6 text-lg rounded-full shadow-lg transition-all duration-200"
        >
          Continuer
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        <Button
          onClick={onBack}
          variant="ghost"
          size="lg"
          className="w-full py-6 text-muted-foreground"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Retour
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default NameStep;
