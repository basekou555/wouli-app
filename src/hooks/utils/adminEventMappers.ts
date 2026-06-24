import { UnifiedEvent } from '@/types/unified';

export interface PendingEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  end_time?: string;
  location: string;
  address: string | null;
  category: string;
  price: number | null;
  external_url: string | null;
  submitter_email: string | null;
  status: string;
  created_at: string;
  validated_at?: string;
  image_url: string | null;
  // Champs issus de l'extraction IA (extract-event) — optionnels, présents via select('*').
  parsing_method?: string | null;
  parsing_confidence?: number | null;
  manual_review_reason?: string | null;
  needs_manual_image?: boolean | null;
  // Contenu structuré produit par extract-event (claude-vision-v1) — voir extract-event/index.ts:436-466.
  // Absents des types générés (types.ts stale) mais bien renvoyés par select('*').
  energy?: string | null;          // 'SCENE' | 'CLUB' | 'JOURNEE'
  subtitle?: string | null;
  music_style?: string | null;
  tags?: string[] | null;
  lineup?: string[] | null;
  venue_category?: string | null;
  color_card?: string | null;
}

// Métadonnées d'affichage de l'énergie déduite par l'IA (3 ambiances, extract-event/index.ts:44).
export const ENERGY_META: Record<string, { label: string; cls: string }> = {
  SCENE: { label: '🎤 Scène', cls: 'border-purple-300 text-purple-700 bg-purple-50' },
  CLUB: { label: '🔊 Club', cls: 'border-pink-300 text-pink-700 bg-pink-50' },
  JOURNEE: { label: '☀️ Journée', cls: 'border-amber-300 text-amber-700 bg-amber-50' },
};

// Vrai si l'event a été enrichi par le pipeline IA de vision.
export const isAIEnriched = (e: { parsing_method?: string | null }): boolean =>
  e.parsing_method === 'claude-vision-v1';

// Confiance IA en 0..100 (null si non enrichi / inconnue).
export const aiConfidencePct = (e: { parsing_confidence?: number | null }): number | null =>
  typeof e.parsing_confidence === 'number' ? Math.round(e.parsing_confidence * 100) : null;

export const mapPendingEventToUnified = (pendingEvent: PendingEvent): UnifiedEvent => {
  return {
    id: pendingEvent.id,
    title: pendingEvent.title,
    description: pendingEvent.description,
    date: pendingEvent.date,
    location: pendingEvent.location,
    category: pendingEvent.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    image_url: pendingEvent.image_url,
    views: 0, // Default for pending events
    likes: 0, // Default for pending events
    participants: 0, // Default for pending events
    created_at: pendingEvent.created_at,
    updated_at: pendingEvent.created_at,
    source: 'user',
    organizer: pendingEvent.submitter_email || 'Utilisateur',
    organizer_type: 'user',
    end_date: pendingEvent.end_time,
    price_text: pendingEvent.price ? `${pendingEvent.price}€` : undefined,
    address: pendingEvent.address,
    external_url: pendingEvent.external_url,
    
    // Wouli enhancements for admin preview
    isUrgent: new Date(pendingEvent.date) < new Date(Date.now() + 4 * 60 * 60 * 1000),
    friendsParticipating: [], // Empty for admin view
    totalParticipants: 0 // Default for pending events
  };
};