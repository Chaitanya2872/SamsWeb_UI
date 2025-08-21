import React from 'react';
import { BackButton } from '../components/common/BackButton';
import { NavigationBreadcrumbs } from '../components/common/NavigationBreadcrumbs';
import { Button } from '../components/common/Button';

export const CreateStructurePage: React.FC = () => {

  const breadcrumbs = [
    { label: 'Structures', href: '/structures' },
    { label: 'Create New Structure', current: true }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <NavigationBreadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton to="/structures" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Structure</h1>
          <p className="text-gray-600">Fill in the details to create a new structure assessment</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Structure creation form will be implemented here</p>
            <Button variant="primary">
              Initialize Structure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
