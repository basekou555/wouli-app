
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WOULI_CATEGORIES } from '@/data/wouliCategories';

interface ProposeEventModalProps {
  trigger?: React.ReactNode;
}

const ProposeEventModal = ({ trigger }: ProposeEventModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    category: '',
    price: '',
    external_url: '',
    submitter_email: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast({
        title: "Date manquante",
        description: "Veuillez sélectionner une date pour l'événement",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('propose_event_public', {
        p_title: formData.title,
        p_description: formData.description || null,
        p_location: formData.location,
        p_address: formData.address || null,
        p_date: date.toISOString(),
        p_category: formData.category as any,
        p_price: formData.price ? parseFloat(formData.price) : 0,
        p_external_url: formData.external_url || null,
        p_submitter_email: formData.submitter_email || null
      });

      if (error) throw error;

      toast({
        title: "✅ Événement proposé !",
        description: "Votre événement a été soumis pour validation. Merci de votre contribution !",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        address: '',
        category: '',
        price: '',
        external_url: '',
        submitter_email: ''
      });
      setDate(undefined);
      setOpen(false);

    } catch (error: any) {
      console.error('Erreur proposition événement:', error);
      
      if (error.message?.includes('Rate limit exceeded')) {
        toast({
          title: "Limite atteinte",
          description: "Vous avez atteint la limite de 5 propositions par jour.",
          variant: "destructive"
        });
      } else if (error.message?.includes('Authentication required')) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour proposer un événement.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de soumettre votre événement. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="gap-2">
      <Plus className="w-4 h-4" />
      Proposer un événement
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Proposer un nouvel événement</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de l'événement *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: Soirée techno au Sucre"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {WOULI_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Décrivez l'événement, l'ambiance, les détails importants..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de l'événement *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
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
            
            <div className="space-y-2">
              <Label htmlFor="price">Prix (€)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0 = Gratuit"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Lieu *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ex: Le Sucre, Wallace Bar..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adresse complète</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Ex: 50 Quai Rambaud, Lyon"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_url">Lien externe</Label>
            <Input
              id="external_url"
              type="url"
              value={formData.external_url}
              onChange={(e) => handleInputChange('external_url', e.target.value)}
              placeholder="Instagram, billetterie, site web..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submitter_email">Votre email (optionnel)</Label>
            <Input
              id="submitter_email"
              type="email"
              value={formData.submitter_email}
              onChange={(e) => handleInputChange('submitter_email', e.target.value)}
              placeholder="Pour vous recontacter si nécessaire"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Envoi en cours..." : "Proposer l'événement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProposeEventModal;
