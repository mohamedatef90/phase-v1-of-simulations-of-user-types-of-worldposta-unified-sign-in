
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context';
import { getMockUserById } from '@/data';
import type { User, ApplicationCardData } from '@/types';
import { Card, Icon, Button } from '@/components/ui';

const ApplicationCard: React.FC<ApplicationCardData & { cardSize?: string }> = ({ name, description, iconName, launchUrl, cardSize }) => {
  const navigate = useNavigate();
  const handleLaunch = () => {
    if (launchUrl.startsWith('http')) {
      window.open(launchUrl, '_blank');
    } else if (launchUrl.startsWith('/')) {
      navigate(launchUrl);
    } else {
       if (launchUrl === '#email-admin-subs') {
        navigate('/app/billing/email-subscriptions'); 
      } else if (launchUrl === '#cloudedge-configs') {
        navigate('/app/billing/cloudedge-configurations'); 
      } else {
        alert(`Action for: ${name}`);
      }
    }
  };

  const isImageUrl = iconName.startsWith('http') || iconName.startsWith('/');

  return (
    <Card className={`flex flex-col h-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg border border-gray-300/70 dark:border-slate-600/50 rounded-xl p-6 transition-all hover:border-gray-400 dark:hover:border-slate-500 ${cardSize}`}>
      <div className="flex-grow">
        <div className="flex items-center space-x-3 mb-3">
          {isImageUrl ? (
            <img src={iconName} alt={`${name} icon`} className="h-8 w-auto" />
          ) : (
            <Icon name={iconName} className="text-2xl text-[#679a41] dark:text-emerald-400" />
          )}
          <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">{name}</h3>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{description}</p>
      </div>
      <div className="mt-auto">
         <hr className="my-4 border-gray-200/50 dark:border-gray-700/50" />
        <Button variant="primary" fullWidth onClick={handleLaunch}>
          Launch Application
        </Button>
      </div>
    </Card>
  );
};


export const DashboardPage: React.FC = () => { // This is the Customer Dashboard
  const { user: loggedInUser } = useAuth();
  const [searchParams] = useSearchParams();
  const viewAsUserId = searchParams.get('viewAsUser');
  const returnToPath = searchParams.get('returnTo');
  
  const [targetUser, setTargetUser] = useState<User | null>(null);

  useEffect(() => {
    if (viewAsUserId) {
      const userToView = getMockUserById(viewAsUserId);
      setTargetUser(userToView || null);
    } else {
      setTargetUser(null);
    }
  }, [viewAsUserId]);
  
  let allPortals: (ApplicationCardData & { section: 'product' | 'application' })[] = [
    { 
      id: 'cloudedge', 
      name: 'CloudEdge', 
      description: 'Manage your cloud infrastructure, VMs, and network resources efficiently.', 
      iconName: "https://console.worldposta.com/assets/loginImgs/edgeLogo.png", 
      launchUrl: '/app/cloud-edge',
      section: 'product',
    },
    { 
      id: 'emailadmin', 
      name: 'Email Admin Suite', 
      description: 'Administer your email services, mailboxes, users, and domains with ease.', 
      iconName: "https://www.worldposta.com/assets/Posta-Logo.png", 
      launchUrl: 'https://tools.worldposta.com/login',
      section: 'product',
    },
    { 
      id: 'billing', 
      name: 'Subscriptions', 
      description: 'Oversee your subscriptions and add new services.', 
      iconName: 'fas fa-wallet', 
      launchUrl: '/app/billing',
      section: 'application',
    },
    { 
      id: 'invoices', 
      name: 'Invoice History', 
      description: 'View and download past invoices for your records.', 
      iconName: 'fas fa-file-invoice', 
      launchUrl: '/app/invoices',
      section: 'application',
    },
    {
      id: 'user-management',
      name: 'User Management',
      description: 'Manage team members, user groups, and their permissions.',
      iconName: 'fas fa-users-cog',
      launchUrl: '/app/team-management',
      section: 'application',
    },
    {
      id: 'support',
      name: 'Support Center',
      description: 'Access knowledge base or create support tickets with our team.',
      iconName: 'fas fa-headset',
      launchUrl: '/app/support',
      section: 'application',
    },
  ];

  const userToDisplay = viewAsUserId ? targetUser : loggedInUser;

  // If a reseller is viewing a customer dashboard, hide their own billing/invoices.
  if (loggedInUser?.role === 'reseller' && viewAsUserId) {
    allPortals = allPortals.filter(p => p.id !== 'billing' && p.id !== 'invoices');
  }

  // Hide specific cards for customer role as requested
  if (userToDisplay?.role === 'customer') {
    const customerHiddenCardIds = ['billing', 'invoices', 'support'];
    allPortals = allPortals.filter(p => !customerHiddenCardIds.includes(p.id));
  }

  // The User Management card should only be visible to customers, similar to the sidebar link.
  if (userToDisplay?.role !== 'customer') {
      allPortals = allPortals.filter(p => p.id !== 'user-management');
  }

  const productPortals = allPortals.filter(p => p.section === 'product');
  const applicationPortals = allPortals.filter(p => p.section === 'application');
  
  return (
    <div className="space-y-6">
      {viewAsUserId && returnToPath && targetUser && (
        <Card className="bg-blue-50 dark:bg-sky-900/40 border border-blue-200 dark:border-sky-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Icon name="fas fa-eye" className="text-blue-600 dark:text-sky-400 mr-3 text-lg" />
              <p className="text-sm font-medium text-blue-800 dark:text-sky-200">
                You are currently viewing the dashboard as <span className="font-bold">{targetUser.fullName}</span>.
              </p>
            </div>
            <Link to={returnToPath}>
              <Button variant="outline" size="sm">
                <Icon name="fas fa-times-circle" className="mr-2" />
                Exit View As Mode
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">
        Welcome, <span className="text-[#679a41] dark:text-emerald-400">{userToDisplay?.displayName || userToDisplay?.fullName || 'User'}</span>!
      </h1>
      
      <div className="space-y-8">
        {productPortals.length > 0 && (
            <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#293c51] dark:text-gray-200">Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {productPortals.map(app => <ApplicationCard key={app.id} {...app} cardSize="md:col-span-1" />)}
            </div>
            </div>
        )}

        {applicationPortals.length > 0 && (
            <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#293c51] dark:text-gray-200">Applications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {applicationPortals.map(app => <ApplicationCard key={app.id} {...app} />)}
            </div>
            </div>
        )}
      </div>
    </div>
  );
};
