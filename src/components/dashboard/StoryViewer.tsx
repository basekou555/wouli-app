
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, ChevronLeft, ChevronRight, Heart, Share2, MessageCircle } from 'lucide-react';

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  media: {
    type: 'image' | 'video';
    url: string;
  };
  timestamp: Date;
  likes: number;
  comments: number;
}

interface StoryViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stories: Story[];
  currentStoryId: string | null;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  open,
  onOpenChange,
  stories,
  currentStoryId
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (open && currentStoryId) {
      const index = stories.findIndex(story => story.id === currentStoryId);
      if (index !== -1) {
        setActiveIndex(index);
        setProgress(0);
      }
    }
  }, [open, currentStoryId, stories]);
  
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story
          if (activeIndex < stories.length - 1) {
            setActiveIndex(prev => prev + 1);
            return 0;
          } else {
            clearInterval(interval);
            onOpenChange(false);
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [open, activeIndex, stories.length, onOpenChange]);
  
  const handlePrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
      setProgress(0);
    }
  };
  
  const handleNext = () => {
    if (activeIndex < stories.length - 1) {
      setActiveIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onOpenChange(false);
    }
  };
  
  if (!open || stories.length === 0) return null;
  
  const currentStory = stories[activeIndex];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md w-full h-[80vh] sm:h-[90vh] bg-black text-white overflow-hidden">
        {/* Close button */}
        <button 
          className="absolute right-2 top-2 z-50 bg-black/30 rounded-full p-1"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5 text-white" />
        </button>
        
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex px-2 pt-2 gap-1">
          {stories.map((_, index) => (
            <div key={index} className="h-0.5 bg-white/30 flex-1 overflow-hidden">
              {index === activeIndex && (
                <div 
                  className="h-full bg-white" 
                  style={{ width: `${progress}%` }}
                />
              )}
              {index < activeIndex && (
                <div className="h-full bg-white w-full" />
              )}
            </div>
          ))}
        </div>
        
        {/* Story header */}
        <div className="absolute top-0 left-0 right-0 z-10 pt-6 px-4">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 border border-white/30">
              <AvatarImage src={currentStory.userAvatar} />
              <AvatarFallback className="bg-purple-500 text-white">
                {currentStory.userName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{currentStory.userName}</p>
              <p className="text-xs text-white/70">
                {new Date(currentStory.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
        
        {/* Story content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {currentStory.media.type === 'image' ? (
            <img 
              src={currentStory.media.url} 
              alt="Story" 
              className="w-full h-full object-contain"
            />
          ) : (
            <video 
              src={currentStory.media.url} 
              className="w-full h-full object-contain" 
              autoPlay 
              loop 
              muted
            />
          )}
        </div>
        
        {/* Navigation buttons */}
        <button 
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/20 rounded-full p-1"
          onClick={handlePrevious}
          disabled={activeIndex === 0}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        
        <button 
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/20 rounded-full p-1"
          onClick={handleNext}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
        
        {/* Reactions */}
        <div className="absolute bottom-4 left-0 right-0 z-20 px-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button className="text-white flex flex-col items-center">
                <Heart className="w-6 h-6" />
                <span className="text-xs mt-1">{currentStory.likes}</span>
              </button>
              <button className="text-white flex flex-col items-center">
                <MessageCircle className="w-6 h-6" />
                <span className="text-xs mt-1">{currentStory.comments}</span>
              </button>
            </div>
            <button className="text-white">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryViewer;
