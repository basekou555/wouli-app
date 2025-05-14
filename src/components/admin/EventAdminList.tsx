
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase.config';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Edit, Trash2, MoreVertical, Eye, Calendar, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { EventData } from '@/services/eventService';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const EventAdminList = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as EventData[];
        
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les événements",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [toast]);

  // Filter events based on search input
  useEffect(() => {
    if (search) {
      const filtered = events.filter((event) => 
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [search, events]);

  // Delete an event
  const handleDelete = async (id: string) => {
    try {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        await deleteDoc(doc(db, 'events', id));
        setEvents(events.filter(event => event.id !== id));
        setFilteredEvents(filteredEvents.filter(event => event.id !== id));
        toast({
          title: "Événement supprimé",
          description: "L'événement a été supprimé avec succès",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive",
      });
    }
  };

  // Format date for display
  const formatEventDate = (date: any) => {
    if (!date) return 'Date inconnue';
    
    // Convert Firebase Timestamp to Date if needed
    const eventDate = date.toDate ? date.toDate() : new Date(date);
    
    return format(eventDate, 'PPP à HH:mm', { locale: fr });
  };

  // Get badge color based on privacy setting
  const getPrivacyBadge = (privacy: string) => {
    switch (privacy) {
      case 'private':
        return <Badge variant="outline">Privé</Badge>;
      case 'friends':
        return <Badge variant="secondary">Amis</Badge>;
      case 'public':
        return <Badge variant="default">Public</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Render status based on date
  const getEventStatus = (date: any) => {
    if (!date) return <Badge variant="outline">Inconnu</Badge>;
    
    const eventDate = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    
    if (eventDate < now) {
      return <Badge variant="secondary">Passé</Badge>;
    } else {
      return <Badge variant="default">À venir</Badge>;
    }
  };

  // View event details
  const viewEventDetails = (id: string) => {
    navigate(`/events/${id}`);
  };

  // Edit event (placeholder for future development)
  const editEvent = (id: string) => {
    toast({
      description: "Fonctionnalité d'édition en développement",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-20 bg-gray-200 animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input 
        placeholder="Rechercher un événement..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md mb-4"
      />
      
      {filteredEvents.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Aucun événement trouvé</p>
        </Card>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-sm">Événement</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-sm">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-sm hidden md:table-cell">Lieu</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-sm hidden lg:table-cell">Statut</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                          {event.image ? (
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-gray-500">
                            {getPrivacyBadge(event.privacy)}
                            {event.maxParticipants && (
                              <span className="ml-2 text-xs">
                                <User className="inline-block h-3 w-3 mr-1" />
                                {event.maxParticipants}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatEventDate(event.date)}
                    </td>
                    <td className="px-4 py-3 text-sm hidden md:table-cell">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        {event.location}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {getEventStatus(event.date)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewEventDetails(event.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => editEvent(event.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(event.id)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAdminList;
