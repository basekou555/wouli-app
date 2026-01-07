import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  ONBOARDING_KEYWORDS, 
  MIN_KEYWORDS_REQUIRED,
  CATEGORY_LABELS,
  getKeywordsByCategory,
  type OnboardingKeyword 
} from '@/data/onboardingKeywords';

interface KeywordSelectorProps {
  selectedKeywords: string[];
  onToggleKeyword: (keywordId: string) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  userName: string;
}

const KeywordCard: React.FC<{
  keyword: OnboardingKeyword;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}> = ({ keyword, isSelected, onToggle, index }) => {
  return (
    <motion.button
      onClick={onToggle}
      className={`
        relative flex flex-col items-center justify-center p-4 rounded-2xl
        transition-all duration-200 touch-manipulation
        ${isSelected 
          ? `bg-gradient-to-br ${keyword.gradient} text-white shadow-lg scale-[1.02]` 
          : 'bg-secondary hover:bg-secondary/80 text-foreground'
        }
      `}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Checkmark */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Check className="w-3 h-3 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji */}
      <span className="text-3xl mb-1">{keyword.emoji}</span>
      
      {/* Label */}
      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}>
        {keyword.label}
      </span>
    </motion.button>
  );
};

const KeywordSelector: React.FC<KeywordSelectorProps> = ({
  selectedKeywords,
  onToggleKeyword,
  onNext,
  onBack,
  canProceed,
  userName
}) => {
  const categories: OnboardingKeyword['category'][] = ['a-boire', 'soirees', 'a-manger', 'activites'];
  const remaining = MIN_KEYWORDS_REQUIRED - selectedKeywords.length;

  return (
    <motion.div 
      className="flex flex-col min-h-screen px-4 py-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.h2 
          className="text-2xl font-bold mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {userName}, qu'est-ce qui te branche ?
        </motion.h2>
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Sélectionne au moins {MIN_KEYWORDS_REQUIRED} centres d'intérêt
        </motion.p>
      </div>

      {/* Counter */}
      <motion.div
        className="flex justify-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className={`
          px-4 py-2 rounded-full font-medium text-sm
          transition-all duration-300
          ${canProceed 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-primary/10 text-primary'
          }
        `}>
          {canProceed ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              {selectedKeywords.length} sélectionnés
            </span>
          ) : (
            <span>{selectedKeywords.length}/{MIN_KEYWORDS_REQUIRED} minimum</span>
          )}
        </div>
      </motion.div>

      {/* Keywords Grid by Category */}
      <div className="flex-1 overflow-y-auto pb-32 space-y-6">
        {categories.map((category, catIndex) => {
          const keywords = getKeywordsByCategory(category);
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + catIndex * 0.1 }}
            >
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
                {CATEGORY_LABELS[category]}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {keywords.map((keyword, index) => (
                  <KeywordCard
                    key={keyword.id}
                    keyword={keyword}
                    isSelected={selectedKeywords.includes(keyword.id)}
                    onToggle={() => onToggleKeyword(keyword.id)}
                    index={catIndex * 5 + index}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <div className="max-w-sm mx-auto space-y-3">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-white font-semibold py-6 text-lg rounded-full shadow-lg transition-all duration-200"
          >
            {canProceed ? (
              <>
                Continuer
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            ) : (
              `Encore ${remaining} à choisir`
            )}
          </Button>

          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Retour
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default KeywordSelector;
