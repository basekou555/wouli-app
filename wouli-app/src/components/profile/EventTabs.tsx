
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ChevronRight, Search, CalendarX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface EventTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isNewAccount?: boolean;
  upcomingEvents?: any[];
  pastEvents?: any[];
  organizedEvents?: any[];
  isMobile?: boolean;
  isLoading?: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const EventSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2].map((item) => (
      <Card key={item} className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 h-40 bg-gray-200"></div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-gray-300 mr-2"></div>
                  <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-gray-300 mr-2"></div>
                  <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-gray-300 mr-2"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const EmptyEventsList: React.FC<{ 
  type: 'upcoming' | 'past' | 'organized',
  actionLink?: string 
}> = ({ type, actionLink }) => {
  const content = {
    upcoming: {
      title: "Aucun événement à venir",
      description: "Explorez les événements pour découvrir de nouvelles activités",
      icon: <Search className="h-12 w-12 mx-auto" />,
      buttonText: "Explorer les événements",
      buttonLink: "/explore"
    },
    past: {
      title: "Aucun événement passé",
      description: "Vos événements passés apparaîtront ici",
      icon: <CalendarX className="h-12 w-12 mx-auto" />,
      buttonText: null,
      buttonLink: null
    },
    organized: {
      title: "Aucun événement organisé",
      description: "Créez un nouvel événement pour le voir apparaître ici",
      icon: <Calendar className="h-12 w-12 mx-auto" />,
      buttonText: "Créer un événement",
      buttonLink: "/events/create"
    }
  };

  const { title, description, icon, buttonText, buttonLink } = content[type];

  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-1">{description}</p>
      {buttonText && buttonLink && (
        <Button className="mt-4" asChild>
          <Link to={buttonLink}>{buttonText}</Link>
        </Button>
      )}
    </div>
  );
};

const UpcomingEventsList: React.FC<{ events?: any[], isLoading?: boolean }> = ({ events = [], isLoading = false }) => {
  if (isLoading) {
    return <EventSkeleton />;
  }
  
  if (events.length === 0) {
    return <EmptyEventsList type="upcoming" />;
  }

  return (
    <div className="space-y-4">
      {events.map(event => (
        <Link to={`/events/${event.id}`} key={event.id} className="block group">
          <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 h-40 overflow-hidden">
                <img 
                  src={event.image || 'https://picsum.photos/400/200?random=1'} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">{event.participants} participants</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

const PastEventsList: React.FC<{ events?: any[], isLoading?: boolean }> = ({ events = [], isLoading = false }) => {
  if (isLoading) {
    return <EventSkeleton />;
  }
  
  if (events.length === 0) {
    return <EmptyEventsList type="past" />;
  }

  return (
    <div className="space-y-4">
      {events.map(event => (
        <Link to={`/events/${event.id}`} key={event.id} className="block group">
          <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 h-40 overflow-hidden">
                <img 
                  src={event.image || 'https://picsum.photos/400/200?random=2'} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

const OrganizedEventsList: React.FC<{ events?: any[], isLoading?: boolean }> = ({ events = [], isLoading = false }) => {
  if (isLoading) {
    return <EventSkeleton />;
  }
  
  if (events.length === 0) {
    return <EmptyEventsList type="organized" />;
  }

  return (
    <div className="space-y-4">
      {events.map(event => (
        <Link to={`/events/${event.id}`} key={event.id} className="block group">
          <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 h-40 overflow-hidden">
                <img 
                  src={event.image || 'https://picsum.photos/400/200?random=3'} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

const EventTabs: React.FC<EventTabsProps> = ({ 
  activeTab, 
  setActiveTab, 
  isNewAccount = false, 
  upcomingEvents = [], 
  pastEvents = [], 
  organizedEvents = [],
  isMobile = false,
  isLoading = false
}) => {
  if (isNewAccount) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-xl font-semibold mb-4">Événements à venir</h2>
        <UpcomingEventsList events={upcomingEvents} isLoading={isLoading} />
      </div>
    );
  }
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
      <TabsList className="bg-gray-100">
        <TabsTrigger value="upcoming">À venir</TabsTrigger>
        <TabsTrigger value="past">Passés</TabsTrigger>
        <TabsTrigger value="organized">Organisés</TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming" className="mt-6">
        <UpcomingEventsList events={upcomingEvents} isLoading={isLoading} />
      </TabsContent>
      
      <TabsContent value="past" className="mt-6">
        <PastEventsList events={pastEvents} isLoading={isLoading} />
      </TabsContent>
      
      <TabsContent value="organized" className="mt-6">
        <OrganizedEventsList events={organizedEvents} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
};

export default EventTabs;
