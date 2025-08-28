import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface DistanceBadgeProps {
  eventLocation?: string;
  eventAddress?: string;
  className?: string;
}

const DistanceBadge: React.FC<DistanceBadgeProps> = ({ 
  eventLocation, 
  eventAddress,
  className = '' 
}) => {
  const [distance, setDistance] = React.useState<string | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const calculateDistance = async () => {
      try {
        if (!navigator.geolocation) {
          return;
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 300000, // 5 minutes cache
            enableHighAccuracy: false
          });
        });

        // Mock distance calculation (in real app, use geocoding API)
        const mockDistance = Math.floor(Math.random() * 25) + 1;
        const timeEstimate = mockDistance < 10 ? `${mockDistance * 2} min` : `${mockDistance} km`;
        
        setDistance(timeEstimate);
      } catch (err) {
        setError(true);
      }
    };

    calculateDistance();
  }, [eventLocation, eventAddress]);

  if (error || !distance) return null;

  return (
    <Badge 
      variant="outline" 
      className={`text-xs bg-background/90 backdrop-blur border-border text-muted-foreground ${className}`}
    >
      <MapPin className="w-3 h-3 mr-1" />
      {distance}
    </Badge>
  );
};

export default DistanceBadge;