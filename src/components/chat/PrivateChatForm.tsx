
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { UserList } from './UserList';
import { User } from '@/types/chat';

interface PrivateChatFormProps {
  selectedUser: string;
  setSelectedUser: (userId: string) => void;
  filteredUsers: User[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function PrivateChatForm({
  selectedUser,
  setSelectedUser,
  filteredUsers,
  searchTerm,
  setSearchTerm,
}: PrivateChatFormProps) {
  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
  };

  return (
    <div className="space-y-4">
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

        {selectedUser ? (
          <div className="text-sm text-gray-500">
            Utilisateur sélectionné.
          </div>
        ) : filteredUsers.length > 0 ? (
          <UserList
            users={filteredUsers}
            selectedUsers={selectedUser ? [selectedUser] : []}
            onUserSelect={handleSelectUser}
            singleSelect={true}
          />
        ) : <div className="text-center text-gray-500">Aucun utilisateur trouvé</div>}

      </div>
    </div>
  );
}
