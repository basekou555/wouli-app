
import React from 'react';
import AdminMenu from '@/components/AdminMenu';
import ValidationInterface from '@/pages/ValidationInterface';

const AdminValidationPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <AdminMenu />
      <ValidationInterface />
    </div>
  );
};

export default AdminValidationPage;
