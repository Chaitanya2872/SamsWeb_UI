import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  BuildingOfficeIcon,
  PlusCircleIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Structures', href: '/structures', icon: BuildingOfficeIcon },
  { name: 'Create Structure', href: '/structures/create', icon: PlusCircleIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

const adminNavigation = [
  { name: 'Admin Panel', href: '/admin', icon: Cog6ToothIcon },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.roles?.includes('AD') || user?.role === 'AD';

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-sm">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <BuildingOfficeIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">SAMS</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`
              group flex items-center px-3 py-2 text-sm font-medium rounded-md
              ${isActive(item.href)
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <item.icon
              className={`
                mr-3 h-5 w-5 flex-shrink-0
                ${isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
              `}
            />
            {item.name}
          </Link>
        ))}

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administration
            </div>
            <div className="mt-2 space-y-1">
              {adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};