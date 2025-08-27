import React, { useState, useCallback } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCw, ZoomIn, Image } from 'lucide-react';
import { toast } from 'sonner';

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

type AspectRatioOption = '4:5' | '9:16';

const ASPECT_RATIOS = {
  '4:5': { ratio: 4/5, width: 1080, height: 1350, label: '4:5 (Portrait)' },
  '9:16': { ratio: 9/16, width: 1080, height: 1920, label: '9:16 (Stories)' }
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
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('4:5');

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
      const targetDimensions = ASPECT_RATIOS[aspectRatio];
      const croppedImageBlob = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation,
        targetDimensions.width,
        targetDimensions.height
      );
      await onSave(croppedImageBlob);
      onClose();
      toast.success('Image mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors du recadrage:', error);
      toast.error('Erreur lors du recadrage de l\'image');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setRotation(0);
    setZoom(1);
  };

  const handleAspectRatioChange = (newRatio: AspectRatioOption) => {
    setAspectRatio(newRatio);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ZoomIn className="h-5 w-5" />
            Recadrer l'image
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Aspect Ratio Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Image className="h-4 w-4" />
                Format
              </label>
              <span className="text-xs text-muted-foreground">
                {ASPECT_RATIOS[aspectRatio].width}x{ASPECT_RATIOS[aspectRatio].height}px
              </span>
            </div>
            <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ASPECT_RATIOS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Crop Area */}
          <div className="relative h-96 bg-black rounded-lg overflow-hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              rotation={rotation}
              zoom={zoom}
              aspect={ASPECT_RATIOS[aspectRatio].ratio}
              onCropChange={setCrop}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                step={0.1}
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
                min={-180}
                max={180}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-center">
              <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || !croppedAreaPixels}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};