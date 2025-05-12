
import React from 'react';
import AppLayout from '../components/AppLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Explore: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      <div className="py-4 md:py-6 space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Explorer</h1>
        
        <div className="flex gap-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher des événements, groupes..." 
              className="pl-9 py-2 h-10"
            />
          </div>
          <Button size={isMobile ? "sm" : "default"}>
            Rechercher
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-500 text-sm md:text-base">
              Découvrez des événements et connectez-vous avec des personnes près de chez vous.
            </p>
            <div className="flex justify-center mt-4">
              <Button variant="outline" size={isMobile ? "sm" : "default"}>
                Explorer les événements populaires
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Explore;
