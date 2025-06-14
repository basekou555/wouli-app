
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Eye, Heart, ExternalLink, Trash2, Tag, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface EventListProps {
  config: BusinessConfig;
  events: BusinessEvent[];
  onDeleteEvent: (id: string) => void;
}

const EventList = ({ config, events, onDeleteEvent }: EventListProps) => {
  const navigate = useNavigate();

  const handleDeleteEvent = (id: string) => {
    onDeleteEvent(id);
  };

  const handleViewDetails = (event: BusinessEvent) => {
    // Navigate to event details with event data
    navigate(`/business/event/${event.id}`, { state: { event } });
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
              <Card key={event.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {event.image_url && (
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(event)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id!)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(event.date).toLocaleDateString('fr-FR')}
                          <Clock className="h-4 w-4 mr-1 ml-3" />
                          {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.venue}
                        </div>
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2" />
                          {event.event_type}
                        </div>
                        {event.price && (
                          <p className="text-sm font-medium text-green-600">{event.price}</p>
                        )}
                      </div>
                      
                      {config.features.includes('stats') && (
                        <div className="flex gap-4 mt-3">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1 text-blue-500" />
                            <span className="font-medium text-sm">{event.views}</span>
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1 text-red-500" />
                            <span className="font-medium text-sm">{event.likes}</span>
                          </div>
                          {config.features.includes('redirections') && (
                            <div className="flex items-center">
                              <ExternalLink className="h-4 w-4 mr-1 text-green-500" />
                              <span className="font-medium text-sm">{Math.floor(event.views * 0.15)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventList;
