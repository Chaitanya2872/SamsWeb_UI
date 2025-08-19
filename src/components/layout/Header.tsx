import React, { useState, useRef, type Ref } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useClickOutside } from '../../hooks/useLocalStorage';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileMenuRef, () => setIsProfileMenuOpen(false));

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
  };

  const getUserDisplayName = () => {
    if (user?.profile?.first_name || user?.profile?.last_name) {
      return `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim();
    }
    return user?.username || 'User';
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      AD: 'Administrator',
      TE: 'Technical Engineer',
      VE: 'Verification Engineer',
      FE: 'Field Engineer',
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">StructureIQ</h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="outline" size="sm" className="relative">
              <BellIcon className="h-4 w-4" />
              <Badge 
                variant="red" 
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs px-1 py-0"
              >
                3
              </Badge>
            </Button>
            {/* User Profile Menu */}
            <div className="relative" ref={profileMenuRef as Ref<HTMLDivElement>}>
              <Button
                variant="outline"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2"
              >
                <UserCircleIcon className="h-5 w-5" />
                <span className="hidden sm:block">{getUserDisplayName()}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </Button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-medium text-gray-900">{getUserDisplayName()}</div>
                    <div className="text-sm text-gray-600">{user?.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="blue" size="sm">
                        {getRoleDisplayName(user?.role || '')}
                      </Badge>
                      {user?.roles && user.roles.length > 1 && (
                        <span className="text-xs text-gray-500">
                          +{user.roles.length - 1} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserCircleIcon className="h-4 w-4" />
                      Profile Settings
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="h-4 w-4" />
                      Preferences
                    </Link>
                    
                    <hr className="my-2" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};