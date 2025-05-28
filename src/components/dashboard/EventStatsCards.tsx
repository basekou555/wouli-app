
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Filter, CalendarIcon, Clock3 } from 'lucide-react';

interface EventStats {
  total: number;
  upcoming: number;
  past: number;
}

interface EventStatsCardsProps {
  stats: EventStats;
}

const EventStatsCards: React.FC<EventStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Filter className="h-5 w-5 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-none shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600">À venir</p>
            <p className="text-2xl font-bold">{stats.upcoming}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-green-600" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-none shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600">Passés</p>
            <p className="text-2xl font-bold">{stats.past}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Clock3 className="h-5 w-5 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventStatsCards;
