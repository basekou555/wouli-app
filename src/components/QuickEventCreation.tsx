
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Clock, MapPin, Users, ChevronRight, CheckCircle2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { eventTemplates, EventType, QuickEvent } from '@/types/eventTemplate';
import { suggestionService, PlaceSuggestion, TimeSuggestion, validateEvent } from '@/services/suggestionService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useData, User } from '@/hooks/useData';
import clsx from 'clsx';

const initialState: QuickEvent = {
  title: '',
  description: '',
  date: null,
  time: '',
  type: 'restaurant',
  location: '',
  address: '',
  maxParticipants: undefined,
  privacy: 'private',
  allowPlusOne: false,
  requireApproval: false,
  invitedUsers: [],
};

const QuickEventCreation: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [event, setEvent] = useState<QuickEvent>(initialState);
  const [loading, setLoading] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [timeSuggestions, setTimeSuggestions] = useState<TimeSuggestion[]>([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userData } = useData('users');

  // Get users for invitations
  const allUsers = userData.filter(item => 
    item.id !== user?.uid && 'email' in item
  ) as User[];

  // Handle selecting an event template
  const selectTemplate = (type: EventType) => {
    const template = eventTemplates.find(t => t.id === type);
    if (!template) return;
    
    setEvent({
      ...event,
      type,
      maxParticipants: template.defaultMaxParticipants,
    });
    
    // Load suggestions based on template
    loadSuggestions(type);
  };
  
  // Load venue and time suggestions based on event type
  const loadSuggestions = async (type: EventType) => {
    setLoading(true);
    try {
      // Get place suggestions
      const places = await suggestionService.getPlaceSuggestions(type);
      setPlaceSuggestions(places);
      
      // Get time suggestions
      const times = suggestionService.getTimeSuggestions(type);
      setTimeSuggestions(times);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Search for places when user types
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (locationQuery.length > 2) {
      const timeout = setTimeout(async () => {
        setLoading(true);
        try {
          const places = await suggestionService.getPlaceSuggestions(event.type, locationQuery);
          setPlaceSuggestions(places);
        } catch (error) {
          console.error('Error searching places:', error);
        } finally {
          setLoading(false);
        }
      }, 500); // Debounce search
      
      setSearchTimeout(timeout);
    }
    
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [locationQuery, event.type]);
  
  // Handle selecting a location
  const selectLocation = (place: PlaceSuggestion) => {
    setEvent({
      ...event,
      location: place.name,
      address: place.address,
    });
    setLocationQuery('');
  };
  
  // Handle selecting a time suggestion
  const selectTimeSuggestion = (suggestion: TimeSuggestion) => {
    setEvent({
      ...event,
      date: suggestion.date,
      time: suggestion.time,
    });
  };
  
  // Handle toggling a user invitation
  const toggleUserInvitation = (userId: string) => {
    setEvent(prev => {
      const invitedUsers = prev.invitedUsers.includes(userId)
        ? prev.invitedUsers.filter(id => id !== userId)
        : [...prev.invitedUsers, userId];
        
      return {
        ...prev,
        invitedUsers
      };
    });
  };
  
  // Validate current step and proceed to next
  const handleNextStep = () => {
    if (step === 1) {
      if (!event.type) {
        toast({
          description: "Veuillez sélectionner un type d'événement",
          variant: "destructive"
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const { isValid, missingFields } = validateEvent({
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        type: event.type
      });
      
      if (!isValid) {
        toast({
          description: `Veuillez remplir les champs suivants: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }
      setStep(3);
    }
  };
  
  // Create the event and navigate to dashboard
  const handleCreateEvent = () => {
    setLoading(true);
    
    // Simulate event creation
    setTimeout(() => {
      toast({
        description: "Événement créé avec succès!",
      });
      navigate('/dashboard');
    }, 1000);
  };
  
  // Render step 1: Event type selection
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center mb-6">Quel type d'événement ?</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {eventTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => selectTemplate(template.id)}
              className={clsx(
                "flex flex-col items-center justify-center p-4 border rounded-xl transition-all",
                event.type === template.id 
                  ? "border-blue-500 bg-blue-50 shadow-sm" 
                  : "border-gray-200 hover:bg-gray-50"
              )}
            >
              <div className={clsx("p-3 rounded-full mb-2", template.color)}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <span className="font-medium">{template.label}</span>
            </button>
          );
        })}
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={handleNextStep}
          className="w-full"
          disabled={!event.type}
        >
          Continuer
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  // Render step 2: Event details
  const renderStep2 = () => {
    const selectedTemplate = eventTemplates.find(t => t.id === event.type);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          {selectedTemplate && (
            <>
              <div className={clsx("p-2 rounded-full", selectedTemplate.color)}>
                <selectedTemplate.icon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">{selectedTemplate.label}</h2>
            </>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Titre de l'événement"
              value={event.title}
              onChange={(e) => setEvent({...event, title: e.target.value})}
              className="text-lg font-medium"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={clsx(
                      "w-full justify-start text-left font-normal",
                      !event.date && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                    {event.date ? format(event.date, 'PPP', { locale: fr }) : "Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={event.date || undefined}
                    onSelect={(date) => date && setEvent({...event, date})}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="time"
                value={event.time}
                onChange={(e) => setEvent({...event, time: e.target.value})}
                className="pl-10"
                placeholder="Heure"
              />
            </div>
          </div>
          
          {timeSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {timeSuggestions.slice(0, 3).map((suggestion, idx) => (
                <Badge 
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => selectTimeSuggestion(suggestion)}
                >
                  {suggestion.label}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Lieu"
              value={locationQuery || event.location}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                if (event.location) setEvent({...event, location: '', address: ''});
              }}
              className="pl-10"
            />
          </div>
          
          {locationQuery && placeSuggestions.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {placeSuggestions.map((place) => (
                    <li 
                      key={place.id} 
                      className="p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => selectLocation(place)}
                    >
                      <div className="font-medium">{place.name}</div>
                      <div className="text-sm text-gray-500">{place.address}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          <div>
            <Textarea
              placeholder="Description (optionnelle)"
              value={event.description}
              onChange={(e) => setEvent({...event, description: e.target.value})}
              rows={2}
            />
          </div>
        </div>
        
        <div className="pt-2 flex justify-between">
          <Button 
            variant="outline"
            onClick={() => setStep(1)}
          >
            Retour
          </Button>
          
          <Button onClick={handleNextStep}>
            Continuer
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };
  
  // Render step 3: Invitations and settings
  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center mb-2">Qui inviter ?</h2>
      
      <div className="space-y-4">
        {allUsers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allUsers.slice(0, 9).map((user) => (
              <button
                key={user.id}
                onClick={() => toggleUserInvitation(user.id)}
                className={clsx(
                  "flex flex-col items-center p-3 border rounded-lg transition-all",
                  event.invitedUsers.includes(user.id) 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:bg-gray-50"
                )}
              >
                <div className="relative mb-1">
                  <Avatar>
                    <img src={user.avatar || user.photoURL} alt={user.name || user.displayName} />
                  </Avatar>
                  {event.invitedUsers.includes(user.id) && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium truncate w-full text-center">
                  {user.name || user.displayName}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Aucun utilisateur disponible
          </div>
        )}
        
        {event.invitedUsers.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <span className="font-medium">
              {event.invitedUsers.length} invitation{event.invitedUsers.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        <div className="space-y-3">
          <h3 className="font-medium">Confidentialité</h3>
          <RadioGroup 
            value={event.privacy}
            onValueChange={(value: 'private' | 'friends' | 'public') => 
              setEvent({...event, privacy: value})
            }
            className="flex space-x-2"
          >
            <div className="flex flex-col items-center">
              <div className={clsx(
                "p-3 border rounded-lg cursor-pointer", 
                event.privacy === 'private' ? "border-blue-500 bg-blue-50" : "border-gray-200"
              )}>
                <RadioGroupItem value="private" id="privacy-private" className="sr-only" />
                <Label htmlFor="privacy-private">Privé</Label>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={clsx(
                "p-3 border rounded-lg cursor-pointer", 
                event.privacy === 'friends' ? "border-blue-500 bg-blue-50" : "border-gray-200"
              )}>
                <RadioGroupItem value="friends" id="privacy-friends" className="sr-only" />
                <Label htmlFor="privacy-friends">Amis</Label>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={clsx(
                "p-3 border rounded-lg cursor-pointer", 
                event.privacy === 'public' ? "border-blue-500 bg-blue-50" : "border-gray-200"
              )}>
                <RadioGroupItem value="public" id="privacy-public" className="sr-only" />
                <Label htmlFor="privacy-public">Public</Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button 
          variant="outline"
          onClick={() => setStep(2)}
        >
          Retour
        </Button>
        
        <Button 
          onClick={handleCreateEvent}
          disabled={loading}
          className="relative"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-white border-r-transparent rounded-full mr-2"></div>
              <span>Création...</span>
            </div>
          ) : (
            <span>Créer l'événement</span>
          )}
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-6">
        <div className="flex justify-center space-x-1">
          <div className={clsx(
            "w-3 h-3 rounded-full transition-colors duration-300",
            step >= 1 ? "bg-blue-500" : "bg-gray-300"
          )}></div>
          <div className={clsx(
            "w-3 h-3 rounded-full transition-colors duration-300",
            step >= 2 ? "bg-blue-500" : "bg-gray-300"
          )}></div>
          <div className={clsx(
            "w-3 h-3 rounded-full transition-colors duration-300",
            step === 3 ? "bg-blue-500" : "bg-gray-300"
          )}></div>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickEventCreation;
