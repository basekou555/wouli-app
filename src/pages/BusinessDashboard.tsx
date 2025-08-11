
import React from 'react';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { BusinessDashboardHome } from '@/components/business/BusinessDashboardHome';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';

// Composant de debug temporaire
const DebugAuth = () => {
  const { user, profile, businessConfig, userType, isBusinessUser, loading } = useAuth();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 mb-4 rounded-lg text-sm">
      <h3 className="font-bold text-yellow-800 mb-2">🔍 Debug Auth Business</h3>
      <div className="space-y-1 text-yellow-700">
        <p>Loading: {loading ? '⏳ En cours' : '✅ Terminé'}</p>
        <p>User ID: {user?.id?.slice(0, 8) || '❌ Non connecté'}</p>
        <p>Email: {user?.email || '—'}</p>
        <p>Profile Type: {profile?.type || '⚠️ Pas de profil'}</p>
        <p>User Type: {userType || 'null'}</p>
        <p>Is Business: {isBusinessUser ? '✅ OUI' : '❌ NON'}</p>
        <p>Business Config: {businessConfig ? `✅ ${businessConfig.client_name}` : '❌ Manquante'}</p>
      </div>
    </div>
  );
};

const BusinessDashboard = () => {
  return (
    <ErrorBoundary>
      <BusinessLayout>
        <DebugAuth />
        <BusinessDashboardHome />
      </BusinessLayout>
    </ErrorBoundary>
  );
};

export default BusinessDashboard;
