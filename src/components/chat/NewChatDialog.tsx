
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
import { db } from '@/firebase.config';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: (chat: Chat) => void;
}

export function NewChatDialog({ open, onOpenChange, onChatCreated }: NewChatDialogProps) {
  const [chatType, setChatType] = useState<ChatType>('group');
  const [groupName, setGroupName] = useState('');
  const [groupVisibility, setGroupVisibility] = useState<ChatVisibility>('private');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const { data: users } = useData('users');
  const { user } = useAuth();
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const newFilteredUsers = users.filter((user): user is UserType =>
      
      'name' in user && 'username' in user &&
      
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(newFilteredUsers as UserType[]);
  }, [searchTerm, users]);


  const createChatToDb = async (chat: Chat) => {
    const docRef = await addDoc(collection(db, 'chats'), { ...chat, createdAt: serverTimestamp() });
    return docRef.id;
  };

  const handleCreateChat = async () => {
    let newChat: Chat;
    if (chatType === 'one-to-one') {
      const selectedUserObj = users.find(u => u.id === selectedUser);
      if (!selectedUserObj) return;
      
      newChat = {
        id: uuidv4(),
        type: chatType,
        name: selectedUserObj.name,
        avatar: selectedUserObj.avatar,
        unreadCount: 0,
        pinned: false,
        visibility: 'private',
        createdAt: serverTimestamp(),
        participants: [
          user && {
            id: user.uid,
            name: user.displayName || 'Vous',
            avatar: user.photoURL,
          },
          {
            id: selectedUserObj.id,
            name: selectedUserObj.name,
            avatar: selectedUserObj.avatar,
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

        },
        ...selectedParticipants.map((id) => {
          const user = users.find(u => u.id === id);

          return user &&  {
            
            
            id: user?.id || '',
            name: user?.name || '',
            avatar: user?.avatar,
          };
        }),
      ];
      
      newChat = {
        type: chatType,
        name: groupName,
        unreadCount: 0,
        pinned: false,
        visibility: groupVisibility,
        participants,
        createdBy: user?.uid || '',
      };
    }
    const newChatId = await createChatToDb(newChat);
    newChat.id = newChatId;
    
    onChatCreated(newChat);
    
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
