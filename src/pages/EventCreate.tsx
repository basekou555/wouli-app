
import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Image, Info } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

// Type pour les étapes de création
type Step = 'infos' | 'location' | 'invitations';

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
  
  const handleNextStep = () => {
    if (step === 'infos') {
      if (!title || !description || !date) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      setStep('location');
    } else if (step === 'location') {
      if (!location || !address) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      setStep('invitations');
    }
  };
  
  const handlePrevStep = () => {
    if (step === 'location') setStep('infos');
    if (step === 'invitations') setStep('location');
  };
  
  const handleCreateEvent = () => {
    // Ici, nous simulons la création d'un événement
    toast.success("Événement créé avec succès !");
    // Redirection vers le tableau de bord après création
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Créer un événement</h1>
        
        {/* Indicateur d'étapes */}
        <div className="flex justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'infos' ? 'bg-wouli-blue text-white' : 'bg-blue-100 text-wouli-blue'
            }`}>
              <Info className="h-4 w-4" />
            </div>
            <span className={step === 'infos' ? 'font-medium' : 'text-gray-500'}>Infos</span>
          </div>
          <div className="flex-1 mx-4 pt-4">
            <div className={`h-1 ${step !== 'infos' ? 'bg-wouli-blue' : 'bg-gray-200'}`}></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'location' ? 'bg-wouli-blue text-white' : step === 'invitations' ? 'bg-blue-100 text-wouli-blue' : 'bg-gray-200 text-gray-400'
            }`}>
              <MapPin className="h-4 w-4" />
            </div>
            <span className={step === 'location' ? 'font-medium' : step === 'invitations' ? 'text-gray-500' : 'text-gray-400'}>Lieu</span>
          </div>
          <div className="flex-1 mx-4 pt-4">
            <div className={`h-1 ${step === 'invitations' ? 'bg-wouli-blue' : 'bg-gray-200'}`}></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'invitations' ? 'bg-wouli-blue text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              <Users className="h-4 w-4" />
            </div>
            <span className={step === 'invitations' ? 'font-medium' : 'text-gray-400'}>Invitations</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{
              step === 'infos' ? 'Informations de base' : 
              step === 'location' ? 'Lieu et paramètres' : 
              'Invitations'
            }</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'infos' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'événement *
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Afterwork, Dîner d'anniversaire..."
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="De quoi s'agit-il ? Donnez quelques détails..."
                    rows={4}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                      Heure *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
            )}
            
            {step === 'location' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Lieu *
                  </label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Restaurant Le Petit Paris"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Adresse complète"
                    required
                  />
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
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confidentialité
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant={privacy === 'private' ? 'default' : 'outline'}
                      className={privacy === 'private' ? 'text-white' : ''}
                      onClick={() => setPrivacy('private')}
                    >
                      Privé
                    </Button>
                    <Button
                      type="button"
                      variant={privacy === 'friends' ? 'default' : 'outline'}
                      className={privacy === 'friends' ? 'text-white' : ''}
                      onClick={() => setPrivacy('friends')}
                    >
                      Amis des participants
                    </Button>
                    <Button
                      type="button"
                      variant={privacy === 'public' ? 'default' : 'outline'}
                      className={privacy === 'public' ? 'text-white' : ''}
                      onClick={() => setPrivacy('public')}
                    >
                      Public
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {step === 'invitations' && (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                  Vous pourrez inviter des amis après la création de l'événement
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options d'invitation
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Input
                        type="checkbox"
                        id="allowPlusOne"
                        className="w-4 h-4 mr-2"
                      />
                      <label htmlFor="allowPlusOne" className="text-sm text-gray-600">
                        Autoriser les invités à amener quelqu'un (+1)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Input
                        type="checkbox"
                        id="requireApproval"
                        className="w-4 h-4 mr-2"
                      />
                      <label htmlFor="requireApproval" className="text-sm text-gray-600">
                        Approuver manuellement chaque participant
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image d'événement (optionnel)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <Image className="h-8 w-8 mx-auto text-gray-400" />
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Glissez-déposez une image ou cliquez pour sélectionner
                      </p>
                    </div>
                    <Input type="file" className="hidden" accept="image/*" />
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-between">
              {step !== 'infos' ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePrevStep}
                >
                  Précédent
                </Button>
              ) : (
                <div></div>
              )}
              
              {step !== 'invitations' ? (
                <Button 
                  type="button" 
                  onClick={handleNextStep}
                >
                  Suivant
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleCreateEvent}
                >
                  Créer l'événement
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default EventCreate;
