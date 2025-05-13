
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Story {
  id: string;
  name: string;
  avatar: string;
  viewed: boolean;
}

interface StoryCirclesProps {
  stories: Story[];
  onCreateStory: () => void;
  onViewStory: (storyId: string) => void;
}

const StoryCircles: React.FC<StoryCirclesProps> = ({ 
  stories, 
  onCreateStory,
  onViewStory 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center space-x-4 overflow-x-auto py-2 px-1 no-scrollbar">
      {/* Create story button */}
      <div className="flex flex-col items-center space-y-1 min-w-fit">
        <button 
          className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 group"
          onClick={onCreateStory}
        >
          <div className="absolute inset-0.5 bg-white rounded-full flex items-center justify-center group-hover:bg-gray-50 transition-colors">
            <Plus className="w-6 h-6 md:w-7 md:h-7 text-purple-500" />
          </div>
        </button>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
          Ajouter
        </span>
      </div>
      
      {/* User stories */}
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center space-y-1 min-w-fit">
          <button 
            className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full p-0.5 ${
              story.viewed 
                ? 'bg-gray-300 dark:bg-gray-700' 
                : 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500'
            }`}
            onClick={() => onViewStory(story.id)}
          >
            <div className="absolute inset-0.5 bg-white dark:bg-gray-900 rounded-full overflow-hidden">
              <Avatar className="w-full h-full">
                <AvatarImage src={story.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white text-lg">
                  {story.name[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </button>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate w-16 md:w-20">
            {story.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StoryCircles;
