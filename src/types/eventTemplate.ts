
import { Utensils, Film, Beer, Music, Dumbbell } from 'lucide-react';

export type EventType = 'restaurant' | 'cinema' | 'bar' | 'concert' | 'sport';

export interface EventTemplate {
  id: EventType;
  icon: React.ElementType;
  label: string;
  defaultDuration: number; // in minutes
  defaultMaxParticipants: number;
  requiredFields: string[];
  suggestedFields: string[];
  defaultLocation?: {
    type: 'fixed' | 'dynamic';
    value?: string;
  };
  color: string;
}

export interface QuickEvent {
  title: string;
  description: string;
  date: Date | null;
  time: string;
  type: EventType;
  location: string;
  address?: string;
  maxParticipants?: number;
  privacy: 'private' | 'friends' | 'public';
  allowPlusOne: boolean;
  requireApproval: boolean;
  invitedUsers: string[];
}

export const eventTemplates: EventTemplate[] = [
  {
    id: 'restaurant',
    icon: Utensils,
    label: 'Restaurant',
    defaultDuration: 120, // 2 hours
    defaultMaxParticipants: 8,
    requiredFields: ['title', 'date', 'time', 'location'],
    suggestedFields: ['description', 'maxParticipants'],
    defaultLocation: {
      type: 'dynamic',
    },
    color: 'bg-amber-500'
  },
  {
    id: 'cinema',
    icon: Film,
    label: 'Cinéma',
    defaultDuration: 150, // 2.5 hours
    defaultMaxParticipants: 6,
    requiredFields: ['title', 'date', 'time', 'location'],
    suggestedFields: ['description'],
    defaultLocation: {
      type: 'dynamic',
    },
    color: 'bg-red-500'
  },
  {
    id: 'bar',
    icon: Beer,
    label: 'Bar',
    defaultDuration: 180, // 3 hours
    defaultMaxParticipants: 10,
    requiredFields: ['title', 'date', 'time', 'location'],
    suggestedFields: ['description'],
    defaultLocation: {
      type: 'dynamic',
    },
    color: 'bg-amber-600'
  },
  {
    id: 'concert',
    icon: Music,
    label: 'Concert',
    defaultDuration: 180, // 3 hours
    defaultMaxParticipants: 6,
    requiredFields: ['title', 'date', 'time', 'location'],
    suggestedFields: ['description', 'maxParticipants'],
    color: 'bg-purple-500'
  },
  {
    id: 'sport',
    icon: Dumbbell,
    label: 'Sport',
    defaultDuration: 90, // 1.5 hours
    defaultMaxParticipants: 10,
    requiredFields: ['title', 'date', 'time', 'location'],
    suggestedFields: ['description', 'maxParticipants'],
    color: 'bg-green-500'
  },
];
