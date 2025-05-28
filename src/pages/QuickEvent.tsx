
import React from 'react';
import AppLayout from '../components/AppLayout';
import QuickEventCreation from '../components/QuickEventCreation';

const QuickEventPage = () => {
  return (
    <AppLayout>
      <div className="py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Créer un événement en 30 secondes</h1>
        <QuickEventCreation />
      </div>
    </AppLayout>
  );
};

export default QuickEventPage;
