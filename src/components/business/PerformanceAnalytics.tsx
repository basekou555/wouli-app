
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Trophy, Star } from 'lucide-react';

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

interface PerformanceAnalyticsProps {
  config: DemoConfig;
  events: BusinessEvent[];
}

const PerformanceAnalytics = ({ config, events }: PerformanceAnalyticsProps) => {
  const totalViews = events.reduce((sum, event) => sum + event.views, 0);
  const totalRedirections = Math.floor(totalViews * 0.15);

  if (!config.features.includes('analytics') && !config.features.includes('ranking')) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" style={{ color: config.brandColor }} />
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
          {config.features.includes('ranking') && (
            <>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 flex items-center">
                  <Trophy className="h-4 w-4 mr-1" />
                  Classement Local
                </h4>
                <p className="text-sm text-yellow-800 mt-1">
                  #3 sur 24 {config.clientType.toLowerCase()}s à {config.location}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  Événement Top
                </h4>
                <p className="text-sm text-purple-800 mt-1">
                  "{events[0]?.title || 'Aucun événement'}" - #1 cette semaine
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceAnalytics;
