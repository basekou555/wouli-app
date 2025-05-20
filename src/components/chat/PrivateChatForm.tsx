
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { UserList } from './UserList';
import { User } from '@/hooks/useData';

interface PrivateChatFormProps {
  users: User[];
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  loading?: boolean;
}

export function PrivateChatForm({
  users,
  selectedUsers,
  onUserSelect,
  loading
}: PrivateChatFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {loading ? (
          <div className="text-center text-gray-500">Chargement...</div>
        ) : selectedUsers.length === 1 ? (
          <div className="text-sm text-gray-500">
            Utilisateur sélectionné.
          </div>
        ) : filteredUsers.length > 0 ? (
          <UserList
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onUserSelect={onUserSelect}
            singleSelect={true}
          />
        ) : <div className="text-center text-gray-500">Aucun utilisateur trouvé</div>}

      </div>
    </div>
  );
}
