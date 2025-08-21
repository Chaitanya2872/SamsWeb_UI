import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/common/Button';
import { useNavigation } from '../hooks/useNavigation';

export const NotFoundPage: React.FC = () => {
  const { navigateToDashboard } = useNavigation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button onClick={navigateToDashboard} variant="primary">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};