import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Memory } from '@/hooks/useMemories';
import { AddMemoryModal } from './AddMemoryModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MemoriesTabProps {
  memories: Memory[];
  memoriesWithPhotos: Memory[];
  memoriesWithoutPhotos: Memory[];
  loading?: boolean;
  onSaveMemory: (eventId: string, data: { photo_url?: string; note?: string; rating?: number }) => Promise<boolean>;
  onUploadPhoto: (eventId: string, file: File) => Promise<string | null>;
  onRefetch: () => void;
}

export const MemoriesTab: React.FC<MemoriesTabProps> = ({ 
  memories,
  memoriesWithPhotos,
  memoriesWithoutPhotos,
  loading = false,
  onSaveMemory,
  onUploadPhoto,
  onRefetch
}) => {
  const navigate = useNavigate();
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (memory: Memory) => {
    setSelectedMemory(memory);
    setIsModalOpen(true);
  };

  const handleSave = async (data: { photo_url?: string; note?: string; rating?: number }) => {
    if (!selectedMemory) return;
    const success = await onSaveMemory(selectedMemory.event.id, data);
    if (success) {
      setIsModalOpen(false);
      setSelectedMemory(null);
      onRefetch();
    }
    return success;
  };

  if (loading) {
    return (
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Camera className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium mb-2">Aucun souvenir</p>
        <p className="text-muted-foreground text-sm mb-4">
          Participe à des événements pour créer des souvenirs
        </p>
        <Button 
          onClick={() => navigate('/app')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full"
        >
          Découvrir des événements
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* Grid des souvenirs avec photos */}
      {memoriesWithPhotos.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-1">
            {memoriesWithPhotos.map(memory => (
              <motion.div 
                key={memory.event.id}
                whileTap={{ scale: 0.95 }}
                className="aspect-square relative cursor-pointer overflow-hidden rounded-lg group"
                onClick={() => handleOpenModal(memory)}
              >
                <img 
                  src={memory.photo_url || memory.event.image_url || '/placeholder.svg'} 
                  alt={memory.event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                
                {/* Rating badge */}
                {memory.rating && (
                  <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-black/50 rounded-full px-1.5 py-0.5">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-white font-medium">{memory.rating}</span>
                  </div>
                )}
                
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-xs font-medium line-clamp-1">
                    {memory.event.title}
                  </p>
                  <p className="text-white/70 text-[10px]">
                    {format(new Date(memory.event.date), 'd MMM', { locale: fr })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des événements à immortaliser */}
      {memoriesWithoutPhotos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              À immortaliser ({memoriesWithoutPhotos.length})
            </span>
          </div>
          
          <div className="space-y-2">
            {memoriesWithoutPhotos.map(memory => (
              <motion.div
                key={memory.event.id}
                whileTap={{ scale: 0.98 }}
                className="bg-card rounded-xl p-3 border border-border flex items-center gap-3 cursor-pointer"
                onClick={() => handleOpenModal(memory)}
              >
                <img 
                  src={memory.event.image_url || '/placeholder.svg'} 
                  alt={memory.event.title}
                  className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {memory.event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(memory.event.date), 'd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedMemory && (
        <AddMemoryModal
          memory={selectedMemory}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMemory(null);
          }}
          onSave={handleSave}
          onUploadPhoto={onUploadPhoto}
        />
      )}
    </div>
  );
};

export default MemoriesTab;
