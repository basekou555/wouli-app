
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import ImageUpload from '@/components/ImageUpload';

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

interface EventCreationFormProps {
  config: DemoConfig;
  onEventCreate: (event: Omit<BusinessEvent, 'id' | 'participants' | 'views' | 'likes'>) => void;
}

const EventCreationForm = ({ config, onEventCreate }: EventCreationFormProps) => {
  const { toast } = useToast();
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    venue: config.clientName,
    description: '',
    category: 'bar',
    price: '',
    imageUrl: ''
  });

  // Mettre à jour le venue quand le nom du client change
  useEffect(() => {
    setNewEvent(prev => ({ ...prev, venue: config.clientName }));
  }, [config.clientName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    onEventCreate({
      ...newEvent,
      venue: config.clientName
    });

    setNewEvent({ 
      title: '', 
      date: '', 
      time: '', 
      venue: config.clientName, 
      description: '', 
      category: 'bar', 
      price: '', 
      imageUrl: '' 
    });
    
    toast({
      title: "✅ Événement créé !",
      description: `"${newEvent.title}" a été publié avec succès`,
    });
  };

  if (!config.features.includes('events')) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PlusCircle className="h-5 w-5 mr-2" style={{ color: config.brandColor }} />
          Créer un événement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image de l'événement
            </label>
            <ImageUpload
              onImageSelect={(imageUrl) => setNewEvent({ ...newEvent, imageUrl })}
              currentImage={newEvent.imageUrl}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de l'événement *
            </label>
            <Input
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Ex: Soirée Jazz, Happy Hour..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure *
              </label>
              <Input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix
            </label>
            <Input
              value={newEvent.price}
              onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
              placeholder="Ex: 15€, Gratuit..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Décrivez votre événement..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            style={{ backgroundColor: config.brandColor }}
          >
            Créer l'événement
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EventCreationForm;
