import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MemoryCard } from '@/components/memories/MemoryCard';
import { Heart, Star, Clock } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';

interface UserMemory extends UnifiedEvent {
  userRating?: number;
  userComment?: string;
  ratedAt?: string;
  canModifyRating?: boolean;
}

export const UserMemories = () => {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user memories from service
    setMemories([]);
    setLoading(false);
  }, []);

  const ratedMemories = memories.filter(m => m.userRating && m.userRating > 0);
  const unratedMemories = memories.filter(m => !m.userRating || m.userRating === 0);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold flex items-center justify-center space-x-2">
            <Heart className="w-6 h-6 text-red-500" />
            <span>Mes Memories</span>
          </h1>
          <p className="text-muted-foreground">
            Retrouvez tous vos événements passés et vos avis
          </p>
        </div>

        <Tabs defaultValue="rated" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rated" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Événements notés ({ratedMemories.length})</span>
            </TabsTrigger>
            <TabsTrigger value="unrated" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>En attente ({unratedMemories.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rated" className="space-y-4">
            {ratedMemories.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun événement noté</h3>
                  <p className="text-muted-foreground">
                    Vos notes d'événements apparaîtront ici après vos participations.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {ratedMemories.map((memory) => (
                  <MemoryCard 
                    key={memory.id} 
                    memory={memory}
                    onRatingUpdate={(eventId, rating, comment) => {
                      // TODO: Update rating
                      console.log('Update rating:', eventId, rating, comment);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unrated" className="space-y-4">
            {unratedMemories.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun événement en attente</h3>
                  <p className="text-muted-foreground">
                    Les événements que vous devez encore noter apparaîtront ici.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {unratedMemories.map((memory) => (
                  <MemoryCard 
                    key={memory.id} 
                    memory={memory}
                    onRatingUpdate={(eventId, rating, comment) => {
                      // TODO: Submit rating
                      console.log('Submit rating:', eventId, rating, comment);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};