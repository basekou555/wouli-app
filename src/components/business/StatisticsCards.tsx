
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Eye, Heart, ExternalLink } from 'lucide-react';

interface DemoConfig {
  clientName: string;
  clientType: string;
  location: string;
  brandColor: string;
  sampleEvents: number;
  features: string[];
}

interface BusinessEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  participants: number;
  venue: string;
  description?: string;
  category: string;
  price?: string;
  views: number;
  likes: number;
  imageUrl?: string;
}

interface StatisticsCardsProps {
  config: DemoConfig;
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
            <Calendar className="h-8 w-8" style={{ color: config.brandColor }} />
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
