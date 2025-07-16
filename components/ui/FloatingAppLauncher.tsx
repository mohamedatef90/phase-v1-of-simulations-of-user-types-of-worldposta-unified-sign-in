import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NavItem, ApplicationCardData } from '@/types';
import { Icon } from './Icon';

interface FloatingAppLauncherProps {
  navItems: NavItem[];
  appItems: ApplicationCardData[];
}

export const FloatingAppLauncher: React.FC<FloatingAppLauncherProps> = ({ navItems, appItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLinkClick = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
    setIsOpen(false);
  };

  const AppGridItem: React.FC<{
    iconName: string;
    name: string;
    onClick: () => void;
  }> = ({ iconName, name, onClick }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 text-center rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group"
    >
      {iconName.startsWith('http') || iconName.startsWith('/') ? (
        <img src={iconName} alt={`${name} icon`} className="h-10 w-10 mb-2 object-contain" />
      ) : (
        <div className="h-10 w-10 mb-2 flex items-center justify-center">
            <Icon name={iconName} className="text-3xl text-[#679a41] dark:text-emerald-400" />
        </div>
      )}
      <span className="text-xs font-medium text-gray-700 dark:text-gray-200 group-hover:text-[#679a41] dark:group-hover:text-emerald-400">{name}</span>
    </button>
  );

  const settingsItem: NavItem = { name: 'Settings', path: '/app/settings', iconName: 'fas fa-cog' };
  const filteredNavItems = navItems.filter(item => item.name !== 'Subscriptions');
  const quickLinkItems = [...filteredNavItems, settingsItem];

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-[80px] right-0 z-50 bg-[#f8f8f8] dark:bg-slate-800 border-l border-t border-b border-gray-200 dark:border-slate-700 text-[#679a41] dark:text-emerald-400 py-4 px-2 rounded-l-lg shadow-lg hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-[#679a41]/50 dark:focus:ring-emerald-400/50 transition-all duration-200 transform hover:scale-105"
          aria-label="Open application launcher"
        >
          <Icon name="fas fa-rocket" className="text-2xl" />
        </button>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[59]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#f8f8f8] dark:bg-slate-800 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-launcher-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <h2 id="app-launcher-title" className="text-lg font-semibold text-[#293c51] dark:text-gray-100">
            Applications & Links
          </h2>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close menu">
            <Icon name="fas fa-times" className="text-xl" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          <section>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Applications</h3>
            <div className="grid grid-cols-3 gap-3">
              {appItems.map(item => (
                <AppGridItem
                  key={item.id}
                  iconName={item.iconName}
                  name={item.name}
                  onClick={() => handleLinkClick(item.launchUrl)}
                />
              ))}
              {quickLinkItems.map(item => (
                <AppGridItem
                  key={item.name}
                  iconName={item.iconUrl || item.iconName || 'fas fa-link'}
                  name={item.name}
                  onClick={() => handleLinkClick(item.path)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};
