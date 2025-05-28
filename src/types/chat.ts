
export type ChatType = 'event' | 'group' | 'one-to-one';
export type ChatVisibility = 'public' | 'friends' | 'private';

export interface Chat {
  id: string;
  type: ChatType;
  name: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: Date;
    read: boolean;
  };
  unreadCount: number;
  pinned: boolean;
  visibility: ChatVisibility;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  createdAt: Date;
  eventId?: string;
  isArchived?: boolean;
  createdBy: string;
}

export interface Message {
  id: string;
  chatId: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  read: boolean;
  attachments?: {
    id: string;
    type: 'image' | 'video' | 'file';
    url: string;
    thumbnail?: string;
  }[];
}
