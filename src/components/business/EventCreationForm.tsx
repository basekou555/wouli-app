
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  PlusCircle, MapPin, ExternalLink, Music, Users, Sparkles, 
  Info, User, AlertTriangle, Building, Calendar, Clock,
  Euro, Hash, Repeat, FileText, Eye, Save
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { BusinessEvent } from '@/types/events';
import EventPreviewModal from './EventPreviewModal';
import { EventDraft } from '@/hooks/useEventDrafts';
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
  onSaveDraft?: (draft: Omit<EventDraft, 'id' | 'savedAt'>) => void;
  isEditing?: boolean;
  isDuplicating?: boolean;
}

const EventCreationForm = ({ 
  config, 
  onEventCreate, 
  editingEvent, 
  onEventUpdate, 
  onCancelEdit,
  onSaveDraft,
  isEditing = false,
  isDuplicating = false
}: EventCreationFormProps) => {
  const [newEvent, setNewEvent] = useState({
    title: editingEvent?.title || '',
    date: editingEvent?.date || '',
    end_date: editingEvent?.end_date || '',
    time: editingEvent?.time || '',
    venue: editingEvent?.venue || config.client_name,
    custom_venue: editingEvent?.custom_venue || '',
    description: editingEvent?.description || '',
    category: editingEvent?.category || 'soirees',
    event_type: editingEvent?.event_type || 'soirees',
    price: editingEvent?.price || '',
    external_url: editingEvent?.external_url || '',
    image_url: editingEvent?.image_url || '',
    venue_photo_url: editingEvent?.venue_photo_url || '',
    ambiance_photo_url: editingEvent?.ambiance_photo_url || '',
    capacity: editingEvent?.capacity ? String(editingEvent.capacity) : '',
    is_recurring: editingEvent?.is_recurring || false,
    avg_attendance: editingEvent?.avg_attendance ? String(editingEvent.avg_attendance) : '',
    total_editions: editingEvent?.total_editions ? String(editingEvent.total_editions) : '',
    // Enriched fields
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
  const [formatSearch, setFormatSearch] = useState('');
  const [customFormat, setCustomFormat] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isMultiDay, setIsMultiDay] = useState(!!editingEvent?.end_date);

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

  // Déduire la catégorie automatiquement selon venue_category
  const getCategoryFromVenue = (venueCategory: string): string => {
    const mapping: Record<string, string> = {
      'bar': 'a-boire',
      'club': 'soirees',
      'restaurant': 'a-manger',
      'salle-spectacle': 'activites',
      'activite': 'activites',
      'culture': 'activites',
      'espace-exterieur': 'soirees'
    };
    return mapping[venueCategory] || 'soirees';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.venue_category || !newEvent.activity_type) {
      return;
    }

    // Auto-set category based on venue_category
    const derivedCategory = getCategoryFromVenue(newEvent.venue_category);

    const eventData = {
      ...newEvent,
      category: derivedCategory,
      event_type: derivedCategory,
      venue: useCustomVenue ? undefined : newEvent.venue,
      custom_venue: useCustomVenue ? newEvent.custom_venue : undefined,
      location: useCustomVenue ? newEvent.custom_venue : newEvent.venue,
      end_date: isMultiDay && newEvent.end_date ? newEvent.end_date : undefined,
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
        title: '', date: '', end_date: '', time: '', venue: config.client_name, custom_venue: '',
        description: '', category: 'soirees', event_type: 'soirees', price: '', 
        external_url: '', image_url: '', venue_photo_url: '', ambiance_photo_url: '',
        capacity: '', is_recurring: false, avg_attendance: '', total_editions: '',
        venue_category: '', activity_type: '', music_style: '', ambiance: '',
        target_audience: [], event_format: '', social_intensity: ''
      });
      setUseCustomVenue(false);
      setCustomActivityType('');
      setShowCustomWarning(false);
      setIsMultiDay(false);
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

  const handleFormatSelect = (value: string) => {
    setNewEvent({ ...newEvent, event_format: value });
    setFormatSearch('');
  };

  const handleCustomFormat = () => {
    if (customFormat.trim()) {
      setNewEvent({ ...newEvent, event_format: customFormat.trim().toLowerCase().replace(/\s+/g, '-') });
      setFormatSearch('');
      setCustomFormat('');
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

  const filteredFormats = EVENT_FORMAT_OPTIONS.filter(format =>
    format.label.toLowerCase().includes(formatSearch.toLowerCase()) ||
    format.value.toLowerCase().includes(formatSearch.toLowerCase())
  );

  const suggestedActivities = newEvent.venue_category 
    ? VENUE_SUGGESTIONS[newEvent.venue_category]?.activity_types || []
    : [];

  if (!config.features.includes('events')) {
    return null;
  }

  return (
    <TooltipProvider>
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
            {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
          </CardTitle>
          <CardDescription>
            Remplissez les informations pour créer votre événement
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ═══════════════════════════════════════════════════════════════
                SECTION: Informations de base
            ═══════════════════════════════════════════════════════════════ */}
            <div className="space-y-4">
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
                  className="text-lg"
                  required
                />
              </div>

              {/* Date/Heure */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Date de début *
                  </Label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Heure *
                  </Label>
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Multi-day toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Événement sur plusieurs jours</span>
                </div>
                <Switch
                  checked={isMultiDay}
                  onCheckedChange={setIsMultiDay}
                />
              </div>

              {/* Date de fin (conditionnelle) */}
              {isMultiDay && (
                <div>
                  <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    Date de fin
                  </Label>
                  <Input
                    type="date"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                    min={newEvent.date}
                  />
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                ACCORDION SECTIONS
            ═══════════════════════════════════════════════════════════════ */}
            <Accordion type="multiple" defaultValue={['lieu-type', 'ambiance', 'public', 'details']} className="w-full space-y-3">
              
              {/* ─────────────────────────────────────────────────────────────
                  SECTION 1: LIEU & TYPE (Purple accent)
              ───────────────────────────────────────────────────────────── */}
              <AccordionItem value="lieu-type" className="border border-purple-500/20 rounded-xl px-4 bg-purple-500/5">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-purple-500/10">
                      <Building className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="font-semibold">Lieu & Type</span>
                    {(!newEvent.venue_category || !newEvent.activity_type) && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">requis</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
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
                      className="w-full px-3 py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
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
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-purple-500" />
                          Suggestions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedActivities.map(act => (
                            <button
                              key={act}
                              type="button"
                              onClick={() => handleActivityTypeSelect(act)}
                              className="px-3 py-1.5 text-xs rounded-full bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-all hover:scale-105"
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
                      <div className="border rounded-lg max-h-40 overflow-y-auto bg-background shadow-sm">
                        {filteredActivityTypes.map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleActivityTypeSelect(type.value)}
                            className="w-full px-3 py-2.5 text-left text-sm hover:bg-purple-500/10 transition-colors"
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
                        <span className="px-3 py-1.5 rounded-full bg-purple-500 text-white text-sm font-medium">
                          {ACTIVITY_TYPES.find(a => a.value === newEvent.activity_type)?.label || newEvent.activity_type}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, activity_type: '' })}
                          className="text-muted-foreground hover:text-foreground text-sm hover:bg-muted/50 rounded-full p-1"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {showCustomWarning && (
                      <div className="flex items-center gap-2 mt-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <p className="text-xs text-amber-600">Ce tag sera soumis à validation</p>
                      </div>
                    )}
                  </div>

                  {/* Venue Location */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      Lieu de l'événement
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <input
                          type="radio"
                          id="preset-venue"
                          checked={!useCustomVenue}
                          onChange={() => setUseCustomVenue(false)}
                          className="accent-purple-500"
                        />
                        <label htmlFor="preset-venue" className="text-sm cursor-pointer flex-1">Mon établissement ({config.client_name})</label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <input
                          type="radio"
                          id="custom-venue"
                          checked={useCustomVenue}
                          onChange={() => setUseCustomVenue(true)}
                          className="accent-purple-500"
                        />
                        <label htmlFor="custom-venue" className="text-sm cursor-pointer flex-1">Autre lieu</label>
                      </div>
                      {useCustomVenue && (
                        <Input
                          value={newEvent.custom_venue}
                          onChange={(e) => setNewEvent({ ...newEvent, custom_venue: e.target.value })}
                          placeholder="Ex: Le Sucre, Villa Florentine..."
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 2: AMBIANCE (Pink accent)
              ───────────────────────────────────────────────────────────── */}
              <AccordionItem value="ambiance" className="border border-pink-500/20 rounded-xl px-4 bg-pink-500/5">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-pink-500/10">
                      <Music className="h-4 w-4 text-pink-500" />
                    </div>
                    <span className="font-semibold">Ambiance</span>
                    <span className="text-xs text-muted-foreground">(optionnel)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
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
                      <div className="border rounded-lg max-h-32 overflow-y-auto bg-background shadow-sm mb-2">
                        {filteredMusicStyles.map(style => (
                          <button
                            key={style.value}
                            type="button"
                            onClick={() => {
                              setNewEvent({ ...newEvent, music_style: style.value });
                              setMusicSearch('');
                            }}
                            className="w-full px-3 py-2.5 text-left text-sm hover:bg-pink-500/10 transition-colors"
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {newEvent.music_style && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-pink-500 text-white text-sm font-medium">
                          {MUSIC_STYLES.find(s => s.value === newEvent.music_style)?.label || newEvent.music_style}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, music_style: '' })}
                          className="text-muted-foreground hover:text-foreground text-sm hover:bg-muted/50 rounded-full p-1"
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
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                            newEvent.ambiance === option.value
                              ? `${option.color} text-white shadow-md`
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

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 3: PUBLIC (Green accent)
              ───────────────────────────────────────────────────────────── */}
              <AccordionItem value="public" className="border border-green-500/20 rounded-xl px-4 bg-green-500/5">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-green-500/10">
                      <Users className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="font-semibold">Public cible</span>
                    <span className="text-xs text-muted-foreground">(optionnel)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
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
                          className={`px-3 py-1.5 rounded-full text-sm transition-all hover:scale-105 ${
                            newEvent.target_audience.includes(option.value)
                              ? 'bg-green-500 text-white shadow-md'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Event Format - Combobox avec recherche */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm font-medium">Format de l'événement</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Le format décrit la structure de votre événement (libre, compétition, atelier guidé...)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <Input
                      placeholder="Rechercher ou créer un format..."
                      value={formatSearch}
                      onChange={(e) => setFormatSearch(e.target.value)}
                      className="mb-2"
                    />

                    {formatSearch && (
                      <div className="border rounded-lg max-h-40 overflow-y-auto bg-background shadow-sm">
                        {filteredFormats.map(format => (
                          <button
                            key={format.value}
                            type="button"
                            onClick={() => handleFormatSelect(format.value)}
                            className="w-full px-3 py-2.5 text-left text-sm hover:bg-green-500/10 transition-colors"
                          >
                            {format.label}
                          </button>
                        ))}
                        {filteredFormats.length === 0 && (
                          <div className="p-3">
                            <p className="text-sm text-muted-foreground mb-2">Aucun résultat</p>
                            <Input
                              placeholder="Créer un nouveau format..."
                              value={customFormat}
                              onChange={(e) => setCustomFormat(e.target.value)}
                              className="mb-2"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCustomFormat}
                              disabled={!customFormat.trim()}
                            >
                              Créer "{customFormat}"
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {newEvent.event_format && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1.5 rounded-full bg-green-500 text-white text-sm font-medium">
                          {EVENT_FORMAT_OPTIONS.find(f => f.value === newEvent.event_format)?.label || newEvent.event_format}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, event_format: '' })}
                          className="text-muted-foreground hover:text-foreground text-sm hover:bg-muted/50 rounded-full p-1"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Social Intensity - Visual slider avec chiffres */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm font-medium">Intensité sociale</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Indique la taille de groupe idéale pour profiter de votre événement</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {SOCIAL_INTENSITY_OPTIONS.map((option, index) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, social_intensity: option.value })}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                            newEvent.social_intensity === option.value
                              ? 'border-green-500 bg-green-500/10 shadow-md'
                              : 'border-input hover:border-green-500/50'
                          }`}
                        >
                          <div className="flex">
                            {Array.from({ length: index + 1 }).map((_, i) => (
                              <User key={i} className={`h-4 w-4 ${
                                newEvent.social_intensity === option.value ? 'text-green-500' : 'text-muted-foreground'
                              }`} />
                            ))}
                          </div>
                          <span className={`text-xs font-medium ${
                            newEvent.social_intensity === option.value ? 'text-green-600' : 'text-foreground'
                          }`}>
                            {option.label}
                          </span>
                          <span className={`text-[10px] ${
                            newEvent.social_intensity === option.value ? 'text-green-500' : 'text-muted-foreground'
                          }`}>
                            {option.sublabel}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 4: DÉTAILS (Amber accent)
              ───────────────────────────────────────────────────────────── */}
              <AccordionItem value="details" className="border border-amber-500/20 rounded-xl px-4 bg-amber-500/5">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-amber-500/10">
                      <FileText className="h-4 w-4 text-amber-500" />
                    </div>
                    <span className="font-semibold">Détails & Pratique</span>
                    <span className="text-xs text-muted-foreground">(optionnel)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  {/* Prix et Capacité */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Euro className="h-4 w-4 text-amber-500" />
                        Prix
                      </Label>
                      <Input
                        value={newEvent.price}
                        onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                        placeholder="Ex: 15€, Gratuit..."
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Hash className="h-4 w-4 text-amber-500" />
                          Capacité
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Nombre maximum de participants</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="Nombre de places"
                        value={newEvent.capacity}
                        onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Récurrence */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-amber-500" />
                      <div>
                        <span className="text-sm font-medium">Événement récurrent</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help ml-2 inline" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Cochez si cet événement se répète régulièrement</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <Switch
                      checked={!!newEvent.is_recurring}
                      onCheckedChange={(checked) => setNewEvent({ ...newEvent, is_recurring: checked })}
                    />
                  </div>

                  {newEvent.is_recurring && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Participants moyens</Label>
                        <Input
                          type="number"
                          placeholder="Ex: 50"
                          value={newEvent.avg_attendance}
                          onChange={(e) => setNewEvent({ ...newEvent, avg_attendance: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Nombre d'éditions</Label>
                        <Input
                          type="number"
                          placeholder="Ex: 12"
                          value={newEvent.total_editions}
                          onChange={(e) => setNewEvent({ ...newEvent, total_editions: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Lien externe */}
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <ExternalLink className="h-4 w-4 text-amber-500" />
                      Lien billetterie/réservation
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
                    <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <FileText className="h-4 w-4 text-amber-500" />
                      Description
                    </Label>
                    <Textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Décrivez votre événement..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Info message */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Ces informations nous aident à recommander votre événement aux bonnes personnes et à améliorer votre classement.
              </p>
            </div>

            {/* Submit buttons */}
            <div className="flex flex-col gap-3 pt-2">
              {/* Preview and Save Draft row */}
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="flex-1 h-10 gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Prévisualiser
                </Button>
                {onSaveDraft && !isEditing && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => onSaveDraft({
                      title: newEvent.title,
                      date: newEvent.date,
                      end_date: newEvent.end_date,
                      time: newEvent.time,
                      venue: newEvent.venue,
                      custom_venue: newEvent.custom_venue,
                      description: newEvent.description,
                      category: newEvent.category,
                      event_type: newEvent.event_type,
                      price: newEvent.price,
                      external_url: newEvent.external_url,
                      image_url: newEvent.image_url,
                      venue_photo_url: newEvent.venue_photo_url,
                      ambiance_photo_url: newEvent.ambiance_photo_url,
                      capacity: newEvent.capacity,
                      is_recurring: newEvent.is_recurring,
                      avg_attendance: newEvent.avg_attendance,
                      total_editions: newEvent.total_editions,
                      venue_category: newEvent.venue_category,
                      activity_type: newEvent.activity_type,
                      music_style: newEvent.music_style,
                      ambiance: newEvent.ambiance,
                      target_audience: newEvent.target_audience,
                      event_format: newEvent.event_format,
                      social_intensity: newEvent.social_intensity
                    })}
                    className="flex-1 h-10 gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                  >
                    <Save className="h-4 w-4" />
                    Brouillon
                  </Button>
                )}
              </div>
              
              {/* Main action buttons */}
              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className="flex-1 h-12 text-base font-semibold"
                  style={{ backgroundColor: config.brand_color }}
                >
                  {isEditing ? 'Mettre à jour' : isDuplicating ? 'Publier la copie' : 'Créer l\'événement'}
                </Button>
                {(isEditing || isDuplicating) && onCancelEdit && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={onCancelEdit}
                    className="h-12"
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </div>

            {/* Preview Modal */}
            <EventPreviewModal
              open={showPreview}
              onClose={() => setShowPreview(false)}
              eventData={{
                title: newEvent.title,
                date: newEvent.date,
                time: newEvent.time,
                description: newEvent.description,
                image_url: newEvent.image_url,
                price: newEvent.price,
                venue: newEvent.venue,
                custom_venue: newEvent.custom_venue,
                venue_category: newEvent.venue_category,
                activity_type: newEvent.activity_type,
                capacity: newEvent.capacity
              }}
            />
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default EventCreationForm;
