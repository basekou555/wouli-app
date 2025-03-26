
import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Image, 
  Info,
  Globe,
  Lock,
  UserPlus,
  Search,
  Plus,
  Check,
  ChevronRight
} from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import CategorySelector from '../components/CategorySelector';

// Type pour les étapes de création (réduit à 2 étapes selon les nouvelles spécifications)
type Step = 'infos' | 'location';

const EventCreate = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('infos');
  
  // États pour les différentes informations de l'événement
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [allowPlusOne, setAllowPlusOne] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [friends, setFriends] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Exemple de liste d'amis
  const allFriends = [
    { id: '1', name: 'Marie Dupont', avatar: 'https://picsum.photos/200?random=1' },
    { id: '2', name: 'Paul Martin', avatar: 'https://picsum.photos/200?random=2' },
    { id: '3', name: 'Sophie Laurent', avatar: 'https://picsum.photos/200?random=3' },
    { id: '4', name: 'Thomas Petit', avatar: 'https://picsum.photos/200?random=4' },
    { id: '5', name: 'Julie Moreau', avatar: 'https://picsum.photos/200?random=5' },
    { id: '6', name: 'Lucas Bernard', avatar: 'https://picsum.photos/200?random=6' },
  ];
  
  // Lieux suggérés en fonction de la saisie
  const suggestedPlaces = [
    { id: '1', name: 'Café des Artistes', address: '12 Rue des Beaux-Arts, 75006 Paris' },
    { id: '2', name: 'Restaurant Le Petit Paris', address: '25 Rue de la Gastronomie, 75001 Paris' },
    { id: '3', name: 'Cinéma Pathé Bellecour', address: '79 Rue de la République, 69002 Lyon' },
    { id: '4', name: 'Musée d\'Art Moderne', address: '11 Avenue du Président Wilson, 75116 Paris' },
  ];
  
  const filteredFriends = allFriends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const toggleFriend = (friendId: string) => {
    setFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId) 
        : [...prev, friendId]
    );
  };
  
  const handleNextStep = () => {
    if (step === 'infos') {
      if (!title || !description || !date || !selectedCategory || !selectedSubCategory) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      setStep('location');
    }
  };
  
  const handlePrevStep = () => {
    if (step === 'location') setStep('infos');
  };
  
  const handleCreateEvent = () => {
    if (!location || !address) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Simulation d'une création d'événement avec animation
    setIsCreating(true);
    setTimeout(() => {
      toast.success("Événement créé avec succès !");
      // Redirection vers le tableau de bord après création
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }, 1500);
  };

  const selectPlace = (place: typeof suggestedPlaces[0]) => {
    setLocation(place.name);
    setAddress(place.address);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Créer un événement</h1>
        
        {/* Indicateur d'étapes (réduit à 2 points) */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              step === 'infos' ? 'bg-wouli-blue' : 'bg-gray-300'
            } transition-colors duration-300`}></div>
            <div className={`w-3 h-3 rounded-full ${
              step === 'location' ? 'bg-wouli-blue' : 'bg-gray-300'
            } transition-colors duration-300`}></div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className={`transition-transform duration-500 flex ${
            step === 'infos' ? 'translate-x-0' : '-translate-x-full'
          }`} style={{ width: '200%' }}>
            {/* Étape 1: Informations essentielles */}
            <div className="w-full px-4">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Informations essentielles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nommer votre événement"
                        className="text-xl font-medium placeholder:text-gray-400 focus:border-wouli-blue transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ajoutez des détails : description, dress code, etc."
                        rows={3}
                        className="focus:border-wouli-blue transition-colors"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                              {date ? format(date, 'PPP', { locale: fr }) : <span className="text-gray-400">Choisir une date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                              locale={fr}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                          Heure
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategorySelector 
                    onCategorySelect={setSelectedCategory} 
                    onSubCategorySelect={setSelectedSubCategory}
                    selectedCategory={selectedCategory}
                    selectedSubCategory={selectedSubCategory}
                  />
                </CardContent>
              </Card>
              
              <div className="mt-8 flex justify-end">
                <Button 
                  type="button" 
                  onClick={handleNextStep}
                  className="bg-wouli-blue hover:bg-blue-600 text-white px-6"
                >
                  Suivant
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Étape 2: Lieu et Invitations */}
            <div className="w-full px-4">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Lieu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Rechercher un lieu
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Nom de l'établissement, adresse..."
                          className="pl-10"
                          required
                        />
                      </div>
                      
                      {/* Suggestions de lieux */}
                      {location && location.length > 2 && (
                        <div className="mt-2 border rounded-md overflow-hidden shadow-sm">
                          {suggestedPlaces.map((place) => (
                            <div 
                              key={place.id}
                              onClick={() => selectPlace(place)}
                              className="p-3 border-b last:border-b-0 flex items-start hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <MapPin className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">{place.name}</p>
                                <p className="text-sm text-gray-500">{place.address}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {location && (
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse complète
                        </label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Adresse complète"
                          required
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Paramètres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Confidentialité
                      </label>
                      <RadioGroup 
                        defaultValue={privacy} 
                        onValueChange={setPrivacy}
                        className="flex space-x-2"
                      >
                        <div className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${privacy === 'private' ? 'border-wouli-blue bg-blue-50' : 'border-gray-200'}`}>
                          <Lock className={`h-6 w-6 mb-1 ${privacy === 'private' ? 'text-wouli-blue' : 'text-gray-400'}`} />
                          <span className={`text-sm ${privacy === 'private' ? 'text-wouli-blue font-medium' : 'text-gray-600'}`}>Privé</span>
                          <RadioGroupItem value="private" id="privacy-private" className="sr-only" />
                        </div>
                        <div className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${privacy === 'friends' ? 'border-wouli-blue bg-blue-50' : 'border-gray-200'}`}>
                          <Users className={`h-6 w-6 mb-1 ${privacy === 'friends' ? 'text-wouli-blue' : 'text-gray-400'}`} />
                          <span className={`text-sm ${privacy === 'friends' ? 'text-wouli-blue font-medium' : 'text-gray-600'}`}>Amis</span>
                          <RadioGroupItem value="friends" id="privacy-friends" className="sr-only" />
                        </div>
                        <div className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${privacy === 'public' ? 'border-wouli-blue bg-blue-50' : 'border-gray-200'}`}>
                          <Globe className={`h-6 w-6 mb-1 ${privacy === 'public' ? 'text-wouli-blue' : 'text-gray-400'}`} />
                          <span className={`text-sm ${privacy === 'public' ? 'text-wouli-blue font-medium' : 'text-gray-600'}`}>Public</span>
                          <RadioGroupItem value="public" id="privacy-public" className="sr-only" />
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre maximum de participants
                      </label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(e.target.value)}
                        placeholder="Laisser vide si illimité"
                        min={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="allowPlusOne" className="text-sm font-medium text-gray-700">
                          Autoriser les invités à amener quelqu'un (+1)
                        </label>
                        <button 
                          type="button"
                          onClick={() => setAllowPlusOne(!allowPlusOne)}
                          className={`w-10 h-6 rounded-full flex items-center transition-colors ${allowPlusOne ? 'bg-wouli-blue justify-end' : 'bg-gray-300 justify-start'}`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-white transform mx-1`}></span>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label htmlFor="requireApproval" className="text-sm font-medium text-gray-700">
                          Approuver manuellement chaque participant
                        </label>
                        <button 
                          type="button"
                          onClick={() => setRequireApproval(!requireApproval)}
                          className={`w-10 h-6 rounded-full flex items-center transition-colors ${requireApproval ? 'bg-wouli-blue justify-end' : 'bg-gray-300 justify-start'}`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-white transform mx-1`}></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Invitations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher des amis..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex overflow-x-auto py-2 space-x-2 -mx-2 px-2">
                      {filteredFriends.map((friend) => (
                        <div 
                          key={friend.id} 
                          onClick={() => toggleFriend(friend.id)}
                          className={`flex-shrink-0 flex flex-col items-center w-20 p-2 rounded-lg cursor-pointer transition-all ${
                            friends.includes(friend.id) ? 'bg-blue-50 border border-wouli-blue' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="relative mb-1">
                            <img 
                              src={friend.avatar} 
                              alt={friend.name} 
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            {friends.includes(friend.id) && (
                              <div className="absolute -bottom-1 -right-1 bg-wouli-blue text-white rounded-full w-5 h-5 flex items-center justify-center">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-center line-clamp-1">{friend.name.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                    
                    {friends.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg text-sm">
                        <span className="font-medium">{friends.length} ami{friends.length > 1 ? 's' : ''} invité{friends.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-8 flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePrevStep}
                >
                  Précédent
                </Button>
                
                <Button 
                  type="button" 
                  onClick={handleCreateEvent}
                  className="bg-wouli-blue hover:bg-blue-600 text-white min-w-32 relative"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-r-transparent rounded-full mr-2"></div>
                      <span>Création...</span>
                    </div>
                  ) : (
                    <span>Créer l'événement</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EventCreate;
