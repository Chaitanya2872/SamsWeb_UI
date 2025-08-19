import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  UsersIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navigation: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Structures',
    href: '/structures',
    icon: BuildingOfficeIcon,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: DocumentTextIcon,
  },
  {
    name: 'Files',
    href: '/files',
    icon: FolderIcon,
  },
  {
    name: 'Users',
    href: '/users',
    icon: UsersIcon,
    roles: ['AD'], // Admin only
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const hasAccess = (item: SidebarItem): boolean => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some(role => 
      user?.roles?.includes(role as any) || user?.role === role
    );
  };

  const filteredNavigation = navigation.filter(hasAccess);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          {
            'translate-x-0': isOpen,
            '-translate-x-full': !isOpen,
          }
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 lg:hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href || 
                               (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition',
                    {
                      'bg-blue-50 text-blue-700 border-r-2 border-blue-700': isActive,
                      'text-gray-700 hover:bg-gray-50 hover:text-gray-900': !isActive,
                    }
                  )}
                >
                  <item.icon 
                    className={clsx('h-5 w-5', {
                      'text-blue-700': isActive,
                      'text-gray-400': !isActive,
                    })} 
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p>Version 1.0.0</p>
              <p className="mt-1">© 2024 StructureIQ</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};