
import React from 'react';
import { Button } from '@/components/ui/button';

interface AuthRequiredStateProps {
  onNavigateHome: () => void;
}

const AuthRequiredState: React.FC<AuthRequiredStateProps> = ({ onNavigateHome }) => (
  <div className="flex flex-col items-center justify-center h-64 gap-4">
    <div className="text-gray-500">Vous devez être connecté pour voir votre profil.</div>
    <Button onClick={onNavigateHome}>Aller à l'accueil</Button>
  </div>
);

export default AuthRequiredState;
