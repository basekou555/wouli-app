
import { Chat, Message } from '@/types/chat';

// Mock Users
export const mockUsers = [
  {
    id: 'user-1',
    name: 'Julie Martin',
    username: 'juliemartin',
    avatar: 'https://picsum.photos/seed/user1/200',
  },
  {
    id: 'user-2',
    name: 'Thomas Dubois',
    username: 'thomasdubois',
    avatar: 'https://picsum.photos/seed/user2/200',
  },
  {
    id: 'user-3',
    name: 'Sophie Laurent',
    username: 'sophiel',
    avatar: 'https://picsum.photos/seed/user3/200',
  },
  {
    id: 'user-4',
    name: 'Lucas Bernard',
    username: 'lucasb',
    avatar: 'https://picsum.photos/seed/user4/200',
  },
  {
    id: 'user-5',
    name: 'Emma Petit',
    username: 'emma_p',
    avatar: 'https://picsum.photos/seed/user5/200',
  },
  {
    id: 'user-6',
    name: 'Hugo Richard',
    username: 'hugor',
    avatar: 'https://picsum.photos/seed/user6/200',
  },
  {
    id: 'user-7',
    name: 'Léa Moreau',
    username: 'leam',
    avatar: 'https://picsum.photos/seed/user7/200',
  },
];

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

// Mock Messages
export const mockMessages: Message[] = [
  // Chat 1 messages
  {
    id: 'msg-1-1',
    chatId: 'chat-1',
    content: 'Salut tout le monde! Prêts pour ma fête d\'anniversaire samedi?',
    sender: {
      id: 'user-1',
      name: 'Julie Martin',
      avatar: 'https://picsum.photos/seed/user1/200',
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 24)),
    read: true,
  },
  {
    id: 'msg-1-2',
    chatId: 'chat-1',
    content: 'Bien sûr! J\'ai hâte!',
    sender: {
      id: 'current-user-id',
      name: 'Vous',
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 23)),
    read: true,
  },
  {
    id: 'msg-1-3',
    chatId: 'chat-1',
    content: 'Est-ce que je dois apporter quelque chose?',
    sender: {
      id: 'user-2',
      name: 'Thomas Dubois',
      avatar: 'https://picsum.photos/seed/user2/200',
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 22)),
    read: true,
  },
  {
    id: 'msg-1-4',
    chatId: 'chat-1',
    content: 'Juste ta bonne humeur! Et peut-être une bouteille si tu veux 😊',
    sender: {
      id: 'user-1',
      name: 'Julie Martin',
      avatar: 'https://picsum.photos/seed/user1/200',
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 20)),
    read: true,
  },
  {
    id: 'msg-1-5',
    chatId: 'chat-1',
    content: 'N\'oubliez pas d\'apporter vos cadeaux!',
    sender: {
      id: 'user-3',
      name: 'Sophie Laurent',
      avatar: 'https://picsum.photos/seed/user3/200',
    },
    timestamp: new Date(),
    read: false,
  },
  
  // Chat 2 messages
  {
    id: 'msg-2-1',
    chatId: 'chat-2',
    content: 'Bonjour à tous! Prêts pour la randonnée demain? Rendez-vous à 9h au parking.',
    sender: {
      id: 'user-2',
      name: 'Thomas Dubois',
      avatar: 'https://picsum.photos/seed/user2/200',
    },
    timestamp: new Date(new Date().setDate(new Date().getDate() - 6)),
    read: true,
  },
  {
    id: 'msg-2-2',
    chatId: 'chat-2',
    content: 'J\'apporte des sandwichs pour tout le monde!',
    sender: {
      id: 'user-4',
      name: 'Lucas Bernard',
      avatar: 'https://picsum.photos/seed/user4/200',
    },
    timestamp: new Date(new Date().setDate(new Date().getDate() - 5)),
    read: true,
  },
  {
    id: 'msg-2-3',
    chatId: 'chat-2',
    content: 'Super! Je m\'occupe des boissons.',
    sender: {
      id: 'current-user-id',
      name: 'Vous',
    },
    timestamp: new Date(new Date().setDate(new Date().getDate() - 5)),
    read: true,
  },
  {
    id: 'msg-2-4',
    chatId: 'chat-2',
    content: 'Super journée, merci à tous!',
    sender: {
      id: 'user-2',
      name: 'Thomas Dubois',
      avatar: 'https://picsum.photos/seed/user2/200',
    },
    timestamp: threeDaysAgo,
    read: true,
    attachments: [
      {
        id: 'attach-1',
        type: 'image',
        url: 'https://picsum.photos/seed/hike1/800/600',
      },
      {
        id: 'attach-2',
        type: 'image',
        url: 'https://picsum.photos/seed/hike2/800/600',
      },
    ],
  },
  
  // Chat 3 messages
  {
    id: 'msg-3-1',
    chatId: 'chat-3',
    content: 'Hé les amis! Ça fait longtemps!',
    sender: {
      id: 'user-3',
      name: 'Sophie Laurent',
      avatar: 'https://picsum.photos/seed/user3/200',
    },
    timestamp: new Date(new Date().setDate(new Date().getDate() - 10)),
    read: true,
  },
  {
    id: 'msg-3-2',
    chatId: 'chat-3',
    content: 'On devrait se retrouver bientôt!',
    sender: {
      id: 'current-user-id',
      name: 'Vous',
    },
    timestamp: new Date(new Date().setDate(new Date().getDate() - 9)),
    read: true,
  },
  {
    id: 'msg-3-3',
    chatId: 'chat-3',
    content: 'Bonne idée! Un resto la semaine prochaine?',
    sender: {
      id: 'user-7',
      name: 'Léa Moreau',
      avatar: 'https://picsum.photos/seed/user7/200',
    },
    timestamp: new Date(new Date().setDate(new Date().getDate() - 8)),
    read: true,
  },
  {
    id: 'msg-3-4',
    chatId: 'chat-3',
    content: 'On se fait une sortie bientôt?',
    sender: {
      id: 'user-3',
      name: 'Sophie Laurent',
      avatar: 'https://picsum.photos/seed/user3/200',
    },
    timestamp: yesterday,
    read: true,
  },
  
  // Chat 4 messages
  {
    id: 'msg-4-1',
    chatId: 'chat-4',
    content: 'Salut! Comment ça va aujourd\'hui?',
    sender: {
      id: 'current-user-id',
      name: 'Vous',
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 5)),
    read: true,
  },
  {
    id: 'msg-4-2',
    chatId: 'chat-4',
    content: 'Ça va bien, merci! Et toi?',
    sender: {
      id: 'user-3',
      name: 'Sophie Laurent',
      avatar: 'https://picsum.photos/seed/user3/200',
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 5)),
    read: true,
  },
  {
    id: 'msg-4-3',
    chatId: 'chat-4',
    content: 'Tout va bien! On se voit demain pour le café alors?',
    sender: {
      id: 'current-user-id',
      name: 'Vous',
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 4)),
    read: true,
  },
  {
    id: 'msg-4-4',
    chatId: 'chat-4',
    content: 'À demain pour le café!',
    sender: {
      id: 'user-3',
      name: 'Sophie Laurent',
      avatar: 'https://picsum.photos/seed/user3/200',
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 3)),
    read: true,
  },
  
  // Chat 5 messages
  {
    id: 'msg-5-1',
    chatId: 'chat-5',
    content: 'Salut Lucas!',
    sender: {
      id: 'current-user-id',
      name: 'Vous',
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 2)),
    read: true,
  },
  {
    id: 'msg-5-2',
    chatId: 'chat-5',
    content: 'Hé! Comment ça va?',
    sender: {
      id: 'user-4',
      name: 'Lucas Bernard',
      avatar: 'https://picsum.photos/seed/user4/200',
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 2)),
    read: true,
  },
  {
    id: 'msg-5-3',
    chatId: 'chat-5',
    content: 'Tu as les photos de la soirée?',
    sender: {
      id: 'current-user-id',
      name: 'Vous',
    },
    timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 30)),
    read: false,
  },
];
