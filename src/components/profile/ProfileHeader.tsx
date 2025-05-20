import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit2, Settings, LogOut, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  isPublic: boolean;
  stats: {
    events: number;
    friends: number;
    photos: number;
    organized: number;
    participated: number;
  };
}

interface ProfileHeaderProps {
  userProfile: UserProfile;
  toggleSettings: () => void;
  onEditProfile?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userProfile, toggleSettings, onEditProfile }) => {
  const { signOut } = useAuth();

  const handleEditProfile = () => {
    if (onEditProfile) {
      onEditProfile();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
            {userProfile.avatar ? (
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
            ) : (
              <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div className="absolute -bottom-2 -right-2 flex items-center bg-white rounded-full p-1 shadow-sm">
            {userProfile.isPublic ? 
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                <Eye className="h-3 w-3 mr-1" /> Public
              </Badge> : 
              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                <EyeOff className="h-3 w-3 mr-1" /> Privé
              </Badge>
            }
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold">{userProfile.name}</h1>
          <p className="text-gray-500">{userProfile.username}</p>
          
          <p className="mt-2 text-gray-700">{userProfile.bio}</p>
          
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
            <Badge variant="outline" className="flex items-center p-2 bg-purple-50 text-purple-700 border-purple-200">
              <span className="font-bold">{userProfile.stats.organized}</span>
              <span className="ml-1">organisés</span>
            </Badge>
            
            <Badge variant="outline" className="flex items-center p-2 bg-pink-50 text-pink-700 border-pink-200">
              <span className="font-bold">{userProfile.stats.participated}</span>
              <span className="ml-1">participés</span>
            </Badge>
            
            <Badge variant="outline" className="flex items-center p-2 bg-blue-50 text-blue-700 border-blue-200">
              <span className="font-bold">{userProfile.stats.photos}</span>
              <span className="ml-1">photos</span>
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={handleEditProfile}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Éditer le profil
          </Button>
          
          <Button 
            variant="secondary" 
            className="flex items-center"
            onClick={toggleSettings}
          >
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
