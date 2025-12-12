
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Euro, Save, X, Sparkles, Loader2, Check } from 'lucide-react';
import { WOULI_CATEGORIES } from '@/data/wouliCategories';
import { supabase } from '@/integrations/supabase/client';
import { enhanceEventContent } from '@/services/aiEnhancementService';
import AdminInlineImageCropper from './AdminInlineImageCropper';
import { updateEventImageUrl } from '@/services/imageUploadService';
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
}

interface EventEditModalProps {
  event: PendingEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EventEditModal = ({ event, onClose, onSuccess }: EventEditModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    address: '',
    category: '',
    price: '',
    image_url: '',
    external_url: '',
    reason: ''
  });
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  

  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.date);
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toTimeString().slice(0, 5),
        location: event.location || '',
        address: event.address || '',
        category: event.category || '',
        price: event.price?.toString() || '',
        image_url: event.image_url || '',
        external_url: event.external_url || '',
        reason: ''
      });
    }
  }, [event]);

  const handleEnhanceWithAI = async () => {
    if (!event) return;
    
    setEnhancing(true);
    try {
      const enhanced = await enhanceEventContent({
        title: formData.title || event.title,
        description: formData.description || event.description || '',
        location: formData.location || event.location
      });

      // Appliquer les améliorations au formulaire
      setFormData(prev => ({
        ...prev,
        title: enhanced.title,
        description: enhanced.description,
        // Appliquer l'heure si elle a été extraite
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
      
      const updateData: any = {
        title: formData.title,
        description: formData.description || null,
        date: dateTime.toISOString(),
        location: formData.location,
        address: formData.address || null,
        category: formData.category as any,
        price: formData.price ? parseFloat(formData.price) : null,
        image_url: formData.image_url || null,
        external_url: formData.external_url || null,
        updated_at: new Date().toISOString()
      };

      // Si validation demandée, ajouter le statut active
      if (andValidate) {
        updateData.status = 'active';
        updateData.validated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('events')
        .update(updateData)
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
      // Update event in database
      const updateResult = await updateEventImageUrl(event.id, newUrl);
      
      if (!updateResult.success) {
        toast.error(updateResult.error || 'Erreur lors de la mise à jour');
        return;
      }

      // Update local form data
      setFormData(prev => ({
        ...prev,
        image_url: newUrl
      }));
    } catch (error) {
      console.error('Erreur handleImageUpdated:', error);
      toast.error('Erreur lors de la mise à jour de l\'image');
    }
  };

  if (!event) return null;

  return (
    <>
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Modifier l'événement
            <span className="text-sm font-normal text-muted-foreground">
              ({event.status})
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Image avec éditeur inline */}
          <div className="col-span-2">
            <Label className="mb-2 block">Image de l'événement</Label>
            <AdminInlineImageCropper
              eventId={event.id}
              imageUrl={formData.image_url || event.image_url || ''}
              onImageUpdated={handleImageUpdated}
            />
          </div>

          {/* Titre avec bouton IA */}
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

          {/* Description */}
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

          {/* Date et heure */}
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

          {/* Lieu */}
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

          {/* Prix */}
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

          {/* Adresse */}
          <div className="col-span-2">
            <Label htmlFor="address">Adresse complète</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Adresse complète du lieu"
            />
          </div>

          {/* Catégorie */}
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

          {/* URL Image */}
          <div>
            <Label htmlFor="image_url">URL de l'image</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          {/* URL externe */}
          <div className="col-span-2">
            <Label htmlFor="external_url">Lien externe (optionnel)</Label>
            <Input
              id="external_url"
              value={formData.external_url}
              onChange={(e) => setFormData(prev => ({ ...prev, external_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          {/* Raison de la modification */}
          <div className="col-span-2">
            <Label htmlFor="reason">Raison de la modification</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Pourquoi cette modification ? (optionnel)"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-6 border-t">
          <Button onClick={onClose} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={() => handleSave(false)} 
            disabled={saving || !formData.title || !formData.location}
            variant="secondary"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
          {event.status !== 'active' && (
            <Button 
              onClick={() => handleSave(true)} 
              disabled={saving || !formData.title || !formData.location}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              {saving ? 'Validation...' : 'Sauvegarder et Valider'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>

    </>
  );
};

export default EventEditModal;
