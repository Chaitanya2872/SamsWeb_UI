import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Button } from '../common/Button';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="bg-white shadow-md"
        >
          <Bars3Icon className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64">
        <Header />
        
        <main className="flex-1">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};