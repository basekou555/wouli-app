
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EventTabsProps {
  onValueChange: (value: 'all' | 'future' | 'past') => void;
  defaultValue?: 'all' | 'future' | 'past';
  isMobile?: boolean;
}

const EventTabs: React.FC<EventTabsProps> = ({ 
  onValueChange, 
  defaultValue = 'all',
  isMobile = false
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 sticky top-16 z-10 p-2">
      <Tabs 
        defaultValue={defaultValue} 
        className="w-full" 
        onValueChange={value => onValueChange(value as 'all' | 'future' | 'past')}
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="all">Tous les événements</TabsTrigger>
          <TabsTrigger value="future">À venir</TabsTrigger>
          <TabsTrigger value="past">Passés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">Affichage de tous les événements</p>
        </TabsContent>
        <TabsContent value="future">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">Événements à venir uniquement</p>
        </TabsContent>
        <TabsContent value="past">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">Événements passés uniquement</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventTabs;
