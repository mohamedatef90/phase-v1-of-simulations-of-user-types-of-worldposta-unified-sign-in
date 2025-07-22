

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet, useSearchParams } from 'react-router-dom';
import { AuthProvider, ThemeProvider, useAuth, AppLayoutContext } from '@/context';
import type { User, AuthContextType, NavItem, UserGroup, ApplicationCardData } from '@/types';
import { Navbar, Sidebar, Spinner, Breadcrumbs, Footer, Icon, FloatingAppLauncher } from '@/components/ui'; 
import { getMockUserById } from '@/data';
import { 
    LandingPage, 
    LoginPage, 
    SignupPage, 
    EmailVerificationPage, 
    DashboardPage,
    AdminDashboardPage,
    ResellerDashboardPage,
    UserManagementPage,
    ResellerCustomersPage,
    StaffManagementPage,
    AdminRouterPage,
    InvoiceRouterPage,
    SettingsRouterPage,
    ProfilePage,
    AccountSettingsPage,
    SecuritySettingsPage,
    NotificationSettingsPage,
    SystemSettingsPage,
    BillingSettingsPage,
    EmailConfigurationsPage,
    InvoiceHistoryPage,
    InvoiceDetailPage,
    ActionLogsPage,
    CustomerTeamManagementPage,
    AddTeamUserPage,
    EditTeamUserPage,
    ResellerProgramPage,
    SupportPage,
    NotFoundPage,
    AllNotificationsPage,
    CloudEdgeLayout,
    CloudEdgeDashboardPage,
    EmailAdminSubscriptionsPage,
    CloudEdgeConfigurationsPage,
    PostaPricingPage
} from '@/pages';


const ProtectedRoute: React.FC<{
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    allowedRoles?: User['role'][];
}> = ({ user, isAuthenticated, isLoading, allowedRoles }) => {
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="w-full h-screen flex justify-center items-center bg-gray-100 dark:bg-slate-900">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/app/dashboard" replace />;
    }

    return <Outlet />;
};

const getNavItems = (role: User['role']): NavItem[] => {
  switch (role) {
    case 'admin':
      return [
        { name: 'Dashboard', path: '/app/admin-dashboard', iconName: 'fas fa-tachometer-alt' },
        { name: 'Customers', path: '/app/admin/users', iconName: 'fas fa-users' },
        { name: 'Staff', path: '/app/admin/staff', iconName: 'fas fa-user-tie' },
        { name: 'Subscriptions', path: '/app/billing', iconName: 'fas fa-file-invoice-dollar' },
        { name: 'System', path: '/app/admin/system', iconName: 'fas fa-cogs' },
      ];
    case 'reseller':
      return [
        { name: 'Dashboard', path: '/app/reseller-dashboard', iconName: 'fas fa-tachometer-alt' },
        { name: 'My Customers', path: '/app/reseller/customers', iconName: 'fas fa-user-friends' },
        { name: 'My Program', path: '/app/reseller/program', iconName: 'fas fa-award' },
        { name: 'Subscriptions', path: '/app/billing', iconName: 'fas fa-file-invoice-dollar' },
        { name: 'Support', path: '/app/support', iconName: 'fas fa-headset' },
      ];
    case 'customer':
    default:
      return [
        { name: 'Dashboard', path: '/app/dashboard', iconName: 'fas fa-home' },
        { name: 'Team Management', path: '/app/team-management', iconName: 'fas fa-users-cog' },
      ];
  }
};

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


const AppLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });
    const [isSearchPanelOpen, setSearchPanelOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(isDesktopSidebarCollapsed));
    }, [isDesktopSidebarCollapsed]);
    
    const navItems = useMemo(() => {
        const viewAsUserId = searchParams.get('viewAsUser');
        const returnTo = searchParams.get('returnTo');
        
        // If in "View As" mode, show the customer's navigation items and append query params.
        if (viewAsUserId && returnTo && user && (user.role === 'admin' || user.role === 'reseller')) {
            const customerNavs = getNavItems('customer');
            return customerNavs.map(item => ({
                ...item,
                path: `${item.path}?viewAsUser=${viewAsUserId}&returnTo=${encodeURIComponent(returnTo)}`
            }));
        }
        
        // Otherwise, show the logged-in user's navigation items.
        return user ? getNavItems(user.role) : [];
    }, [user, searchParams]);
    
    const appLauncherItems = useMemo(() => getAppLauncherItems(user?.role), [user]);

    const breadcrumbItems = useMemo(() => {
        const viewAsUserId = searchParams.get('viewAsUser');
        const returnToPath = searchParams.get('returnTo');
        const pathnames = location.pathname.split('/').filter(x => x);

        const BREADCRUMB_LABELS: { [key: string]: string } = {
            'admin': 'Admin',
            'users': 'Customer Management',
            'staff': 'Staff Management',
            'system': 'System Settings',
            'team-management': 'User Management',
            'add': 'Add User',
            'edit': 'Edit User',
            'billing': 'Billing',
            'email-subscriptions': 'Email Subscriptions',
            'email-configurations': 'Email Configurations',
            'cloudedge-configurations': 'CloudEdge Configurations',
            'invoices': 'Invoices',
            'action-logs': 'Action Logs',
            'support': 'Support',
            'settings': 'Settings',
            'account': 'Account Settings',
            'security': 'Security Settings',
            'notifications': 'Notifications',
            'reseller': 'Reseller',
            'customers': 'My Customers',
            'program': 'My Program',
        };
        
        const getLabel = (value: string) => {
            return BREADCRUMB_LABELS[value] || value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        };

        // "View As" mode breadcrumbs for admin/reseller
        if (viewAsUserId && returnToPath && user && (user.role === 'admin' || user.role === 'reseller')) {
            const viewedUser = getMockUserById(viewAsUserId);
            if (!viewedUser) return [];

            const adminHomePath = user.role === 'admin' ? '/app/admin-dashboard' : '/app/reseller-dashboard';
            const crumbs = [{ label: 'Dashboard', path: adminHomePath }];

            let returnLabel = getLabel(returnToPath.split('/').pop() || '');
            crumbs.push({ label: returnLabel, path: returnToPath });
            
            const customerDashboardPath = `/app/dashboard?viewAsUser=${viewAsUserId}&returnTo=${encodeURIComponent(returnToPath)}`;
            crumbs.push({ label: viewedUser.fullName, path: customerDashboardPath });
            
            pathnames.slice(1).forEach((value, index) => {
                if (value === 'dashboard') return; 

                const to = `/app/${pathnames.slice(1, index + 2).join('/')}?viewAsUser=${viewAsUserId}&returnTo=${encodeURIComponent(returnToPath)}`;
                const label = getLabel(value);
                crumbs.push({ label, path: to });
            });
            
            if (crumbs.length > 1) {
                delete crumbs[crumbs.length - 1].path;
            }

            return crumbs;
        }

        // Original breadcrumb logic for other cases
        if (pathnames[0] !== 'app') return [];

        let homePath = '/app/dashboard';
        if (user?.role === 'admin') homePath = '/app/admin-dashboard';
        if (user?.role === 'reseller') homePath = '/app/reseller-dashboard';

        const crumbs = [{ label: 'Dashboard', path: homePath }];
        
        pathnames.slice(1).forEach((value, index) => {
            if (value === 'admin' || value.endsWith('-dashboard')) return;

            const to = `/app/${pathnames.slice(1, index + 2).join('/')}`;
            const label = getLabel(value);
            if (label !== 'Dashboard' && label !== 'App') {
                 crumbs.push({ label, path: to });
            }
        });

        if (crumbs.length > 1) {
            delete crumbs[crumbs.length - 1].path;
        }

        return crumbs;
    }, [location, user, searchParams]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Special layout for CloudEdge
    if (location.pathname.startsWith('/app/cloud-edge')) {
        return (
            <CloudEdgeLayout>
                <Outlet />
            </CloudEdgeLayout>
        );
    }
    
    const appLayoutContextValue = {
        setSearchPanelOpen,
    };

    return (
        <AppLayoutContext.Provider value={appLayoutContextValue}>
            <div className={`flex h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden`}>
                <Sidebar 
                    navItems={navItems}
                    isOpen={isMobileSidebarOpen}
                    isCollapsed={isDesktopSidebarCollapsed}
                    onClose={() => setMobileSidebarOpen(false)}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar
                        user={user}
                        onLogout={logout}
                        onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
                        onToggleDesktopSidebar={() => setDesktopSidebarCollapsed(prev => !prev)}
                        sidebarCollapsed={isDesktopSidebarCollapsed}
                    />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <Breadcrumbs items={breadcrumbItems} />
                        <Outlet />
                    </main>
                </div>
                 {!isSearchPanelOpen && <FloatingAppLauncher navItems={navItems} appItems={appLauncherItems} />}
            </div>
        </AppLayoutContext.Provider>
    );
};


const AppIndexRedirect: React.FC = () => {
    const { user } = useAuth();
  
    // This component is rendered within ProtectedRoute, so user should exist.
    if (!user) {
      // This is a fallback, should not be reached in normal flow.
      return <Navigate to="/login" replace />; 
    }
  
    switch (user.role) {
      case 'admin':
        return <Navigate to="/app/admin-dashboard" replace />;
      case 'reseller':
        return <Navigate to="/app/reseller-dashboard" replace />;
      case 'customer':
      default:
        return <Navigate to="/app/dashboard" replace />;
    }
};

const AppRoutes: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/email-verification" element={<EmailVerificationPage />} />
            <Route path="/posta-pricing" element={<PostaPricingPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute user={user} isAuthenticated={isAuthenticated} isLoading={isLoading} />}>
                <Route path="/app" element={<AppLayout />}>
                    <Route index element={<AppIndexRedirect />} />
                    
                    {/* Customer Routes */}
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="billing" element={<BillingSettingsPage />} />
                    <Route path="billing/email-subscriptions" element={<EmailAdminSubscriptionsPage />} />
                    <Route path="billing/email-configurations" element={<EmailConfigurationsPage />} />
                    <Route path="billing/cloudedge-configurations" element={<CloudEdgeConfigurationsPage />} />
                    <Route path="invoices" element={<InvoiceRouterPage />}>
                        <Route index element={<InvoiceHistoryPage />} />
                        <Route path=":invoiceId" element={<InvoiceDetailPage />} />
                    </Route>
                    <Route path="action-logs" element={<ActionLogsPage />} />
                    <Route path="team-management">
                        <Route index element={<CustomerTeamManagementPage />} />
                        <Route path="add" element={<AddTeamUserPage />} />
                        <Route path="edit/:userId" element={<EditTeamUserPage />} />
                    </Route>
                    <Route path="support" element={<SupportPage />} />

                    {/* Settings Routes */}
                    <Route path="settings" element={<SettingsRouterPage />}>
                        <Route index element={<Navigate to="account" replace />} />
                        <Route path="account" element={<AccountSettingsPage />} />
                        <Route path="security" element={<SecuritySettingsPage />} />
                        <Route path="notifications" element={<NotificationSettingsPage />} />
                    </Route>
                     <Route path="notifications" element={<AllNotificationsPage />} />

                    {/* Admin Routes */}
                     <Route path="admin" element={<AdminRouterPage />}>
                        <Route index element={<Navigate to="/app/admin-dashboard" replace />} />
                        <Route path="users" element={<UserManagementPage />} />
                        <Route path="staff" element={<StaffManagementPage />} />
                        <Route path="system" element={<SystemSettingsPage />} />
                    </Route>
                    <Route path="admin-dashboard" element={<AdminDashboardPage />} />
                    
                    {/* Reseller Routes */}
                    <Route path="reseller" element={<Outlet />}>
                         <Route index element={<Navigate to="/app/reseller-dashboard" replace />} />
                         <Route path="customers" element={<ResellerCustomersPage />} />
                         <Route path="program" element={<ResellerProgramPage />} />
                    </Route>
                    <Route path="reseller-dashboard" element={<ResellerDashboardPage />} />

                    {/* CloudEdge Route (special layout handled in AppLayout) */}
                    <Route path="cloud-edge" element={<CloudEdgeDashboardPage />} />


                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};


const App: React.FC = () => {
  return (
    <ThemeProvider>
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
