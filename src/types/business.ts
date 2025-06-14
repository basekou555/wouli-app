
export interface BusinessConfig {
  id?: string;
  client_name: string;
  client_type: string;
  location: string;
  brand_color: string;
  features: string[];
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessStats {
  totalEvents: number;
  totalViews: number;
  totalLikes: number;
  totalParticipants: number;
  avgEngagement: number;
}
