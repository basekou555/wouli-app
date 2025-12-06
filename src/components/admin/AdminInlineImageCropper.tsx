import React, { useState, useCallback, useRef } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  ZoomIn, 
  Check,
  Loader2,
  RotateCcw,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadEventImage } from '@/services/imageUploadService';

interface AdminInlineImageCropperProps {
  eventId: string;
  imageUrl: string;
  onImageUpdated: (newUrl: string) => void;
  className?: string;
}

// Fonction pour créer l'image croppée
const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = imageSrc;
  
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Taille finale : 1080x1350 (4:5)
  const outputWidth = 1080;
  const outputHeight = 1350;
  
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create blob'));
    }, 'image/jpeg', 0.85);
  });
};

const AdminInlineImageCropper: React.FC<AdminInlineImageCropperProps> = ({
  eventId,
  imageUrl,
  onImageUpdated,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleStartEdit = () => {
    setIsEditing(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalImageUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLocalImageUrl(result);
      setIsEditing(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels) return;

    const sourceImage = localImageUrl || imageUrl;
    if (!sourceImage) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await createCroppedImage(sourceImage, croppedAreaPixels);
      
      // Upload to Supabase Storage
      const uploadResult = await uploadEventImage(croppedBlob, eventId);
      
      if (!uploadResult.success || !uploadResult.url) {
        toast.error(uploadResult.error || 'Erreur lors de l\'upload');
        return;
      }

      onImageUpdated(uploadResult.url);
      setIsEditing(false);
      setLocalImageUrl(null);
      toast.success('Image recadrée et sauvegardée');
    } catch (error) {
      console.error('Erreur crop:', error);
      toast.error('Impossible de recadrer l\'image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const currentImage = localImageUrl || imageUrl;

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Mode édition */}
      {isEditing && currentImage ? (
        <div className="space-y-4">
          {/* Zone de crop */}
          <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-black/90 border border-border/30">
            <Cropper
              image={currentImage}
              crop={crop}
              zoom={zoom}
              aspect={4 / 5}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              showGrid={true}
              cropShape="rect"
              objectFit="contain"
            />
            
            {/* Badge format */}
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
              <span className="text-xs text-white/80 font-medium">4:5 • 1080×1350px</span>
            </div>
          </div>

          {/* Contrôle de zoom */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
              <Slider
                value={[zoom]}
                onValueChange={(values) => setZoom(values[0])}
                min={1}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Autre image
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApplyCrop}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </div>
        </div>
      ) : (
        /* Mode aperçu */
        <div className="space-y-3">
          <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden border border-border/30 bg-black">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Image événement"
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Aucune image
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {imageUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartEdit}
                className="flex-1"
              >
                Recadrer
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {imageUrl ? 'Changer' : 'Ajouter'}
            </Button>
          </div>

          {/* Info format */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span className="text-xs text-muted-foreground">
                Format 4:5 (1080×1350px)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInlineImageCropper;
