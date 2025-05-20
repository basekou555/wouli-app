
import React from 'react';
import { Settings, Edit, Image, MapPin, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ProfileHeaderProps {
  userProfile: any;
  toggleSettings: () => void;
  onEditProfile: () => void;
  isMobile?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userProfile, toggleSettings, onEditProfile, isMobile = false }) => {
  const { name, username, avatar, bio, isPublic, stats } = userProfile;
  
  return (
    <div className="animate-fade-down space-y-4 md:space-y-6">
      {/* Cover image placeholder */}
      <div className="relative h-24 md:h-36 w-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-white opacity-50">
          <Image className="h-8 w-8" />
        </div>
        <div className="absolute bottom-4 right-4">
          <Button size="sm" variant="ghost" className="bg-black/20 text-white hover:bg-black/30">
            <Image className="h-4 w-4 mr-1" />
            <span className="text-xs">Ajouter une couverture</span>
          </Button>
        </div>
      </div>
      
      {/* Profile information */}
      <div className="flex flex-col md:flex-row md:items-end md:gap-6">
        <div className={`${isMobile ? '-mt-12' : '-mt-16'} mx-auto md:mx-0 relative`}>
          <Avatar className={`${isMobile ? 'h-24 w-24' : 'h-32 w-32'} border-4 border-white`}>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <Button
            size="sm"
            variant="ghost"
            className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-1.5 bg-gray-100"
            onClick={onEditProfile}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        
        <div className={`flex flex-col ${isMobile ? 'mt-3 items-center' : 'mt-0'} md:flex-grow`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
            <div className={`space-y-1 ${isMobile ? 'text-center' : ''}`}>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-xl md:text-2xl font-bold">{name}</h1>
                {isPublic ? (
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 text-xs">
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 text-xs">
                    Privé
                  </Badge>
                )}
              </div>
              <p className="text-gray-500 text-sm">{username}</p>
            </div>
            
            <div className={`flex gap-2 ${isMobile ? 'mt-3 justify-center' : ''}`}>
              <Button size={isMobile ? "sm" : "default"} variant="outline" onClick={toggleSettings}>
                <Settings className="h-4 w-4 mr-1" />
                Paramètres
              </Button>
              <Button size={isMobile ? "sm" : "default"}>
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </Button>
            </div>
          </div>
          
          <div className={`mt-3 md:mt-4 ${isMobile ? 'text-center' : ''}`}>
            <p className="text-sm text-gray-700">{bio}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-gray-500 text-sm">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>France</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Depuis 2023</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                <span>Vérifié</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 mt-2">
        <div className="bg-white rounded-lg border p-2 md:p-3 text-center">
          <p className="text-base md:text-lg font-semibold text-gray-900">{stats.events || 0}</p>
          <p className="text-[10px] md:text-xs text-gray-500">Événements</p>
        </div>
        <div className="bg-white rounded-lg border p-2 md:p-3 text-center">
          <p className="text-base md:text-lg font-semibold text-gray-900">{stats.organized || 0}</p>
          <p className="text-[10px] md:text-xs text-gray-500">Organisés</p>
        </div>
        <div className="bg-white rounded-lg border p-2 md:p-3 text-center">
          <p className="text-base md:text-lg font-semibold text-gray-900">{stats.participated || 0}</p>
          <p className="text-[10px] md:text-xs text-gray-500">Participés</p>
        </div>
        <div className="bg-white rounded-lg border p-2 md:p-3 text-center">
          <p className="text-base md:text-lg font-semibold text-gray-900">{stats.photos || 0}</p>
          <p className="text-[10px] md:text-xs text-gray-500">Photos</p>
        </div>
        <div className="bg-white rounded-lg border p-2 md:p-3 text-center hidden md:block">
          <p className="text-lg font-semibold text-gray-900">{stats.friends || 0}</p>
          <p className="text-xs text-gray-500">Amis</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
