import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, History, TrendingUp, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EventSectionTabsProps {
  upcomingCount: number;
  pastCount: number;
  activeTab: 'upcoming' | 'past';
  onTabChange: (tab: 'upcoming' | 'past') => void;
  upcomingContent: React.ReactNode;
  pastContent: React.ReactNode;
}

export default function EventSectionTabs({
  upcomingCount,
  pastCount,
  activeTab,
  onTabChange,
  upcomingContent,
  pastContent,
}: EventSectionTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as 'upcoming' | 'past')}>
      <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl">
        <TabsTrigger 
          value="upcoming" 
          className={cn(
            "relative flex items-center justify-center gap-2 h-10 rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm",
            activeTab === 'upcoming' && "text-emerald-600"
          )}
        >
          <Calendar className="h-4 w-4" />
          <span className="font-medium">À venir</span>
          <Badge 
            variant="secondary" 
            className={cn(
              "h-5 min-w-[20px] px-1.5 text-xs transition-colors",
              activeTab === 'upcoming' 
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                : "bg-muted"
            )}
          >
            {upcomingCount}
          </Badge>
        </TabsTrigger>
        
        <TabsTrigger 
          value="past" 
          className={cn(
            "relative flex items-center justify-center gap-2 h-10 rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm",
            activeTab === 'past' && "text-slate-600 dark:text-slate-300"
          )}
        >
          <History className="h-4 w-4" />
          <span className="font-medium">Historique</span>
          <Badge 
            variant="secondary" 
            className={cn(
              "h-5 min-w-[20px] px-1.5 text-xs transition-colors",
              activeTab === 'past' 
                ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" 
                : "bg-muted"
            )}
          >
            {pastCount}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <AnimatePresence mode="wait">
        <TabsContent value="upcoming" className="mt-4 focus-visible:outline-none">
          <motion.div
            key="upcoming"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Clock className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Événements à venir</h3>
                <p className="text-sm text-muted-foreground">
                  {upcomingCount === 0 
                    ? "Aucun événement programmé" 
                    : `${upcomingCount} événement${upcomingCount > 1 ? 's' : ''} programmé${upcomingCount > 1 ? 's' : ''}`
                  }
                </p>
              </div>
            </div>
            {upcomingContent}
          </motion.div>
        </TabsContent>

        <TabsContent value="past" className="mt-4 focus-visible:outline-none">
          <motion.div
            key="past"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-gradient-to-r from-slate-500/10 to-transparent border border-slate-500/20">
              <div className="p-2 rounded-lg bg-slate-500/20">
                <TrendingUp className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Historique des événements</h3>
                <p className="text-sm text-muted-foreground">
                  {pastCount === 0 
                    ? "Aucun événement passé" 
                    : `${pastCount} événement${pastCount > 1 ? 's' : ''} passé${pastCount > 1 ? 's' : ''}`
                  }
                </p>
              </div>
            </div>
            {pastContent}
          </motion.div>
        </TabsContent>
      </AnimatePresence>
    </Tabs>
  );
}
