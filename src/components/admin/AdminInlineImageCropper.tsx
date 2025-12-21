import React, { useState, useCallback, useRef } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  ZoomIn, 
  Check,
  Loader2,
  RotateCcw,
  Upload,
  Trash2,
  Move,
  MoveHorizontal,
  MoveVertical
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
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropChange = (newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
    setHasChanges(true);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    setHasChanges(true);
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
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setHasChanges(true);
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
      setLocalImageUrl(null);
      setHasChanges(false);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
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
    if (localImageUrl) {
      setLocalImageUrl(null);
    }
    setHasChanges(false);
  };

  const handleRemoveImage = () => {
    onImageUpdated('');
    setLocalImageUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setHasChanges(false);
  };

  const currentImage = localImageUrl || imageUrl;
  const hasImage = !!currentImage;

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {hasImage ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Zone de crop - toujours visible quand il y a une image */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-black/90 border border-border/30">
              <Cropper
                image={currentImage}
                crop={crop}
                zoom={zoom}
                aspect={4 / 5}
                onCropChange={handleCropChange}
                onCropComplete={onCropComplete}
                onZoomChange={handleZoomChange}
                showGrid={true}
                cropShape="rect"
                objectFit="contain"
              />
              
              {/* Badge format */}
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
                <span className="text-xs text-white/80 font-medium">4:5 • 1080×1350px</span>
              </div>

              {/* Indicateur de modification */}
              {hasChanges && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500/80 backdrop-blur-sm rounded-md">
                  <span className="text-xs text-white font-medium">Non sauvegardé</span>
                </div>
              )}
            </div>

            {/* Actions rapides sous le crop */}
            <div className="flex gap-2">
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Panneau de contrôles - toujours visible */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/30">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Move className="h-4 w-4 text-primary" />
              Ajustements
            </div>

            {/* Contrôle Position X */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MoveHorizontal className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Position X</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {crop.x.toFixed(0)}
                </span>
              </div>
              <Slider
                value={[crop.x + 100]}
                onValueChange={(values) => handleCropChange({ ...crop, x: values[0] - 100 })}
                min={0}
                max={200}
                step={1}
                className="h-8"
              />
            </div>

            {/* Contrôle Position Y */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MoveVertical className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Position Y</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {crop.y.toFixed(0)}
                </span>
              </div>
              <Slider
                value={[crop.y + 100]}
                onValueChange={(values) => handleCropChange({ ...crop, y: values[0] - 100 })}
                min={0}
                max={200}
                step={1}
                className="h-8"
              />
            </div>

            {/* Contrôle de zoom */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ZoomIn className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Zoom</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <Slider
                value={[zoom]}
                onValueChange={(values) => handleZoomChange(values[0])}
                min={1}
                max={3}
                step={0.05}
                className="h-8"
              />
            </div>

            {/* Preview miniature */}
            <div className="pt-2 border-t border-border/30">
              <p className="text-xs text-muted-foreground mb-2">Aperçu final</p>
              <div className="aspect-[4/5] w-full max-w-[120px] mx-auto bg-black rounded-lg overflow-hidden border-2 border-primary/30">
                <div 
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${currentImage})`,
                    backgroundSize: `${zoom * 100}%`,
                    backgroundPosition: `${50 - crop.x / 5}% ${50 - crop.y / 5}%`,
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full"
                disabled={!hasChanges}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
              
              <Button
                type="button"
                size="sm"
                onClick={handleApplyCrop}
                disabled={isProcessing || !hasChanges}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {isProcessing ? 'Sauvegarde...' : 'Appliquer'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* État sans image */
        <div 
          className="aspect-[4/5] w-full max-w-md mx-auto rounded-xl border-2 border-dashed border-border/50 bg-muted/20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Ajouter une image</p>
            <p className="text-xs text-muted-foreground mt-1">Format recommandé : 4:5 (1080×1350px)</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
          >
            Parcourir
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminInlineImageCropper;
