import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Share2, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SwipeFeedEmptyProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onRestart: () => void;
}

const SwipeFeedEmpty: React.FC<SwipeFeedEmptyProps> = ({
  hasActiveFilters,
  onResetFilters,
  onRestart,
}) => {
  const [upcomingCount, setUpcomingCount] = useState<number | null>(null);
  const { toast } = useToast();

  // Compter les events de la semaine prochaine pour afficher un teaser
  useEffect(() => {
    const fetchUpcoming = async () => {
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { count } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('date', tomorrow)
        .lte('date', in7Days);

      setUpcomingCount(count ?? 0);
    };

    fetchUpcoming();
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: 'Wouli — Les sorties à Lyon',
      text: 'Découvre les meilleures sorties à Lyon avec Wouli !',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: 'Lien copié ! 📋', duration: 2000 });
      }
    } catch {
      // Share cancelled
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center text-white space-y-6 max-w-xs w-full"
      >
        <motion.span
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-6xl block"
        >
          🎉
        </motion.span>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold leading-tight">
            {hasActiveFilters
              ? 'Rien avec ces filtres'
              : 'Tu as tout swipé !'}
          </h2>
          <p className="text-white/80 text-sm">
            {hasActiveFilters
              ? 'Élargis tes filtres pour voir plus d\'événements'
              : upcomingCount && upcomingCount > 0
                ? `${upcomingCount} événement${upcomingCount > 1 ? 's' : ''} arrivent cette semaine — reviens vite`
                : 'De nouvelles sorties arrivent bientôt'}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {hasActiveFilters && (
            <Button
              onClick={onResetFilters}
              className="w-full bg-white/20 hover:bg-white/30 text-white border-0 rounded-full font-semibold"
              variant="outline"
            >
              Élargir les filtres
            </Button>
          )}

          <Button
            onClick={onRestart}
            className="w-full bg-white text-purple-700 hover:bg-white/90 rounded-full font-semibold flex items-center justify-center gap-2"
            variant="secondary"
          >
            <RefreshCw className="w-4 h-4" />
            Revoir depuis le début
          </Button>

          {upcomingCount !== null && upcomingCount > 0 && !hasActiveFilters && (
            <div className="flex items-center justify-center gap-2 text-white/70 text-xs pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Reviens demain pour {upcomingCount} nouvel{upcomingCount > 1 ? 'les' : ''} event{upcomingCount > 1 ? 's' : ''}</span>
            </div>
          )}

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 text-white/60 hover:text-white/90 text-sm transition-colors mt-2"
          >
            <Share2 className="w-4 h-4" />
            Partager Wouli avec des amis
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SwipeFeedEmpty;
