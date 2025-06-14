
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BusinessEvent } from '@/types/events';

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
  if (!config.features.includes('stats')) {
    return null;
  }

  // Prepare data for charts
  const eventPerformanceData = events.slice(0, 5).map(event => ({
    name: event.title.substring(0, 10) + '...',
    vues: event.views,
    likes: event.likes,
    participants: event.participants
  }));

  // Mock data for trends (in a real app, this would come from time-series data)
  const trendData = [
    { month: 'Jan', events: 2, vues: 120, likes: 15 },
    { month: 'Fév', events: 3, vues: 180, likes: 25 },
    { month: 'Mar', events: 1, vues: 90, likes: 12 },
    { month: 'Avr', events: 4, vues: 240, likes: 35 },
    { month: 'Mai', events: events.length, vues: events.reduce((sum, e) => sum + e.views, 0), likes: events.reduce((sum, e) => sum + e.likes, 0) }
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8 mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Performance par événement</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vues" fill="#3B82F6" />
              <Bar dataKey="likes" fill="#EF4444" />
              <Bar dataKey="participants" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tendances mensuelles</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="events" stroke={config.brand_color} strokeWidth={2} />
              <Line type="monotone" dataKey="vues" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="likes" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceAnalytics;
