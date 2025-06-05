
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search } from 'lucide-react';
import { UserList } from './UserList';
import { User, ChatVisibility } from '@/types/chat';

interface GroupChatFormProps {
  groupName: string;
  setGroupName: (name: string) => void;
  groupVisibility: ChatVisibility;
  setGroupVisibility: (visibility: ChatVisibility) => void;
  selectedParticipants: string[];
  setSelectedParticipants: (participants: string[]) => void;
  filteredUsers: User[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function GroupChatForm({
  groupName,
  setGroupName,
  groupVisibility,
  setGroupVisibility,
  selectedParticipants,
  setSelectedParticipants,
  filteredUsers,
  searchTerm,
  setSearchTerm,
}: GroupChatFormProps) {
  const toggleParticipant = (userId: string) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
  };

  return (
    <div className="space-y-4">
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
              const user = filteredUsers.find(u => u.id === id);
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
        
        <UserList 
          users={filteredUsers} 
          selectedUsers={selectedParticipants} 
          onUserSelect={toggleParticipant} 
        />
      </div>
    </div>
  );
}
