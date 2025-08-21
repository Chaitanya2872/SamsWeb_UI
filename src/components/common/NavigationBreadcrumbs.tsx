import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useNavigation } from '../../hooks/useNavigation';

interface Breadcrumb {
  label: string;
  href?: string;
  current?: boolean;
}

interface NavigationBreadcrumbsProps {
  items: Breadcrumb[];
  className?: string;
}

export const NavigationBreadcrumbs: React.FC<NavigationBreadcrumbsProps> = ({ 
  items, 
  className = '' 
}) => {
  const { navigateTo } = useNavigation();

  const allItems = [
    { label: 'Dashboard', href: '/dashboard' },
    ...items
  ];

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        <li>
          <div>
            <button
              onClick={() => navigateTo('/dashboard')}
              className="text-gray-400 hover:text-gray-500"
            >
              <HomeIcon className="h-5 w-5 flex-shrink-0" />
              <span className="sr-only">Dashboard</span>
            </button>
          </div>
        </li>
        {allItems.slice(1).map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
              {item.href && !item.current ? (
                <Link
                  to={item.href}
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="ml-4 text-sm font-medium text-gray-500">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};