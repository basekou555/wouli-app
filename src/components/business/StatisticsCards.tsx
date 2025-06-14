
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Eye, Heart, Users, Calendar, ExternalLink } from 'lucide-react';
import { BusinessEvent } from '@/types/events';

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
  const totalParticipants = events.reduce((sum, event) => sum + event.participants, 0);
  const totalRedirections = Math.floor(totalViews * 0.15); // Mock calculation

  const stats = [
    {
      title: "Événements créés",
      value: events.length,
      icon: Calendar,
      color: config.brand_color,
      visible: config.features.includes('events')
    },
    {
      title: "Vues totales",
      value: totalViews,
      icon: Eye,
      color: "#3B82F6",
      visible: config.features.includes('stats')
    },
    {
      title: "Likes totaux",
      value: totalLikes,
      icon: Heart,
      color: "#EF4444",
      visible: config.features.includes('stats')
    },
    {
      title: "Participants",
      value: totalParticipants,
      icon: Users,
      color: "#10B981",
      visible: config.features.includes('stats')
    },
    {
      title: "Redirections",
      value: totalRedirections,
      icon: ExternalLink,
      color: "#8B5CF6",
      visible: config.features.includes('redirections')
    }
  ];

  const visibleStats = stats.filter(stat => stat.visible);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {visibleStats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon 
              className="h-4 w-4" 
              style={{ color: stat.color }}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatisticsCards;
