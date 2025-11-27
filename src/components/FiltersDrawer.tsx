import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPrice: string;
  onPriceChange: (price: string) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  onReset: () => void;
}

const categories = [
  { id: 'all', label: 'Tout', emoji: '🎯' },
  { id: 'a-boire', label: 'À boire', emoji: '🍻' },
  { id: 'a-manger', label: 'À manger', emoji: '🍽️' },
  { id: 'soirees', label: 'Soirées', emoji: '🎉' },
  { id: 'activites', label: 'Activités', emoji: '🎨' },
];

const priceRanges = [
  { id: 'all', label: 'Tous les prix', emoji: '💰' },
  { id: 'free', label: 'Gratuit', emoji: '🎁' },
  { id: 'cheap', label: 'Économique (< 15€)', emoji: '€' },
  { id: 'medium', label: 'Moyen (15-30€)', emoji: '€€' },
  { id: 'expensive', label: 'Premium (> 30€)', emoji: '€€€' },
];

const timeRanges = [
  { id: 'all', label: 'Tout le temps', emoji: '⏰' },
  { id: 'now', label: 'Maintenant', emoji: '🔥' },
  { id: 'tonight', label: 'Ce soir', emoji: '🌙' },
  { id: 'tomorrow', label: 'Demain', emoji: '☀️' },
  { id: 'weekend', label: 'Ce week-end', emoji: '🎉' },
];

export const FiltersDrawer: React.FC<FiltersDrawerProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onCategoryChange,
  selectedPrice,
  onPriceChange,
  selectedTime,
  onTimeChange,
  onReset,
}) => {
  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedPrice !== 'all' || 
    selectedTime !== 'all';

  const handleReset = () => {
    onReset();
  };

  const handleApply = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl max-h-[85vh] overflow-y-auto z-50 shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="sticky top-0 bg-background z-10 px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Filtres</h2>
                {hasActiveFilters && (
                  <p className="text-sm text-muted-foreground">
                    Filtres actifs
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 pb-32">
              
              {/* Catégories */}
              <div>
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  🎯 <span>Catégories</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => onCategoryChange(cat.id)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                        selectedCategory === cat.id
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                          : "bg-accent hover:bg-accent/80"
                      )}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prix */}
              <div>
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  💰 <span>Prix</span>
                </h3>
                <div className="space-y-2">
                  {priceRanges.map((price) => (
                    <button
                      key={price.id}
                      onClick={() => onPriceChange(price.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg transition-all",
                        selectedPrice === price.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent hover:bg-accent/80"
                      )}
                    >
                      <span className="font-medium">
                        {price.emoji} {price.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Horaires */}
              <div>
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  ⏰ <span>Quand ?</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {timeRanges.map((time) => (
                    <button
                      key={time.id}
                      onClick={() => onTimeChange(time.id)}
                      className={cn(
                        "px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                        selectedTime === time.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent hover:bg-accent/80"
                      )}
                    >
                      {time.emoji} {time.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 grid grid-cols-2 gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={!hasActiveFilters}
                className="w-full"
              >
                Réinitialiser
              </Button>
              <Button
                onClick={handleApply}
                className="w-full"
              >
                Appliquer
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FiltersDrawer;
