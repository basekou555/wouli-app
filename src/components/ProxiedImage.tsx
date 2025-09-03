import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ProxiedImageProps {
  src?: string;
  alt: string;
  className?: string;
  eventId?: string;
  fallback?: string;
}

const ProxiedImage: React.FC<ProxiedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  eventId,
  fallback = "https://picsum.photos/400/400?random=event"
}) => {
  const [imageSrc, setImageSrc] = useState<string>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      if (!src) {
        setImageSrc(fallback);
        setLoading(false);
        return;
      }

      // Si c'est déjà une URL Supabase ou une URL locale, l'utiliser directement
      if (src.includes('supabase.co') || src.includes('picsum.photos') || src.startsWith('data:')) {
        setImageSrc(src);
        setLoading(false);
        return;
      }

      // Si c'est une URL Instagram, la proxifier
      if (src.includes('instagram.com') || src.includes('fbcdn.net')) {
        try {
          const { data, error } = await supabase.functions.invoke('proxy-image', {
            body: { imageUrl: src, eventId }
          });

          if (!error && data?.url) {
            setImageSrc(data.url);
          } else {
            console.warn('Failed to proxy image:', error);
            setImageSrc(fallback);
          }
        } catch (err) {
          console.error('Error proxying image:', err);
          setImageSrc(fallback);
        }
      } else {
        setImageSrc(src);
      }
      setLoading(false);
    };

    loadImage();
  }, [src, eventId, fallback]);

  if (loading) {
    return <Skeleton className={className} />;
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt}
      className={className}
      onError={() => setImageSrc(fallback)}
    />
  );
};

export default ProxiedImage;