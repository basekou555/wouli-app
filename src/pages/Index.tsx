
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers le dashboard
    navigate('/dashboard');
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="text-3xl font-bold text-wouli-blue mb-4">Wouli</div>
        <p className="text-gray-600">Chargement de l'application...</p>
      </div>
    </div>
  );
};

export default Index;
