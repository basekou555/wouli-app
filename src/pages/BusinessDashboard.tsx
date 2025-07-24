
import React from 'react';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { BusinessDashboardHome } from '@/components/business/BusinessDashboardHome';
import ErrorBoundary from '@/components/ErrorBoundary';

const BusinessDashboard = () => {
  return (
    <ErrorBoundary>
      <BusinessLayout>
        <BusinessDashboardHome />
      </BusinessLayout>
    </ErrorBoundary>
  );
};

export default BusinessDashboard;
