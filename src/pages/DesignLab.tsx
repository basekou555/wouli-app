import React, { useEffect, useState } from 'react';
import EventCard from '@/components/EventCard';
import { UnifiedEvent } from '@/types/unified';
import { supabase } from '@/integrations/supabase/client';

// ── Design Lab ──────────────────────────────────────────────────────────────
// Page d'itération visuelle : la carte avec de vrais événements tirés au sort.
// Route publique /design — données live, non lié au feed principal.

const noop = () => {};

const DesignLab: React.FC = () => {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      // Événements À VENIR uniquement : ce sont les seuls représentatifs (bien
      // enrichis par le pipeline = énergie + couleur). Les anciens événements
      // (souvent non enrichis) ne sont pas pertinents pour juger le design.
      // On tire un pool, shuffle + déduplique par image pour de la variété.
      const { data, error: err } = await supabase
        .from('events')
        .select('*')
        .in('status', ['validated', 'active'])
        .not('image_url', 'is', null)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(60);

      if (err) {
        setError(err.message);
      } else if (data) {
        // Shuffle for variety on each reload
        const shuffled = [...data].sort(() => Math.random() - 0.5);

        // Deduplicate by image_url to avoid identical-looking cards
        const seenImages = new Set<string>();
        const unique = shuffled.filter((row) => {
          const url = row.image_url as string;
          if (seenImages.has(url)) return false;
          seenImages.add(url);
          return true;
        }).slice(0, 9);

        const mapped: UnifiedEvent[] = unique.map((row: Record<string, unknown>) => ({
          ...row,
          source: 'business' as const,
          organizer: (row.venue as string) || (row.location as string) || '',
          organizer_type: 'business' as const,
          views: (row.views as number) ?? 0,
          likes: (row.likes as number) ?? 0,
          participants: (row.participants as number) ?? 0,
        })) as UnifiedEvent[];
        setEvents(mapped);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-2xl font-bold">Design Lab — Carte</h1>
      <p className="text-white/50 text-sm mt-1 mb-6">
        Événements à venir (live) · Cliquer sur la photo pour voir les détails
      </p>

      {loading && (
        <p className="text-white/40 text-sm">Chargement des événements…</p>
      )}

      {error && (
        <p className="text-red-400 text-sm">Erreur : {error}</p>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="text-white/40 text-sm">Aucun événement validé avec image trouvé.</p>
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-8">
        {events.map((event) => (
          <div key={event.id} className="space-y-2">
            <div className="text-[11px] uppercase tracking-wide text-white/55 font-semibold flex gap-2 max-w-[300px] items-center">
              <span className="text-purple-400 flex-shrink-0">{event.energy ?? 'AUTO'}</span>
              <span className="truncate">{event.title?.slice(0, 28)}</span>
              {event.color_card ? (
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: event.color_card, boxShadow: `0 0 4px ${event.color_card}` }}
                  title={`color_card: ${event.color_card}`}
                />
              ) : (
                <span className="text-white/25 flex-shrink-0 text-[9px]">no color</span>
              )}
            </div>
            <div className="w-[300px] h-[620px] rounded-[28px] overflow-hidden ring-1 ring-white/10 shadow-2xl bg-black">
              <EventCard
                event={event}
                isFirstEvent={false}
                onBack={noop}
                onDislike={noop}
                onLike={noop}
                onParticipate={noop}
                onShare={noop}
                onEstablishmentClick={noop}
                onMapClick={noop}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignLab;
