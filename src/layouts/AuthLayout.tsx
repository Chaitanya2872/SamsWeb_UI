import React from 'react';
import { Outlet } from 'react-router-dom';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SAMS</h1>
              <p className="text-sm text-gray-600">Structure Assessment Management System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Outlet />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="text-xs text-gray-500 space-y-2">
          <p>&copy; 2024 SAMS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};