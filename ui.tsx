
import React, { useState, useEffect, useRef, Fragment, useMemo } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { NavItem, User, AppNotification, StepperStep, EmailPlan, EmailCartItem, CloudEdgeConfiguration, InstanceTemplate, GPUType, EmailPlanDuration, ApplicationCardData } from './types';
import { NotificationType } from './types'; // Import enum for usage

// Generic Icon Component for Font Awesome
interface IconProps {
  name: string; // e.g., 'fas fa-home'
  className?: string;
  ariaHidden?: boolean;
  ariaLabel?: string;
  fixedWidth?: boolean;
  style?: React.CSSProperties;
}
export const Icon: React.FC<IconProps> = ({ name, className, ariaHidden = true, ariaLabel, fixedWidth, style }) => (
  <i className={`${name} ${fixedWidth ? 'fa-fw' : ''} ${className || ''}`} aria-hidden={ariaHidden} {...(ariaLabel && {'aria-label': ariaLabel})} style={style}></i>
);


// Logo (Remains as img)
export const Logo: React.FC<{ className?: string, iconClassName?: string }> = ({ className, iconClassName = "h-6 w-auto" }) => (
  <Link to="/" className={`flex items-center ${className}`}>
    <img src="https://www.worldposta.com/assets/WP-Logo.png" alt="WorldPosta Logo" className={`${iconClassName}`} />
  </Link>
);

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'fa-sm', 
    md: 'fa-lg', // fa-lg is 1.33em, default FA icon is 1em. Use fa-lg as a medium size.
    lg: 'fa-2x',
  };
  return (
    <Icon name={`fas fa-circle-notch fa-spin ${sizeClasses[size]}`} className={className} />
  );
};


// Form Components
interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  as?: 'textarea' | 'select';
  disabled?: boolean;
  children?: React.ReactNode; // For select options
  inputClassName?: string;
  labelClassName?: string;
  showPasswordToggle?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  hint?: React.ReactNode; // For hints below the input
  name?: string; // Add name attribute
  checked?: boolean; // For checkboxes
  wrapperClassName?: string; // To style the div wrapping checkbox and label
  maxLength?: number;
}

export const FormField: React.FC<FormFieldProps> = ({ 
  id, label, type = "text", value, onChange, placeholder, error, required, as, disabled, children,
  inputClassName, labelClassName, showPasswordToggle, rows = 4, min, max, step, hint, name, checked, wrapperClassName, maxLength
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const effectiveType = showPasswordToggle && type === 'password' ? (isPasswordVisible ? 'text' : 'password') : type;

  const baseLabelClasses = `block text-sm font-medium mb-1 ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-[#293c51] dark:text-gray-300'}`;
  const baseInputClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700 dark:text-white'} placeholder-gray-400 dark:placeholder-gray-500`;
  
  const inputElement = () => {
    if (as === 'textarea') {
      return (
        <textarea
          id={id}
          name={name || id}
          value={(value as string) ?? ''} 
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          className={`${baseInputClasses} ${inputClassName}`}
        />
      );
    } else if (as === 'select') {
      return (
        <select
          id={id}
          name={name || id}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          className={`${baseInputClasses} ${inputClassName}`}
        >
          {children}
        </select>
      );
    } else if (type === 'checkbox') {
        const defaultCheckboxClasses = `h-4 w-4 text-[#679a41] rounded border-gray-300 dark:border-gray-600 focus:ring-[#679a41] dark:focus:ring-emerald-400`;
        return (
            <input
                type="checkbox"
                id={id}
                name={name || id}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className={`${inputClassName || defaultCheckboxClasses} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            />
        );
    } else { 
      return (
        <input
          type={effectiveType}
          id={id}
          name={name || id}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          maxLength={maxLength}
          className={`${baseInputClasses} ${inputClassName} ${showPasswordToggle ? 'pr-10' : ''}`}
        />
      );
    }
  };

  if (type === 'checkbox') {
    return (
        <div className={`mb-4 flex items-center ${wrapperClassName || ''}`}>
            {inputElement()}
            {label && ( // Conditionally render the label text part
              <label htmlFor={id} className={`ml-2 text-sm ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-[#293c51] dark:text-gray-300'} ${labelClassName || ''}`}>
                  {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
              </label>
            )}
            {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
        </div>
    );
  }

  return (
    <div className="mb-4">
      <label htmlFor={id} className={`${baseLabelClasses} ${labelClassName || ''}`}>
        {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>
      <div className="relative">
        {inputElement()}
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            <Icon name={isPasswordVisible ? "fas fa-eye-slash" : "fas fa-eye"} className="w-5 h-5" />
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIconName?: string; // Changed from leftIcon
  leftIconClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', isLoading = false, fullWidth = false, className, leftIconName, leftIconClassName, ...props }) => {
  const baseStyles = "font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-colors duration-150 ease-in-out inline-flex items-center justify-center";
  const variantStyles = {
    primary: "bg-[#679a41] text-white hover:bg-[#588836] focus:ring-[#679a41] dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:focus:ring-emerald-500",
    secondary: "bg-[#293c51] text-white hover:bg-[#1f2d3d] focus:ring-[#293c51] dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-600",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-500",
    outline: "bg-transparent text-[#679a41] border border-[#679a41] hover:bg-[#679a41]/10 focus:ring-[#679a41] dark:text-emerald-400 dark:border-emerald-400 dark:hover:bg-emerald-400/10",
    ghost: "bg-transparent text-[#293c51] hover:bg-gray-100 focus:ring-[#679a41] dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-emerald-400",
    dark: "bg-[#1F2937] text-gray-300 hover:bg-[#374151] focus:ring-[#1F2937] border border-[#374151]" // Auth specific, no dark variant needed
  };
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs h-8",
    md: "px-4 py-2 text-sm h-10",
    lg: "px-6 py-3 text-base h-12",
    icon: "p-2", // For icon-only buttons, ensure width/height are set or icon is sized appropriately
  };
  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${isLoading || props.disabled ? 'opacity-75 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Spinner size="sm" />
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        <>
        {leftIconName && <Icon name={leftIconName} className={`${children ? 'mr-2' : ''} ${leftIconClassName || ''}`} />}
        {children}
        </>
      )}
    </button>
  );
};


// Card Component
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; titleActions?: React.ReactNode }> = ({ children, className, title, titleActions }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 ${className}`}>
    {title && (
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">{title}</h2>
        {titleActions && <div>{titleActions}</div>}
      </div>
    )}
    {children}
  </div>
);

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'lg' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
    '5xl': 'sm:max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 dark:bg-black bg-opacity-75 dark:bg-opacity-60 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className={`inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full`}>
          <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-[#293c51] dark:text-gray-100" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  {children}
                </div>
              </div>
            </div>
          </div>
          {footer && (
            <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// Navbar Component
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


// Sidebar Component
interface SidebarProps {
  navItems: NavItem[];
  isOpen: boolean; // For mobile
  isCollapsed: boolean; // For desktop
  onClose: () => void; // For mobile
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, isOpen, isCollapsed, onClose }) => {
  const baseTextColor = "text-gray-700 dark:text-gray-300";
  const hoverBgColor = "hover:bg-gray-200 dark:hover:bg-slate-700";
  const hoverTextColor = "hover:text-[#679a41] dark:hover:text-emerald-400";
  const activeBgColor = "bg-[#679a41] dark:bg-emerald-600";
  const activeTextColor = "text-white dark:text-white";
  
  const iconBaseColor = "text-[#679a41] dark:text-emerald-400";
  const iconActiveColor = "text-white dark:text-white"; 
  const iconHoverColor = "group-hover:text-[#588836] dark:group-hover:text-emerald-500";

  const settingsNavItem: NavItem = { name: 'Settings', path: '/app/settings', iconName: "fas fa-cog" };
  
  const additionalNavItems: NavItem[] = [
    { name: 'Workspace Hub', path: 'https://cloudspace.worldposta.com/index.php/login', iconUrl: 'https://www.worldposta.com/assets/CloudSpace.png' },
    { name: 'Mail In-box', path: 'https://mail.worldposta.com/owa/auth/logon.aspx?replaceCurrent=1&url=https://mail.worldposta.com/owa/', iconUrl: 'https://www.worldposta.com/assets/Newhomeimgs/postaImgs/Microsoft_Exchange_(2019-present)%201.png' },
  ];

  const imageIconClasses = `h-5 w-5 object-contain ${isCollapsed ? '' : 'mr-3'} transition-opacity duration-150 ease-in-out group-hover:opacity-75`;
  const faIconBaseClasses = `text-lg ${isCollapsed ? '' : 'mr-3'} transition-colors duration-150 ease-in-out`;


  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" 
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}
      <aside className={`fixed top-0 left-0 z-40 h-screen bg-[#f8f8f8] dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 ease-in-out flex flex-col
                       ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                       lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen 
                       ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-slate-700 ${isCollapsed ? 'lg:justify-center' : ''}`}>
          {isCollapsed ? (
             <Link to="/" className="flex items-center justify-center">
                <img 
                    src="https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%201.png" 
                    alt="WorldPosta Collapsed Logo" 
                    className="h-7 w-auto" // Adjusted height to h-7
                />
             </Link>
          ) : (
            <Logo iconClassName="h-6 w-auto lg:h-7" />
          )}
          <button onClick={onClose} className={`lg:hidden ${baseTextColor} ${hoverTextColor}`}>
            <Icon name="fas fa-times" className="text-xl" />
          </button>
        </div>
        <nav className="py-4 px-2 space-y-1 overflow-y-auto flex-grow">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={isOpen ? onClose : undefined} 
              title={isCollapsed ? item.name : undefined}
              className={({ isActive: isNavLinkActive }) =>
                `flex items-center py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group
                 ${isCollapsed ? 'px-3 justify-center' : 'px-3'}
                 ${isNavLinkActive
                    ? `${activeBgColor} ${activeTextColor} shadow-inner`
                    : `${baseTextColor} ${hoverBgColor} ${hoverTextColor}`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.iconUrl ? (
                     <img src={item.iconUrl} alt={`${item.name} icon`} className={`${imageIconClasses} ${isActive ? 'opacity-100' : 'opacity-90'}`} />
                  ) : item.iconName ? (
                    <Icon 
                      name={item.iconName}
                      fixedWidth
                      className={`${faIconBaseClasses} ${isActive ? iconActiveColor : `${iconBaseColor} ${iconHoverColor}`}`} 
                    />
                  ) : null}
                  {!isCollapsed && <span>{item.name}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        {/* Additional Links and Settings Section */}
        <div className="px-2 pb-2 pt-0 mt-auto">
            {additionalNavItems.map((item) => {
                 const commonClasses = `flex items-center py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${baseTextColor} ${hoverBgColor} ${hoverTextColor} ${isCollapsed ? 'px-3 justify-center' : 'px-3'}`;
                 const currentFaIconClasses = `${faIconBaseClasses} ${iconBaseColor} ${iconHoverColor}`;

                return (
                    <a
                        key={item.name}
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={isCollapsed ? item.name : undefined}
                        className={`${commonClasses} mb-1`} 
                        onClick={isOpen ? onClose : undefined}
                    >
                        {item.iconUrl ? (
                           <img src={item.iconUrl} alt={`${item.name} icon`} className={imageIconClasses} />
                        ) : item.iconName ? (
                            <Icon name={item.iconName} fixedWidth className={currentFaIconClasses} />
                        ) : null}
                        {!isCollapsed && <span>{item.name}</span>}
                    </a>
                );
            })}

            <NavLink
              key={settingsNavItem.name}
              to={settingsNavItem.path}
              onClick={isOpen ? onClose : undefined}
              title={isCollapsed ? settingsNavItem.name : undefined}
              className={({ isActive: isNavLinkActive }) =>
                `flex items-center py-2.5 mb-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group
                 ${isCollapsed ? 'px-3 justify-center' : 'px-3'}
                 ${isNavLinkActive
                    ? `${activeBgColor} ${activeTextColor} shadow-inner`
                    : `${baseTextColor} ${hoverBgColor} ${hoverTextColor}`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {settingsNavItem.iconUrl ? (
                     <img src={settingsNavItem.iconUrl} alt={`${settingsNavItem.name} icon`} className={`${imageIconClasses} ${isActive ? 'opacity-100' : 'opacity-90'}`} />
                  ) : settingsNavItem.iconName ? (
                    <Icon
                      name={settingsNavItem.iconName}
                      fixedWidth
                      className={`${faIconBaseClasses} ${isActive ? iconActiveColor : `${iconBaseColor} ${iconHoverColor}`}`} 
                    />
                  ) : null}
                  {!isCollapsed && <span>{settingsNavItem.name}</span>}
                </>
              )}
            </NavLink>
            <hr className={`my-2 border-gray-300 dark:border-slate-600 ${isCollapsed ? 'mx-auto w-10/12' : ''}`} />
            {!isCollapsed && (
              <div className="pt-1 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  &copy; {new Date().getFullYear()} WorldPosta.
                </p>
              </div>
            )}
        </div>
      </aside>
    </>
  );
};

// Breadcrumb Component
interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.path && index < items.length -1 ? (
              <Link to={item.path} className="hover:text-[#679a41] dark:hover:text-emerald-400 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-[#293c51] dark:text-gray-200 font-medium">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <Icon name="fas fa-chevron-right" className="w-4 h-4 mx-1 text-gray-400 dark:text-gray-500" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Footer Component
export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 print:hidden">
      <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Link to="/privacy-policy" className="hover:text-[#679a41] dark:hover:text-emerald-400 hover:underline">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-[#679a41] dark:hover:text-emerald-400 hover:underline">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

// Auth Layout Component - Redesigned
interface AuthLayoutProps {
  formTitle: string;
  formSubtitle: string;
  children: React.ReactNode; // This will be the <form>
  isLoginPage: boolean;
}


export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, formTitle, formSubtitle, isLoginPage }) => {
  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center text-[#293c51] dark:text-gray-200"
      style={{ backgroundImage: "url('https://logincdn.msftauth.net/shared/5/images/fluent_web_light_57fee22710b04cebe1d5.svg')" }}
    >
      <main className="flex-grow w-full flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-gray-50/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Logo className="mx-auto justify-center" iconClassName="h-10 w-auto dark:filter dark:brightness-0 dark:invert" />
            <h2 className="mt-6 text-3xl font-bold text-[#293c51] dark:text-gray-100">
              {formTitle}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {formSubtitle}
            </p>
          </div>

          <Card className="p-6 sm:p-8 shadow-lg">
            {children}
          </Card>
          
          <div className="text-center text-sm">
            {isLoginPage ? (
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-[#679a41] hover:text-[#588836] dark:text-emerald-400 dark:hover:text-emerald-500 hover:underline">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-[#679a41] hover:text-[#588836] dark:text-emerald-400 dark:hover:text-emerald-500 hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Stepper Component - New Modern Design
export const Stepper: React.FC<{ steps: StepperStep[]; currentStep: number; className?: string }> = ({ steps, currentStep, className }) => {
  const progressPercentage = steps.length > 1 ? (100 / (steps.length - 1)) * currentStep : 0;
  
  return (
    <nav aria-label="Progress" className={`w-full ${className}`}>
      <div className="relative">
        {/* Background track */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 dark:bg-slate-700 rounded-full" aria-hidden="true" />
        
        {/* Progress track */}
        <div
          className="absolute top-5 left-0 h-1 bg-[#679a41] dark:bg-emerald-500 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
        
        <ol role="list" className="relative flex justify-between items-start">
          {steps.map((step, stepIdx) => {
            const isCompleted = stepIdx < currentStep;
            const isCurrent = stepIdx === currentStep;

            return (
              <li key={step.name} className="flex flex-col items-center text-center w-28">
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 z-10 bg-white dark:bg-slate-800
                    ${isCompleted ? 'border-2 border-[#679a41] dark:border-emerald-500' : ''}
                    ${isCurrent ? 'border-2 border-[#679a41] dark:border-emerald-500 ring-4 ring-[#a3cc85]/50 dark:ring-emerald-700/50' : ''}
                    ${!isCompleted && !isCurrent ? 'border-2 border-gray-300 dark:border-slate-600' : ''}
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Icon name="fas fa-check" className="w-5 h-5 text-[#679a41] dark:text-emerald-400" aria-hidden="true" />
                  ) : (
                    <span className={`text-base font-bold 
                      ${isCurrent ? 'text-[#679a41] dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                      {stepIdx + 1}
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-xs md:text-sm font-medium transition-colors duration-300
                  ${isCompleted || isCurrent ? 'text-[#293c51] dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}
                `}>
                  {step.name}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

// Floating App Launcher (Reimagined as Side Panel Launcher)
interface FloatingAppLauncherProps {
  navItems: NavItem[];
  appItems: ApplicationCardData[];
}

export const FloatingAppLauncher: React.FC<FloatingAppLauncherProps> = ({ navItems, appItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent body scroll when panel is open
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
      {/* Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-[80px] right-0 z-50 bg-[#f8f8f8] dark:bg-slate-800 border-l border-t border-b border-gray-200 dark:border-slate-700 text-[#679a41] dark:text-emerald-400 py-4 px-2 rounded-l-lg shadow-lg hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-[#679a41]/50 dark:focus:ring-emerald-400/50 transition-all duration-200 transform hover:scale-105"
          aria-label="Open application launcher"
        >
          <Icon name="fas fa-rocket" className="text-2xl" />
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[59]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Side Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#f8f8f8] dark:bg-slate-800 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-launcher-title"
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <h2 id="app-launcher-title" className="text-lg font-semibold text-[#293c51] dark:text-gray-100">
            Applications & Links
          </h2>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close menu">
            <Icon name="fas fa-times" className="text-xl" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        {/* Panel Content */}
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


// Collapsible Section
interface CollapsibleSectionProps {
  title?: string;
  children: React.ReactNode;
  initialOpen?: boolean;
  className?: string;
  maxItemsToShow?: number;
  items?: string[]; 
  itemClassName?: string; 
  seeMoreLinkClassName?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
    title, children, initialOpen = false, className, maxItemsToShow, items, itemClassName = "text-sm text-gray-600 dark:text-gray-400", seeMoreLinkClassName = "text-xs text-[#679a41] dark:text-emerald-400 hover:underline mt-1"
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [showAllItems, setShowAllItems] = useState(false);

  const renderContent = () => {
    if (items && maxItemsToShow && items.length > maxItemsToShow) {
      const visibleItems = showAllItems ? items : items.slice(0, maxItemsToShow);
      return (
        <>
          <ul className="list-disc list-inside space-y-1">
            {visibleItems.map((item, index) => <li key={index} className={itemClassName}>{item}</li>)}
          </ul>
          <button
            onClick={() => setShowAllItems(!showAllItems)}
            className={seeMoreLinkClassName}
          >
            {showAllItems ? `See ${items.length - maxItemsToShow} less features...` : `See ${items.length - maxItemsToShow} more features...`}
          </button>
        </>
      );
    }
    if(items && (!maxItemsToShow || items.length <= maxItemsToShow)) {
        return (
            <ul className="list-disc list-inside space-y-1">
                {items.map((item, index) => <li key={index} className={itemClassName}>{item}</li>)}
            </ul>
        );
    }
    return children;
  };

  if (!title) { 
    return <div className={className}>{renderContent()}</div>;
  }

  return (
    <div className={`py-2 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left text-sm font-medium text-[#293c51] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded-md"
      >
        <span>{title}</span>
        <Icon name={isOpen ? "fas fa-chevron-up" : "fas fa-chevron-down"} className="w-4 h-4" />
      </button>
      {isOpen && <div className="mt-2 pl-2 border-l-2 border-gray-200 dark:border-slate-600 ml-2">
          {renderContent()}
        </div>}
    </div>
  );
};

// Slider Input Component
interface SliderInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string; 
  pricePerUnit?: number;
  className?: string;
  disabled?: boolean;
}
export const SliderInput: React.FC<SliderInputProps> = ({ id, label, value, onChange, min, max, step, unit, pricePerUnit, className, disabled }) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let numValue = Number(e.target.value);
    if (numValue < min) numValue = min;
    if (numValue > max) numValue = max;
    onChange(numValue);
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-[#293c51] dark:text-gray-300 mb-1">
        {label} {unit && `(${unit})`}
        {pricePerUnit && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(${pricePerUnit.toFixed(2)}/{unit || 'unit'})</span>}
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="range"
          id={`${id}-slider`}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          disabled={disabled}
          className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#679a41] dark:accent-emerald-500"
        />
        <input
          type="number"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400"
        />
      </div>
    </div>
  );
};

// Tooltip Component
export const Tooltip: React.FC<{ text: string; children: React.ReactNode; className?: string }> = ({ text, children, className }) => {
  return (
    <div className={`relative flex items-center group ${className}`}>
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 dark:bg-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        {text}
      </div>
    </div>
  );
};

// Searchable Select Component
interface SearchableSelectProps {
    id: string;
    label: string;
    options: { value: string; label: string; }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    listHeight?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({ id, label, options, value, onChange, placeholder, listHeight = 'max-h-60' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = useMemo(() => options.find(o => o.value === value), [options, value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const handleOptionClick = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const baseLabelClasses = 'block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300';
    const baseButtonClasses = `w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 border-gray-300 dark:border-gray-600 dark:text-white flex justify-between items-center`;

    return (
        <div className="mb-4" ref={rootRef}>
            <label htmlFor={id} className={baseLabelClasses}>{label}</label>
            <div className="relative">
                <button
                    type="button"
                    id={id}
                    className={baseButtonClasses}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <span className={selectedOption ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
                        {selectedOption?.label || placeholder || 'Select an option'}
                    </span>
                    <Icon name={isOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'} className="text-gray-400" />
                </button>
                {isOpen && (
                    <div className={`absolute z-20 mt-1 w-full bg-white dark:bg-slate-700 shadow-lg rounded-md border dark:border-gray-600`}>
                        <div className="p-2">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search..."
                                className="w-full px-2 py-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-[#679a41]"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <ul className={`overflow-y-auto ${listHeight}`} tabIndex={-1} role="listbox">
                            {filteredOptions.length > 0 ? filteredOptions.map(option => (
                                <li
                                    key={option.value}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 ${value === option.value ? 'font-bold bg-gray-100 dark:bg-slate-600' : 'dark:text-gray-200'}`}
                                    onClick={() => handleOptionClick(option.value)}
                                    role="option"
                                    aria-selected={value === option.value}
                                >
                                    {option.label}
                                </li>
                            )) : (
                                <li className="px-3 py-2 text-sm text-center text-gray-500 dark:text-gray-400">No results found.</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

type DoughnutChartProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
} & ({ color: string; gradientId?: never } | { color?: never; gradientId: string });

export const DoughnutChart: React.FC<DoughnutChartProps> = ({ percentage, color, gradientId, size = 120, strokeWidth = 10, className }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {gradientId && (
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
            </defs>
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e6e6e6"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="dark:stroke-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradientId ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-2xl font-bold text-[#293c51] dark:text-gray-100">
        {percentage}%
      </span>
    </div>
  );
};

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, disabled }) => (
  <label htmlFor={id} className={`flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
    {label && <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">{label}</span>}
    <div className="relative">
      <input 
        type="checkbox" 
        id={id} 
        className="sr-only" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
        disabled={disabled}
      />
      <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-[#679a41]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </div>
  </label>
);