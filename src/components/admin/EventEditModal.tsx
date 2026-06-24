
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Euro, Save, X, Sparkles, Loader2, Check, Zap, Image as ImageIcon, FileText, ListChecks } from 'lucide-react';
import { WOULI_CATEGORIES } from '@/data/wouliCategories';
import { ENERGY_META } from '@/hooks/utils/adminEventMappers';
import { supabase } from '@/integrations/supabase/client';
import { enhanceEventContent } from '@/services/aiEnhancementService';
import AdminInlineImageCropper from './AdminInlineImageCropper';
import { updateEventImageUrl } from '@/services/imageUploadService';
import EventCard from '@/components/EventCard';
import { UnifiedEvent } from '@/types/unified';
import { toast } from 'sonner';

interface PendingEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  address: string | null;
  category: string;
  price: number | null;
  external_url: string | null;
  image_url: string | null;
  status: string;
  energy?: string | null;
  tags?: string[] | null;
  end_date?: string | null;
  end_time?: string | null;
  time?: string | null;
}

interface EventEditModalProps {
  event: PendingEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  date: string;
  time: string;
  end_date: string;
  end_time: string;
  location: string;
  address: string;
  category: string;
  energy: string;
  price: string;
  image_url: string;
  external_url: string;
  tags: string;
  reason: string;
}

const EMPTY_FORM: FormData = {
  title: '', description: '', date: '', time: '', end_date: '', end_time: '',
  location: '', address: '', category: '', energy: 'none', price: '',
  image_url: '', external_url: '', tags: '', reason: '',
};

// Valeur sentinelle pour « pas d'énergie » (Radix Select interdit la valeur "").
const ENERGY_NONE = 'none';

const buildFormData = (event: PendingEvent): FormData => {
  const eventDate = new Date(event.date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  return {
    title: event.title || '',
    description: event.description || '',
    date: eventDate.toISOString().split('T')[0],
    time: event.time || eventDate.toTimeString().slice(0, 5),
    end_date: endDate ? endDate.toISOString().split('T')[0] : '',
    end_time: event.end_time || '',
    location: event.location || '',
    address: event.address || '',
    category: event.category || '',
    energy: event.energy || ENERGY_NONE,
    price: event.price?.toString() || '',
    image_url: event.image_url || '',
    external_url: event.external_url || '',
    tags: event.tags?.join(', ') || '',
    reason: '',
  };
};

// Petit en-tête de section pour structurer le formulaire.
const SectionHeader = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-2 mb-1 col-span-2">
    {icon}
    {children}
  </div>
);

// Construit un UnifiedEvent à partir du formulaire pour alimenter la VRAIE carte de swipe.
// On réutilise EventCard (source de vérité) pour que l'aperçu soit pixel-identique à
// ce que verront les utilisateurs — énergie, zone infos, barre d'action comprises.
const buildPreviewEvent = (form: FormData): UnifiedEvent => {
  const p = parseFloat(form.price);
  const hasPrice = !!form.price && !Number.isNaN(p) && p > 0;
  const eventType = (form.category || 'soirees') as UnifiedEvent['event_type'];
  const date =
    form.date && !Number.isNaN(new Date(`${form.date}T${form.time || '00:00'}`).getTime())
      ? new Date(`${form.date}T${form.time || '00:00'}`).toISOString()
      : new Date().toISOString();

  return {
    id: 'preview',
    title: form.title || "Titre de l'événement",
    description: form.description || '',
    date,
    location: form.location || 'Lieu',
    category: (form.category || 'soirees') as UnifiedEvent['category'],
    image_url: form.image_url || '',
    views: 0,
    likes: 0,
    participants: 0,
    source: 'business',
    organizer: form.location || '',
    organizer_type: 'business',
    venue: form.location || '',
    event_type: eventType,
    time: form.time || '',
    price_text: hasPrice ? `${p}€` : undefined,
    address: form.address || '',
    external_url: form.external_url || '',
    tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    energy:
      form.energy && form.energy !== ENERGY_NONE
        ? (form.energy as UnifiedEvent['energy'])
        : undefined,
  };
};

// Aperçu live : rend la vraie carte EventCard dans un cadre type téléphone.
// `pointer-events-none` neutralise les clics (pas de tracking, pas de drawer) : c'est
// un aperçu purement visuel. Les variables --app-* sont remises à 0 pour ne pas hériter
// du chrome de l'app autour.
const LivePreviewCard = ({ form }: { form: FormData }) => {
  const previewEvent = useMemo(() => buildPreviewEvent(form), [form]);

  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div
        className="relative overflow-hidden rounded-[2rem] border-[6px] border-neutral-800 bg-black shadow-xl"
        style={{ aspectRatio: '9 / 19', ['--app-header-h' as string]: '0px', ['--app-nav-h' as string]: '0px' } as React.CSSProperties}
      >
        <div className="absolute inset-0 pointer-events-none select-none">
          <EventCard
            event={previewEvent}
            isFirstEvent
            onBack={() => {}}
            onDislike={() => {}}
            onLike={() => {}}
            onParticipate={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

const EventEditModal = ({ event, onClose, onSuccess }: EventEditModalProps) => {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  // Snapshot de référence pour détecter les modifications non enregistrées.
  const [initialData, setInitialData] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  useEffect(() => {
    if (event) {
      const next = buildFormData(event);
      setFormData(next);
      setInitialData(next);
    }
  }, [event]);

  // Vrai dès qu'un champ diffère du snapshot initial (hors champ "reason").
  const isDirty = useMemo(() => {
    const { reason: _r1, ...a } = formData;
    const { reason: _r2, ...b } = initialData;
    return JSON.stringify(a) !== JSON.stringify(b);
  }, [formData, initialData]);

  // Ferme en confirmant si des modifications ne sont pas enregistrées.
  const handleAttemptClose = () => {
    if (isDirty && !window.confirm('Des modifications ne sont pas enregistrées. Fermer quand même ?')) {
      return;
    }
    onClose();
  };

  const handleEnhanceWithAI = async () => {
    if (!event) return;

    setEnhancing(true);
    try {
      const enhanced = await enhanceEventContent({
        title: formData.title || event.title,
        description: formData.description || event.description || '',
        location: formData.location || event.location
      });

      setFormData(prev => ({
        ...prev,
        title: enhanced.title,
        description: enhanced.description,
        time: enhanced.time || prev.time
      }));

      toast.success("✨ Le contenu a été amélioré par l'IA");
    } catch (error) {
      console.error('Erreur amélioration IA:', error);
      toast.error("Impossible d'améliorer le contenu avec l'IA");
    } finally {
      setEnhancing(false);
    }
  };

  const handleSave = async (andValidate = false) => {
    if (!event) return;

    setSaving(true);
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const updateData: Record<string, unknown> = {
        title: formData.title,
        description: formData.description || null,
        date: dateTime.toISOString(),
        time: formData.time || null,
        end_date: formData.end_date ? new Date(`${formData.end_date}T${formData.end_time || '23:59'}`).toISOString() : null,
        end_time: formData.end_time || null,
        location: formData.location,
        address: formData.address || null,
        category: formData.category,
        energy: formData.energy && formData.energy !== ENERGY_NONE ? formData.energy : null,
        price: formData.price ? parseFloat(formData.price) : null,
        image_url: formData.image_url || null,
        external_url: formData.external_url || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
        updated_at: new Date().toISOString()
      };

      if (andValidate) {
        updateData.status = 'active';
        updateData.validated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('events')
        .update(updateData as never)
        .eq('id', event.id);

      if (error) throw error;

      toast.success(andValidate
        ? "✅ Événement modifié et validé !"
        : "✅ Événement modifié avec succès"
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur modification:', error);
      toast.error("Impossible de modifier l'événement");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpdated = async (newUrl: string) => {
    if (!event?.id) return;

    try {
      const updateResult = await updateEventImageUrl(event.id, newUrl);

      if (!updateResult.success) {
        toast.error(updateResult.error || 'Erreur lors de la mise à jour');
        return;
      }

      // L'image est persistée immédiatement : on aligne le snapshot pour ne pas la
      // compter comme "modification non enregistrée".
      setFormData(prev => ({ ...prev, image_url: newUrl }));
      setInitialData(prev => ({ ...prev, image_url: newUrl }));
    } catch (error) {
      console.error('Erreur handleImageUpdated:', error);
      toast.error('Erreur lors de la mise à jour de l\'image');
    }
  };

  if (!event) return null;

  return (
    <Dialog open={!!event} onOpenChange={(open) => { if (!open) handleAttemptClose(); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            Modifier l'événement
            <span className="text-sm font-normal text-muted-foreground">
              ({event.status})
            </span>
            {isDirty && (
              <Badge variant="outline" className="text-[11px] border-amber-300 text-amber-700 bg-amber-50">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                Modifications non enregistrées
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Deux panneaux : formulaire (sections) à gauche, aperçu live à droite */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* ---- Colonne formulaire ---- */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {/* Section Essentiel */}
            <SectionHeader icon={<ListChecks className="w-4 h-4 text-purple-500" />}>Essentiel</SectionHeader>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="title">Titre de l'événement *</Label>
                <Button
                  onClick={handleEnhanceWithAI}
                  disabled={enhancing || !formData.title || !formData.location}
                  size="sm"
                  variant="outline"
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  {enhancing ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1" />
                  )}
                  {enhancing ? 'Amélioration...' : 'Améliorer avec l\'IA'}
                </Button>
              </div>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de l'événement"
              />
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="time">Heure *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="location">Lieu *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Nom du lieu"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="price">Prix</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Catégorie *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {WOULI_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="energy" className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-muted-foreground" /> Énergie
              </Label>
              <Select value={formData.energy} onValueChange={(value) => setFormData(prev => ({ ...prev, energy: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Énergie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ENERGY_NONE}>— Aucune</SelectItem>
                  <SelectItem value="JOURNEE">{ENERGY_META.JOURNEE.label}</SelectItem>
                  <SelectItem value="CLUB">{ENERGY_META.CLUB.label}</SelectItem>
                  <SelectItem value="SCENE">{ENERGY_META.SCENE.label}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Section Détails */}
            <SectionHeader icon={<FileText className="w-4 h-4 text-purple-500" />}>Détails</SectionHeader>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de l'événement"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="end_date">Date de fin (optionnel)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="end_time">Heure de fin</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Adresse complète</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Adresse complète du lieu"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="external_url">Lien externe (optionnel)</Label>
              <Input
                id="external_url"
                value={formData.external_url}
                onChange={(e) => setFormData(prev => ({ ...prev, external_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="tags">Tags (séparés par virgule)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="afterwork, rooftop, dj-set, gratuit..."
              />
            </div>

            {/* Section Média */}
            <SectionHeader icon={<ImageIcon className="w-4 h-4 text-purple-500" />}>Média</SectionHeader>

            <div className="col-span-2">
              <Label className="mb-2 block">Image de l'événement</Label>
              <AdminInlineImageCropper
                eventId={event.id}
                imageUrl={formData.image_url || event.image_url || ''}
                onImageUpdated={handleImageUpdated}
              />
            </div>
          </div>

          {/* ---- Colonne aperçu live ---- */}
          <div className="lg:sticky lg:top-0 self-start space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Aperçu — tel que les utilisateurs le verront</p>
            <LivePreviewCard form={formData} />
          </div>
        </div>

        <div className="flex gap-2 pt-6 border-t justify-end">
          <Button onClick={handleAttemptClose} variant="ghost" size="sm">
            Annuler
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={saving || !formData.title || !formData.location || !isDirty}
            variant="outline"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
          {event.status !== 'active' && (
            <Button
              onClick={() => handleSave(true)}
              disabled={saving || !formData.title || !formData.location}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Valider
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventEditModal;
