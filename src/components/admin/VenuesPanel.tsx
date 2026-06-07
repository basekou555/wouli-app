import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Music, Disc3, Sun, Shuffle, Loader2, CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export interface UnknownVenue {
  location: string;
  n_events: number;
}

export type VenueProfile = 'scene' | 'club' | 'mixte' | 'journee';

interface VenuesPanelProps {
  venues: UnknownVenue[];
  loading: boolean;
  pendingLocation: string | null;
  onClassify: (location: string, profile: VenueProfile) => void;
}

// Les 4 profils du registre : pilotent l'énergie imposée à l'extraction (scene/club/journee)
// ou laissent le modèle trancher (mixte).
const PROFILES: { key: VenueProfile; label: string; icon: React.ReactNode; cls: string }[] = [
  { key: 'scene', label: 'Scène', icon: <Music className="w-3.5 h-3.5" />, cls: 'text-purple-700 hover:bg-purple-50 hover:border-purple-300' },
  { key: 'club', label: 'Club', icon: <Disc3 className="w-3.5 h-3.5" />, cls: 'text-pink-700 hover:bg-pink-50 hover:border-pink-300' },
  { key: 'journee', label: 'Journée', icon: <Sun className="w-3.5 h-3.5" />, cls: 'text-amber-700 hover:bg-amber-50 hover:border-amber-300' },
  { key: 'mixte', label: 'Mixte', icon: <Shuffle className="w-3.5 h-3.5" />, cls: 'text-muted-foreground hover:bg-muted hover:border-border' },
];

export const VenuesPanel: React.FC<VenuesPanelProps> = ({ venues, loading, pendingLocation, onClassify }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" text="Analyse des lieux..." />
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-12 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Tous les lieux sont classés 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-blue-900">
            {venues.length} lieu{venues.length > 1 ? 'x' : ''} hors registre
          </p>
          <p className="text-sm text-blue-700">
            Classe chaque lieu : son profil fiabilise l'énergie des futurs events (et retire le flag « lieu inconnu »).
            Pour une ville ou un lieu ambigu, choisis « Mixte ».
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg divide-y">
        {venues.map((v) => {
          const isPending = pendingLocation === v.location;
          return (
            <div key={v.location} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-sm truncate" title={v.location}>{v.location}</span>
                <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                  {v.n_events} event{v.n_events > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {isPending ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground px-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Classement...
                  </span>
                ) : (
                  PROFILES.map((p) => (
                    <Button
                      key={p.key}
                      size="sm"
                      variant="outline"
                      onClick={() => onClassify(v.location, p.key)}
                      className={`h-7 px-2 text-xs ${p.cls}`}
                      title={`Classer "${v.location}" comme ${p.label}`}
                    >
                      {p.icon}
                      <span className="ml-1 hidden md:inline">{p.label}</span>
                    </Button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VenuesPanel;
