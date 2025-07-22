



export interface User {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  role: 'customer' | 'admin' | 'reseller'; // Added role
  status?: 'active' | 'suspended' | 'blocked';
  displayName?: string;
  phoneNumber?: string;
  avatarUrl?: string; // URL to placeholder image
  teamManagerId?: string; // ID of the primary customer managing this user
  assignedGroupId?: string; // ID of the UserGroup this user belongs to
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission key strings
  teamManagerId: string; // ID of the customer who owns/manages this group
}

export interface StaffGroup {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string, redirectPath?: string) => Promise<void>;
  signup: (details: Omit<User, 'id' | 'avatarUrl' | 'displayName' | 'phoneNumber' | 'role' | 'teamManagerId' | 'assignedGroupId' | 'status'> & {password: string}) => Promise<void>;
  logout: () => void;
  updateProfile: (details: Partial<Pick<User, 'fullName' | 'companyName' | 'displayName' | 'phoneNumber'>>) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
}

export interface NavItem {
  name: string;
  path: string;
  iconName?: string; // For Font Awesome class
  iconUrl?: string;  // For image URL
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SECURITY = 'security', 
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
}

export interface ProductPortal {
  id: string;
  name: string;
  description: string;
  iconBgColor: string;
  url: string; // Could be external or internal path
}

// Data for the Floating App Launcher and Dashboard Cards
export interface ApplicationCardData {
  id:string;
  name: string;
  description: string;
  iconName: string;
  launchUrl: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  performedBy: string;
  status: 'Success' | 'Failed' | 'Pending User Action' | 'Pending System Action' | 'Information' | 'Warning';
}

export type SupportTicketProduct = 'CloudEdge' | 'Posta Email' | 'Subscriptions' | 'General Inquiry';

export interface TicketAttachment {
    name: string;
    type: string;
    size: number;
    dataUrl: string; // base64
}

export interface SupportTicketComment {
    author: string;
    timestamp: string;
    content: string;
    attachments?: TicketAttachment[];
}

export interface SupportTicket {
    id: string;
    subject: string;
    product: SupportTicketProduct;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    lastUpdate: string;
    description: string;
    attachments?: TicketAttachment[];
    customerId?: string;
    customerName?: string;
    comments?: SupportTicketComment[];
    internalComments?: SupportTicketComment[];
}

export interface StepperStep {
  name: string;
}

export type EmailPlanDuration = 'monthly' | 'yearly';

export interface EmailPlan {
  id: string;
  name: string;
  basePriceMonthly: number;
  features: string[];
  description: string;
  isRecommended?: boolean;
}

export interface EmailCartItem {
  plan: EmailPlan;
  quantity: number;
  duration: EmailPlanDuration;
  advancedRulesEnabled: boolean;
}

export type CloudEdgeComponentType = 'instance' | 'vdc' | 'ready-plan';
export type MachineType = 'performance-01' | 'performance-02' | 'performance-03';
export type ProvisioningModel = 'regular' | 'spot';
export type SubscriptionTermUnit = 'hr' | 'week' | 'month' | 'year';

export interface CloudEdgeConfiguration {
    id: string;
    name: string;
    type: CloudEdgeComponentType;
    quantity: number;
    subscriptionTermValue: number;
    subscriptionTermUnit: SubscriptionTermUnit;
    deploymentRegion: string;
    
    // Instance specific
    instanceTemplateId?: string;
    machineType?: MachineType;
    osSoftware?: string;

    // VDC specific
    vdcCPU?: number;
    vdcRAM?: number;
    vdcFlashStorage?: number;

    // Ready Plan specific
    readyPlanId?: string;
    
    // Advanced/Optional
    provisioningModel?: ProvisioningModel;
    confidentialVM?: boolean;
    addGPUs?: boolean;
    gpuType?: string;
    gpuCount?: number;

    // Other resources
    staticPublicIPs?: number;
    objectStorageGB?: number;
    advancedBackupGB?: number;
    trendMicroEndpoints?: number;
    windowsServerLicenses?: number;
    linuxEnterpriseLicenses?: number;
    cortexXDREndpoints?: number;
    loadBalancerInstances?: number;
    
    // Add-ons
    advancedFirewall?: boolean;
    enhancedMonitoring?: boolean;

    // Calculated
    unitSubtotalMonthly: number;
}
export interface InstanceTemplate {
  id: string;
  name: string;
  cpu: number;
  ramGB: number;
  bootDiskGB: number;
  priceMonthly: number;
  description: string;
}
export interface GPUType {
  id: string;
  name: string;
  priceMonthly: number;
}
export interface InvoiceLineItem {
  description: string;
  units: number;
  amount: number;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Unpaid';
  url: string; // for PDF download
  customerId: string;
  customerName: string;
  customerAddress: string[];
  customerEmail: string;
  billingPeriod: string;
  nextBillingDate: string;
  subscriptionId: string;
  lineItems: InvoiceLineItem[];
  subTotal: number;
  tax: {
    label: string;
    amount: number;
  };
  payments: number;
  amountDue: number;
  paymentDetails: string;
}

export interface AddedResource {
    id: string; // Unique ID for the table row
    productId: 'posta' | 'cloudedge' | string;
    packageId: string;
    organizationId: string;
    domainIds: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnually: number;
  priceAnnuallyPerMonth: number;
  description: string;
  features: string[];
  isRecommended?: boolean;
}

export interface Feature {
  name:string;
  availability: { [planId: string]: boolean | string };
}

export interface FeatureCategory {
  name: string;
  features: Feature[];
}

export interface FaqItem {
  question: string;
  answer: string;
}