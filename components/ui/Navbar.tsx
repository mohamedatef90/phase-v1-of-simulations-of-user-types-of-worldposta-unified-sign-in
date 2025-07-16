import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { User, AppNotification } from '@/types';
import { NotificationType } from '@/types';
import { Icon } from './Icon';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onToggleMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  sidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onToggleMobileSidebar, onToggleDesktopSidebar, sidebarCollapsed }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
          userMenuButtonRef.current && !userMenuButtonRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node) &&
          notificationsButtonRef.current && !notificationsButtonRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const mockNotifications: AppNotification[] = [
    { id: '1', type: NotificationType.INFO, message: 'Welcome to WorldPosta!', timestamp: new Date(Date.now() - 3600000) },
    { id: '2', type: NotificationType.SUCCESS, message: 'Your profile has been updated.', timestamp: new Date(Date.now() - 7200000) },
    { id: '3', type: NotificationType.WARNING, message: 'Billing due soon.', timestamp: new Date(Date.now() - 10800000) },
  ];
  
  const getNotificationIconName = (type: NotificationType) => {
    switch (type) {
        case NotificationType.INFO: return 'fas fa-info-circle';
        case NotificationType.SUCCESS: return 'fas fa-check-circle';
        case NotificationType.WARNING: return 'fas fa-exclamation-triangle';
        case NotificationType.ERROR: return 'fas fa-times-circle';
        case NotificationType.SECURITY: return 'fas fa-shield-halved';
        default: return 'fas fa-bell';
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-800 text-[#293c51] dark:text-gray-200 shadow-md dark:shadow-slate-900/50 sticky top-0 z-40 w-full">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button
              onClick={onToggleDesktopSidebar}
              className="mr-2 text-gray-500 dark:text-gray-400 hover:text-[#679a41] dark:hover:text-emerald-400 hidden lg:block"
              aria-label="Toggle desktop sidebar"
            >
              <Icon name={sidebarCollapsed ? "fas fa-angles-right" : "fas fa-angles-left"} className="text-xl" />
            </button>
            <button
              onClick={onToggleMobileSidebar}
              className="mr-2 text-gray-500 dark:text-gray-400 hover:text-[#679a41] dark:hover:text-emerald-400 lg:hidden"
              aria-label="Toggle mobile sidebar"
            >
              <Icon name="fas fa-bars" className="text-xl" />
            </button>
          </div>

          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="fas fa-search" className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Instant Search..."
                className="block w-full bg-gray-100 dark:bg-slate-700 text-[#293c51] dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border border-transparent rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                ref={notificationsButtonRef}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-[#679a41] dark:hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[#679a41] dark:focus:ring-emerald-400"
                aria-haspopup="true"
                aria-expanded={notificationsOpen}
              >
                <Icon name="far fa-bell" className="text-xl" />
                {mockNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex justify-center items-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-semibold">
                    {mockNotifications.length}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div ref={notificationsRef} className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none text-[#293c51] dark:text-gray-200">
                  <div className="px-4 py-2 font-semibold border-b dark:border-slate-600">Notifications</div>
                  {mockNotifications.length > 0 ? (
                    mockNotifications.slice(0, 3).map(notif => (
                      <a key={notif.id} href="#" className="flex items-start px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                        <Icon name={getNotificationIconName(notif.type)} className={`mr-3 mt-1 ${
                            notif.type === NotificationType.ERROR ? 'text-red-500' : 
                            notif.type === NotificationType.WARNING ? 'text-yellow-500' : 
                            notif.type === NotificationType.SECURITY ? 'text-purple-500' :
                             notif.type === NotificationType.SUCCESS ? 'text-green-500' :
                            'text-blue-500'
                        }`} fixedWidth />
                        <div className="flex-grow">
                            <p className={`font-medium ${
                                notif.type === NotificationType.ERROR ? 'text-red-600 dark:text-red-400' : 
                                notif.type === NotificationType.WARNING ? 'text-yellow-600 dark:text-yellow-400' : 
                                notif.type === NotificationType.SECURITY ? 'text-purple-600 dark:text-purple-400' :
                                notif.type === NotificationType.SUCCESS ? 'text-green-600 dark:text-green-400' :
                                'text-blue-600 dark:text-blue-400' 
                            }`}>
                            {notif.type.toUpperCase()}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 truncate">{notif.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{notif.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </a>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No new notifications.</p>
                  )}
                   <Link to="/app/notifications" onClick={() => { setNotificationsOpen(false); }} className="block text-center px-4 py-2 text-sm text-[#679a41] dark:text-emerald-400 hover:bg-gray-100 dark:hover:bg-slate-600 border-t dark:border-slate-600">
                      View all notifications
                    </Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                ref={userMenuButtonRef}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[#679a41] dark:focus:ring-emerald-400"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                {user?.avatarUrl ? (
                  <img className="h-8 w-8 rounded-full" src={user.avatarUrl} alt="User avatar" />
                ) : (
                  <Icon name="fas fa-user-circle" className="h-8 w-8 text-gray-500 dark:text-gray-400 text-3xl" />
                )}
                <span className="ml-2 hidden md:inline text-[#293c51] dark:text-gray-200">{user?.displayName || user?.fullName || 'User'}</span>
                <Icon name="fas fa-chevron-down" className={`ml-1 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 text-xs ${userMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>
              {userMenuOpen && (
                <div ref={userMenuRef} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none text-[#293c51] dark:text-gray-200">
                  <Link to="/app/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                    <Icon name="fas fa-user-circle" className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> Profile
                  </Link>
                  <Link to="/app/settings/account" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                    <Icon name="fas fa-cog" className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> Account Settings
                  </Link>
                   {user?.role === 'customer' && (
                    <>
                      <Link to="/app/billing" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                        <Icon name="far fa-credit-card" className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> Subscriptions
                      </Link>
                      <Link to="/app/support" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                        <Icon name="fas fa-headset" className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> Support
                      </Link>
                    </>
                   )}
                  <button
                    onClick={() => { onLogout(); setUserMenuOpen(false); }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600 text-red-600 dark:text-red-400"
                  >
                    <Icon name="fas fa-sign-out-alt" className="w-5 h-5 mr-2" fixedWidth /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
