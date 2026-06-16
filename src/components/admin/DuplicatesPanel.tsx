import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Instagram, Archive, Eye, Sparkles, Copy, CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

// Event minimal renvoyé par la RPC find_duplicate_pairs.
export interface DuplicateEvent {
  id: string;
  title: string;
  date: string;
  location: string | null;
  image_url: string | null;
  account_username: string | null;
  status: string;
  parsing_method: string | null;
  created_at: string;
}

export interface DuplicatePair {
  a: DuplicateEvent;
  b: DuplicateEvent;
  sim: number;
}

interface DuplicatesPanelProps {
  pairs: DuplicatePair[];
  loading: boolean;
  onArchive: (event: DuplicateEvent) => void;
  onPreview: (eventId: string) => void;
}

// Suggère lequel garder : priorité à l'event enrichi par l'IA, sinon au titre le plus complet.
const keepRecommendation = (pair: DuplicatePair): 'a' | 'b' => {
  const aEnriched = pair.a.parsing_method === 'claude-vision-v1';
  const bEnriched = pair.b.parsing_method === 'claude-vision-v1';
  if (aEnriched !== bEnriched) return aEnriched ? 'a' : 'b';
  return (pair.a.title?.length ?? 0) >= (pair.b.title?.length ?? 0) ? 'a' : 'b';
};

const EventMiniCard = ({
  event,
  recommended,
  onArchive,
  onPreview,
}: {
  event: DuplicateEvent;
  recommended: boolean;
  onArchive: (event: DuplicateEvent) => void;
  onPreview: (eventId: string) => void;
}) => (
  <div
    className={`flex-1 min-w-0 border rounded-lg p-3 ${
      recommended ? 'border-green-300 bg-green-50/40' : 'border-border'
    }`}
  >
    <div className="flex gap-3">
      <div
        className="w-14 h-18 bg-muted rounded-md overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
        onClick={() => onPreview(event.id)}
      >
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Eye className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1 justify-between">
          <h4 className="font-semibold text-sm line-clamp-2">{event.title}</h4>
          {recommended && (
            <Badge variant="outline" className="text-[10px] border-green-400 text-green-700 bg-green-50 shrink-0">
              <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Garder
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1 mt-1.5">
          {event.parsing_method === 'claude-vision-v1' && (
            <Badge variant="outline" className="text-[10px] border-green-300 text-green-700 bg-green-50">
              <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Enrichi IA
            </Badge>
          )}
          {event.account_username && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
              <Instagram className="w-3 h-3" /> @{event.account_username}
            </span>
          )}
        </div>
      </div>
    </div>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onArchive(event)}
      className="w-full mt-2 h-7 text-xs text-muted-foreground hover:text-red-600 hover:border-red-300"
    >
      <Archive className="w-3.5 h-3.5 mr-1" /> Archiver ce doublon
    </Button>
  </div>
);

export const DuplicatesPanel: React.FC<DuplicatesPanelProps> = ({ pairs, loading, onArchive, onPreview }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" text="Recherche de doublons..." />
      </div>
    );
  }

  if (pairs.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-12 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Aucun doublon détecté 🎉</p>
      </div>
    );
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR');

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <Copy className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-blue-900">
            {pairs.length} doublon{pairs.length > 1 ? 's' : ''} potentiel{pairs.length > 1 ? 's' : ''}
          </p>
          <p className="text-sm text-blue-700">
            Même date et même lieu, titres similaires. Vérifie puis archive celui à jeter (réversible).
          </p>
        </div>
      </div>

      {pairs.map((pair) => {
        const keep = keepRecommendation(pair);
        return (
          <div key={`${pair.a.id}-${pair.b.id}`} className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(pair.a.date)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {pair.a.location}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {Math.round(pair.sim * 100)}% similaire
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <EventMiniCard event={pair.a} recommended={keep === 'a'} onArchive={onArchive} onPreview={onPreview} />
              <div className="hidden sm:flex items-center text-muted-foreground font-bold text-xs">VS</div>
              <EventMiniCard event={pair.b} recommended={keep === 'b'} onArchive={onArchive} onPreview={onPreview} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DuplicatesPanel;
