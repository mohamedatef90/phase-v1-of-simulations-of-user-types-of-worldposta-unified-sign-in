



import type { User, UserGroup, Invoice, SupportTicket, LogEntry, SupportTicketProduct, InvoiceLineItem, StaffGroup } from './types';

// Mock User Data
export const MOCK_USERS: { [email: string]: User & { passwordHash: string } } = {
  "customer@worldposta.com": { 
    id: "user123",
    fullName: "Demo Customer Alpha",
    email: "customer@worldposta.com",
    companyName: "Alpha Inc.",
    displayName: "DemoCustomerA",
    phoneNumber: "555-1234",
    avatarUrl: "https://picsum.photos/seed/customer123/100/100",
    passwordHash: "hashedpassword123", 
    role: "customer",
    status: 'active'
  },
   "customer2@worldposta.com": {
    id: "user777",
    fullName: "Beta User (Team Alpha)",
    email: "customer2@worldposta.com",
    companyName: "Alpha Inc.",
    displayName: "BetaUser",
    avatarUrl: "https://picsum.photos/seed/customer777/100/100",
    passwordHash: "hashedpassword777",
    role: "customer",
    status: 'active',
    teamManagerId: "user123",
    assignedGroupId: "groupAlphaAdmins"
  },
  "customer3@worldposta.com": {
    id: "user888",
    fullName: "Gamma Client (Team Alpha)",
    email: "customer3@worldposta.com",
    companyName: "Alpha Inc.",
    displayName: "GammaClient",
    avatarUrl: "https://picsum.photos/seed/customer888/100/100",
    passwordHash: "hashedpassword888",
    role: "customer",
    status: 'suspended',
    teamManagerId: "user123",
    assignedGroupId: "groupAlphaViewers"
  },
   "customer.new1@example.com": {
    id: "user-new-1",
    fullName: "Charlie Brown",
    email: "customer.new1@example.com",
    companyName: "Peanuts Comics",
    displayName: "CharlieB",
    passwordHash: "hashedpassword123",
    role: "customer",
    status: 'active',
    avatarUrl: "https://picsum.photos/seed/new-user1/100/100",
  },
  "customer.new2@example.com": {
    id: "user-new-2",
    fullName: "Lucy van Pelt",
    email: "customer.new2@example.com",
    companyName: "Psychiatric Help Inc.",
    displayName: "LucyVP",
    passwordHash: "hashedpassword123",
    role: "customer",
    status: 'blocked',
    avatarUrl: "https://picsum.photos/seed/new-user2/100/100",
  },
  "customer.new3@example.com": {
    id: "user-new-3",
    fullName: "Linus van Pelt",
    email: "customer.new3@example.com",
    companyName: "Great Pumpkin Believers",
    displayName: "Linus",
    passwordHash: "hashedpassword123",
    role: "customer",
    status: 'active',
    avatarUrl: "https://picsum.photos/seed/new-user3/100/100",
  },
  "admin@worldposta.com": {
    id: "admin456",
    fullName: "Admin User",
    email: "admin@worldposta.com",
    companyName: "WorldPosta Admin Dept.",
    displayName: "SysAdmin",
    avatarUrl: "https://picsum.photos/seed/admin456/100/100",
    passwordHash: "hashedpassword_admin",
    role: "admin",
    staffGroupId: "staffGroupAdmins",
    status: 'active',
    creationDate: '2023-01-15T10:00:00Z',
    mfaEnabled: true,
  },
  "reseller@worldposta.com": {
    id: "reseller789",
    fullName: "Reseller Partner",
    email: "reseller@worldposta.com",
    companyName: "Partner Solutions Ltd.",
    displayName: "ResellerPro",
    avatarUrl: "https://picsum.photos/seed/reseller789/100/100",
    passwordHash: "hashedpassword_reseller",
    role: "reseller",
    staffGroupId: "staffGroupSupport",
    status: 'suspended',
    creationDate: '2023-02-20T11:30:00Z',
    mfaEnabled: false,
  }
};

// Mock User Groups for customer@worldposta.com (user123)
export const MOCK_USER_GROUPS: UserGroup[] = [
  { 
    id: "groupAlphaAdmins", 
    name: "Team Administrators", 
    description: "Full access to manage team services and users.",
    permissions: ["view_billing", "manage_services", "admin_team_users", "view_action_logs"],
    teamManagerId: "user123"
  },
  {
    id: "groupAlphaViewers",
    name: "Service Viewers",
    description: "Can view services and logs, but cannot make changes.",
    permissions: ["view_services", "view_action_logs"],
    teamManagerId: "user123"
  },
  {
    id: "groupBillingManagers",
    name: "Billing Managers",
    description: "Can view and manage billing aspects.",
    permissions: ["view_billing", "manage_billing"],
    teamManagerId: "user123"
  }
];

export const MOCK_PERMISSIONS: string[] = [
  'view_billing', 
  'manage_billing', 
  'view_services', 
  'manage_services', 
  'admin_team_users', 
  'view_action_logs'
];


export const MOCK_ADMIN_PERMISSIONS: string[] = [
    'manage_customers',
    'view_all_billing',
    'manage_all_billing',
    'manage_support_tickets',
    'manage_staff_members',
    'manage_staff_groups',
    'access_system_settings',
    'impersonate_users'
];

export const MOCK_ADMIN_ROLES = MOCK_ADMIN_PERMISSIONS.map(perm => ({
    id: perm,
    label: perm.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    description: `Allows user to ${perm.replace(/_/g, ' ')}.`
}));


export const MOCK_STAFF_GROUPS: StaffGroup[] = [
    {
        id: "staffGroupAdmins",
        name: "Super Administrators",
        description: "Full access to all system features and settings.",
        permissions: MOCK_ADMIN_PERMISSIONS,
    },
    {
        id: "staffGroupSupport",
        name: "Support Team",
        description: "Can manage customer support tickets and view customer information.",
        permissions: ['manage_support_tickets', 'view_all_billing', 'manage_customers'],
    },
    {
        id: "staffGroupBilling",
        name: "Billing Department",
        description: "Manages all aspects of customer and system billing.",
        permissions: ['view_all_billing', 'manage_all_billing'],
    }
];

// Function to get user by ID, used by DashboardPage for "View As" mode
export const getMockUserById = (userId: string): User | undefined => {
  return Object.values(MOCK_USERS).find(u => u.id === userId);
};
// Function to get all customers, used by UserManagementPage and ResellerCustomersPage
export const getAllMockCustomers = (): User[] => {
  return Object.values(MOCK_USERS).filter(u => u.role === 'customer' && !u.teamManagerId); // Only primary customers
};
// Function to get all internal users (admins/resellers)
export const getAllMockInternalUsers = (): User[] => {
  return Object.values(MOCK_USERS).filter(u => u.role === 'admin' || u.role === 'reseller');
};
// Function to get users for a specific team manager
export const getUsersForTeam = (teamManagerId: string): User[] => {
  return Object.values(MOCK_USERS).filter(u => u.teamManagerId === teamManagerId);
};
// Function to get groups for a specific team manager
export const getGroupsForTeam = (teamManagerId: string): UserGroup[] => {
  return MOCK_USER_GROUPS.filter(g => g.teamManagerId === teamManagerId);
};

export const getAllMockStaffGroups = (): StaffGroup[] => {
  return MOCK_STAFF_GROUPS;
};


// --- MOCK DATA FOR PAGES ---

export const mockInvoices: Invoice[] = [
    { 
        id: 'INV-2024-004', 
        date: '2024-08-01', 
        amount: 250.00, 
        status: 'Unpaid', 
        url: '#',
        customerId: 'user123',
        customerName: 'Demo Customer Alpha',
        customerAddress: ['123 Innovation Drive', 'Tech City, TX 75001', 'United States'],
        customerEmail: 'customer@worldposta.com',
        billingPeriod: 'Aug 1, 2024 to Sep 1, 2024',
        nextBillingDate: 'Sep 1, 2024',
        subscriptionId: 'sub-cloud-cluster-xyz',
        lineItems: [
            { description: 'CloudEdge - Web Server Cluster', units: 1, amount: 238.10 },
            { description: 'Posta Standard Plan (5 users)', units: 1, amount: 50.00 },
        ],
        subTotal: 288.10,
        tax: { label: 'Tax (8.25%)', amount: 23.77 },
        payments: -61.87, // partial payment? just for example
        amountDue: 250.00,
        paymentDetails: 'Awaiting payment.'
    },
    { 
        id: 'INV-2024-003', 
        date: '2024-07-01', 
        amount: 150.00, 
        status: 'Paid', 
        url: '#',
        customerId: 'user123',
        customerName: 'Demo Customer Alpha',
        customerAddress: ['123 Innovation Drive', 'Tech City, TX 75001', 'United States'],
        customerEmail: 'customer@worldposta.com',
        billingPeriod: 'Jul 1, 2024 to Aug 1, 2024',
        nextBillingDate: 'Aug 1, 2024',
        subscriptionId: 'sub-posta-std-abc',
        lineItems: [
            { description: 'Posta Standard Plan (10 users)', units: 1, amount: 100.00 },
            { description: 'Advanced Email Archiving', units: 1, amount: 42.86 },
        ],
        subTotal: 142.86,
        tax: { label: 'Tax (5%)', amount: 7.14 },
        payments: -150.00,
        amountDue: 0.00,
        paymentDetails: '$150.00 was paid on Jul 3, 2024 by Visa card ending 4242.'
    },
    { 
        id: 'INV-2024-002', 
        date: '2024-06-01', 
        amount: 145.50, 
        status: 'Paid', 
        url: '#',
        customerId: 'user123',
        customerName: 'Demo Customer Alpha',
        customerAddress: ['123 Innovation Drive', 'Tech City, TX 75001', 'United States'],
        customerEmail: 'customer@worldposta.com',
        billingPeriod: 'Jun 1, 2024 to Jul 1, 2024',
        nextBillingDate: 'Jul 1, 2024',
        subscriptionId: 'sub-posta-std-abc',
        lineItems: [
            { description: 'Posta Standard Plan (10 users)', units: 1, amount: 100.00 },
            { description: 'Advanced Email Archiving', units: 1, amount: 38.30 },
        ],
        subTotal: 138.30,
        tax: { label: 'Tax (5%)', amount: 7.20 },
        payments: -145.50,
        amountDue: 0.00,
        paymentDetails: '$145.50 was paid on Jun 2, 2024 by Visa card ending 4242.'
    },
    { 
        id: 'INV-2024-001', 
        date: '2024-05-01', 
        amount: 145.50, 
        status: 'Paid', 
        url: '#',
        customerId: 'user123',
        customerName: 'Demo Customer Alpha',
        customerAddress: ['123 Innovation Drive', 'Tech City, TX 75001', 'United States'],
        customerEmail: 'customer@worldposta.com',
        billingPeriod: 'May 1, 2024 to Jun 1, 2024',
        nextBillingDate: 'Jun 1, 2024',
        subscriptionId: 'sub-posta-std-abc',
        lineItems: [
            { description: 'Posta Standard Plan (10 users)', units: 1, amount: 100.00 },
            { description: 'Advanced Email Archiving', units: 1, amount: 38.30 },
        ],
        subTotal: 138.30,
        tax: { label: 'Tax (5%)', amount: 7.20 },
        payments: -145.50,
        amountDue: 0.00,
        paymentDetails: '$145.50 was paid on May 3, 2024 by Visa card ending 4242.'
    },
];

export const mockSupportTickets: SupportTicket[] = [
    { 
        id: 'TKT-58291', 
        subject: 'Cannot access my VM', 
        product: 'CloudEdge', 
        status: 'In Progress', 
        lastUpdate: new Date(Date.now() - 3600000).toISOString(), 
        description: 'I am trying to SSH into my prod-web-01 VM and the connection is timing out. I have checked my firewall rules and nothing has changed. Please assist.', 
        customerName: 'Demo Customer Alpha',
        comments: [
            {
                author: 'Support Staff',
                timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
                content: 'Hello, we have received your ticket. Can you please confirm you are able to ping the gateway from another machine in the same network?'
            },
            {
                author: 'Demo Customer Alpha',
                timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
                content: 'Yes, I can ping the gateway. The issue seems to be specific to SSH on port 22.'
            }
        ],
        internalComments: [
            {
                author: 'Support Staff',
                timestamp: new Date(Date.now() - 1.5 * 3600000).toISOString(),
                content: 'Customer seems to have a network issue on their end, but I am checking our firewall logs just in case. No blocks found so far.'
            },
            {
                author: 'Admin User',
                timestamp: new Date(Date.now() - 1.2 * 3600000).toISOString(),
                content: 'Good. Keep me updated. Let\'s resolve this quickly.'
            }
        ]
    },
    { id: 'TKT-58285', subject: 'Question about email archiving', product: 'Posta Email', status: 'Resolved', lastUpdate: new Date(Date.now() - 48 * 3600000).toISOString(), description: 'How long are emails archived by default on the Posta Premium plan?', customerName: 'Demo Customer Alpha' },
    { id: 'TKT-58275', subject: 'Invoice Discrepancy', product: 'Subscriptions', status: 'Closed', lastUpdate: new Date(Date.now() - 120 * 3600000).toISOString(), description: 'My last invoice seems higher than expected. Can you please provide a breakdown?', customerName: 'Demo Customer Alpha' },
];

export const mockCloudEdgeLogs: LogEntry[] = [
    { id: 'ce1', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'VM Started', resource: 'prod-web-01', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'ce2', timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'Firewall Rule Updated', resource: 'default-fw', performedBy: 'System', status: 'Success' },
    { id: 'ce3', timestamp: new Date(Date.now() - 10800000).toISOString(), action: 'Snapshot Creation Failed', resource: 'db-main-vm', performedBy: 'customer@worldposta.com', status: 'Failed' },
  ];
export const mockPostaLogs: LogEntry[] = [
    { id: 'po1', timestamp: new Date(Date.now() - 4000000).toISOString(), action: 'Mailbox Created', resource: 'new.user@alpha.inc', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'po2', timestamp: new Date(Date.now() - 8000000).toISOString(), action: 'Spam Filter Updated', resource: 'alpha.inc domain', performedBy: 'admin@worldposta.com', status: 'Information' },
    { id: 'po3', timestamp: new Date(Date.now() - 12000000).toISOString(), action: 'Password Reset', resource: 'user@alpha.inc', performedBy: 'customer@worldposta.com', status: 'Pending User Action' },
  ];
  
export const mockSubscriptionLogs: LogEntry[] = [
    { id: 'sub1', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), action: 'Subscription Added', resource: 'Posta Standard Plan (10 users)', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'sub2', timestamp: new Date(Date.now() - 26 * 3600000).toISOString(), action: 'Payment Method Updated', resource: 'Visa ending in 4242', performedBy: 'customer@worldposta.com', status: 'Information' },
    { id: 'sub3', timestamp: new Date(Date.now() - 50 * 3600000).toISOString(), action: 'Auto-renewal Failed', resource: 'CloudEdge - Web Server', performedBy: 'System', status: 'Failed' },
  ];

export const mockUserManagementLogs: LogEntry[] = [
    { id: 'um1', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), action: 'User Invited', resource: 'charlie.new@alpha.inc', performedBy: 'customer@worldposta.com', status: 'Pending User Action' },
    { id: 'um2', timestamp: new Date(Date.now() - 32 * 3600000).toISOString(), action: 'Group Permissions Updated', resource: 'Team Administrators', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'um3', timestamp: new Date(Date.now() - 72 * 3600000).toISOString(), action: 'User Removed from Group', resource: 'beta.user@alpha.inc from Viewers', performedBy: 'customer@worldposta.com', status: 'Success' },
  ];

export const mockSupportLogs: LogEntry[] = [
    { id: 'sup1', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), action: 'Ticket Created', resource: 'TKT-58291: Cannot access my VM', performedBy: 'customer@worldposta.com', status: 'Information' },
    { id: 'sup2', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), action: 'Support Staff Replied', resource: 'TKT-58291', performedBy: 'Support Staff', status: 'Information' },
    { id: 'sup3', timestamp: new Date(Date.now() - 100 * 3600000).toISOString(), action: 'Ticket Resolved', resource: 'TKT-58275: Invoice Discrepancy', performedBy: 'Support Staff', status: 'Success' },
  ];

export const mockInvoiceLogs: LogEntry[] = [
    { id: 'inv1', timestamp: new Date().toISOString(), action: 'Invoice Downloaded', resource: 'INV-2024-003', performedBy: 'customer@worldposta.com', status: 'Information' },
    { id: 'inv2', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), action: 'Payment Succeeded', resource: 'Invoice INV-2024-002', performedBy: 'System', status: 'Success' },
];

export const mockPostaPackages = [
    { id: 'posta-basic', name: 'Posta Basic Plan' },
    { id: 'posta-standard', name: 'Posta Standard Plan' },
    { id: 'posta-premium', name: 'Posta Premium Plan' },
];
export const mockCloudEdgePackages = [
    { id: 'cloudedge-s1', name: 'CloudEdge Small Instance' },
    { id: 'cloudedge-m1', name: 'CloudEdge Medium Instance' },
    { id: 'cloudedge-l1', name: 'CloudEdge Large Instance' },
];
export const mockOrganizations = [
    { id: 'org-alpha', name: 'Alpha Inc.' },
    { id: 'org-beta', name: 'Beta Division' },
];
export const mockDomains = [
    { id: 'dom-alpha', name: 'alpha-inc.com' },
    { id: 'dom-beta', name: 'betadivision.net' },
    { id: 'dom-gamma', name: 'gamma-corp.io' },
];