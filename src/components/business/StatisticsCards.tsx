
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Eye, Heart, ExternalLink } from 'lucide-react';

interface BusinessEvent {
  id?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  event_type: string;
  price?: string;
  image_url?: string;
  views: number;
  likes: number;
  participants: number;
}

interface BusinessConfig {
  client_name: string;
  client_type: string;
  location: string;
  brand_color: string;
  features: string[];
}

interface StatisticsCardsProps {
  config: BusinessConfig;
  events: BusinessEvent[];
}

const StatisticsCards = ({ config, events }: StatisticsCardsProps) => {
  const totalViews = events.reduce((sum, event) => sum + event.views, 0);
  const totalLikes = events.reduce((sum, event) => sum + event.likes, 0);
  const totalRedirections = Math.floor(totalViews * 0.15);

  if (!config.features.includes('stats')) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Événements</p>
              <p className="text-2xl font-bold">{events.length}</p>
            </div>
            <Calendar className="h-8 w-8" style={{ color: config.brand_color }} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vues totales</p>
              <p className="text-2xl font-bold">{totalViews}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Likes</p>
              <p className="text-2xl font-bold">{totalLikes}</p>
            </div>
            <Heart className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
      
      {config.features.includes('redirections') && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Redirections</p>
                <p className="text-2xl font-bold">{totalRedirections}</p>
              </div>
              <ExternalLink className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatisticsCards;
