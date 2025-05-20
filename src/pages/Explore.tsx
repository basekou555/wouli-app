
import React from 'react';
import AppLayout from '../components/AppLayout';

const Explore: React.FC = () => {
  return (
    <AppLayout>
      <div className="py-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Explore</h1>
        <p className="text-gray-500">
          Discover events and connect with people near you.
        </p>
      </div>
    </AppLayout>
  );
};

export default Explore;
