import React, { useState } from 'react';

interface EventImageCarouselProps {
  images: string[];
  title: string;
}

const EventImageCarousel: React.FC<EventImageCarouselProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!images || images.length === 0) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="opacity-80">Image à venir</p>
        </div>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <img 
        src={images[0]} 
        className="w-full h-full object-cover"
        alt={title}
      />
    );
  }

  const imageLabels = ["L'événement", "Le lieu", "L'ambiance"];

  return (
    <div className="relative h-full">
      <div 
        className="flex h-full snap-x snap-mandatory overflow-x-auto scrollbar-hide"
        onScroll={(e) => {
          const scrollLeft = e.currentTarget.scrollLeft;
          const itemWidth = e.currentTarget.offsetWidth;
          const newIndex = Math.round(scrollLeft / itemWidth);
          setCurrentIndex(newIndex);
        }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
            <img 
              src={img} 
              className="w-full h-full object-cover" 
              alt={imageLabels[idx] || `Image ${idx + 1}`}
            />
            {/* Label sur image */}
            <span className="absolute bottom-4 left-4 bg-black/70 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-medium">
              {imageLabels[idx] || `Image ${idx + 1}`}
            </span>
          </div>
        ))}
      </div>
      
      {/* Indicateurs */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-opacity ${
                i === currentIndex ? 'bg-white' : 'bg-white/50'
              }`} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventImageCarousel;