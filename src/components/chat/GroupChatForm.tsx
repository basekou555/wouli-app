
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search } from 'lucide-react';
import { UserList } from './UserList';
import { User as ChatUser } from '@/types/chat';
import { User as DataUser } from '@/hooks/useData';

type ChatVisibility = 'private' | 'friends' | 'public';

interface GroupChatFormProps {
  users: DataUser[];
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  groupName: string;
  onGroupNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
}

export function GroupChatForm({
  users,
  selectedUsers,
  onUserSelect,
  groupName,
  onGroupNameChange,
  loading
}: GroupChatFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupVisibility, setGroupVisibility] = useState<ChatVisibility>('private');
  
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Convert users to match the expected ChatUser type
  const convertedUsers: ChatUser[] = filteredUsers.map(user => ({
    id: user.id,
    name: user.name || '',
    username: user.username || user.displayName || '',
    avatar: user.avatar || user.photoURL || ''
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="group-name">Nom du groupe</Label>
        <Input 
          id="group-name" 
          placeholder="Entrez le nom du groupe" 
          value={groupName}
          onChange={onGroupNameChange}
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
        
        {loading ? (
          <div className="text-center text-gray-500">Chargement...</div>
        ) : selectedUsers.length > 0 && filteredUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 py-2">
            {selectedUsers.map(id => {
              const user = filteredUsers.find(u => u.id === id);
              return (
                <div 
                  key={id}
                  className="flex items-center bg-purple-100 text-purple-700 rounded-full py-1 px-3 text-sm"
                >
                  <span>{user?.name}</span>
                  <button 
                    className="ml-2"
                    onClick={() => onUserSelect(id)}
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
        {!loading && filteredUsers.length > 0 ? (
          <UserList
            users={convertedUsers}
            selectedUsers={selectedUsers}
            onUserSelect={onUserSelect}
          />
        ) : (
          <div className="text-center text-gray-500">
            {loading ? "Chargement..." : "Aucun utilisateur trouvé"}
          </div>
        )}
      </div>
    </div>
  );
}
