import { Chat } from '@/types/chat';

// Mock Chats
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

export const mockChats: Chat[] = [
  // Event chat (upcoming)
  {
    id: 'chat-1',
    type: 'event',
    name: 'Soirée Anniversaire Julie',
    avatar: 'https://picsum.photos/seed/event1/200',
    lastMessage: {
      content: 'N\'oubliez pas d\'apporter vos cadeaux!',
      sender: 'Sophie Laurent',
      timestamp: new Date(),
      read: false,
    },
    unreadCount: 3,
    pinned: true,
    visibility: 'private',
    participants: [
      { id: 'current-user-id', name: 'Vous' },
      { id: 'user-1', name: 'Julie Martin', avatar: 'https://picsum.photos/seed/user1/200' },
      { id: 'user-2', name: 'Thomas Dubois', avatar: 'https://picsum.photos/seed/user2/200' },
      { id: 'user-3', name: 'Sophie Laurent', avatar: 'https://picsum.photos/seed/user3/200' },
    ],
    createdAt: oneWeekAgo,
    eventId: 'event-1',
    createdBy: 'user-1',
  },
  
  // Event chat (past, archived)
  {
    id: 'chat-2',
    type: 'event',
    name: 'Randonnée Montagne',
    avatar: 'https://picsum.photos/seed/event2/200',
    lastMessage: {
      content: 'Super journée, merci à tous!',
      sender: 'Thomas Dubois',
      timestamp: threeDaysAgo,
      read: true,
    },
    unreadCount: 0,
    pinned: false,
    visibility: 'public',
    participants: [
      { id: 'current-user-id', name: 'Vous' },
      { id: 'user-2', name: 'Thomas Dubois', avatar: 'https://picsum.photos/seed/user2/200' },
      { id: 'user-4', name: 'Lucas Bernard', avatar: 'https://picsum.photos/seed/user4/200' },
      { id: 'user-5', name: 'Emma Petit', avatar: 'https://picsum.photos/seed/user5/200' },
    ],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 14)),
    eventId: 'event-2',
    isArchived: true,
    createdBy: 'user-2',
  },
  
  // Group chat
  {
    id: 'chat-3',
    type: 'group',
    name: 'Amis du Lycée',
    avatar: 'https://picsum.photos/seed/group1/200',
    lastMessage: {
      content: 'On se fait une sortie bientôt?',
      sender: 'Sophie Laurent',
      timestamp: yesterday,
      read: true,
    },
    unreadCount: 1,
    pinned: true,
    visibility: 'private',
    participants: [
      { id: 'current-user-id', name: 'Vous' },
      { id: 'user-1', name: 'Julie Martin', avatar: 'https://picsum.photos/seed/user1/200' },
      { id: 'user-3', name: 'Sophie Laurent', avatar: 'https://picsum.photos/seed/user3/200' },
      { id: 'user-6', name: 'Hugo Richard', avatar: 'https://picsum.photos/seed/user6/200' },
      { id: 'user-7', name: 'Léa Moreau', avatar: 'https://picsum.photos/seed/user7/200' },
    ],
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 2)),
    createdBy: 'user-7',
  },
  
  // One-to-one chat
  {
    id: 'chat-4',
    type: 'one-to-one',
    name: 'Sophie Laurent',
    avatar: 'https://picsum.photos/seed/user3/200',
    lastMessage: {
      content: 'À demain pour le café!',
      sender: 'Sophie Laurent',
      timestamp: new Date(new Date().setHours(new Date().getHours() - 3)),
      read: true,
    },
    unreadCount: 0,
    pinned: false,
    visibility: 'private',
    participants: [
      { id: 'current-user-id', name: 'Vous' },
      { id: 'user-3', name: 'Sophie Laurent', avatar: 'https://picsum.photos/seed/user3/200' },
    ],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 60)),
    createdBy: 'user-3',
  },
  
  // Another One-to-one chat
  {
    id: 'chat-5',
    type: 'one-to-one',
    name: 'Lucas Bernard',
    avatar: 'https://picsum.photos/seed/user4/200',
    lastMessage: {
      content: 'Tu as les photos de la soirée?',
      sender: 'current-user-id',
      timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 30)),
      read: false,
    },
    unreadCount: 0,
    pinned: false,
    visibility: 'private',
    participants: [
      { id: 'current-user-id', name: 'Vous' },
      { id: 'user-4', name: 'Lucas Bernard', avatar: 'https://picsum.photos/seed/user4/200' },
    ],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 20)),
    createdBy: 'current-user-id',
  },
];