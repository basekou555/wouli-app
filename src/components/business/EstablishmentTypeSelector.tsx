import React from 'react';
import { EstablishmentType } from '@/data/establishmentTypes';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

interface EstablishmentTypeSelectorProps {
  types: EstablishmentType[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const EstablishmentTypeSelector: React.FC<EstablishmentTypeSelectorProps> = ({
  types,
  value,
  onChange,
  error
}) => {
  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-foreground font-medium">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Building2 className="w-3.5 h-3.5 text-white" />
        </div>
        Type d'établissement
      </Label>
      <div className="grid grid-cols-2 gap-3">
        {types.map((type, index) => {
          const IconComponent = type.icon;
          const isSelected = value === type.value;
          
          // Different gradient for each type
          const gradients = [
            'from-orange-500 to-amber-500',
            'from-pink-500 to-rose-500',
            'from-purple-500 to-violet-500',
            'from-indigo-500 to-blue-500',
            'from-emerald-500 to-teal-500',
          ];
          const gradient = gradients[index % gradients.length];
          
          return (
            <motion.div
              key={type.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={cn(
                  "relative p-4 rounded-xl cursor-pointer transition-all duration-200 overflow-hidden",
                  "bg-white/80 border-2",
                  isSelected 
                    ? "border-transparent shadow-lg" 
                    : "border-white/50 hover:border-gray-200 hover:shadow-md"
                )}
                onClick={() => onChange(type.value)}
              >
                {/* Gradient border effect when selected */}
                {isSelected && (
                  <motion.div 
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-10`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                  />
                )}
                
                {/* Selected indicator */}
                {isSelected && (
                  <motion.div 
                    className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-br ${gradient}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  />
                )}
                
                <div className="flex items-start gap-3 relative z-10">
                  <div className={cn(
                    "p-2.5 rounded-xl transition-all",
                    isSelected 
                      ? `bg-gradient-to-br ${gradient} shadow-md` 
                      : "bg-gray-100"
                  )}>
                    <IconComponent className={cn(
                      "h-5 w-5",
                      isSelected ? "text-white" : "text-gray-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-semibold text-sm",
                      isSelected ? "text-gray-900" : "text-gray-700"
                    )}>
                      {type.label}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {type.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default EstablishmentTypeSelector;
