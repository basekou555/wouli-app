
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  onReset: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-gray-400 mb-4">
        <Search className="h-12 w-12 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">Aucun événement trouvé</h3>
      <p className="text-gray-500 mt-1 mb-4">Essayez de modifier vos critères de recherche</p>
      <Button onClick={onReset} variant="outline">
        Réinitialiser les filtres
      </Button>
    </div>
  );
};

export default EmptyState;
