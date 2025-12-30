import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Star, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Memory } from '@/hooks/useMemories';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AddMemoryModalProps {
  memory: Memory;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { photo_url?: string; note?: string; rating?: number }) => Promise<boolean | undefined>;
  onUploadPhoto: (eventId: string, file: File) => Promise<string | null>;
}

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({
  memory,
  isOpen,
  onClose,
  onSave,
  onUploadPhoto
}) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(memory.photo_url || null);
  const [note, setNote] = useState(memory.note || '');
  const [rating, setRating] = useState(memory.rating || 0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let photoUrl = memory.photo_url;

      // Upload new photo if selected
      if (photo) {
        setIsUploading(true);
        const uploadedUrl = await onUploadPhoto(memory.event.id, photo);
        setIsUploading(false);
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      await onSave({
        photo_url: photoUrl || undefined,
        note: note || undefined,
        rating: rating || undefined
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card z-10 px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-lg text-foreground">
              {memory.hasMemory ? 'Modifier le souvenir' : 'Ajouter un souvenir'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Event Info */}
          <div className="px-4 py-3 bg-muted/50 flex items-center gap-3">
            <img 
              src={memory.event.image_url || '/placeholder.svg'} 
              alt={memory.event.title}
              className="w-14 h-14 object-cover rounded-lg"
            />
            <div>
              <p className="font-medium text-foreground line-clamp-1">{memory.event.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(memory.event.date), 'd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Photo souvenir
              </label>
              
              {photoPreview ? (
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition-colors"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors bg-muted/30">
                  <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Ajouter une photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Note
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform hover:scale-110"
                    onClick={() => setRating(rating === star ? 0 : star)}
                  >
                    <Star 
                      className={`w-8 h-8 transition-colors ${
                        star <= rating 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Note personnelle
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Comment s'est passée cette soirée ?"
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-card px-4 py-4 border-t border-border">
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploading ? 'Upload en cours...' : 'Enregistrement...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Enregistrer le souvenir
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddMemoryModal;
