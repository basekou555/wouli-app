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
      const { data, error: err } = await supabase
        .from('events')
        .select('*')
        .in('status', ['validated', 'active'])
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(9);

      if (err) {
        setError(err.message);
      } else if (data) {
        // Map DB rows → UnifiedEvent (DB columns are snake_case and mostly compatible)
        const mapped: UnifiedEvent[] = data.map((row: Record<string, unknown>) => ({
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
        Vrais événements (live) · Cliquer sur la photo pour voir les détails
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
            <div className="text-[11px] uppercase tracking-wide text-white/55 font-semibold flex gap-2 max-w-[300px]">
              <span className="text-purple-400">{event.energy ?? '–'}</span>
              <span className="truncate">{event.title?.slice(0, 35)}</span>
              {event.color_card && (
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 self-center"
                  style={{ background: event.color_card }}
                  title={event.color_card}
                />
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
