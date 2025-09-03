import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
  onClick,
  children
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className="relative">
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onClick={onClick}
        onError={handleError}
      />
      {children}
    </div>
  );
};

export default ImageWithFallback;