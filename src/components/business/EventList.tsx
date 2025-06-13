
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Eye, Heart, ExternalLink, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

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

interface EventListProps {
  config: DemoConfig;
  events: BusinessEvent[];
  onDeleteEvent: (id: number) => void;
}

const EventList = ({ config, events, onDeleteEvent }: EventListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDeleteEvent = (id: number) => {
    onDeleteEvent(id);
    toast({
      title: "🗑️ Événement supprimé",
      description: "L'événement a été retiré de votre liste",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes événements ({events.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun événement créé pour le moment
            </p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {event.imageUrl && (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.venue}
                      </div>
                      {config.features.includes('stats') && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1 text-blue-500" />
                            <span className="font-medium">{event.views}</span>
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1 text-red-500" />
                            <span className="font-medium">{event.likes}</span>
                          </div>
                          {config.features.includes('redirections') && (
                            <div className="flex items-center">
                              <ExternalLink className="h-4 w-4 mr-1 text-green-500" />
                              <span className="font-medium">{Math.floor(event.views * 0.15)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {event.price && (
                        <p className="text-sm font-medium text-green-600">{event.price}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/business/event/${event.id}`)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventList;
