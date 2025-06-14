
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface BusinessEvent {
  title: string;
  description?: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  event_type: string;
  price?: string;
  image_url?: string;
}

interface BusinessConfig {
  client_name: string;
  client_type: string;
  location: string;
  brand_color: string;
  features: string[];
}

interface EventCreationFormProps {
  config: BusinessConfig;
  onEventCreate: (event: BusinessEvent) => void;
}

const EVENT_TYPES = [
  'À boire',
  'À manger',
  'Soirées',
  'Activités'
];

const EventCreationForm = ({ config, onEventCreate }: EventCreationFormProps) => {
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    venue: config.client_name,
    description: '',
    category: 'bar',
    event_type: 'Soirées',
    price: '',
    image_url: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      return;
    }

    onEventCreate({
      ...newEvent,
      venue: config.client_name
    });

    setNewEvent({ 
      title: '', 
      date: '', 
      time: '', 
      venue: config.client_name, 
      description: '', 
      category: 'bar', 
      event_type: 'Soirées',
      price: '', 
      image_url: '' 
    });
  };

  if (!config.features.includes('events')) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PlusCircle className="h-5 w-5 mr-2" style={{ color: config.brand_color }} />
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
              onImageSelect={(imageUrl) => setNewEvent({ ...newEvent, image_url: imageUrl })}
              currentImage={newEvent.image_url}
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
              required
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
                required
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
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'événement
            </label>
            <select
              value={newEvent.event_type}
              onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
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
            style={{ backgroundColor: config.brand_color }}
          >
            Créer l'événement
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EventCreationForm;
