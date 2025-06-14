
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Trophy, Star } from 'lucide-react';

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

interface PerformanceAnalyticsProps {
  config: BusinessConfig;
  events: BusinessEvent[];
}

const PerformanceAnalytics = ({ config, events }: PerformanceAnalyticsProps) => {
  const totalViews = events.reduce((sum, event) => sum + event.views, 0);
  const totalRedirections = Math.floor(totalViews * 0.15);
  
  // Generate ranking based on client type
  const getRanking = () => {
    const rankings = {
      'Bar/Restaurant': { position: 3, total: 24 },
      'Boîte de Nuit': { position: 2, total: 8 },
      'Salle de Sport': { position: 5, total: 12 },
      'Centre Commercial': { position: 1, total: 6 }
    };
    return rankings[config.client_type as keyof typeof rankings] || { position: 3, total: 10 };
  };

  const ranking = getRanking();
  const topEvent = events.sort((a, b) => b.views - a.views)[0];

  if (!config.features.includes('analytics') && !config.features.includes('ranking')) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" style={{ color: config.brand_color }} />
          Aperçu des performances
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900">Visibilité</h4>
            <p className="text-sm text-blue-800 mt-1">
              Vos événements ont été vus {totalViews} fois cette semaine
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900">Engagement</h4>
            <p className="text-sm text-green-800 mt-1">
              Taux de redirection: {totalViews > 0 ? Math.round((totalRedirections / totalViews) * 100) : 0}%
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 flex items-center">
              <Trophy className="h-4 w-4 mr-1" />
              Classement Local
            </h4>
            <p className="text-sm text-yellow-800 mt-1">
              #{ranking.position} sur {ranking.total} {config.client_type.toLowerCase()}s à {config.location}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 flex items-center">
              <Star className="h-4 w-4 mr-1" />
              Événement Top
            </h4>
            <p className="text-sm text-purple-800 mt-1">
              "{topEvent?.title || 'Aucun événement'}" - #{topEvent ? 1 : 0} cette semaine
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceAnalytics;
