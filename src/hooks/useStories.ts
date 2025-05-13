
import { useState, useEffect } from 'react';

// Types for stories
export interface UserStory {
  id: string;
  name: string;
  avatar: string;
  viewed: boolean;
}

export interface StoryContent {
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

// Mock data for demo
const MOCK_USER_STORIES: UserStory[] = [
  {
    id: 'story1',
    name: 'Thomas',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    viewed: false
  },
  {
    id: 'story2',
    name: 'Marie',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    viewed: false
  },
  {
    id: 'story3',
    name: 'Pierre',
    avatar: 'https://randomuser.me/api/portraits/men/83.jpg',
    viewed: true
  },
  {
    id: 'story4',
    name: 'Sophie',
    avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
    viewed: false
  },
  {
    id: 'story5',
    name: 'David',
    avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
    viewed: true
  }
];

const MOCK_STORY_CONTENTS: StoryContent[] = [
  {
    id: 'content1',
    userId: 'story1',
    userName: 'Thomas',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1496024840928-4c417adf211d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    timestamp: new Date(),
    likes: 24,
    comments: 3
  },
  {
    id: 'content2',
    userId: 'story2',
    userName: 'Marie',
    userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    timestamp: new Date(),
    likes: 56,
    comments: 8
  },
  {
    id: 'content3',
    userId: 'story3',
    userName: 'Pierre',
    userAvatar: 'https://randomuser.me/api/portraits/men/83.jpg',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    timestamp: new Date(),
    likes: 12,
    comments: 1
  },
  {
    id: 'content4',
    userId: 'story4',
    userName: 'Sophie',
    userAvatar: 'https://randomuser.me/api/portraits/women/67.jpg',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    timestamp: new Date(),
    likes: 78,
    comments: 12
  },
  {
    id: 'content5',
    userId: 'story5',
    userName: 'David',
    userAvatar: 'https://randomuser.me/api/portraits/men/91.jpg',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    timestamp: new Date(),
    likes: 45,
    comments: 6
  }
];

export const useStories = () => {
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [storyContents, setStoryContents] = useState<StoryContent[]>([]);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate fetching stories from a server
    const fetchStories = () => {
      setUserStories(MOCK_USER_STORIES);
      setStoryContents(MOCK_STORY_CONTENTS);
    };
    
    fetchStories();
  }, []);
  
  const openStory = (storyId: string) => {
    setSelectedStoryId(storyId);
    setIsStoryModalOpen(true);
    
    // Mark the story as viewed
    setUserStories(prevStories => 
      prevStories.map(story => 
        story.id === storyId ? { ...story, viewed: true } : story
      )
    );
  };
  
  const closeStory = () => {
    setIsStoryModalOpen(false);
    setSelectedStoryId(null);
  };
  
  const createStory = () => {
    // For demo purposes, we'll just alert
    alert('Créer une story (fonctionnalité à venir)');
  };
  
  return {
    userStories,
    storyContents,
    isStoryModalOpen,
    selectedStoryId,
    openStory,
    closeStory,
    createStory
  };
};
