
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';

interface EmptyProfileStateProps {
  onCreateProfile: () => void;
}

const EmptyProfileState: React.FC<EmptyProfileStateProps> = ({ onCreateProfile }) => (
  <Card className="text-center p-8 max-w-md mx-auto">
    <CardContent className="pt-6 flex flex-col items-center">
      <div className="bg-purple-100 p-3 rounded-full mb-4">
        <UserCircle className="h-12 w-12 text-purple-500" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Créez votre profil</h2>
      <p className="text-gray-500 mb-6">
        Partagez vos informations et personnalisez votre expérience Wouli
      </p>
      <Button onClick={onCreateProfile} size="lg" className="w-full md:w-auto">
        Créer mon profil
      </Button>
    </CardContent>
  </Card>
);

export default EmptyProfileState;
