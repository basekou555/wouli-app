import React from 'react';
import EventCard from '@/components/EventCard';
import { UnifiedEvent } from '@/types/unified';

// ── Design Lab ──────────────────────────────────────────────────────────────
// Page d'itération visuelle (preview only) : la carte dans toutes les énergies
// et états, avec des données fictives, en cadre téléphone. Route publique /design.

let _id = 0;
const makeEvent = (o: Partial<UnifiedEvent>): UnifiedEvent =>
  ({
    id: `lab-${_id++}`,
    title: 'Événement',
    description:
      "Une description d'exemple, aérée, pour remplir le drawer de détails quand on clique sur la carte.",
    date: new Date().toISOString(),
    location: 'Lyon',
    category: 'soirees',
    views: 0,
    likes: 0,
    participants: 0,
    source: 'business',
    organizer: 'Lab',
    organizer_type: 'business',
    ...o,
  } as UnifiedEvent);

// Date relative : décalage en jours + heure (locale).
const at = (dayOffset: number, hour: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
// Dans N minutes (pour tester l'urgence "Maintenant" / "Dans 2h").
const inMinutes = (m: number): string => new Date(Date.now() + m * 60000).toISOString();

const cards: { label: string; event: UnifiedEvent }[] = [
  {
    label: 'CLUB · ce soir · gratuit · 2 amis',
    event: makeEvent({
      energy: 'CLUB',
      title: 'Nuits Sonores — Closing',
      venue: 'La Sucrière',
      event_type: 'soirees',
      date: at(0, 23),
      time: '23:00',
      price_text: 'Gratuit',
      music_style: 'techno',
      tags: ['techno', 'rooftop', 'gratuit'],
      color_card: '#241B2E',
      image_url: 'https://picsum.photos/seed/club1/600/900',
      totalParticipants: 128,
      friendsParticipating: [
        { id: 'f1', name: 'Léa' },
        { id: 'f2', name: 'Tom' },
      ],
    }),
  },
  {
    label: 'CLUB · imminent (Dans 2h) · unique · payant',
    event: makeEvent({
      energy: 'CLUB',
      title: 'Afterwork Rooftop',
      venue: 'Le Sucre',
      event_type: 'soirees',
      date: inMinutes(90),
      time: '19:00',
      price_text: '12€',
      is_unique: true,
      music_style: 'house',
      tags: ['house', 'afterwork'],
      color_card: '#2A1E22',
      image_url: 'https://picsum.photos/seed/club2/600/900',
      totalParticipants: 0,
    }),
  },
  {
    label: 'SCÈNE · demain · payant · participants',
    event: makeEvent({
      energy: 'SCENE',
      title: 'La Femme — en concert',
      venue: 'Le Transbordeur',
      event_type: 'activites',
      date: at(1, 20),
      time: '20:00',
      price_text: '24€',
      tags: ['live', 'rock', 'concert'],
      color_card: '#1E2A33',
      image_url: 'https://picsum.photos/seed/scene1/600/900',
      totalParticipants: 56,
    }),
  },
  {
    label: 'SCÈNE · récurrent (#5) · titre long',
    event: makeEvent({
      energy: 'SCENE',
      title: "Match d'impro de la Ligue Lyonnaise d'Improvisation",
      venue: 'Comédie Odéon',
      event_type: 'activites',
      date: at(2, 21),
      time: '21:00',
      price_text: '15€',
      is_recurring: true,
      edition_number: 5,
      color_card: '#22201A',
      image_url: 'https://picsum.photos/seed/scene2/600/900',
      totalParticipants: 34,
    }),
  },
  {
    label: 'JOURNÉE · samedi · gratuit (panneau crème)',
    event: makeEvent({
      energy: 'JOURNEE',
      title: 'Brunch & Marché de créateurs',
      venue: 'Halle de la Martinière',
      event_type: 'a-manger',
      date: at(5, 11),
      time: '11:00',
      price_text: 'Gratuit',
      tags: ['brunch', 'marché', 'famille'],
      image_url: 'https://picsum.photos/seed/jour1/600/900',
      totalParticipants: 12,
    }),
  },
  {
    label: 'JOURNÉE · atelier · participants seuls',
    event: makeEvent({
      energy: 'JOURNEE',
      title: 'Atelier céramique',
      venue: 'Atelier des Canuts',
      event_type: 'activites',
      date: at(3, 14),
      time: '14:00',
      price_text: '35€',
      tags: ['atelier', 'créatif'],
      image_url: 'https://picsum.photos/seed/jour2/600/900',
      totalParticipants: 8,
    }),
  },
];

const noop = () => {};

const DesignLab: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-2xl font-bold">Design Lab — Carte</h1>
      <p className="text-white/50 text-sm mt-1 mb-6">
        Aperçu de la carte par énergie et état (données fictives). Preview only — non lié aux vrais events.
      </p>

      <div className="flex flex-wrap gap-x-6 gap-y-8">
        {cards.map(({ label, event }, i) => (
          <div key={event.id} className="space-y-2">
            <div className="text-[11px] uppercase tracking-wide text-white/55 font-semibold">
              {label}
            </div>
            <div className="w-[300px] h-[620px] rounded-[28px] overflow-hidden ring-1 ring-white/10 shadow-2xl bg-black">
              <EventCard
                event={event}
                isFirstEvent={i === 0}
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
