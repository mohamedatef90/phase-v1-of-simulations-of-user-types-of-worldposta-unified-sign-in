
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Icon } from '@/components/ui';
import type { ApplicationCardData } from '@/types';

const ApplicationCard: React.FC<ApplicationCardData & { cardSize?: string }> = ({ name, description, iconName, launchUrl, cardSize }) => {
    const navigate = useNavigate();
    const handleLaunch = () => {
      if (launchUrl.startsWith('http')) {
        window.open(launchUrl, '_blank');
      } else if (launchUrl.startsWith('/')) {
        navigate(launchUrl);
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

interface Subscription {
  id: string;
  productName: string;
  subscribeDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'expired';
  manageUrl: string;
}

const SubscriptionCard: React.FC<{ subscription: Subscription }> = ({ subscription }) => {
  const navigate = useNavigate();

  const getStatusChip = (status: 'active' | 'pending' | 'expired') => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (status) {
      case 'active':
        return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Active</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>Pending</span>;
      case 'expired':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>Expired</span>;
      default:
        return null;
    }
  };

  const handleAction = (url: string) => {
      navigate(url);
  };

  return (
    <Card className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-[#293c51] dark:text-gray-100">{subscription.productName}</h3>
          <div className="flex flex-wrap text-sm text-gray-500 dark:text-gray-400 mt-1 gap-x-4 gap-y-1">
            <span>Subscribed: {new Date(subscription.subscribeDate).toLocaleDateString()}</span>
            <span>Renews/Ends: {new Date(subscription.endDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center mt-4 md:mt-0 md:ml-6 gap-2 flex-shrink-0">
          {getStatusChip(subscription.status)}
          {subscription.status === 'pending' && <Button size="sm" variant="outline" onClick={() => handleAction(subscription.manageUrl)}>Edit</Button>}
          {subscription.status === 'active' && <Button size="sm" onClick={() => handleAction(subscription.manageUrl)}>Manage</Button>}
          {subscription.status === 'expired' && <Button size="sm" onClick={() => handleAction(subscription.manageUrl)}>Renew</Button>}
        </div>
      </div>
    </Card>
  );
};


export const BillingSettingsPage: React.FC = () => {
  const billingApps: (ApplicationCardData & { section: 'product' | 'application' })[] = [
    {
      id: 'email-subs',
      name: 'Posta Email Subscriptions',
      description: 'Manage licenses, plans, and advanced features for your Posta email services.',
      iconName: 'fas fa-envelope-open-text',
      launchUrl: '/app/billing/email-subscriptions',
      section: 'application',
    },
    {
      id: 'cloudedge-configs',
      name: 'CloudEdge Configurations',
      description: 'Configure and get estimates for your virtual data centers and instances.',
      iconName: 'fas fa-server',
      launchUrl: '/app/billing/cloudedge-configurations',
      section: 'application',
    },
  ];

  const mockSubscriptions: Subscription[] = [
    { id: 'sub1', productName: 'Posta Standard Plan (10 users)', subscribeDate: '2024-01-15', endDate: '2025-01-15', status: 'active', manageUrl: '/app/billing/email-configurations' },
    { id: 'sub2', productName: 'CloudEdge - Web Server Cluster', subscribeDate: '2024-06-01', endDate: '2024-07-01', status: 'pending', manageUrl: '/app/billing/cloudedge-configurations' },
    { id: 'sub3', productName: 'Posta Basic Plan (5 users)', subscribeDate: '2023-05-20', endDate: '2024-05-20', status: 'expired', manageUrl: '/app/billing/email-subscriptions' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Subscriptions</h1>
      <p className="text-gray-600 dark:text-gray-400">
        From here you can manage your existing subscriptions or add new services for your account.
      </p>

      <div>
        <h2 className="text-2xl font-semibold text-[#293c51] dark:text-gray-200 mb-4">Manage & Add Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {billingApps.map(app => <ApplicationCard key={app.id} {...app} />)}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-[#293c51] dark:text-gray-200 mb-4">My Subscriptions</h2>
        {mockSubscriptions.length > 0 ? (
          <div className="space-y-4">
            {mockSubscriptions.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-500 dark:text-gray-400">You have no active subscriptions.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
