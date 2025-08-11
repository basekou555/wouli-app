
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MapPin, ExternalLink } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { BusinessEvent } from '@/types/events';

interface BusinessConfig {
  client_name: string;
  client_type: string;
  location: string;
  brand_color: string;
  features: string[];
}

interface EventCreationFormProps {
  config: BusinessConfig;
  onEventCreate: (event: Omit<BusinessEvent, 'id' | 'views' | 'likes' | 'participants' | 'user_id'>) => void;
  editingEvent?: BusinessEvent;
  onEventUpdate?: (eventId: string, event: Partial<BusinessEvent>) => void;
  onCancelEdit?: () => void;
}

const EVENT_TYPES = [
  'À boire',
  'À manger',
  'Soirées',
  'Activités'
];

const VENUE_OPTIONS = [
  'Blue Note Bar',
  'Club Nyx',
  'FitMax Gym',
  'Autre (personnalisé)'
];

const EventCreationForm = ({ config, onEventCreate, editingEvent, onEventUpdate, onCancelEdit }: EventCreationFormProps) => {
  const [newEvent, setNewEvent] = useState({
    title: editingEvent?.title || '',
    date: editingEvent?.date || '',
    time: editingEvent?.time || '',
    venue: editingEvent?.venue || config.client_name,
    custom_venue: editingEvent?.custom_venue || '',
    description: editingEvent?.description || '',
    category: editingEvent?.category || 'a-boire',
    event_type: editingEvent?.event_type || 'a-boire',
    price: editingEvent?.price || '',
    external_url: editingEvent?.external_url || '',
    image_url: editingEvent?.image_url || '',
    // New fields
    venue_photo_url: (editingEvent as any)?.venue_photo_url || '',
    ambiance_photo_url: (editingEvent as any)?.ambiance_photo_url || '',
    capacity: (editingEvent as any)?.capacity ? String((editingEvent as any).capacity) : '',
    is_recurring: (editingEvent as any)?.is_recurring || false,
    avg_attendance: (editingEvent as any)?.avg_attendance ? String((editingEvent as any).avg_attendance) : '',
    total_editions: (editingEvent as any)?.total_editions ? String((editingEvent as any).total_editions) : ''
  });

  const [useCustomVenue, setUseCustomVenue] = useState(!!editingEvent?.custom_venue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      return;
    }

    const eventData = {
      ...newEvent,
      venue: useCustomVenue ? undefined : newEvent.venue,
      custom_venue: useCustomVenue ? newEvent.custom_venue : undefined,
      location: useCustomVenue ? newEvent.custom_venue : newEvent.venue,
      capacity: newEvent.capacity ? Number(newEvent.capacity) : undefined,
      avg_attendance: newEvent.avg_attendance ? Number(newEvent.avg_attendance) : undefined,
      total_editions: newEvent.total_editions ? Number(newEvent.total_editions) : undefined
    } as unknown as Omit<BusinessEvent, 'id' | 'views' | 'likes' | 'participants' | 'user_id'>;

    if (editingEvent && onEventUpdate && editingEvent.id) {
      onEventUpdate(editingEvent.id, eventData);
    } else {
      onEventCreate(eventData);
    }

    // Reset form only if creating new event
    if (!editingEvent) {
      setNewEvent({ 
        title: '', 
        date: '', 
        time: '', 
        venue: config.client_name, 
        custom_venue: '',
        description: '', 
        category: 'a-boire', 
        event_type: 'a-boire',
        price: '', 
        external_url: '',
        image_url: '',
        venue_photo_url: '',
        ambiance_photo_url: '',
        capacity: '',
        is_recurring: false,
        avg_attendance: '',
        total_editions: ''
      });
      setUseCustomVenue(false);
    }
  };

  if (!config.features.includes('events')) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PlusCircle className="h-5 w-5 mr-2" style={{ color: config.brand_color }} />
          {editingEvent ? 'Modifier l\'événement' : 'Créer un événement'}
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

          {/* Photos supplémentaires */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Photos supplémentaires
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <ImageUpload
                onImageSelect={(url) => setNewEvent({ ...newEvent, venue_photo_url: url })}
                currentImage={(newEvent as any).venue_photo_url}
              />
              <ImageUpload
                onImageSelect={(url) => setNewEvent({ ...newEvent, ambiance_photo_url: url })}
                currentImage={(newEvent as any).ambiance_photo_url}
              />
            </div>
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
              <MapPin className="h-4 w-4 inline mr-1" />
              Lieu de l'événement *
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="preset-venue"
                  name="venue-type"
                  checked={!useCustomVenue}
                  onChange={() => setUseCustomVenue(false)}
                />
                <label htmlFor="preset-venue">Lieu prédéfini</label>
              </div>
              {!useCustomVenue && (
                <select
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {VENUE_OPTIONS.filter(option => option !== 'Autre (personnalisé)').map((venue) => (
                    <option key={venue} value={venue}>
                      {venue}
                    </option>
                  ))}
                </select>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom-venue"
                  name="venue-type"
                  checked={useCustomVenue}
                  onChange={() => setUseCustomVenue(true)}
                />
                <label htmlFor="custom-venue">Lieu personnalisé</label>
              </div>
              {useCustomVenue && (
                <Input
                  value={newEvent.custom_venue}
                  onChange={(e) => setNewEvent({ ...newEvent, custom_venue: e.target.value })}
                  placeholder="Ex: Le Sucre, Villa Florentine..."
                  required
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'événement
            </label>
            <select
              value={newEvent.event_type}
              onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as 'a-boire' | 'a-manger' | 'soirees' | 'activites' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="a-boire">À boire</option>
              <option value="a-manger">À manger</option>
              <option value="soirees">Soirées</option>
              <option value="activites">Activités</option>
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

          {/* Capacité (optionnel) */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Capacité (optionnel)
            </Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Nombre de places"
              value={newEvent.capacity}
              onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
            />
          </div>

          {/* Événement récurrent */}
          <div>
            <div className="flex items-center gap-2">
              <Switch
                checked={!!newEvent.is_recurring}
                onCheckedChange={(checked) => setNewEvent({ ...newEvent, is_recurring: checked })}
              />
              <Label>Événement récurrent</Label>
            </div>
            {newEvent.is_recurring && (
              <div className="pl-0 md:pl-6 mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Participants moyens par édition"
                  value={newEvent.avg_attendance}
                  onChange={(e) => setNewEvent({ ...newEvent, avg_attendance: e.target.value })}
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Nombre d'éditions précédentes"
                  value={newEvent.total_editions}
                  onChange={(e) => setNewEvent({ ...newEvent, total_editions: e.target.value })}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ExternalLink className="h-4 w-4 inline mr-1" />
              Lien billeterie/réservation
            </label>
            <Input
              type="url"
              value={newEvent.external_url}
              onChange={(e) => setNewEvent({ ...newEvent, external_url: e.target.value })}
              placeholder="https://billetterie.example.com"
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

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1"
              style={{ backgroundColor: config.brand_color }}
            >
              {editingEvent ? 'Mettre à jour' : 'Créer l\'événement'}
            </Button>
            {editingEvent && onCancelEdit && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancelEdit}
              >
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EventCreationForm;
