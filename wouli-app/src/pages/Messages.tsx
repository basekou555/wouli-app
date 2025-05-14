
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { ChatList } from '@/components/chat/ChatList';
import { ChatView } from '@/components/chat/ChatView';
import NewChatDialog from '@/components/chat/NewChatDialog';
import { Chat } from '@/types/chat';
import { MessageSquare, ArrowLeft, Loader, User, Users } from 'lucide-react';
import { db } from '../firebase.config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton pour le chargement des conversations
const ChatListSkeleton = () => (
  <div className="space-y-4 p-4 animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      <div className="h-8 w-8 bg-gray-200 rounded"></div>
    </div>
    
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3 p-2">
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-100 rounded w-3/4"></div>
        </div>
      </div>
    ))}
  </div>
);

// État vide - pas de conversations
const EmptyChatState = ({ onNewChat }: { onNewChat: () => void }) => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-15rem)] text-center p-4 space-y-4">
    <div className="bg-purple-100 h-16 w-16 flex items-center justify-center rounded-full">
      <MessageSquare className="h-8 w-8 text-purple-500" />
    </div>
    <h3 className="text-xl font-medium">Aucune conversation</h3>
    <p className="text-gray-500 max-w-xs">
      Commencez une nouvelle conversation pour échanger avec vos amis et organiser des événements ensemble.
    </p>
    <Button onClick={onNewChat} className="mt-2">
      Nouvelle conversation
    </Button>
  </div>
);

// État vide - pas de conversation sélectionnée
const NoActiveChatState = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4">
    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
      <MessageSquare className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-xl font-medium">Vos messages</h3>
    <p className="text-gray-500 max-w-sm">
      Sélectionnez une conversation ou créez une nouvelle discussion pour commencer à chatter.
    </p>
  </div>
);

const Messages = () => {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', user.uid));

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const chatsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Chat));
          
          setChats(chatsData);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching chats:", error);
          setError("Impossible de charger vos conversations");
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up chat listener:", error);
      setError("Une erreur est survenue");
      setLoading(false);
    }
  }, [user]);
  
  const handleBackToList = () => {
    setActiveChat(null);
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-15rem)]">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">Connectez-vous</h3>
          <p className="text-gray-500 mb-4 text-center">
            Vous devez être connecté pour accéder à vos messages
          </p>
          <Button asChild>
            <a href="/signin">Se connecter</a>
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-15rem)]">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] -mt-2 md:mt-0">
        <div className={`${activeChat && isMobile ? 'hidden' : ''} w-full md:w-96 border-r border-gray-200 overflow-hidden`}>
          {loading ? (
            <ChatListSkeleton />
          ) : chats.length === 0 ? (
            <EmptyChatState onNewChat={() => setIsNewChatDialogOpen(true)} />
          ) : (
            <ChatList 
              activeChat={activeChat} 
              setActiveChat={setActiveChat}
              onNewChat={() => setIsNewChatDialogOpen(true)}
            />
          )}
        </div>
        
        <div className={`${!activeChat && isMobile ? 'hidden' : 'flex'} flex-col flex-1 w-full`}>
          {activeChat ? (
            <>
              {isMobile && (
                <div className="flex items-center p-2 border-b border-gray-200 bg-gray-50">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleBackToList}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium truncate">
                    {activeChat.name || 'Conversation'}
                  </span>
                </div>
              )}
              <ChatView 
                chat={activeChat} 
                onBack={handleBackToList}
              />
            </>
          ) : (
            <NoActiveChatState />
          )}
        </div>
      </div>
      
      <NewChatDialog 
        open={isNewChatDialogOpen} 
        onOpenChange={setIsNewChatDialogOpen}
        onChatCreated={(chat) => {
          setActiveChat(chat);
          setIsNewChatDialogOpen(false);
        }}
      />
    </AppLayout>
  );
};

export default Messages;
