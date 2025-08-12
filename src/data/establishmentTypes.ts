import { Utensils, Beer, Music, Target, Building } from 'lucide-react';

export interface EstablishmentType {
  value: string;
  label: string;
  icon: any;
  description: string;
  color: string;
}

export const ESTABLISHMENT_TYPES: EstablishmentType[] = [
  {
    value: 'restaurant',
    label: 'Restaurant',
    icon: Utensils,
    description: 'Service de restauration',
    color: 'hsl(var(--primary))'
  },
  {
    value: 'bar',
    label: 'Bar / Pub',
    icon: Beer,
    description: 'Débit de boissons',
    color: 'hsl(var(--secondary))'
  },
  {
    value: 'club',
    label: 'Club / Promoteur',
    icon: Music,
    description: 'Soirées et événements',
    color: 'hsl(var(--accent))'
  },
  {
    value: 'activity',
    label: 'Activité / Loisir',
    icon: Target,
    description: 'Sports, ateliers, cours',
    color: 'hsl(var(--chart-1))'
  },
  {
    value: 'venue',
    label: 'Lieu polyvalent',
    icon: Building,
    description: 'Espace événementiel',
    color: 'hsl(var(--chart-2))'
  }
];

export const LYON_CITIES = [
  'Lyon 1er',
  'Lyon 2e', 
  'Lyon 3e',
  'Lyon 4e',
  'Lyon 5e',
  'Lyon 6e',
  'Lyon 7e',
  'Lyon 8e',
  'Lyon 9e',
  'Villeurbanne',
  'Caluire-et-Cuire',
  'Vénissieux',
  'Saint-Priest',
  'Vaulx-en-Velin',
  'Bron',
  'Rillieux-la-Pape',
  'Écully',
  'Tassin-la-Demi-Lune',
  'Oullins',
  'Sainte-Foy-lès-Lyon'
];