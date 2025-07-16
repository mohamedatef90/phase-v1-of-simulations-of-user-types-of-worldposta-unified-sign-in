import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon, FormField, Button, ToggleSwitch, DoughnutChart, FloatingAppLauncher } from '@/components/ui';
import { useAuth } from '@/context';
import type { NavItem, ApplicationCardData } from '@/types';
import type { User } from '@/types';

const getAppLauncherItems = (role: User['role'] | undefined): ApplicationCardData[] => {
    const baseApps: ApplicationCardData[] = [
        {
            id: 'website',
            name: 'WorldPosta.com',
            description: 'Visit the main WorldPosta website for news and service information.',
            iconName: 'https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%201.png',
            launchUrl: '/'
        },
        { 
            id: 'cloudedge', 
            name: 'CloudEdge', 
            description: 'Manage your cloud infrastructure, VMs, and network resources efficiently.',
            iconName: "https://console.worldposta.com/assets/loginImgs/edgeLogo.png", 
            launchUrl: '/app/cloud-edge' 
        },
        { 
            id: 'emailadmin', 
            name: 'Email Admin Suite', 
            description: 'Administer your email services, mailboxes, users, and domains with ease.',
            iconName: "https://www.worldposta.com/assets/Posta-Logo.png", 
            launchUrl: 'https://tools.worldposta.com/login'
        }
    ];

    if (role === 'customer') {
        return baseApps;
    }
    if (role === 'admin') {
        return [
            { id: 'customers', name: 'Customers', description: 'Search, manage, and view customer accounts.', iconName: 'fas fa-users', launchUrl: '/app/admin/users' },
            { id: 'billing', name: 'Billing Overview', description: 'Access and manage billing for all customer accounts.', iconName: 'fas fa-cash-register', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    if (role === 'reseller') {
        return [
            { id: 'customers', name: 'My Customers', description: 'Access and manage your customer accounts.', iconName: 'fas fa-user-friends', launchUrl: '/app/reseller/customers' },
            { id: 'billing', name: 'Reseller Billing', description: 'Manage your billing, commissions, and payment history.', iconName: 'fas fa-file-invoice-dollar', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    return baseApps;
};

const CloudEdgeSidebar: React.FC = () => {
    const location = useLocation();
    const sidebarNavItems = [
        { name: 'Dashboard', icon: 'fas fa-th-large', path: '/app/cloud-edge' },
        { name: 'Administration', icon: 'fas fa-user-shield', path: '#', collapsible: true },
        { name: 'Organizations (worldposta)', icon: 'fas fa-sitemap', path: '#', collapsible: true },
        { name: 'Virtual Machines', icon: 'fas fa-desktop', path: '#' },
        { name: 'Reservations', icon: 'fas fa-calendar-check', path: '#' },
        { name: 'Gateways', icon: 'fas fa-dungeon', path: '#' },
        { name: 'NATs', icon: 'fas fa-random', path: '#' },
        { name: 'Route', icon: 'fas fa-route', path: '#', collapsible: true },
        { name: 'VPN', icon: 'fas fa-user-secret', path: '#', collapsible: true },
        { name: 'Reserved IP', icon: 'fas fa-map-marker-alt', path: '#' },
        { name: 'Firewall', icon: 'fas fa-fire-alt', path: '#' },
        { name: 'Backup', icon: 'fas fa-save', path: '#', collapsible: true },
        { name: 'Scheduled Tasks', icon: 'fas fa-calendar-alt', path: '#', collapsible: true },
        { name: 'Running Tasks', icon: 'fas fa-tasks', path: '#' },
    ];

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 p-2 flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-slate-700 mb-2 flex-shrink-0">
                <img src="https://console.worldposta.com/assets/loginImgs/edgeLogo.png" alt="CloudEdge Logo" className="h-6" />
                <Link to="/app/dashboard" title="Exit CloudEdge" className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    <Icon name="fas fa-sign-out-alt" className="transform rotate-180" />
                </Link>
            </div>
            <nav className="flex-grow space-y-1 overflow-y-auto">
                {sidebarNavItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link to={item.path} key={item.name} className={`flex justify-between items-center px-3 py-3 text-base rounded-md transition-colors ${isActive ? 'bg-gray-200/60 dark:bg-slate-700/80 font-semibold text-[#293c51] dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-300'}`}>
                            <div className="flex items-center">
                                <Icon name={item.icon} className="w-5 mr-3 text-[#679a41] dark:text-emerald-400" />
                                <span>{item.name}</span>
                            </div>
                            {item.collapsible && <Icon name="fas fa-chevron-right" className="w-4 h-4 text-xs text-gray-400" />}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    );
};

const CloudEdgeTopBar: React.FC = () => {
    const { user } = useAuth();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [cloudSearchTerm, setCloudSearchTerm] = useState('');
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
                userMenuButtonRef.current && !userMenuButtonRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white dark:bg-slate-800 p-4 flex justify-between items-center flex-shrink-0">
            <div className="flex-1 max-w-sm">
                <FormField id="cloud-search" label="" placeholder="Search..." value={cloudSearchTerm} onChange={(e) => setCloudSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center space-x-4">
                 <Button variant="ghost" className="hidden sm:inline-flex items-center">
                    <Icon name="fas fa-building" className="mr-2" />
                    Worldposta
                    <Icon name="fas fa-chevron-down" className="ml-2 text-xs" />
                </Button>
                <div className="relative">
                    <button
                        ref={userMenuButtonRef}
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[#679a41] dark:focus:ring-emerald-400"
                        aria-haspopup="true" aria-expanded={userMenuOpen}
                    >
                        {user?.avatarUrl ? (
                            <img className="h-8 w-8 rounded-full" src={user.avatarUrl} alt="User avatar" />
                        ) : (
                            <Icon name="fas fa-user-circle" className="h-8 w-8 text-gray-500 dark:text-gray-400 text-3xl" />
                        )}
                        <span className="ml-2 hidden md:inline text-[#293c51] dark:text-gray-200">Hello, {user?.displayName || 'Mine'}</span>
                        <Icon name="fas fa-chevron-down" className={`ml-1 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 text-xs ${userMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                    {userMenuOpen && (
                        <div ref={userMenuRef} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none text-[#293c51] dark:text-gray-200 z-10">
                            <Link to="/app/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                                <Icon name="fas fa-user-circle" className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> Profile
                            </Link>
                            <Link to="/app/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                                <Icon name="fas fa-sign-out-alt" className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> Exit CloudEdge
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export const CloudEdgeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    
    const userNavItems: NavItem[] = [
        { name: 'Dashboard', path: '/app/dashboard', iconName: 'fas fa-th-large' },
        { name: 'Profile', path: '/app/profile', iconName: 'fas fa-user-circle' },
        { name: 'Settings', path: '/app/settings', iconName: 'fas fa-cog' },
    ];

    const appLauncherItems = getAppLauncherItems(user?.role);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden">
            <CloudEdgeSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <CloudEdgeTopBar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {children}
                </main>
            </div>
            <FloatingAppLauncher navItems={userNavItems} appItems={appLauncherItems} />
        </div>
    );
};
