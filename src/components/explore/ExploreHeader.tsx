
import React from 'react';

interface ExploreHeaderProps {}

const ExploreHeader: React.FC<ExploreHeaderProps> = () => {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-2xl font-bold text-gray-900">Découvrir</h1>
      <p className="text-gray-500">Trouvez de nouvelles activités qui pourraient vous plaire</p>
    </div>
  );
};

export default ExploreHeader;
