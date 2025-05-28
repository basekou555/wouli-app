
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { ChatList } from '@/components/chat/ChatList';
import { ChatView } from '@/components/chat/ChatView';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { Chat } from '@/types/chat';
import { MessageSquare } from 'lucide-react';
import { db } from '../firebase.config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
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
  
  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-72px)] md:h-[calc(100vh-24px)] -mt-4 md:mt-0">
        <div className={`${activeChat ? 'hidden md:block' : ''} w-full md:w-96 border-r border-gray-200 overflow-hidden`}>
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
        
        <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-col flex-1 w-full`}>
          {activeChat ? (
            <ChatView 
              chat={activeChat} 
              onBack={() => setActiveChat(null)} 
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Vos messages</h3>
                <p className="text-gray-500 mt-2">
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
