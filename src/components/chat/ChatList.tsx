import React, { useState } from 'react';
import { MessageSquare, Plus, Search, Users, UserPlus, Calendar, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chat, ChatType } from '@/types/chat';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { mockChats } from './mockData';

interface ChatListProps {
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat) => void;
  onNewChat: () => void;
}

export function ChatList({ chats, activeChat, setActiveChat, onNewChat }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ChatType | 'all'>('all');
  
  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || chat.type === filter;
    return matchesSearch && matchesFilter;
  });
  
  const sortedChats = [...filteredChats].sort((a, b) => {
    // First sort by pinned status
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    // Then sort by most recent message
    const aTime = a.lastMessage?.timestamp || a.createdAt;
    const bTime = b.lastMessage?.timestamp || b.createdAt;
    return bTime.getTime() - aTime.getTime();
  });
  
  const pinnedChats = sortedChats.filter(chat => chat.pinned);
  const unpinnedChats = sortedChats.filter(chat => !chat.pinned);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button variant="ghost" size="icon" onClick={onNewChat}>
            <PlusCircle className="h-5 w-5" />
            <span className="sr-only">Nouvelle discussion</span>
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Rechercher..." 
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="border-b border-gray-200 p-2 flex space-x-2 overflow-x-auto">
        <Button
          variant={filter === 'all' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('all')}
          className="whitespace-nowrap"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Tous
        </Button>
        <Button
          variant={filter === 'group' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('group')}
          className="whitespace-nowrap"
        >
          <Users className="h-4 w-4 mr-2" />
          Groupes
        </Button>
        <Button
          variant={filter === 'event' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('event')}
          className="whitespace-nowrap"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Événements
        </Button>
        <Button
          variant={filter === 'one-to-one' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('one-to-one')}
          className="whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Privés
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {pinnedChats.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Épinglés</p>
            {pinnedChats.map(chat => (
              <ChatListItem 
                key={chat.id} 
                chat={chat} 
                isActive={activeChat?.id === chat.id}
                onClick={() => setActiveChat(chat)} 
              />
            ))}
          </div>
        )}
        
        {unpinnedChats.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Messages récents</p>
            {unpinnedChats.map(chat => (
              <ChatListItem 
                key={chat.id} 
                chat={chat} 
                isActive={activeChat?.id === chat.id}
                onClick={() => setActiveChat(chat)} 
              />
            ))}
          </div>
        )}
        
        {sortedChats.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <p>Aucune conversation trouvée</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <Button onClick={onNewChat} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle discussion
        </Button>
      </div>
    </div>
  );
}

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

function ChatListItem({ chat, isActive, onClick }: ChatListItemProps) {
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
  };
  
  const getTypeIcon = () => {
    switch (chat.type) {
      case 'event':
        return <Calendar className="h-3 w-3 text-purple-500" />;
      case 'group':
        return <Users className="h-3 w-3 text-blue-500" />;
      case 'one-to-one':
        return <UserPlus className="h-3 w-3 text-green-500" />;
    }
  };
  
  const getChatInitials = () => {
    if (chat.type === 'one-to-one') {
      // For one-to-one chats, use the other person's initial
      const otherPerson = chat.participants.find(p => p.id !== 'current-user-id');
      return otherPerson?.name.charAt(0) || '?';
    } else {
      // For groups and events, use the first letter of the chat name
      return chat.name.charAt(0);
    }
  };

  return (
    <div 
      className={`flex items-center p-3 mb-1 rounded-lg cursor-pointer transition-colors
        ${isActive ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          {chat.avatar ? (
            <AvatarImage src={chat.avatar} />
          ) : (
            <AvatarFallback className={`
              ${chat.type === 'event' ? 'bg-purple-100 text-purple-500' : 
                chat.type === 'group' ? 'bg-blue-100 text-blue-500' : 
                'bg-green-100 text-green-500'}
            `}>
              {getChatInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="absolute -right-1 -bottom-1 bg-white rounded-full p-0.5">
          {getTypeIcon()}
        </div>
      </div>
      
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <p className="font-medium truncate">{chat.name}</p>
          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
            {chat.lastMessage ? formatDate(chat.lastMessage.timestamp) : formatDate(chat.createdAt)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 truncate">
            {chat.lastMessage ? chat.lastMessage.content : "Aucun message"}
          </p>
          {chat.unreadCount > 0 && (
            <Badge variant="default" className="ml-2 bg-purple-500 hover:bg-purple-600">
              {chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
