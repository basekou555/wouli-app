import React from 'react';
import { EstablishmentType } from '@/data/establishmentTypes';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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
      <Label className="text-sm font-medium">Type d'établissement</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {types.map((type) => {
          const IconComponent = type.icon;
          const isSelected = value === type.value;
          
          return (
            <Card
              key={type.value}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-sm" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onChange(type.value)}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-medium text-sm",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {type.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {type.description}
                  </p>
                </div>
              </div>
            </Card>
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