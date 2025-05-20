import React, { useState, useEffect, } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, User } from 'lucide-react';
import { Chat, ChatType, ChatVisibility } from '@/types/chat';
import { GroupChatForm } from './GroupChatForm';
import { PrivateChatForm } from './PrivateChatForm';
import { useData } from '@/hooks/useData';
import { User as UserType } from '@/types/chat';
import { addDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../../firebase.config';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: (chat: Chat) => void;
}

// Interface for user data from Firestore
interface FirestoreUser {
  id: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
}

export function NewChatDialog({ open, onOpenChange, onChatCreated }: NewChatDialogProps) {
  const [chatType, setChatType] = useState<ChatType>('group');
  const [groupName, setGroupName] = useState('');
  const [groupVisibility, setGroupVisibility] = useState<ChatVisibility>('private');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const { data: usersData } = useData('users');
  const { user } = useAuth();
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);

  // Safely convert raw data to FirestoreUser array
  const users = usersData
    .filter((userData) => typeof userData === 'object' && userData !== null && 'id' in userData)
    .map((userData): FirestoreUser => ({
      id: String(userData.id || ''),
      displayName: typeof userData.displayName === 'string' ? userData.displayName : undefined,
      email: typeof userData.email === 'string' ? userData.email : undefined,
      photoURL: typeof userData.photoURL === 'string' ? userData.photoURL : undefined
    }));

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers(users as unknown as UserType[]);
      return;
    }
    
    const newFilteredUsers = users.filter((user) => {
      const displayName = user.displayName || '';
      const email = user.email || '';
      const searchTermLower = searchTerm.toLowerCase();
      return displayName.toLowerCase().includes(searchTermLower) || 
             email.toLowerCase().includes(searchTermLower);
    });
    
    setFilteredUsers(newFilteredUsers as unknown as UserType[]);
  }, [searchTerm, users]);

  const createChatToDb = async (chat: Chat) => {
    const docRef = await addDoc(collection(db, 'chats'), { ...chat, createdAt: serverTimestamp() });
    return docRef.id;
  };

  const handleCreateChat = async () => {
    let newChat: Partial<Chat>;
    
    if (chatType === 'one-to-one') {
      const selectedUserObj = users.find(u => u.id === selectedUser);
      if (!selectedUserObj) return;
      
      newChat = {
        id: uuidv4(),
        type: chatType,
        name: selectedUserObj.displayName || (selectedUserObj.email ? selectedUserObj.email.split('@')[0] : 'Utilisateur'),
        avatar: selectedUserObj.photoURL,
        unreadCount: 0,
        pinned: false,
        visibility: 'private',
        createdAt: new Date(),
        participants: [
          user && {
            id: user.uid,
            name: user.displayName || 'Vous',
            avatar: user.photoURL,
          },
          {
            id: selectedUserObj.id,
            name: selectedUserObj.displayName || (selectedUserObj.email ? selectedUserObj.email.split('@')[0] : 'Utilisateur'),
            avatar: selectedUserObj.photoURL,
          }
        ].filter(Boolean),
        createdBy: user?.uid || '',
      };
    } else {
      // Group chat
      if (!groupName.trim()) return;
      
      const participants = [
        user && {
          id: user.uid,
          name: user.displayName || 'Vous',
          avatar: user.photoURL,
        },
        ...selectedParticipants.map((id) => {
          const userObj = users.find(u => u.id === id);
          
          return userObj && {
            id: userObj.id || '',
            name: userObj.displayName || (userObj.email ? userObj.email.split('@')[0] : ''),
            avatar: userObj.photoURL,
          };
        }),
      ].filter(Boolean);
      
      newChat = {
        id: uuidv4(),
        type: chatType,
        name: groupName,
        unreadCount: 0,
        pinned: false,
        visibility: groupVisibility,
        participants,
        createdAt: new Date(),
        createdBy: user?.uid || '',
      };
    }
    
    const newChatId = await createChatToDb(newChat as Chat);
    newChat.id = newChatId;
    
    onChatCreated(newChat as Chat);
    
    // Reset form
    setChatType('group');
    setGroupName('');
    setGroupVisibility('private');
    setSearchTerm('');
    setSelectedParticipants([]);
    setSelectedUser('');
  };

  const isFormValid = () => {
    if (chatType === 'one-to-one') {
      return !!selectedUser;
    } else {
      return groupName.trim() !== '' && selectedParticipants.length > 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle discussion</DialogTitle>
          <DialogDescription>
            Créez un nouveau groupe ou démarrez une conversation privée.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="group" onValueChange={(value) => setChatType(value as ChatType)}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="group" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Groupe
            </TabsTrigger>
            <TabsTrigger value="one-to-one" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Message privé
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="group">
            <GroupChatForm
              groupName={groupName}
              setGroupName={setGroupName}
              groupVisibility={groupVisibility}
              setGroupVisibility={setGroupVisibility}
              selectedParticipants={selectedParticipants}
              setSelectedParticipants={setSelectedParticipants}
              filteredUsers={filteredUsers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </TabsContent>
          
          <TabsContent value="one-to-one">
            <PrivateChatForm
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              filteredUsers={filteredUsers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreateChat} disabled={!isFormValid()}>
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
