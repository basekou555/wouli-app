
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit3, MapPin, Star, Building, Globe, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BusinessConfig {
  client_name: string;
  client_type: string;
  location: string;
  brand_color: string;
  features: string[];
  username?: string;
  bio?: string;
  website?: string;
  phone?: string;
  avatar_url?: string;
  city?: string;
}

interface BusinessProfileProps {
  config: BusinessConfig;
  eventsCount: number;
}

const BusinessProfile = ({ config, eventsCount }: BusinessProfileProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Informations principales */}
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={config.avatar_url} alt={config.client_name} />
              <AvatarFallback 
                className="text-white font-bold text-2xl"
                style={{ backgroundColor: config.brand_color }}
              >
                {config.client_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{config.client_name}</h1>
              <p className="text-lg text-gray-600 mt-1">{config.client_type}</p>
              
              <div className="flex items-center mt-2 text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{config.city || config.location}, France</span>
              </div>

              {config.bio && (
                <p className="text-sm text-gray-600 mt-2 max-w-2xl">{config.bio}</p>
              )}

              <div className="flex items-center gap-4 mt-3">
                {config.website && (
                  <a 
                    href={config.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Site web
                  </a>
                )}
                {config.phone && (
                  <a 
                    href={`tel:${config.phone}`}
                    className="flex items-center text-sm text-green-600 hover:text-green-800"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    {config.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/profile-settings')}
              className="flex items-center"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Modifier le profil
            </Button>
          </div>
        </div>

        {/* Badges et statuts */}
        <div className="flex flex-wrap gap-2 mt-6">
          <span 
            className="px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: config.brand_color }}
          >
            Partenaire Wouli
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Actif
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {eventsCount} événement{eventsCount > 1 ? 's' : ''} actif{eventsCount > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
