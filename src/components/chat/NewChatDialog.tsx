import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Users, User, Calendar, Search } from 'lucide-react';
import { Chat, ChatType, ChatVisibility } from '@/types/chat';
import { mockUsers } from './data/users';

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

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChat = () => {
    let newChat: Chat;
    
    if (chatType === 'one-to-one') {
      const selectedUserObj = mockUsers.find(u => u.id === selectedUser);
      if (!selectedUserObj) return;
      
      newChat = {
        id: `new-${Date.now()}`,
        type: 'one-to-one',
        name: selectedUserObj.name,
        avatar: selectedUserObj.avatar,
        unreadCount: 0,
        pinned: false,
        visibility: 'private',
        participants: [
          {
            id: 'current-user-id',
            name: 'Vous',
          },
          {
            id: selectedUserObj.id,
            name: selectedUserObj.name,
            avatar: selectedUserObj.avatar,
          },
        ],
        createdAt: new Date(),
        createdBy: 'current-user-id',
      };
    } else {
      // Group chat
      if (!groupName.trim()) return;
      
      const participants = [
        {
          id: 'current-user-id',
          name: 'Vous',
        },
        ...selectedParticipants.map(id => {
          const user = mockUsers.find(u => u.id === id);
          return {
            id: user?.id || '',
            name: user?.name || '',
            avatar: user?.avatar,
          };
        }),
      ];
      
      newChat = {
        id: `new-${Date.now()}`,
        type: chatType,
        name: groupName,
        unreadCount: 0,
        pinned: false,
        visibility: groupVisibility,
        participants,
        createdAt: new Date(),
        createdBy: 'current-user-id',
      };
    }
    
    onChatCreated(newChat);
    
    // Reset form
    setChatType('group');
    setGroupName('');
    setGroupVisibility('private');
    setSearchTerm('');
    setSelectedParticipants([]);
    setSelectedUser('');
  };

  const toggleParticipant = (userId: string) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
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
          
          <TabsContent value="group" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Nom du groupe</Label>
              <Input 
                id="group-name" 
                placeholder="Entrez le nom du groupe" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Visibilité</Label>
              <RadioGroup 
                defaultValue="private"
                value={groupVisibility}
                onValueChange={(value) => setGroupVisibility(value as ChatVisibility)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Privé</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="friends" id="friends" />
                  <Label htmlFor="friends">Amis</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Public</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>Ajouter des participants</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Rechercher des utilisateurs..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {selectedParticipants.length > 0 && (
                <div className="flex flex-wrap gap-2 py-2">
                  {selectedParticipants.map(id => {
                    const user = mockUsers.find(u => u.id === id);
                    return (
                      <div 
                        key={id}
                        className="flex items-center bg-purple-100 text-purple-700 rounded-full py-1 px-3 text-sm"
                      >
                        <span>{user?.name}</span>
                        <button 
                          className="ml-2"
                          onClick={() => toggleParticipant(id)}
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div 
                      key={user.id}
                      onClick={() => toggleParticipant(user.id)}
                      className={`
                        flex items-center p-2 rounded-md cursor-pointer
                        ${selectedParticipants.includes(user.id) ? 'bg-purple-50' : 'hover:bg-gray-50'}
                      `}
                    >
                      <Avatar className="h-8 w-8 mr-3">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} />
                        ) : (
                          <AvatarFallback>
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                      {selectedParticipants.includes(user.id) && (
                        <Check className="h-5 w-5 text-purple-500" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center p-4 text-gray-500">Aucun utilisateur trouvé</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="one-to-one" className="space-y-4">
            <div className="space-y-2">
              <Label>Sélectionner un contact</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Rechercher un contact..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div 
                      key={user.id}
                      onClick={() => setSelectedUser(user.id)}
                      className={`
                        flex items-center p-2 rounded-md cursor-pointer
                        ${selectedUser === user.id ? 'bg-purple-50' : 'hover:bg-gray-50'}
                      `}
                    >
                      <Avatar className="h-8 w-8 mr-3">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} />
                        ) : (
                          <AvatarFallback>
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                      {selectedUser === user.id && (
                        <Check className="h-5 w-5 text-purple-500" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center p-4 text-gray-500">Aucun contact trouvé</p>
                )}
              </div>
            </div>
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
