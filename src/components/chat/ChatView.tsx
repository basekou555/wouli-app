import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, MoreVertical, Paperclip, Send, Image, Smile, Users, Info, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Chat, Message } from '@/types/chat';
import { useData } from '@/hooks/useData';
import { db } from '../../firebase.config';
import { addDoc, serverTimestamp, collection } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';

interface ChatViewProps {

  chat: Chat;
  onBack: () => void;
}

export function ChatView({ chat, onBack }: ChatViewProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: allData, loading } = useData('messages');
  const { user, loading: loadingUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (allData) {
      const chatMessages = allData.filter((item): item is Message => {
        return 'content' in item && item.chatId === chat.id
      });
      setMessages(chatMessages);
    }
  }, [chat.id, allData]);
  
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageToDb = async (message: Message) => {
    await addDoc(collection(db, 'messages'), { ...message, timestamp: serverTimestamp() });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    const userId = user?.uid;
    const newMsg: Message = {
      id: uuidv4(),
      chatId: chat.id, content: newMessage,
      sender: {
        id: userId,
        name: user?.displayName || 'Vous',
      },
      timestamp: new Date(),
      read: false,
    };
     await sendMessageToDb(newMsg);

    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isEventChat = chat.type === 'event';
  const isReadOnly = isEventChat && chat.isArchived;
  
  const getChatTypeInfo = () => {
    switch (chat.type) {
      case 'event':
        return {
          icon: <Calendar className="h-4 w-4 mr-1" />,
          label: 'Événement',
          color: 'bg-purple-50 text-purple-700'
        };
      case 'group':
        return {
          icon: <Users className="h-4 w-4 mr-1" />,
          label: 'Groupe',
          color: 'bg-blue-50 text-blue-700'
        };
      case 'one-to-one':
        return {
          icon: <Users className="h-4 w-4 mr-1" />,
          label: 'Privé',
          color: 'bg-green-50 text-green-700'
        };
    }
  };
  
  const typeInfo = getChatTypeInfo();

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 mr-3">
            {chat.avatar ? (
              <AvatarImage src={chat.avatar} />
            ) : (
              <AvatarFallback className={`
                ${chat.type === 'event' ? 'bg-purple-100 text-purple-500' : 
                  chat.type === 'group' ? 'bg-blue-100 text-blue-500' : 
                  'bg-green-100 text-green-500'}
              `}>
                {chat.name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center">
              <h2 className="font-semibold text-lg">{chat.name}</h2>
              <Badge 
                variant="outline" 
                className={`ml-2 flex items-center text-xs ${typeInfo.color}`}>
                {typeInfo.icon}
                {typeInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              {chat.participants.length} participant{chat.participants.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageBubble 
          key={message.id} 
            message={message} 
            isSelf={message.sender.id === user?.uid}
            showAvatar={index === 0 || messages[index - 1].sender.id !== message.sender.id}
          />
        ))}
        {isReadOnly && (
          <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-center text-sm">
            Ce chat est en lecture seule car l'événement est terminé.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {!isReadOnly && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
              />
              <Button variant="ghost" size="icon">
                <Image className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Smile className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 relative">
              <Input 
                placeholder="Envoyer un message..." 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>
            <Button onClick={handleSendMessage} disabled={newMessage.trim() === ''}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isSelf: boolean;
  showAvatar: boolean;
}

function MessageBubble({ message, isSelf, showAvatar }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
      {!isSelf && showAvatar && (
        <Avatar className="h-8 w-8 mr-2">
          {message.sender.avatar ? (
            <AvatarImage src={message.sender.avatar} />
          ) : (
            <AvatarFallback>
              {message.sender.name.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
      )}
      {!isSelf && !showAvatar && <div className="w-8 mr-2" />}
      
      <div className="max-w-[75%]">
        {!isSelf && showAvatar && (
          <p className="text-xs text-gray-500 mb-1">{message.sender.name}</p>
        )}
        <div className={`rounded-xl p-3 ${
          isSelf ? 
          'bg-gradient-to-br from-purple-500 to-purple-600 text-white' : 
          'bg-gray-100 text-gray-800'
        }`}>
          <p>{message.content}</p>
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.attachments.map(attachment => (
                <div 
                  key={attachment.id} 
                  className="relative rounded-lg overflow-hidden border"
                >
                  {attachment.type === 'image' && (
                    <img 
                      src={attachment.url} 
                      alt="Attachment" 
                      className="max-h-60 object-contain"
                    />
                  )}
                  {attachment.type === 'video' && (
                    <video 
                      src={attachment.url}
                      poster={attachment.thumbnail}
                      controls
                      className="max-h-60"
                    />
                  )}
                  {attachment.type === 'file' && (
                    <div className="p-3 bg-gray-50 text-blue-700 flex items-center">
                      <span className="truncate max-w-xs">{attachment.url.split('/').pop()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
