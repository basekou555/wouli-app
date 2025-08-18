
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { UnifiedEvent } from '@/types/unified';
import { formatDate } from '@/utils/dateFormatting';

interface UserMemory extends UnifiedEvent {
  participated_at: string;
}

export const UserMemories = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMemories();
    }
  }, [user]);

  const loadMemories = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Récupérer les événements archivés où l'user a participé
      const { data: eventParticipations, error } = await supabase
        .from('event_participants')
        .select(`
          created_at,
          events!inner(*)
        `)
        .eq('user_id', user.id)
        .eq('events.status', 'archived')
        .order('events.date', { ascending: false });

      if (error) {
        console.error('Error loading memories:', error);
        return;
      }

      const memoriesData = eventParticipations?.map(item => {
        const event = item.events;
        if (!event || typeof event !== 'object') return null;
        return {
          id: event.id || '',
          title: event.title || '',
          description: event.description || '',
          date: event.date || '',
          location: event.location || '',
          category: event.category || 'a-boire',
          image_url: event.image_url || null,
          views: event.views || 0,
          likes: event.likes || 0,
          participants: event.participants || 0,
          created_at: event.created_at || '',
          updated_at: event.updated_at || '',
          source: 'user' as const,
          organizer: 'Organisateur',
          organizer_type: 'user' as const,
          participated_at: item.created_at
        };
      }).filter(Boolean) || [];

      setMemories(memoriesData);
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Mes Memories 🎭</h2>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Mes Memories 🎭</h2>
      
      {memories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎭</div>
            <p className="text-gray-500 mb-2">Pas encore de souvenirs...</p>
            <p className="text-sm text-gray-400">
              Vos événements passés apparaîtront ici après votre participation
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {memories.map(memory => (
            <MemoryCard key={memory.id} event={memory} />
          ))}
        </div>
      )}
    </div>
  );
};

const MemoryCard = ({ event }: { event: UserMemory }) => (
  <div className="relative rounded-lg overflow-hidden group cursor-pointer hover:scale-105 transition-transform">
    <img 
      src={event.image_url || `https://picsum.photos/400/200?random=${event.id}`}
      alt={event.title}
      className="w-full h-32 object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    <div className="absolute bottom-0 p-3 text-white">
      <p className="font-semibold text-sm line-clamp-1">{event.title}</p>
      <p className="text-xs opacity-80">{formatDate(event.date)}</p>
    </div>
    
    {/* Badge "Souvenir" */}
    <div className="absolute top-2 left-2">
      <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
        <span className="text-xs text-white font-medium">🎉</span>
      </div>
    </div>
  </div>
);
