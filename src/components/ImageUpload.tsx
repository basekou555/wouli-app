
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageSelect, 
  currentImage, 
  className = "" 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation basique
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast({
        title: "Erreur", 
        description: "L'image ne doit pas dépasser 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    // Créer une preview locale avec FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      onImageSelect(result);
      setIsUploading(false);
      
      toast({
        title: "Image uploadée",
        description: "Votre image a été ajoutée avec succès"
      });
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement de l'image",
        variant: "destructive"
      });
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageSelect('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative">
          <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          onClick={triggerFileInput}
          className="aspect-video w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 text-center">
            Cliquez pour ajouter une image
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPEG, PNG • Max 5MB
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Chargement...' : previewUrl ? 'Changer l\'image' : 'Ajouter une image'}
        </Button>
        
        {previewUrl && (
          <Button
            variant="destructive"
            onClick={handleRemoveImage}
          >
            Supprimer
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
