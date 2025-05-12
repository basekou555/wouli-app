
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { ChatList } from '@/components/chat/ChatList';
import { ChatView } from '@/components/chat/ChatView';
import NewChatDialog from '@/components/chat/NewChatDialog';
import { Chat } from '@/types/chat';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { db } from '../firebase.config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Messages = () => {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Chat));
      
      setChats(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);
  
  const handleBackToList = () => {
    setActiveChat(null);
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] -mt-2 md:mt-0">
        <div className={`${activeChat && isMobile ? 'hidden' : ''} w-full md:w-96 border-r border-gray-200 overflow-hidden`}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p>Chargement des conversations...</p>
            </div>
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
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 md:p-8 space-y-4">
              <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-purple-100 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold">Vos messages</h3>
                <p className="text-gray-500 mt-2 text-sm md:text-base">
                  Sélectionnez une conversation ou créez une nouvelle discussion pour commencer à chatter.
                </p>
              </div>
            </div>
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
