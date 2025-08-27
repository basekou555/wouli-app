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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { RotateCw, ZoomIn, Image, Crop, Maximize } from 'lucide-react';
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
  const [fillMode, setFillMode] = useState<'crop' | 'fit'>('crop');

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (fillMode === 'crop' && !croppedAreaPixels) return;

    setSaving(true);
    try {
      const targetDimensions = ASPECT_RATIOS[aspectRatio];
      
      let processedImageBlob: Blob;
      if (fillMode === 'crop') {
        processedImageBlob = await getCroppedImg(
          imageUrl,
          croppedAreaPixels!,
          rotation,
          targetDimensions.width,
          targetDimensions.height
        );
      } else {
        processedImageBlob = await getFittedImg(
          imageUrl,
          rotation,
          targetDimensions.width,
          targetDimensions.height
        );
      }
      
      await onSave(processedImageBlob);
      onClose();
      toast.success('Image mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      toast.error('Erreur lors du traitement de l\'image');
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
            {fillMode === 'crop' ? <Crop className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            {fillMode === 'crop' ? 'Recadrer l\'image' : 'Ajuster l\'image'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Fill Mode Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mode de traitement</label>
            <RadioGroup value={fillMode} onValueChange={(value: 'crop' | 'fit') => setFillMode(value)} className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="crop" id="crop" />
                <Label htmlFor="crop" className="flex items-center gap-2 cursor-pointer">
                  <Crop className="h-4 w-4" />
                  Recadrer (crop)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fit" id="fit" />
                <Label htmlFor="fit" className="flex items-center gap-2 cursor-pointer">
                  <Maximize className="h-4 w-4" />
                  Ajuster avec padding
                </Label>
              </div>
            </RadioGroup>
          </div>

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
            {fillMode === 'crop' ? (
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
            ) : (
              <div className="w-full h-full flex items-center justify-center relative">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: 'center'
                  }}
                />
                <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded pointer-events-none" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fillMode === 'crop' && (
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
            )}

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
          <Button onClick={handleSave} disabled={saving || (fillMode === 'crop' && !croppedAreaPixels)}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};