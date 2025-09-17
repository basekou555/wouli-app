import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCw, Sparkles, Crop } from 'lucide-react';
import { toast } from 'sonner';
import { AICropSuggestions } from './AICropSuggestions';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (croppedImageBlob: Blob) => Promise<void>;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  targetWidth: number,
  targetHeight: number
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // First canvas for rotation
  const rotationCanvas = document.createElement('canvas');
  const rotationCtx = rotationCanvas.getContext('2d')!;
  
  rotationCanvas.width = safeArea;
  rotationCanvas.height = safeArea;

  rotationCtx.translate(safeArea / 2, safeArea / 2);
  rotationCtx.rotate((rotation * Math.PI) / 180);
  rotationCtx.translate(-safeArea / 2, -safeArea / 2);

  rotationCtx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const rotatedData = rotationCtx.getImageData(0, 0, safeArea, safeArea);

  // Second canvas for cropping
  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d')!;
  
  cropCanvas.width = pixelCrop.width;
  cropCanvas.height = pixelCrop.height;

  cropCtx.putImageData(
    rotatedData,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  // Final canvas for normalization to target size
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(cropCanvas, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/jpeg', 0.85);
  });
};

const getFittedImg = async (
  imageSrc: string,
  rotation = 0,
  targetWidth: number,
  targetHeight: number
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Fill with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Apply rotation
  ctx.save();
  ctx.translate(targetWidth / 2, targetHeight / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  // Calculate scale to fit image in canvas while maintaining aspect ratio
  const imageAspectRatio = image.width / image.height;
  const canvasAspectRatio = targetWidth / targetHeight;
  
  let drawWidth, drawHeight;
  
  if (imageAspectRatio > canvasAspectRatio) {
    // Image is wider, fit to width
    drawWidth = targetWidth;
    drawHeight = targetWidth / imageAspectRatio;
  } else {
    // Image is taller, fit to height
    drawHeight = targetHeight;
    drawWidth = targetHeight * imageAspectRatio;
  }

  // Draw image centered
  ctx.drawImage(
    image,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );

  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/jpeg', 0.85);
  });
};

// Format fixe 4:5 pour optimiser l'UX
const TARGET_DIMENSIONS = {
  ratio: 4/5,
  width: 1080,
  height: 1350
};

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onSave,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoApplied, setAutoApplied] = useState(false);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setSaving(true);
    try {
      const processedImageBlob = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation,
        TARGET_DIMENSIONS.width,
        TARGET_DIMENSIONS.height
      );
      
      await onSave(processedImageBlob);
      onClose();
      toast.success('Image recadrée avec succès');
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      toast.error('Erreur lors du recadrage de l\'image');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setRotation(0);
    setZoom(1);
    setAutoApplied(false);
  };

  const handleAISuggestionCrop = (cropPosition: { x: number; y: number }, zoom: number) => {
    setCrop(cropPosition);
    setZoom(zoom);
  };

  // Support des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && croppedAreaPixels) {
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, croppedAreaPixels]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Recadrer l'image
            <span className="text-sm text-muted-foreground font-normal ml-2">
              Format 4:5 - {TARGET_DIMENSIONS.width}×{TARGET_DIMENSIONS.height}px
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zone de recadrage principale */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative h-[400px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden border">
              <Cropper
                image={imageUrl}
                crop={crop}
                rotation={rotation}
                zoom={zoom}
                aspect={TARGET_DIMENSIONS.ratio}
                onCropChange={setCrop}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={true}
                objectFit="contain"
              />
            </div>

            {/* Contrôles tactiles simplifiés */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Zoom</label>
                  <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
                </div>
                <Slider
                  value={[zoom]}
                  onValueChange={([value]) => setZoom(value)}
                  min={1}
                  max={3}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Rotation</label>
                  <span className="text-sm text-muted-foreground">{Math.round(rotation)}°</span>
                </div>
                <Slider
                  value={[rotation]}
                  onValueChange={([value]) => setRotation(value)}
                  min={-45}
                  max={45}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Panneau latéral - IA + Preview */}
          <div className="space-y-4">
            {/* Suggestions IA */}
            <div className="border rounded-xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
              <AICropSuggestions
                imageUrl={imageUrl}
                aspectRatio={TARGET_DIMENSIONS.ratio}
                onApplyCrop={handleAISuggestionCrop}
                autoApply={!autoApplied}
                onAutoApplied={() => setAutoApplied(true)}
              />
            </div>

            {/* Aperçu temps réel */}
            {croppedAreaPixels && (
              <div className="border rounded-xl p-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  Aperçu final
                </h4>
                <div className="aspect-[4/5] bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/30">
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-xs text-muted-foreground">
                    Preview {TARGET_DIMENSIONS.width}×{TARGET_DIMENSIONS.height}
                  </div>
                </div>
              </div>
            )}

            {/* Actions rapides */}
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={handleReset} 
                className="w-full flex items-center gap-2"
                disabled={saving}
              >
                <RotateCw className="h-4 w-4" />
                Réinitialiser
              </Button>
              
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>💡 <kbd>ESC</kbd> pour fermer • <kbd>Entrée</kbd> pour sauvegarder</p>
                <p>Glissez pour déplacer • Pincez pour zoomer</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !croppedAreaPixels}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Traitement...
              </>
            ) : (
              'Sauvegarder'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};