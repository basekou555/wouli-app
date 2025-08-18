
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BusinessEvent } from '@/types/events';
import { formatDate } from '@/utils/dateFormatting';
import { getMonthAgo } from '@/utils/eventStatus';

type DateFilter = 'all' | 'month' | 'quarter';

export const EventArchives = () => {
  const { user } = useAuth();
  const [archives, setArchives] = useState<BusinessEvent[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadArchives();
    }
  }, [user, dateFilter]);

  const loadArchives = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let query = supabase
        .from('business_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'archived')
        .order('date', { ascending: false });

      // Appliquer filtres de date
      if (dateFilter === 'month') {
        query = query.gte('date', getMonthAgo());
      } else if (dateFilter === 'quarter') {
        const quarterAgo = new Date();
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        query = query.gte('date', quarterAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading archives:', error);
        return;
      }

      setArchives(data || []);
    } catch (error) {
      console.error('Error loading archives:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Archives 📚</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded" />
                <div className="bg-gray-200 h-3 w-1/2 mb-3 rounded" />
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="bg-gray-200 h-8 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <span>Archives</span>
            <span className="text-2xl">📚</span>
          </CardTitle>
          <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les événements</SelectItem>
              <SelectItem value="month">30 derniers jours</SelectItem>
              <SelectItem value="quarter">3 derniers mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {archives.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500 mb-2">Aucun événement archivé</p>
            <p className="text-sm text-gray-400">
              Vos événements terminés apparaîtront ici automatiquement
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {archives.map(event => (
              <ArchivedEventRow key={event.id} event={event} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ArchivedEventRow = ({ event }: { event: BusinessEvent }) => (
  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{event.title}</h3>
        <p className="text-sm text-gray-600">{formatDate(event.date)} • {event.time}</p>
        <p className="text-sm text-gray-500">{event.venue || event.custom_venue}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="bg-gray-100">
          Archivé
        </Badge>
        {event.price && (
          <Badge variant="secondary">{event.price}</Badge>
        )}
      </div>
    </div>
    
    <div className="grid grid-cols-4 gap-4 text-sm">
      <div className="text-center">
        <p className="text-gray-500 mb-1">Vues</p>
        <p className="font-semibold text-lg">{event.views}</p>
      </div>
      <div className="text-center">
        <p className="text-gray-500 mb-1">Participants</p>
        <p className="font-semibold text-lg">{event.participants}</p>
      </div>
      <div className="text-center">
        <p className="text-gray-500 mb-1">Présents</p>
        <p className="font-semibold text-lg text-green-600">
          {event.actual_participants || '-'}
        </p>
      </div>
      <div className="text-center">
        <p className="text-gray-500 mb-1">No-show</p>
        <p className="font-semibold text-lg text-red-600">
          {event.no_show_count || '-'}
        </p>
      </div>
    </div>

    {event.archived_at && (
      <div className="mt-3 pt-3 border-t text-xs text-gray-400">
        Archivé le {formatDate(event.archived_at)}
      </div>
    )}
  </div>
);
