import React from 'react';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { BusinessDashboardHome } from '@/components/business/BusinessDashboardHome';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';

// Composant de debug temporaire
const DebugAuth = () => {
  const {
    user,
    profile,
    businessConfig,
    userType,
    isBusinessUser,
    loading
  } = useAuth();
  if (process.env.NODE_ENV !== 'development') return null;
  return;
};
const BusinessDashboard = () => {
  return <ErrorBoundary>
      <BusinessLayout>
        <DebugAuth />
        <BusinessDashboardHome />
      </BusinessLayout>
    </ErrorBoundary>;
};
export default BusinessDashboard;