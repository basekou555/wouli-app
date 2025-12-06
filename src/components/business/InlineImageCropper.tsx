import React, { useState, useCallback, useRef } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  ImageIcon, 
  Upload, 
  RotateCcw, 
  ZoomIn, 
  Check,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface InlineImageCropperProps {
  value: string | null;
  onChange: (croppedImageUrl: string) => void;
  className?: string;
}

// Fonction pour créer l'image croppée
const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: Area
): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  
  await new Promise((resolve) => {
    image.onload = resolve;
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

  return canvas.toDataURL('image/jpeg', 0.85);
};

const InlineImageCropper: React.FC<InlineImageCropperProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCropped, setIsCropped] = useState(!!value);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 10MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setRawImage(result);
      setIsCropped(false);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = async () => {
    if (!rawImage || !croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await createCroppedImage(rawImage, croppedAreaPixels);
      onChange(croppedImage);
      setIsCropped(true);
      toast({
        title: "Image recadrée",
        description: "Votre image est prête",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de recadrer l'image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setRawImage(null);
    setIsCropped(false);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // État initial ou image validée
  const showCroppedPreview = isCropped && value && !rawImage;
  const showCropper = rawImage && !isCropped;
  const showEmpty = !rawImage && !value;

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* État vide - Zone d'upload */}
      {showEmpty && (
        <div
          onClick={handleChangeImage}
          className="aspect-[4/5] w-full max-w-sm mx-auto rounded-xl border-2 border-dashed border-border/60 bg-muted/20 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/40 hover:border-primary/40 transition-all duration-200"
        >
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <ImageIcon className="h-8 w-8 text-primary/60" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Cliquez pour ajouter une image
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Format 4:5 • JPEG, PNG • Max 10MB
          </p>
        </div>
      )}

      {/* Zone de crop active */}
      {showCropper && (
        <div className="space-y-4">
          {/* Container du cropper avec aspect ratio 4:5 */}
          <div className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-black/90 border border-border/30">
            <Cropper
              image={rawImage}
              crop={crop}
              zoom={zoom}
              aspect={4 / 5}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              showGrid={true}
              cropShape="rect"
              classes={{
                containerClassName: 'rounded-xl',
                cropAreaClassName: 'border-2 border-white/80'
              }}
            />
            
            {/* Overlay avec info format */}
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
              <span className="text-xs text-white/80 font-medium">4:5</span>
            </div>
          </div>

          {/* Contrôle de zoom */}
          <div className="max-w-sm mx-auto space-y-2">
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
          <div className="flex gap-2 max-w-sm mx-auto">
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
              Valider
            </Button>
          </div>

          {/* Bouton changer image */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleChangeImage}
              className="text-muted-foreground hover:text-foreground"
            >
              <Upload className="h-4 w-4 mr-2" />
              Changer d'image
            </Button>
          </div>
        </div>
      )}

      {/* Preview de l'image croppée */}
      {showCroppedPreview && (
        <div className="space-y-3">
          <div className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-xl overflow-hidden border border-border/30 shadow-lg">
            <img
              src={value}
              alt="Image recadrée"
              className="w-full h-full object-cover"
            />
            {/* Badge de confirmation */}
            <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-md flex items-center gap-1">
              <Check className="h-3 w-3 text-white" />
              <span className="text-xs text-white font-medium">4:5</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 max-w-sm mx-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // Réouvrir le cropper avec l'image actuelle
                setRawImage(value);
                setIsCropped(false);
              }}
              className="flex-1"
            >
              Recadrer
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleChangeImage}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Changer
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveImage}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Supprimer
            </Button>
          </div>
        </div>
      )}

      {/* Info badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          <span className="text-xs text-muted-foreground">
            Format optimisé 4:5 (1080×1350px)
          </span>
        </div>
      </div>
    </div>
  );
};

export default InlineImageCropper;
