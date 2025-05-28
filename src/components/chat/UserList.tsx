
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check } from 'lucide-react';
import { User } from '@/types/chat';

interface UserListProps {
  users: User[];
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  singleSelect?: boolean;
}

export function UserList({ 
  users, 
  selectedUsers, 
  onUserSelect, 
  singleSelect = false 
}: UserListProps) {
  return (
    <div className="max-h-60 overflow-y-auto border rounded-md p-2">
      {users.length > 0 ? (
        users.map(user => (
          <div 
            key={user.id}
            onClick={() => onUserSelect(user.id)}
            className={`
              flex items-center p-2 rounded-md cursor-pointer
              ${selectedUsers.includes(user.id) ? 'bg-purple-50' : 'hover:bg-gray-50'}
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
            {selectedUsers.includes(user.id) && (
              <Check className="h-5 w-5 text-purple-500" />
            )}
          </div>
        ))
      ) : (
        <p className="text-center p-4 text-gray-500">
          {singleSelect ? 'Aucun contact trouvé' : 'Aucun utilisateur trouvé'}
        </p>
      )}
    </div>
  );
}
