
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  PlusCircle, MapPin, ExternalLink, Music, Users, Sparkles, 
  Info, User, AlertTriangle, Building, Zap
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { BusinessEvent } from '@/types/events';
import {
  VENUE_CATEGORIES,
  ACTIVITY_TYPES,
  MUSIC_STYLES,
  AMBIANCE_OPTIONS,
  TARGET_AUDIENCE_OPTIONS,
  EVENT_FORMAT_OPTIONS,
  SOCIAL_INTENSITY_OPTIONS,
  VENUE_SUGGESTIONS
} from '@/data/tags';

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
    venue_photo_url: editingEvent?.venue_photo_url || '',
    ambiance_photo_url: editingEvent?.ambiance_photo_url || '',
    capacity: editingEvent?.capacity ? String(editingEvent.capacity) : '',
    is_recurring: editingEvent?.is_recurring || false,
    avg_attendance: editingEvent?.avg_attendance ? String(editingEvent.avg_attendance) : '',
    total_editions: editingEvent?.total_editions ? String(editingEvent.total_editions) : '',
    // New enriched fields
    venue_category: editingEvent?.venue_category || '',
    activity_type: editingEvent?.activity_type || '',
    music_style: editingEvent?.music_style || '',
    ambiance: editingEvent?.ambiance || '',
    target_audience: editingEvent?.target_audience || [],
    event_format: editingEvent?.event_format || '',
    social_intensity: editingEvent?.social_intensity || ''
  });

  const [useCustomVenue, setUseCustomVenue] = useState(!!editingEvent?.custom_venue);
  const [customActivityType, setCustomActivityType] = useState('');
  const [showCustomWarning, setShowCustomWarning] = useState(false);
  const [activitySearch, setActivitySearch] = useState('');
  const [musicSearch, setMusicSearch] = useState('');

  // Auto-suggestions when venue_category changes
  useEffect(() => {
    if (newEvent.venue_category && !editingEvent) {
      const suggestions = VENUE_SUGGESTIONS[newEvent.venue_category];
      if (suggestions) {
        setNewEvent(prev => ({
          ...prev,
          ambiance: prev.ambiance || suggestions.ambiance,
          social_intensity: prev.social_intensity || suggestions.social_intensity
        }));
      }
    }
  }, [newEvent.venue_category, editingEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.venue_category || !newEvent.activity_type) {
      return;
    }

    const eventData = {
      ...newEvent,
      venue: useCustomVenue ? undefined : newEvent.venue,
      custom_venue: useCustomVenue ? newEvent.custom_venue : undefined,
      location: useCustomVenue ? newEvent.custom_venue : newEvent.venue,
      capacity: newEvent.capacity ? Number(newEvent.capacity) : undefined,
      avg_attendance: newEvent.avg_attendance ? Number(newEvent.avg_attendance) : undefined,
      total_editions: newEvent.total_editions ? Number(newEvent.total_editions) : undefined,
      target_audience: newEvent.target_audience.length > 0 ? newEvent.target_audience : undefined
    } as unknown as Omit<BusinessEvent, 'id' | 'views' | 'likes' | 'participants' | 'user_id'>;

    if (editingEvent && onEventUpdate && editingEvent.id) {
      onEventUpdate(editingEvent.id, eventData);
    } else {
      onEventCreate(eventData);
    }

    if (!editingEvent) {
      setNewEvent({ 
        title: '', date: '', time: '', venue: config.client_name, custom_venue: '',
        description: '', category: 'a-boire', event_type: 'a-boire', price: '', 
        external_url: '', image_url: '', venue_photo_url: '', ambiance_photo_url: '',
        capacity: '', is_recurring: false, avg_attendance: '', total_editions: '',
        venue_category: '', activity_type: '', music_style: '', ambiance: '',
        target_audience: [], event_format: '', social_intensity: ''
      });
      setUseCustomVenue(false);
      setCustomActivityType('');
      setShowCustomWarning(false);
    }
  };

  const handleActivityTypeSelect = (value: string) => {
    setNewEvent({ ...newEvent, activity_type: value });
    setActivitySearch('');
  };

  const handleCustomActivityType = () => {
    if (customActivityType.trim()) {
      setNewEvent({ ...newEvent, activity_type: customActivityType.trim().toLowerCase().replace(/\s+/g, '-') });
      setShowCustomWarning(true);
    }
  };

  const toggleTargetAudience = (value: string) => {
    setNewEvent(prev => ({
      ...prev,
      target_audience: prev.target_audience.includes(value)
        ? prev.target_audience.filter(v => v !== value)
        : [...prev.target_audience, value]
    }));
  };

  const filteredActivityTypes = ACTIVITY_TYPES.filter(type => 
    type.label.toLowerCase().includes(activitySearch.toLowerCase()) ||
    type.value.toLowerCase().includes(activitySearch.toLowerCase())
  );

  const filteredMusicStyles = MUSIC_STYLES.filter(style =>
    style.label.toLowerCase().includes(musicSearch.toLowerCase()) ||
    style.value.toLowerCase().includes(musicSearch.toLowerCase())
  );

  const suggestedActivities = newEvent.venue_category 
    ? VENUE_SUGGESTIONS[newEvent.venue_category]?.activity_types || []
    : [];

  if (!config.features.includes('events')) {
    return null;
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" style={{ color: config.brand_color }} />
            {editingEvent ? 'Modifier l\'événement' : 'Créer un événement'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image principale */}
            <div>
              <Label className="block text-sm font-medium mb-2">Image de l'événement</Label>
              <ImageUpload
                onImageSelect={(imageUrl) => setNewEvent({ ...newEvent, image_url: imageUrl })}
                currentImage={newEvent.image_url}
              />
            </div>

            {/* Titre */}
            <div>
              <Label className="block text-sm font-medium mb-2">Titre de l'événement *</Label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Ex: Soirée Jazz, Happy Hour..."
                required
              />
            </div>

            {/* Date/Heure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Date *</Label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">Heure *</Label>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Accordion Sections */}
            <Accordion type="multiple" defaultValue={['lieu-type', 'ambiance', 'public']} className="w-full">
              
              {/* SECTION 1: LIEU & TYPE */}
              <AccordionItem value="lieu-type" className="border rounded-lg px-4 mb-2">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <span className="font-medium">Lieu & Type</span>
                    {(!newEvent.venue_category || !newEvent.activity_type) && (
                      <span className="text-xs text-destructive">*requis</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {/* Venue Category */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm font-medium">Catégorie de lieu *</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Le type de lieu aide à recommander votre événement aux bonnes personnes</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <select
                      value={newEvent.venue_category}
                      onChange={(e) => setNewEvent({ ...newEvent, venue_category: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {VENUE_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Activity Type with search */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm font-medium">Type d'activité *</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Décrit l'activité principale de votre événement</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    {/* Suggested activities */}
                    {suggestedActivities.length > 0 && !newEvent.activity_type && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Suggestions
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestedActivities.map(act => (
                            <button
                              key={act}
                              type="button"
                              onClick={() => handleActivityTypeSelect(act)}
                              className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              {ACTIVITY_TYPES.find(a => a.value === act)?.label || act}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Input
                      placeholder="Rechercher ou créer..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="mb-2"
                    />

                    {activitySearch && (
                      <div className="border rounded-md max-h-40 overflow-y-auto bg-background">
                        {filteredActivityTypes.map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleActivityTypeSelect(type.value)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                          >
                            {type.label}
                          </button>
                        ))}
                        {filteredActivityTypes.length === 0 && (
                          <div className="p-3">
                            <p className="text-sm text-muted-foreground mb-2">Aucun résultat</p>
                            <Input
                              placeholder="Créer un nouveau tag..."
                              value={customActivityType}
                              onChange={(e) => setCustomActivityType(e.target.value)}
                              className="mb-2"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCustomActivityType}
                              disabled={!customActivityType.trim()}
                            >
                              Créer "{customActivityType}"
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {newEvent.activity_type && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm">
                          {ACTIVITY_TYPES.find(a => a.value === newEvent.activity_type)?.label || newEvent.activity_type}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, activity_type: '' })}
                          className="text-muted-foreground hover:text-foreground text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {showCustomWarning && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-md">
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <p className="text-xs text-amber-600">Ce tag sera soumis à validation</p>
                      </div>
                    )}
                  </div>

                  {/* Venue Location */}
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Lieu de l'événement
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="preset-venue"
                          checked={!useCustomVenue}
                          onChange={() => setUseCustomVenue(false)}
                          className="accent-primary"
                        />
                        <label htmlFor="preset-venue" className="text-sm">Mon établissement ({config.client_name})</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="custom-venue"
                          checked={useCustomVenue}
                          onChange={() => setUseCustomVenue(true)}
                          className="accent-primary"
                        />
                        <label htmlFor="custom-venue" className="text-sm">Autre lieu</label>
                      </div>
                      {useCustomVenue && (
                        <Input
                          value={newEvent.custom_venue}
                          onChange={(e) => setNewEvent({ ...newEvent, custom_venue: e.target.value })}
                          placeholder="Ex: Le Sucre, Villa Florentine..."
                        />
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* SECTION 2: AMBIANCE */}
              <AccordionItem value="ambiance" className="border rounded-lg px-4 mb-2">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-pink-500" />
                    <span className="font-medium">Ambiance</span>
                    <span className="text-xs text-muted-foreground">(optionnel)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {/* Music Style */}
                  <div>
                    <Label className="block text-sm font-medium mb-2">Style musical</Label>
                    <Input
                      placeholder="Rechercher un style..."
                      value={musicSearch}
                      onChange={(e) => setMusicSearch(e.target.value)}
                      className="mb-2"
                    />
                    {musicSearch && (
                      <div className="border rounded-md max-h-32 overflow-y-auto bg-background mb-2">
                        {filteredMusicStyles.map(style => (
                          <button
                            key={style.value}
                            type="button"
                            onClick={() => {
                              setNewEvent({ ...newEvent, music_style: style.value });
                              setMusicSearch('');
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {newEvent.music_style && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-pink-500/20 text-pink-600 text-sm">
                          {MUSIC_STYLES.find(s => s.value === newEvent.music_style)?.label || newEvent.music_style}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, music_style: '' })}
                          className="text-muted-foreground hover:text-foreground text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Ambiance Pills */}
                  <div>
                    <Label className="block text-sm font-medium mb-2">Ambiance générale</Label>
                    <div className="flex flex-wrap gap-2">
                      {AMBIANCE_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, ambiance: option.value })}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            newEvent.ambiance === option.value
                              ? `${option.color} text-white scale-105`
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* SECTION 3: PUBLIC */}
              <AccordionItem value="public" className="border rounded-lg px-4 mb-2">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Public cible</span>
                    <span className="text-xs text-muted-foreground">(optionnel)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {/* Target Audience - Multi-select pills */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm font-medium">Audience cible</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Sélectionnez plusieurs profils pour toucher la bonne audience</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TARGET_AUDIENCE_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleTargetAudience(option.value)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            newEvent.target_audience.includes(option.value)
                              ? 'bg-green-500 text-white'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Event Format */}
                  <div>
                    <Label className="block text-sm font-medium mb-2">Format de l'événement</Label>
                    <select
                      value={newEvent.event_format}
                      onChange={(e) => setNewEvent({ ...newEvent, event_format: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Sélectionner un format</option>
                      {EVENT_FORMAT_OPTIONS.map((format) => (
                        <option key={format.value} value={format.value}>{format.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Social Intensity - Visual slider */}
                  <div>
                    <Label className="block text-sm font-medium mb-2">Intensité sociale</Label>
                    <div className="flex gap-2">
                      {SOCIAL_INTENSITY_OPTIONS.map((option, index) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, social_intensity: option.value })}
                          className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                            newEvent.social_intensity === option.value
                              ? 'border-primary bg-primary/10'
                              : 'border-input hover:border-primary/50'
                          }`}
                        >
                          <div className="flex">
                            {Array.from({ length: index + 1 }).map((_, i) => (
                              <User key={i} className={`h-4 w-4 ${
                                newEvent.social_intensity === option.value ? 'text-primary' : 'text-muted-foreground'
                              }`} />
                            ))}
                          </div>
                          <span className={`text-xs ${
                            newEvent.social_intensity === option.value ? 'text-primary font-medium' : 'text-muted-foreground'
                          }`}>
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Prix et Type d'événement */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Type</Label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as any, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="a-boire">À boire</option>
                  <option value="a-manger">À manger</option>
                  <option value="soirees">Soirées</option>
                  <option value="activites">Activités</option>
                </select>
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">Prix</Label>
                <Input
                  value={newEvent.price}
                  onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                  placeholder="Ex: 15€, Gratuit..."
                />
              </div>
            </div>

            {/* Capacité et récurrence */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Capacité</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Nombre de places"
                  value={newEvent.capacity}
                  onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={!!newEvent.is_recurring}
                  onCheckedChange={(checked) => setNewEvent({ ...newEvent, is_recurring: checked })}
                />
                <Label className="text-sm">Récurrent</Label>
              </div>
            </div>

            {newEvent.is_recurring && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Participants moyens"
                  value={newEvent.avg_attendance}
                  onChange={(e) => setNewEvent({ ...newEvent, avg_attendance: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Nombre d'éditions"
                  value={newEvent.total_editions}
                  onChange={(e) => setNewEvent({ ...newEvent, total_editions: e.target.value })}
                />
              </div>
            )}

            {/* Lien externe */}
            <div>
              <Label className="block text-sm font-medium mb-2">
                <ExternalLink className="h-4 w-4 inline mr-1" />
                Lien billeterie/réservation
              </Label>
              <Input
                type="url"
                value={newEvent.external_url}
                onChange={(e) => setNewEvent({ ...newEvent, external_url: e.target.value })}
                placeholder="https://billetterie.example.com"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="block text-sm font-medium mb-2">Description</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Décrivez votre événement..."
                rows={3}
              />
            </div>

            {/* Info message */}
            <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/10 rounded-lg">
              <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Ces informations nous aident à recommander votre événement aux bonnes personnes et à améliorer votre classement.
              </p>
            </div>

            {/* Submit buttons */}
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
    </TooltipProvider>
  );
};

export default EventCreationForm;
