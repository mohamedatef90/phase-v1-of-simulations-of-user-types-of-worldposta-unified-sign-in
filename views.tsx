

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, Routes, Route, Outlet, Navigate, useLocation, NavLink, useSearchParams, useParams } from 'react-router-dom';
import { 
    FormField, Button, Card, Spinner, Icon,
    Modal, AuthLayout, Footer, SearchableSelect, Logo, Stepper, FloatingAppLauncher, DoughnutChart, ToggleSwitch
} from './ui';
import { useAuth, useTheme, useAppLayout } from './context'; 
import { getMockUserById, getAllMockCustomers, getAllMockInternalUsers, getUsersForTeam, getGroupsForTeam, MOCK_USERS, MOCK_USER_GROUPS } from './data';
import type { User, AppNotification, LogEntry, UserGroup, ApplicationCardData, SupportTicket, SupportTicketComment, TicketAttachment, Invoice, InvoiceLineItem, SupportTicketProduct, NavItem } from './types';
import { NotificationType } from './types';
import { v4 as uuidv4 } from 'uuid';

// --- HELPERS FOR LANDING PAGE ---
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


// --- NEW LANDING PAGE START ---

const HeroSlider: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const slides = [
        {
            title: "Mission-Critical <br/> Cloud Solutions",
            description: "Experience unparalleled performance, security, and scalability with WorldPosta's enterprise-grade cloud infrastructure. Built for businesses that demand zero downtime.",
            bgImage: "https://www.milesweb.com/blog/wp-content/uploads/2024/02/what-is-cpu.png"
        },
        {
            title: "Advanced Security <br/> You Can Trust",
            description: "Protect your digital assets with our 24/7 Security Operations Center (SOC), advanced threat protection, and comprehensive compliance certifications.",
            bgImage: "https://www.milesweb.com/blog/wp-content/uploads/2024/02/what-is-gpu.png"
        },
        {
            title: "Seamless Global <br/> Collaboration",
            description: "Empower your teams with CloudSpace, our secure suite for file sharing, video conferencing, and real-time document collaboration, with 10TB storage per user.",
            bgImage: "https://www.intelligentdatacentres.com/wp-content/uploads/2024/04/HyperCool-liquid-cooling-technology.jpg"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, [slides.length]);

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 7000);
        return () => clearInterval(slideInterval);
    }, [nextSlide]);

    const handleCtaClick = () => {
        if (isAuthenticated) {
            const role = user?.role;
            if (role === 'admin') navigate('/app/admin-dashboard');
            else if (role === 'reseller') navigate('/app/reseller-dashboard');
            else navigate('/app/dashboard');
        } else {
            navigate('/signup');
        }
    };

    return (
        <section className="relative h-screen min-h-[700px] w-full overflow-hidden text-white">
            <div className="absolute inset-0 bg-slate-900/60 z-10"></div>
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                    style={{ backgroundImage: `url(${slide.bgImage})`, opacity: index === currentSlide ? 1 : 0 }}
                />
            ))}
            <div className="relative z-20 h-full flex items-center justify-center text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight leading-tight" dangerouslySetInnerHTML={{ __html: slides[currentSlide].title }}></h1>
                    <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-gray-200">{slides[currentSlide].description}</p>
                    <Button 
                        size="lg" 
                        className="bg-[#679a41] hover:bg-[#588836] dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white transform hover:scale-105 transition-transform"
                        onClick={handleCtaClick}
                    >
                        {isAuthenticated ? 'My Dashboard' : 'Register Now'}
                    </Button>
                </div>
            </div>
            <div className="absolute z-20 bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
                {slides.map((_, index) => (
                    <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'}`}></button>
                ))}
            </div>
        </section>
    );
};

const ProductBrief: React.FC = () => {
    const products = [
        { name: "CloudEdge", description: "Comprehensive, scalable cloud infrastructure with customizable VMs and resource pools.", icon: "fas fa-cloud", link: "#cloudedge" },
        { name: "CloudSpace", description: "Collaboration suite for file sharing, meetings, and enhanced team productivity.", icon: "fas fa-users", link: "#cloudspace" },
        { name: "Posta", description: "Secure, reliable, and enterprise-grade email hosting for your business.", icon: "fas fa-envelope", link: "#posta" },
        { name: "WPSYS IT Solutions", description: "Enterprise-level system integration, IT automation, and security solutions.", icon: "fas fa-shield-alt", link: "#wpsys" }
    ];
    return (
        <section className="py-20 bg-gray-50 dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map(p => (
                        <a href={p.link} key={p.name} className="block p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#679a41]/10 dark:bg-emerald-400/10 mx-auto mb-4">
                                <Icon name={p.icon} className="text-3xl text-[#679a41] dark:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-[#293c51] dark:text-gray-100">{p.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{p.description}</p>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

interface FeatureSectionProps {
    id: string;
    title: string;
    description: string;
    features: { icon: string; text: string }[];
    imageUrl: string;
    imagePosition?: 'left' | 'right';
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ id, title, description, features, imageUrl, imagePosition = 'left' }) => {
    const isImageLeft = imagePosition === 'left';
    return (
        <section id={id} className="py-20 bg-white dark:bg-slate-800">
            <div className="container mx-auto px-4">
                <div className={`flex flex-col md:flex-row gap-12 items-center ${isImageLeft ? '' : 'md:flex-row-reverse'}`}>
                    <div className="md:w-1/2">
                        <img src={imageUrl} alt={title} className="rounded-lg shadow-2xl object-cover w-full h-auto aspect-video" />
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-3xl font-bold mb-4 text-[#293c51] dark:text-gray-100">{title}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
                        <ul className="space-y-4">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    <Icon name={feature.icon} className="text-xl text-[#679a41] dark:text-emerald-400 mt-1 mr-4 flex-shrink-0" />
                                    <span>{feature.text}</span>
                                </li>
                            ))}
                        </ul>
                        <Button className="mt-8">Learn More</Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const SecurityTicker: React.FC = () => {
    const logos = [
        "https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%201.png",
        "https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%202.png",
        "https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%203.png",
        "https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%204.png",
        "https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%205.png"
    ];
    return (
        <section className="py-20 bg-gray-50 dark:bg-slate-900">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4 text-[#293c51] dark:text-gray-100">Security</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">Managed by our advanced SOC, we ensure your compliance across all critical regulations.</p>
                <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap">
                    {logos.map((logo, i) => (
                        <img key={i} src={logo} alt={`Certification Logo ${i + 1}`} className="h-12 w-auto object-contain" />
                    ))}
                </div>
            </div>
        </section>
    );
};

const WhyChooseUs: React.FC = () => {
    const benefits = [
        { icon: 'fas fa-headset', title: '24/7 Expert Support', description: 'Our dedicated, certified experts are always ready to help you, any time of the day.' },
        { icon: 'fas fa-shield-alt', title: 'Advanced Security', description: 'XDR, DDoS protection, Palo Alto firewalls, and continuous SOC monitoring keep you safe.' },
        { icon: 'fas fa-random', title: 'Seamless Migration', description: 'We handle your entire migration process with zero downtime, ensuring a smooth transition.' },
        { icon: 'fas fa-tachometer-alt', title: 'Mission-Critical Performance', description: 'Rely on our 99.99% SLA uptime guarantee for your most important applications.' },
    ];
    return (
        <section className="py-20 bg-gray-50 dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Why Choose WorldPosta?</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map(b => (
                        <Card key={b.title} className="text-center">
                            <Icon name={b.icon} className="text-4xl text-[#679a41] dark:text-emerald-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{b.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{b.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CustomerBenefits: React.FC = () => {
    const benefits = [
        { icon: 'fas fa-plane-departure', title: 'Easy, Zero-Downtime Migration', description: 'Migrate without disrupting your business operations.' },
        { icon: 'fas fa-globe-americas', title: 'Global Reach with Local Expertise', description: '35 availability zones and multilingual support.' },
        { icon: 'fas fa-award', title: 'Comprehensive Compliance', description: 'ISO, PCI DSS, and SOC 2 certifications.' },
    ];
    return (
        <section className="py-20 bg-white dark:bg-slate-800">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {benefits.map(b => (
                    <div key={b.title}>
                        <Icon name={b.icon} className="text-5xl text-[#679a41] dark:text-emerald-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">{b.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{b.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

const Certifications: React.FC = () => {
    // Placeholder logos. In a real app, these would be proper SVGs or PNGs.
    const logos = [
        "https://www.svgrepo.com/show/44310/nike.svg",
        "https://www.svgrepo.com/show/303472/adidas-logo.svg",
        "https://www.svgrepo.com/show/452131/coca-cola.svg",
        "https://www.svgrepo.com/show/303272/mcdonalds-15-logo.svg",
        "https://www.svgrepo.com/show/303269/netflix-logo.svg",
        "https://www.svgrepo.com/show/303152/amazon-logo.svg",
        "https://www.svgrepo.com/show/303268/google-logo.svg",
    ];
    return (
        <div className="py-12 bg-gray-100 dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap opacity-60">
                    {logos.map((logo, i) => (
                        <img key={i} src={logo} alt={`Client Logo ${i + 1}`} className="h-10 w-auto object-contain" />
                    ))}
                </div>
            </div>
        </div>
    );
};

const DataCenter: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const handleCtaClick = () => {
        if (isAuthenticated) {
            const role = user?.role;
            if (role === 'admin') navigate('/app/admin-dashboard');
            else if (role === 'reseller') navigate('/app/reseller-dashboard');
            else navigate('/app/dashboard');
        } else {
            navigate('/signup');
        }
    };

    return (
        <section className="py-20 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1591493732773-289591b36582?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3')"}}>
            <div className="absolute inset-0 bg-slate-900/80"></div>
            <div className="relative container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-4 text-white">Our distributed data centers allow enterprises to easily manage their IT architecture</h2>
                    <ul className="space-y-3 text-gray-200">
                        <li className="flex items-center"><Icon name="fas fa-check-circle" className="mr-3 text-emerald-400"/>Global availability</li>
                        <li className="flex items-center"><Icon name="fas fa-check-circle" className="mr-3 text-emerald-400"/>High performance and security</li>
                        <li className="flex items-center"><Icon name="fas fa-check-circle" className="mr-3 text-emerald-400"/>Scalability and customization</li>
                        <li className="flex items-center"><Icon name="fas fa-check-circle" className="mr-3 text-emerald-400"/>24/7 expert support</li>
                    </ul>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm p-8 rounded-lg">
                    <p className="text-lg text-gray-200">Contact our experts today at:</p>
                    <p className="text-3xl font-bold my-4 text-emerald-400">+1 (647) 556-6256</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="primary" size="lg" onClick={handleCtaClick}>
                            {isAuthenticated ? 'My Dashboard' : 'Register Now'}
                        </Button>
                        <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/20">Contact Us</Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const ContactForm: React.FC<{isAuthenticated: boolean}> = ({ isAuthenticated }) => {
    const [formData, setFormData] = useState({ name: '', email: '', inquiry: '', phone: '', details: '', terms: false });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
    }
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.terms) {
            alert("You must accept the terms and conditions.");
            return;
        }
        alert(`Form submitted! Thank you, ${formData.name}.`);
        console.log(formData);
    }
    return (
        <section className="py-20 bg-gray-50 dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-[#293c51] dark:text-gray-100">Ready to Experience Secure and Mission-Critical Cloud Solutions?</h2>
                        <p className="text-gray-600 dark:text-gray-400">{
                            isAuthenticated 
                            ? "We're here to help you build the perfect solution for your business needs. Schedule a free consultation with one of our experts."
                            : "Sign up today or schedule a free consultation with one of our experts. We're here to help you build the perfect solution for your business needs."
                        }</p>
                    </div>
                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <FormField id="name" name="name" label="Name" value={formData.name} onChange={handleChange} required />
                            <FormField id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
                            <FormField as="select" id="inquiry" name="inquiry" label="Inquiry" value={formData.inquiry} onChange={handleChange}>
                                <option value="">Select a service</option>
                                <option>CloudEdge Inquiry</option>
                                <option>SAP Hosting</option>
                                <option>Cybersecurity (SOC)</option>
                                <option>General IT Consultation</option>
                            </FormField>
                            <FormField id="phone" name="phone" label="Phone (Optional)" type="tel" value={formData.phone} onChange={handleChange} />
                            <FormField as="textarea" id="details" name="details" label="Additional Details (Optional)" value={formData.details} onChange={handleChange} />
                            <FormField type="checkbox" id="terms" name="terms" checked={formData.terms} onChange={handleChange} label="I accept the terms and conditions."/>
                            <Button type="submit" fullWidth disabled={!formData.terms}>Talk to Our Experts</Button>
                        </form>
                    </Card>
                </div>
            </div>
        </section>
    );
};

const ResourceLibrary: React.FC = () => {
    const articles = [
        { title: "Five Ways to Develop a World Class Sales Operations Function", link: "#" },
        { title: "Succession Risks That Threaten Your Leadership Strategy", link: "#" },
        { title: "Financial's Need For Strategic Advisor", link: "#" },
    ];
    return (
        <section className="py-20 bg-white dark:bg-slate-800">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">From Our Resource Library</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {articles.map(a => (
                        <a href={a.link} key={a.title} className="group block">
                            <Card className="h-full">
                                <img src="https://www.worldposta.com/assets/WP-Logo.png" alt="WorldPosta Logo" className="w-full h-40 object-contain p-4 rounded-t-lg bg-gray-100 dark:bg-slate-700 mb-4" />
                                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#679a41] dark:group-hover:text-emerald-400 transition-colors">{a.title}</h3>
                                <span className="text-sm font-semibold text-[#679a41] dark:text-emerald-400 group-hover:underline">Read More &rarr;</span>
                            </Card>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

const LandingFooter: React.FC = () => {
    return (
        <footer className="bg-slate-800 dark:bg-slate-900 text-gray-300 py-12">
            <div className="container mx-auto px-4 text-center">
                <Logo iconClassName="h-10 w-auto filter brightness-0 invert mx-auto mb-4" />
                <p>&copy; {new Date().getFullYear()} WorldPosta. All Rights Reserved.</p>
                <div className="mt-4 space-x-6">
                    <Link to="/login" className="hover:text-emerald-400 hover:underline">Portal Login</Link>
                    <a href="https://www.worldposta.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 hover:underline">Privacy Policy</a>
                    <a href="https://www.worldposta.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 hover:underline">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};


export const LandingPage: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    
    // State for dropdowns
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    
    // App Launcher items
    const appLauncherItems = getAppLauncherItems(user?.role);
    const userNavItems: NavItem[] = [
        { name: 'Dashboard', path: user?.role === 'admin' ? '/app/admin-dashboard' : user?.role === 'reseller' ? '/app/reseller-dashboard' : '/app/dashboard', iconName: 'fas fa-home' },
        { name: 'Profile', path: '/app/profile', iconName: 'fas fa-user-circle' },
        { name: 'Settings', path: '/app/settings', iconName: 'fas fa-cog' },
    ];
    
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const cloudEdgeFeatures = [
        { icon: "fas fa-cogs", text: "Resource Pools with dedicated CPU, Memory, and Storage." },
        { icon: "fas fa-expand-arrows-alt", text: "Customizable VMs: Up to 128 cores and 24TB Memory." },
        { icon: "fas fa-hdd", text: "High-performance NVME and SSD storage options." },
        { icon: "fas fa-brain", text: "AI-Powered Optimization for peak performance and efficiency." },
        { icon: "fas fa-network-wired", text: "Global low-latency network across 35 availability zones." },
    ];
    const sapFeatures = [
        { icon: "fab fa-suse", text: "Comprehensive SAP Hosting with hardened SUSE Linux environments." },
        { icon: "fas fa-tasks", text: "Continuous SAP Management, including monitoring, backups, and security." },
        { icon: "fas fa-user-tie", text: "Dedicated SAP Team of certified experts to support your operations." },
    ];
    const cloudSpaceFeatures = [
        { icon: "fas fa-comments", text: "Team chat and video conferencing for seamless communication." },
        { icon: "fas fa-file-alt", text: "Real-time document sharing and collaborative editing." },
        { icon: "fas fa-database", text: "Secure file storage with a generous 10 TB per user." },
        { icon: "fas fa-magic", text: "AI-powered productivity tools to streamline your workflows." },
    ];
    const postaFeatures = [
        { icon: "fas fa-hdd", text: "Massive mailboxes up to 1TB to store all your important communications." },
        { icon: "fas fa-shield-virus", text: "Zero-day attack protection to safeguard against emerging threats." },
        { icon: "fas fa-user-secret", text: "Advanced anti-phishing and end-to-end encryption for maximum security." },
        { icon: "fas fa-check-double", text: "99.99% SLA uptime guarantee for mission-critical reliability." },
    ];
    const wpsysFeatures = [
        { icon: "fas fa-broadcast-tower", text: "Security Operations Center (SOC) with 24/7 monitoring and threat response." },
        { icon: "fas fa-cloud-upload-alt", text: "Automated multi-cloud and hybrid cloud management for simplified IT." },
        { icon: "fas fa-cogs", text: "Continuous SAP operations and expert support to optimize your ERP." },
        { icon: "fas fa-fingerprint", text: "Advanced cybersecurity solutions including XDR and Managed Palo Alto Firewalls." },
    ];

    const headerTextColor = !isScrolled ? 'text-white' : 'text-gray-700 dark:text-gray-200';
    const headerButtonHover = !isScrolled ? 'hover:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-slate-700';

    return (
        <div className="bg-white dark:bg-slate-900">
             {isAuthenticated && user && (
                <FloatingAppLauncher navItems={userNavItems} appItems={appLauncherItems} />
            )}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white dark:bg-slate-800 shadow-md' : 'bg-transparent'}`}>
                <nav className="container mx-auto flex justify-between items-center p-4">
                    <Logo iconClassName={`h-8 w-auto transition-all ${!isScrolled ? 'filter brightness-0 invert' : ''}`} />
                    <div className="flex items-center space-x-2 md:space-x-4">
                         {isAuthenticated && user ? (
                            <>
                                {/* USER MENU */}
                                <div ref={userMenuRef} className="relative">
                                    <button onClick={() => setUserMenuOpen(o => !o)} className={`flex items-center rounded-full p-1 ${headerTextColor} ${headerButtonHover}`}>
                                        {user.avatarUrl ? (
                                            <img className="h-8 w-8 rounded-full" src={user.avatarUrl} alt="User avatar" />
                                        ) : (
                                            <Icon name="fas fa-user-circle" className="h-8 w-8 text-3xl" />
                                        )}
                                        <span className="ml-2 hidden md:inline font-medium">{user.displayName}</span>
                                        <Icon name="fas fa-chevron-down" className={`ml-1 text-xs transform transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                                    </button>
                                    {userMenuOpen && (
                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none text-[#293c51] dark:text-gray-200">
                                            {userNavItems.map(item => (
                                                <Link key={item.name} to={item.path} onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                                                    <Icon name={item.iconName || ''} className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> {item.name}
                                                </Link>
                                            ))}
                                             <button
                                                onClick={() => { logout(); setUserMenuOpen(false); }}
                                                className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600 text-red-600 dark:text-red-400"
                                            >
                                                <Icon name="fas fa-sign-out-alt" className="w-5 h-5 mr-2" fixedWidth /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="space-x-2">
                                <Button variant="ghost" onClick={() => navigate('/login')} className={`${headerTextColor} ${headerButtonHover}`}>Sign In</Button>
                                <Button variant="primary" onClick={() => navigate('/signup')}>Get Started</Button>
                            </div>
                        )}
                    </div>
                </nav>
            </header>
            <main>
                <HeroSlider />
                <ProductBrief />
                <FeatureSection 
                    id="cloudedge"
                    title="Scalability and Performance at Your Fingertips"
                    description="Scale your infrastructure with customizable resource pools, dedicated performance, and enterprise-level security. CloudEdge provides the foundation for your most demanding applications."
                    features={cloudEdgeFeatures}
                    imageUrl="https://www.worldposta.com/assets/Newhomeimgs/jpeg-optimizer_4.jpg1-ezgif.com-apng-to-avif-converter.avif"
                />
                 <FeatureSection 
                    id="sap"
                    title="Empowering Your SAP Environment with WorldPosta's Expertise"
                    description="Optimize your SAP operations with our robust cloud hosting, enhanced security, and expert management. We ensure your SAP landscape is stable, secure, and performing at its best."
                    features={sapFeatures}
                    imageUrl="https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2106&auto=format&fit=crop&ixlib=rb-4.0.3"
                    imagePosition='right'
                />
                <SecurityTicker />
                 <FeatureSection 
                    id="cloudspace"
                    title="Collaborate Anywhere with CloudSpace"
                    description="Enhance team productivity with secure file sharing, video conferencing, and AI-powered collaboration tools. CloudSpace is your all-in-one digital workspace."
                    features={cloudSpaceFeatures}
                    imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
                />
                <FeatureSection 
                    id="posta"
                    title="Power Your Business with Professional, Secure Email"
                    description="Unlock seamless communication with enterprise-grade email powered by cutting-edge cloud infrastructure. Posta is more than just email; it's a secure communication hub."
                    features={postaFeatures}
                    imageUrl="https://www.worldposta.com/assets/Newhomeimgs/jpeg-optimizer_jpeg-optimizer_6-ezgif.com-apng-to-avif-converter.avif"
                    imagePosition='right'
                />
                 <FeatureSection 
                    id="wpsys"
                    title="WPSYS: IT Solutions That Drive Growth"
                    description="From comprehensive IT infrastructure management to advanced cybersecurity and system integration, WPSYS provides the end-to-end solutions your business needs to thrive."
                    features={wpsysFeatures}
                    imageUrl="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
                />
                <WhyChooseUs />
                <CustomerBenefits />
                <Certifications />
                <DataCenter />
                <ContactForm isAuthenticated={isAuthenticated} />
                <ResourceLibrary />
            </main>
            <LandingFooter />
        </div>
    );
};

// --- END NEW LANDING PAGE ---


export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Account name and password are required.');
      return;
    }
    try {
      await login(email, password);
      // On success, AuthProvider will handle navigation.
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleRoleLogin = async (roleEmail: string, rolePass: string) => {
    setError('');
    try {
      await login(roleEmail, rolePass);
    } catch (err: any) {
      setError(err.message || `Demo login for ${roleEmail} failed.`);
    }
  };

  return (
    <AuthLayout 
        formTitle="Welcome Back" 
        formSubtitle="Sign in to your WorldPosta account." 
        isLoginPage={true}
    >
      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <FormField 
            id="email" 
            label="Account Name" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Enter your account name" 
            required 
        />
        <FormField 
            id="password" 
            label="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Enter your password" 
            required 
            showPasswordToggle={true}
        />
        
        <div className="flex items-center justify-between text-sm">
            <FormField
                type="checkbox"
                id="rememberMe"
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe((e.target as HTMLInputElement).checked)}
                wrapperClassName="mb-0" 
            />
            <a href="#" className="font-medium text-[#679a41] hover:text-[#588836] dark:text-emerald-400 dark:hover:text-emerald-500 hover:underline">
              Forgot password?
            </a>
        </div>

        {error && <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
        
        <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="!mt-6">
          Sign In
        </Button>
      </form>
      <div className="mt-4 space-y-2">
        <Button onClick={() => handleRoleLogin('customer@worldposta.com', 'password')} variant="outline" size="md" fullWidth isLoading={isLoading}>
          Login as Customer (Demo)
        </Button>
        <Button onClick={() => handleRoleLogin('admin@worldposta.com', 'password_admin')} variant="outline" size="md" fullWidth isLoading={isLoading}>
          Login as Admin (Demo)
        </Button>
        <Button onClick={() => handleRoleLogin('reseller@worldposta.com', 'password_reseller')} variant="outline" size="md" fullWidth isLoading={isLoading}>
          Login as Reseller (Demo)
        </Button>
      </div>
    </AuthLayout>
  );
};

export const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !companyName || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await signup({ fullName, email, companyName, password });
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <AuthLayout 
        formTitle="Create an account" 
        formSubtitle="Get started with WorldPosta services" 
        isLoginPage={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField id="fullName" label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required 
            placeholder="Enter your full name"/>
        <FormField id="email" label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required 
            placeholder="you@example.com"/>
        <FormField id="companyName" label="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required 
            placeholder="Your company's name"/>
        <FormField id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required showPasswordToggle={true}
            placeholder="Create a strong password"/>
        <FormField id="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required showPasswordToggle={true}
            placeholder="Confirm your password"/>
        {error && <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
        <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="!mt-6">
          Create Account
        </Button>
      </form>
    </AuthLayout>
  );
};

export const EmailVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <AuthLayout formTitle="Verify Your Email" formSubtitle="One last step to secure your account." isLoginPage={false}>
            <div className="text-center space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                    A verification email has been sent to your email address. Please check your inbox and follow the instructions to complete your registration.
                </p>
                <Button onClick={() => navigate('/login')} fullWidth size="lg">
                    Continue to Login
                </Button>
                <button className="text-sm text-[#679a41] hover:text-[#588836] dark:text-emerald-400 dark:hover:text-emerald-500 hover:underline">
                    Didn't receive email? Resend verification
                </button>
            </div>
        </AuthLayout>
    );
};

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


export const AdminDashboardPage: React.FC = () => {
    const adminApps: (ApplicationCardData & {section: 'product' | 'application'})[] = [
        {
            id: 'customers',
            name: 'Customers',
            description: 'Search, manage, and view customer accounts and their dashboards.',
            iconName: 'fas fa-users',
            launchUrl: '/app/admin/users',
            section: 'application'
        },
        {
            id: 'billing',
            name: 'Billing Overview',
            description: 'Access and manage billing for all customer accounts.',
            iconName: 'fas fa-cash-register',
            launchUrl: '/app/billing',
            section: 'application'
        }
    ];
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminApps.map(app => <ApplicationCard key={app.id} {...app} />)}
            </div>
        </div>
    );
};

export const ResellerDashboardPage: React.FC = () => {
    const resellerApps: (ApplicationCardData & {section: 'product' | 'application'})[] = [
        {
            id: 'customers',
            name: 'My Customers',
            description: 'Access and manage your customer accounts and view their dashboards.',
            iconName: 'fas fa-user-friends',
            launchUrl: '/app/reseller/customers',
            section: 'application'
        },
        {
            id: 'billing',
            name: 'Reseller Billing',
            description: 'Manage your billing, commissions, and payment history.',
            iconName: 'fas fa-file-invoice-dollar',
            launchUrl: '/app/billing',
            section: 'application'
        }
    ];
     return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Reseller Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resellerApps.map(app => <ApplicationCard key={app.id} {...app} />)}
            </div>
        </div>
    );
};

const UserListTable: React.FC<{ 
    users: User[], 
    searchTerm: string, 
    onUserSelect: (userId: string) => void,
    onUserEdit: (userId: string) => void,
    onUserDelete: (userId: string) => void
}> = ({ users, searchTerm, onUserSelect, onUserEdit, onUserDelete }) => {
    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusChip = (status: User['status']) => {
        const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize';
        switch (status) {
            case 'active':
                return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Active</span>;
            case 'suspended':
                return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>Suspended</span>;
            case 'blocked':
                return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>Blocked</span>;
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>Unknown</span>;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-slate-800">
                <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Full Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{user.fullName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.companyName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {getStatusChip(user.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                    <Button size="sm" onClick={() => onUserSelect(user.id)}>
                                        View Dashboard
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => onUserEdit(user.id)} 
                                        title="Edit User" 
                                        leftIconName="fas fa-pencil-alt"
                                        className="text-gray-500 hover:text-[#679a41] dark:text-gray-400 dark:hover:text-emerald-400"
                                    />
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => onUserDelete(user.id)} 
                                        title="Delete User" 
                                        leftIconName="fas fa-trash-alt"
                                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                                    />
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">No users found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export const UserManagementPage: React.FC = () => { // For Admins
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState(() => getAllMockCustomers());
    const navigate = useNavigate();

    // State for delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    const handleViewDashboard = (userId: string) => {
        navigate(`/app/dashboard?viewAsUser=${userId}&returnTo=/app/admin/users`);
    };

    const handleEditUser = (userId: string) => {
        alert(`Editing user ID: ${userId}. This would typically open a user editing modal or page.`);
    };

    const handleOpenDeleteModal = (userId: string) => {
        const user = customers.find(c => c.id === userId);
        if (user) {
            setUserToDelete(user);
            setDeleteConfirmationText('');
            setIsDeleteModalOpen(true);
        }
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (userToDelete && deleteConfirmationText === 'DELETE') {
            // In a real app, this would be an API call
            setCustomers(prev => prev.filter(c => c.id !== userToDelete.id));
            
            // Also update the source MOCK_USERS for this session's persistence
            if (MOCK_USERS[userToDelete.email]) {
                delete MOCK_USERS[userToDelete.email];
            }
            handleCloseDeleteModal();
        }
    };

    return (
        <>
            <Card title="Customer Accounts">
                <div className="flex justify-between items-center mb-4">
                    <div className="w-full max-w-xs">
                        <FormField id="search-customer" label="" placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <Button leftIconName="fas fa-user-plus">Add New User</Button>
                </div>
                <UserListTable 
                    users={customers} 
                    searchTerm={searchTerm} 
                    onUserSelect={handleViewDashboard} 
                    onUserEdit={handleEditUser}
                    onUserDelete={handleOpenDeleteModal}
                />
            </Card>

            {isDeleteModalOpen && userToDelete && (
                 <Modal 
                    isOpen={isDeleteModalOpen} 
                    onClose={handleCloseDeleteModal}
                    title={`Delete User: ${userToDelete.fullName}`}
                    size="md"
                    footer={
                        <>
                            <Button variant="ghost" onClick={handleCloseDeleteModal}>Cancel</Button>
                            <Button 
                                variant="danger" 
                                onClick={handleConfirmDelete}
                                disabled={deleteConfirmationText !== 'DELETE'}
                            >
                                Delete User
                            </Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            This action is permanent and cannot be undone. You are about to delete the user account for 
                            <strong className="text-red-600 dark:text-red-400"> {userToDelete.fullName} ({userToDelete.email})</strong>.
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                           To confirm, please type <strong className="font-mono text-[#293c51] dark:text-gray-200">DELETE</strong> in the box below.
                        </p>
                        <FormField
                            id="delete-confirm"
                            label=""
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            inputClassName="text-center tracking-widest"
                        />
                    </div>
                </Modal>
            )}
        </>
    );
};


export const ResellerCustomersPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState(() => getAllMockCustomers()); // In real app, filter by reseller's managed customers
    const navigate = useNavigate();
    
    // State for delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    const handleViewDashboard = (userId: string) => {
        navigate(`/app/dashboard?viewAsUser=${userId}&returnTo=/app/reseller/customers`);
    };
    
    const handleEditUser = (userId: string) => {
        alert(`Editing customer ID: ${userId}. This would typically open a customer editing modal or page.`);
    };

    const handleOpenDeleteModal = (userId: string) => {
        const user = customers.find(c => c.id === userId);
        if (user) {
            setUserToDelete(user);
            setDeleteConfirmationText('');
            setIsDeleteModalOpen(true);
        }
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (userToDelete && deleteConfirmationText === 'DELETE') {
            setCustomers(prev => prev.filter(c => c.id !== userToDelete.id));
            if (MOCK_USERS[userToDelete.email]) {
                delete MOCK_USERS[userToDelete.email];
            }
            handleCloseDeleteModal();
        }
    };

    return (
        <>
            <Card title="My Customers">
                <div className="flex justify-between items-center mb-4">
                     <div className="w-full max-w-xs">
                        <FormField id="search-reseller-customer" label="" placeholder="Search your customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <Button leftIconName="fas fa-user-plus">Add New User</Button>
                </div>
                <UserListTable 
                    users={customers} 
                    searchTerm={searchTerm} 
                    onUserSelect={handleViewDashboard} 
                    onUserEdit={handleEditUser}
                    onUserDelete={handleOpenDeleteModal}
                />
            </Card>

            {isDeleteModalOpen && userToDelete && (
                 <Modal 
                    isOpen={isDeleteModalOpen} 
                    onClose={handleCloseDeleteModal}
                    title={`Delete Customer: ${userToDelete.fullName}`}
                    size="md"
                    footer={
                        <>
                            <Button variant="ghost" onClick={handleCloseDeleteModal}>Cancel</Button>
                            <Button 
                                variant="danger" 
                                onClick={handleConfirmDelete}
                                disabled={deleteConfirmationText !== 'DELETE'}
                            >
                                Delete Customer
                            </Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            This action is permanent and cannot be undone. You are about to delete the customer account for 
                            <strong className="text-red-600 dark:text-red-400"> {userToDelete.fullName} ({userToDelete.email})</strong>.
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                           To confirm, please type <strong className="font-mono text-[#293c51] dark:text-gray-200">DELETE</strong> in the box below.
                        </p>
                        <FormField
                            id="delete-confirm-reseller"
                            label=""
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            inputClassName="text-center tracking-widest"
                        />
                    </div>
                </Modal>
            )}
        </>
    );
};

export const StaffManagementPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const internalUsers = useMemo(() => getAllMockInternalUsers(), []);

    const filteredUsers = internalUsers.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card title="Staff & Permissions">
            <div className="flex justify-between items-center mb-4">
                <div className="w-full max-w-xs">
                    <FormField id="search-staff" label="" placeholder="Search staff members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Button leftIconName="fas fa-plus">Add Staff Member</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-slate-800">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Full Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{user.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{user.role}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button size="sm" variant="outline">Edit Permissions</Button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">No staff found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export const AdminRouterPage: React.FC = () => {
    return (
        <div>
            <Outlet />
        </div>
    );
};

export const InvoiceRouterPage: React.FC = () => {
    return (
        <div>
            <Outlet />
        </div>
    );
};

export const SettingsRouterPage: React.FC = () => {
    const { toggleTheme, ThemeIconComponent } = useTheme();

    const settingsNavItems = [
        { name: "Account", path: "account", iconName: "fas fa-user-circle" },
        { name: "Security", path: "security", iconName: "fas fa-shield-alt" },
        { name: "Notifications", path: "notifications", iconName: "fas fa-bell" },
    ];
    
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4 lg:w-1/5">
                <Card className="p-4">
                    <h2 className="text-lg font-semibold mb-4 text-[#293c51] dark:text-gray-100">Settings</h2>
                    <nav className="space-y-1">
                        {settingsNavItems.map(item => (
                             <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) => `flex items-center px-3 py-2 text-sm font-medium rounded-md ${ isActive ? 'bg-[#679a41] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700' }`}
                            >
                                <Icon name={item.iconName} className="mr-3 w-5" />
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                    <hr className="my-4 dark:border-gray-600"/>
                    <div className="px-3 py-2">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600">
                                <ThemeIconComponent className="text-lg text-gray-500 dark:text-gray-400" />
                            </button>
                        </label>
                    </div>
                </Card>
            </div>
            <div className="md:w-3/4 lg:w-4/5">
                <Outlet />
            </div>
        </div>
    );
};

export const ProfilePage: React.FC = () => {
    return <Navigate to="/app/settings/account" replace />;
};

export const AccountSettingsPage: React.FC = () => {
    const { user, updateProfile, isLoading, changePassword } = useAuth();
    const [formState, setFormState] = useState({
        fullName: user?.fullName || '',
        displayName: user?.displayName || '',
        email: user?.email || '',
        companyName: user?.companyName || '',
        phoneNumber: user?.phoneNumber || ''
    });
     const [passState, setPassState] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassState({ ...passState, [e.target.name]: e.target.value });
    };
    
    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { email, ...updateData } = formState; // exclude email
        updateProfile(updateData);
    };

    const handlePassSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passState.newPassword !== passState.confirmNewPassword) {
            alert("New passwords do not match.");
            return;
        }
        changePassword(passState.oldPassword, passState.newPassword);
        setPassState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    };


    return (
        <div className="space-y-6">
            <Card title="Account Information">
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="fullName" name="fullName" label="Full Name" value={formState.fullName} onChange={handleInfoChange} />
                        <FormField id="displayName" name="displayName" label="Display Name" value={formState.displayName} onChange={handleInfoChange} />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="email" name="email" label="Email" value={formState.email} onChange={handleInfoChange} disabled />
                        <FormField id="companyName" name="companyName" label="Company Name" value={formState.companyName} onChange={handleInfoChange} />
                     </div>
                     <FormField id="phoneNumber" name="phoneNumber" label="Phone Number" type="tel" value={formState.phoneNumber} onChange={handleInfoChange} />
                     <div className="flex justify-end">
                         <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                     </div>
                </form>
            </Card>
            <Card title="Change Password">
                 <form onSubmit={handlePassSubmit} className="space-y-4">
                    <FormField id="oldPassword" name="oldPassword" label="Old Password" type="password" value={passState.oldPassword} onChange={handlePassChange} showPasswordToggle/>
                    <FormField id="newPassword" name="newPassword" label="New Password" type="password" value={passState.newPassword} onChange={handlePassChange} showPasswordToggle/>
                    <FormField id="confirmNewPassword" name="confirmNewPassword" label="Confirm New Password" type="password" value={passState.confirmNewPassword} onChange={handlePassChange} showPasswordToggle/>
                    <div className="flex justify-end">
                         <Button type="submit" isLoading={isLoading}>Change Password</Button>
                     </div>
                </form>
            </Card>
        </div>
    );
};

export const SecuritySettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [mfaStep, setMfaStep] = useState(1);
    const [mfaMethod, setMfaMethod] = useState<'app' | 'email'>('app');
    const [mfaVerificationCode, setMfaVerificationCode] = useState('');
    const [mfaError, setMfaError] = useState('');

    const handleCloseMfaModal = () => {
        setIsMfaModalOpen(false);
        setTimeout(() => {
            setMfaStep(1);
            setMfaMethod('app');
            setMfaVerificationCode('');
            setMfaError('');
        }, 300);
    };

    const handleMfaSubmit = () => {
        setMfaError('');
        if (mfaStep === 1) {
            setMfaStep(2);
        } else if (mfaStep === 2) {
            if (mfaVerificationCode === '123456') { // Mock verification
                setMfaEnabled(true);
                setMfaStep(3);
            } else {
                setMfaError('Invalid verification code. Please try again.');
            }
        }
    };
    
    const handleDisableMfa = () => {
        if (window.confirm("Are you sure you want to disable Multi-Factor Authentication?")) {
            setMfaEnabled(false);
            handleCloseMfaModal();
        }
    };


    const mockLoginLogs = [
        { id: 1, date: new Date().toISOString(), ip: '192.168.1.10', location: 'New York, USA', device: 'Chrome on macOS', status: 'Success' },
        { id: 2, date: new Date(Date.now() - 3600000 * 5).toISOString(), ip: '10.0.0.5', location: 'London, UK', device: 'Firefox on Windows', status: 'Success' },
        { id: 3, date: new Date(Date.now() - 3600000 * 25).toISOString(), ip: '203.0.113.19', location: 'Tokyo, Japan', device: 'Safari on iOS', status: 'Failed' },
        { id: 4, date: new Date(Date.now() - 3600000 * 48).toISOString(), ip: '198.51.100.22', location: 'Sydney, Australia', device: 'Chrome on Android', status: 'Success' },
    ];
    
    return (
        <div className="space-y-6">
            <Card title="Multi-Factor Authentication (MFA)">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">Add an extra layer of security to protect your account from unauthorized access.</p>
                        <div className="mt-2 flex items-center gap-2">
                           {mfaEnabled ? (
                                <>
                                    <Icon name="fas fa-check-circle" className="text-green-500" />
                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">MFA is enabled.</span>
                                </>
                            ) : (
                                <>
                                   <Icon name="fas fa-times-circle" className="text-red-500" />
                                   <span className="text-sm font-semibold text-red-600 dark:text-red-400">MFA is currently disabled.</span>
                                </>
                           )}
                        </div>
                    </div>
                    <Button onClick={() => setIsMfaModalOpen(true)} leftIconName="fas fa-shield-alt">
                        {mfaEnabled ? 'Manage MFA' : 'Enable MFA'}
                    </Button>
                </div>
            </Card>

            <Card title="Recent Login Activity">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">IP Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Location</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Device/Browser</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {mockLoginLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(log.date).toLocaleString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{log.ip}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.location}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.device}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'Success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isMfaModalOpen} onClose={handleCloseMfaModal} title={mfaEnabled ? "Manage MFA" : "Setup Multi-Factor Authentication"} size="lg">
                {mfaEnabled ? (
                     <div className="text-center space-y-6 py-8">
                        <Icon name="fas fa-shield-alt" className="text-5xl text-green-500 mx-auto" />
                        <p className="text-gray-700 dark:text-gray-200">Multi-Factor Authentication is currently active on your account.</p>
                        <div className="flex justify-center gap-4">
                            <Button variant="outline" onClick={handleCloseMfaModal}>Close</Button>
                            <Button variant="danger" onClick={handleDisableMfa}>Disable MFA</Button>
                        </div>
                    </div>
                ) : (
                    <>
                    {mfaStep === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Choose your preferred method to receive security codes when you sign in.
                            </p>
                            <label htmlFor="mfa-app" className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${mfaMethod === 'app' ? 'border-[#679a41] ring-2 ring-[#679a41]/50 bg-green-50 dark:bg-emerald-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                                <div className="flex items-center">
                                    <input type="radio" id="mfa-app" name="mfa-method" value="app" checked={mfaMethod === 'app'} onChange={() => setMfaMethod('app')} className="h-4 w-4 text-[#679a41] focus:ring-[#679a41] border-gray-300" />
                                    <div className="ml-4 flex items-center gap-3">
                                        <Icon name="fas fa-qrcode" className="text-3xl text-[#679a41] dark:text-emerald-400 w-8 text-center" />
                                        <div>
                                            <h4 className="font-semibold text-[#293c51] dark:text-gray-100">Authenticator App</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Use an app like Google Authenticator, Authy, or 1Password.</p>
                                        </div>
                                    </div>
                                </div>
                            </label>
                            <label htmlFor="mfa-email" className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${mfaMethod === 'email' ? 'border-[#679a41] ring-2 ring-[#679a41]/50 bg-green-50 dark:bg-emerald-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                                <div className="flex items-center">
                                    <input type="radio" id="mfa-email" name="mfa-method" value="email" checked={mfaMethod === 'email'} onChange={() => setMfaMethod('email')} className="h-4 w-4 text-[#679a41] focus:ring-[#679a41] border-gray-300" />
                                    <div className="ml-4 flex items-center gap-3">
                                        <Icon name="fas fa-envelope-open-text" className="text-3xl text-[#679a41] dark:text-emerald-400 w-8 text-center" />
                                        <div>
                                            <h4 className="font-semibold text-[#293c51] dark:text-gray-100">Email Authentication</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Receive a code to your registered email address upon login.</p>
                                        </div>
                                    </div>
                                </div>
                            </label>
                            <div className="mt-6 flex justify-end space-x-2">
                                <Button variant="outline" onClick={handleCloseMfaModal}>Cancel</Button>
                                <Button onClick={handleMfaSubmit} disabled={!mfaMethod}>Continue</Button>
                            </div>
                        </div>
                    )}

                    {mfaStep === 2 && mfaMethod === 'app' && (
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Scan the image below with your authenticator app, then enter the 6-digit code to verify.</p>
                            <div className="flex justify-center p-4 bg-white rounded-lg">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/WorldPosta:${user?.email}?secret=JBSWY3DPEHPK3PXP&issuer=WorldPosta`} alt="QR Code for MFA Setup" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Can't scan? Enter this code manually:</p>
                            <p className="font-mono tracking-widest p-2 bg-gray-100 dark:bg-slate-700 rounded-md">JBSWY3DPEHPK3PXP</p>
                            <FormField id="mfa-code" label="Verification Code" value={mfaVerificationCode} onChange={e => setMfaVerificationCode(e.target.value)} placeholder="Enter 6-digit code" error={mfaError} inputClassName="text-center tracking-[0.5em]" maxLength={6}/>
                            <div className="mt-6 flex justify-between">
                                <Button variant="outline" onClick={() => setMfaStep(1)}>Back</Button>
                                <Button onClick={handleMfaSubmit}>Verify & Enable</Button>
                            </div>
                        </div>
                    )}
                    
                    {mfaStep === 2 && mfaMethod === 'email' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">We've sent a 6-digit verification code to <span className="font-semibold text-[#293c51] dark:text-gray-200">{user?.email}</span>. Please enter it below.</p>
                            <FormField id="mfa-code" label="Verification Code" value={mfaVerificationCode} onChange={e => setMfaVerificationCode(e.target.value)} placeholder="Enter 6-digit code" error={mfaError} inputClassName="text-center tracking-[0.5em]" maxLength={6}/>
                            <div className="mt-6 flex justify-between">
                                <Button variant="outline" onClick={() => setMfaStep(1)}>Back</Button>
                                <Button onClick={handleMfaSubmit}>Verify & Enable</Button>
                            </div>
                        </div>
                    )}

                    {mfaStep === 3 && (
                        <div className="text-center space-y-4 py-8">
                            <Icon name="fas fa-check-circle" className="text-5xl text-green-500 mx-auto" />
                            <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">MFA Enabled!</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">You have successfully secured your account with Multi-Factor Authentication.</p>
                            <div className="mt-6 flex justify-center">
                                <Button onClick={handleCloseMfaModal}>Done</Button>
                            </div>
                        </div>
                    )}
                    </>
                )}
            </Modal>
        </div>
    );
};


export const NotificationSettingsPage: React.FC = () => (
    <Card title="Notification Settings">
        <p className="text-gray-600 dark:text-gray-400">Conceptual page for managing email and push notification preferences.</p>
    </Card>
);

export const SystemSettingsPage: React.FC = () => (
    <Card title="System Settings">
        <p className="text-gray-600 dark:text-gray-400">Conceptual page for system-wide configurations, such as branding, default permissions, etc.</p>
    </Card>
);

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

export const EmailConfigurationsPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [domainName, setDomainName] = useState('');
    const [emailUser, setEmailUser] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [sendInstructions, setSendInstructions] = useState(false);
    const [additionalEmail, setAdditionalEmail] = useState('');
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');

    const steps = [
        { name: 'Create Mailbox' },
        { name: 'Verify MX & SPF' },
        { name: 'Email Migration' }
    ];

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
        let newPassword = '';
        for (let i = 0; i < 22; i++) {
            newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(newPassword);
        setConfirmPassword(newPassword);
    };

    const handleNext = () => {
        if (currentStep === 0) {
            if (!firstName || !lastName || !displayName || !domainName || !emailUser || !password || !confirmPassword) {
                alert("Please fill all required fields.");
                return;
            }
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handleCancel = () => {
        navigate('/app/billing');
    };

    const handleVerify = () => {
        setVerificationStatus('verifying');
        setTimeout(() => {
            if (domainName) { // Mock success if domain is entered
                setVerificationStatus('success');
            } else {
                setVerificationStatus('failed');
            }
        }, 2000);
    };

    const DNSRecordRow: React.FC<{type: string, name: string, value: string, priority?: number, ttl?: string}> = ({type, name, value, priority, ttl="14400 (4 hours)"}) => {
        const handleCopy = (text: string) => {
            navigator.clipboard.writeText(text).then(() => {
                alert(`Copied: ${text}`);
            }, (err) => {
                alert('Failed to copy text.');
                console.error('Could not copy text: ', err);
            });
        };

        return (
            <tr className="border-b dark:border-gray-700">
                <td className="px-4 py-3 text-sm font-semibold">{type}</td>
                <td className="px-4 py-3 text-sm font-mono">{name}</td>
                <td className="px-4 py-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="font-mono">{value}</span>
                        <Button size="icon" variant="ghost" onClick={() => handleCopy(value)} title="Copy value">
                            <Icon name="far fa-copy" />
                        </Button>
                    </div>
                    {priority && <p className="text-xs text-gray-500">Priority: {priority}</p>}
                </td>
                <td className="px-4 py-3 text-sm font-mono">{ttl}</td>
            </tr>
        );
    };

    return (
        <Card title="Email Configurations">
            <div className="w-full md:w-3/4 lg:w-2/3 mx-auto">
                <Stepper steps={steps} currentStep={currentStep} className="my-8" />
            </div>

            {currentStep === 0 && (
                <div className="mt-8 max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold text-center mb-6">Create Your First Mailbox</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            id="firstName"
                            label="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter first name"
                            required
                        />
                        <FormField
                            id="lastName"
                            label="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter last name"
                            required
                        />
                    </div>
                    <FormField
                        id="displayName"
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter display name"
                        required
                    />
                    
                    <FormField
                        id="domainName"
                        label="Domain Name"
                        value={domainName}
                        onChange={(e) => setDomainName(e.target.value)}
                        placeholder="example.com"
                        required
                    />
                    <div className="mb-4">
                        <label htmlFor="emailUser" className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300">
                            Email Address <span className="text-red-500 dark:text-red-400">*</span>
                        </label>
                        <div className="flex items-center">
                            <input
                                id="emailUser"
                                name="emailUser"
                                type="text"
                                value={emailUser}
                                onChange={(e) => setEmailUser(e.target.value)}
                                placeholder="your-name"
                                className="w-full px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                required
                            />
                            <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm rounded-r-md">
                                @{domainName || 'your-domain.com'}
                            </span>
                        </div>
                    </div>
                    <FormField
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        showPasswordToggle
                    />
                     <FormField
                        id="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        showPasswordToggle
                    />
                    <div className="text-right -mt-2 mb-4">
                         <Button type="button" variant="ghost" size="sm" onClick={generatePassword}>
                            Generate Complex Password
                        </Button>
                    </div>
                    <FormField
                        type="checkbox"
                        id="sendInstructions"
                        label="Send setup instructions"
                        checked={sendInstructions}
                        onChange={(e) => setSendInstructions((e.target as HTMLInputElement).checked)}
                    />
                    {sendInstructions && (
                         <FormField
                            id="additionalEmail"
                            label="Additional setup instructions email"
                            type="email"
                            value={additionalEmail}
                            onChange={(e) => setAdditionalEmail(e.target.value)}
                            placeholder="another.email@example.com"
                            hint="Instructions will be sent to the new mailbox and this address if provided."
                        />
                    )}

                    <div className="flex justify-end space-x-2 mt-8">
                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleNext}>Next</Button>
                    </div>
                </div>
            )}
            
            {currentStep === 1 && (
                 <div className="mt-8 max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold text-center mb-2">Verify Your Domain's MX & SPF Records</h3>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                        To receive emails at <span className="font-semibold text-[#293c51] dark:text-gray-200">{emailUser}@{domainName}</span>, you need to update your domain's DNS records at your domain registrar (e.g., GoDaddy, Namecheap).
                    </p>
                    
                    <Card title="Required DNS Records">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name/Host</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Value/Target</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">TTL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <DNSRecordRow type="MX" name="@" value="mail.worldposta.com" priority={10} />
                                    <DNSRecordRow type="TXT" name="@" value={`"v=spf1 include:spf.worldposta.com ~all"`} />
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                            Note: DNS changes can take up to 48 hours to propagate fully, but are usually much faster.
                        </p>
                    </Card>
                    
                    <div className="text-center mt-6">
                        {verificationStatus === 'idle' && (
                            <Button onClick={handleVerify} leftIconName="fas fa-check-double">Verify DNS Records</Button>
                        )}
                        {verificationStatus === 'verifying' && (
                            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                                <Spinner size="sm" /> Verifying records...
                            </div>
                        )}
                        {verificationStatus === 'success' && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 rounded-lg inline-flex items-center gap-2">
                                <Icon name="fas fa-check-circle" className="text-green-500" />
                                <span className="text-sm font-semibold text-green-700 dark:text-green-300">Domain verified successfully!</span>
                            </div>
                        )}
                        {verificationStatus === 'failed' && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg inline-block">
                                <div className="flex items-center gap-2">
                                    <Icon name="fas fa-times-circle" className="text-red-500" />
                                    <span className="text-sm font-semibold text-red-700 dark:text-red-400">Verification failed. Please double-check your records.</span>
                                </div>
                                <Button onClick={handleVerify} variant="outline" size="sm" className="mt-2">Try Again</Button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <Button variant="outline" onClick={() => setCurrentStep(0)}>Back</Button>
                        <Button onClick={handleNext} disabled={verificationStatus !== 'success'}>Next</Button>
                    </div>
                </div>
            )}

             {currentStep === 2 && (
                <div className="mt-8 max-w-2xl mx-auto text-center">
                    <Icon name="fas fa-rocket" className="text-5xl text-[#679a41] dark:text-emerald-400 mb-4" />
                    <h3 className="text-2xl font-semibold">Ready to Get Started?</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-4 mb-8">
                        Your mailbox is ready! You can now choose to migrate emails from your previous provider, or you can skip this step and go directly to your new inbox.
                    </p>
                    
                    <div className="space-y-4">
                        <Button size="lg" fullWidth onClick={() => alert('This would open an email migration wizard.')}>
                            <Icon name="fas fa-magic" className="mr-2" />
                            Start Email Migration
                        </Button>
                        <Button 
                            size="lg" 
                            fullWidth 
                            variant="outline" 
                            onClick={() => window.open('https://mail.worldposta.com/owa/', '_blank')}
                        >
                            <Icon name="fas fa-sign-in-alt" className="mr-2" />
                            Skip and Go to My Inbox
                        </Button>
                    </div>

                    <div className="flex justify-between items-center mt-12">
                        <Button variant="ghost" onClick={() => setCurrentStep(1)}>Back</Button>
                        <Button variant="ghost" onClick={handleCancel}>Finish & Return to Subscriptions</Button>
                    </div>
                </div>
            )}
        </Card>
    );
};

const mockInvoices: Invoice[] = [
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

export const InvoiceHistoryPage: React.FC = () => {
    const navigate = useNavigate();

    const getInvoiceStatusChipClass = (status: 'Paid' | 'Unpaid') => {
        switch (status) {
            case 'Paid':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Unpaid':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <Card title="Invoice History">
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-slate-800">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoice ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {mockInvoices.map(invoice => (
                            <tr key={invoice.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{invoice.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(invoice.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${invoice.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getInvoiceStatusChipClass(invoice.status)}`}>{invoice.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex justify-end items-center space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => window.open(invoice.url, '_blank')}>Download PDF</Button>
                                        <Button size="sm" onClick={() => navigate(`/app/invoices/${invoice.id}`)}>View Invoice</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export const InvoiceDetailPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const invoice = useMemo(() => mockInvoices.find(inv => inv.id === invoiceId), [invoiceId]);

  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadPdf = () => {
    alert("This would trigger a PDF download of the invoice.");
  };

  if (!invoice) {
    return (
        <Card title="Invoice Not Found">
            <div className="text-center py-10">
                <Icon name="fas fa-file-invoice-dollar" className="text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">The invoice with ID "{invoiceId}" could not be found.</p>
                <Button onClick={() => navigate('/app/invoices')} className="mt-6">
                    Back to Invoice History
                </Button>
            </div>
        </Card>
    );
  }

  const getStatusChip = (status: 'Paid' | 'Unpaid') => {
      const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
        switch (status) {
            case 'Paid':
                return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>PAID</span>;
            case 'Unpaid':
                return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>UNPAID</span>;
            default:
                return null;
        }
    };

  return (
    <div>
        <div className="flex justify-between items-center mb-4 print:hidden">
            <Button variant="outline" onClick={() => navigate('/app/invoices')} leftIconName="fas fa-arrow-left">Back to History</Button>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handlePrint} leftIconName="fas fa-print">Print</Button>
                <Button variant="outline" onClick={handleDownloadPdf} leftIconName="fas fa-download">Download PDF</Button>
            </div>
        </div>
        <div className="printable-area">
            <Card className="p-6 sm:p-10 mx-auto max-w-5xl font-sans text-[#293c51] dark:text-gray-200">
                <header className="flex justify-between items-start pb-6 border-b dark:border-gray-700">
                    <div>
                        <Logo iconClassName="h-10 w-auto" />
                        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                            <p className="font-bold">WorldPosta, Inc.</p>
                            <p>789 Cloud Way, Suite 100</p>
                            <p>Internet City, 101010</p>
                            <p>Digital Ocean</p>
                            <p>Tax Reg #: WP123456789</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold uppercase text-[#293c51] dark:text-gray-100">Invoice</h2>
                        <div className="mt-2 text-sm space-y-1">
                            <p><span className="font-semibold">Invoice #</span> {invoice.id}</p>
                            <p><span className="font-semibold">Invoice Date</span> {new Date(invoice.date).toLocaleDateString()}</p>
                            <p><span className="font-semibold">Invoice Amount</span> ${invoice.amount.toFixed(2)} (USD)</p>
                            <p><span className="font-semibold">Customer ID</span> {invoice.customerId}</p>
                            <div className="pt-2">{getStatusChip(invoice.status)}</div>
                        </div>
                    </div>
                </header>
                
                <section className="grid grid-cols-2 gap-8 py-6">
                    <div>
                        <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Billed To</h3>
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            <p className="font-bold">{invoice.customerName}</p>
                            {invoice.customerAddress.map((line, i) => <p key={i}>{line}</p>)}
                            <p>{invoice.customerEmail}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Subscription</h3>
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            <p><span className="font-semibold">ID</span> {invoice.subscriptionId}</p>
                            <p><span className="font-semibold">Billing Period</span> {invoice.billingPeriod}</p>
                            <p><span className="font-semibold">Next Billing Date</span> {invoice.nextBillingDate}</p>
                        </div>
                    </div>
                </section>

                <section className="py-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b-2 border-gray-300 dark:border-gray-600">
                                <tr>
                                    <th className="py-2 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Description</th>
                                    <th className="py-2 text-right text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Units</th>
                                    <th className="py-2 text-right text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Amount (USD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.lineItems.map((item, i) => (
                                    <tr key={i} className="border-b dark:border-gray-700">
                                        <td className="py-3 pr-4 text-sm font-medium">{item.description}</td>
                                        <td className="py-3 px-4 text-right text-sm">{item.units}</td>
                                        <td className="py-3 pl-4 text-right text-sm font-medium">${item.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="flex justify-end py-4">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Sub Total</span>
                            <span className="font-medium">${invoice.subTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{invoice.tax.label}</span>
                            <span className="font-medium">${invoice.tax.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t pt-2 dark:border-gray-600">
                            <span className="text-[#293c51] dark:text-gray-100">Total</span>
                            <span>${(invoice.subTotal + invoice.tax.amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Payments</span>
                            <span className="font-medium">${invoice.payments.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-[#679a41] dark:text-emerald-400 bg-gray-50 dark:bg-slate-700 p-2 rounded-md">
                            <span>Amount Due (USD)</span>
                            <span>${invoice.amountDue.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                <section className="pt-6 border-t dark:border-gray-700 text-sm">
                    <div className="mb-4">
                        <h3 className="font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Payments</h3>
                        <p className="text-gray-600 dark:text-gray-400">{invoice.paymentDetails}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Notes</h3>
                        <p className="text-gray-600 dark:text-gray-400">All payments are due within 15 days of the invoice date.</p>
                    </div>
                </section>

                <footer className="text-center pt-8 mt-8 border-t dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Thank you for trusting us</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        WorldPosta is a registered trademark of WorldPosta, Inc. All rights reserved. <br/>
                        For any billing inquiries, please contact our support team at support@worldposta.com.
                    </p>
                </footer>
            </Card>
        </div>
        <style>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                .printable-area, .printable-area * {
                    visibility: visible;
                }
                .printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    border: none;
                    box-shadow: none;
                    background-color: white !important;
                }
                .printable-area .dark\\:text-gray-200, 
                .printable-area .dark\\:text-gray-100,
                .printable-area .dark\\:text-gray-300,
                .printable-area .dark\\:text-emerald-400,
                .printable-area .dark\\:text-white {
                    color: #293c51 !important;
                }
                .printable-area .dark\\:bg-slate-800,
                .printable-area .dark\\:bg-slate-700 {
                    background-color: white !important;
                }
                .printable-area .dark\\:border-gray-700,
                .printable-area .dark\\:border-gray-600 {
                    border-color: #e5e7eb !important;
                }
            }
        `}</style>
    </div>
  );
};


const LogTable: React.FC<{ logs: LogEntry[], title?: string }> = ({ logs, title }) => {
    const getStatusChipClass = (status: LogEntry['status']) => {
        switch (status) {
            case 'Success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'Pending User Action':
            case 'Pending System Action':
            case 'Warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Information': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    return (
        <div className="space-y-4">
             {title && <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-200">{title}</h3>}
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-y-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date & Time</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Resource/Details</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Performed By</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {logs.length > 0 ? logs.map((log) => (
                            <tr key={log.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-gray-200">{log.action}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.resource}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.performedBy}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChipClass(log.status)}`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-6 text-gray-500 dark:text-gray-400">
                                    No log entries found for this source.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const mockCloudEdgeLogs: LogEntry[] = [
    { id: 'ce1', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'VM Started', resource: 'prod-web-01', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'ce2', timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'Firewall Rule Updated', resource: 'default-fw', performedBy: 'System', status: 'Success' },
    { id: 'ce3', timestamp: new Date(Date.now() - 10800000).toISOString(), action: 'Snapshot Creation Failed', resource: 'db-main-vm', performedBy: 'customer@worldposta.com', status: 'Failed' },
  ];
const mockPostaLogs: LogEntry[] = [
    { id: 'po1', timestamp: new Date(Date.now() - 4000000).toISOString(), action: 'Mailbox Created', resource: 'new.user@alpha.inc', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'po2', timestamp: new Date(Date.now() - 8000000).toISOString(), action: 'Spam Filter Updated', resource: 'alpha.inc domain', performedBy: 'admin@worldposta.com', status: 'Information' },
    { id: 'po3', timestamp: new Date(Date.now() - 12000000).toISOString(), action: 'Password Reset', resource: 'user@alpha.inc', performedBy: 'customer@worldposta.com', status: 'Pending User Action' },
  ];
  
const mockSubscriptionLogs: LogEntry[] = [
    { id: 'sub1', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), action: 'Subscription Added', resource: 'Posta Standard Plan (10 users)', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'sub2', timestamp: new Date(Date.now() - 26 * 3600000).toISOString(), action: 'Payment Method Updated', resource: 'Visa ending in 4242', performedBy: 'customer@worldposta.com', status: 'Information' },
    { id: 'sub3', timestamp: new Date(Date.now() - 50 * 3600000).toISOString(), action: 'Auto-renewal Failed', resource: 'CloudEdge - Web Server', performedBy: 'System', status: 'Failed' },
  ];

const mockUserManagementLogs: LogEntry[] = [
    { id: 'um1', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), action: 'User Invited', resource: 'charlie.new@alpha.inc', performedBy: 'customer@worldposta.com', status: 'Pending User Action' },
    { id: 'um2', timestamp: new Date(Date.now() - 32 * 3600000).toISOString(), action: 'Group Permissions Updated', resource: 'Team Administrators', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'um3', timestamp: new Date(Date.now() - 72 * 3600000).toISOString(), action: 'User Removed from Group', resource: 'beta.user@alpha.inc from Viewers', performedBy: 'customer@worldposta.com', status: 'Success' },
  ];

const mockSupportLogs: LogEntry[] = [
    { id: 'sup1', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), action: 'Ticket Created', resource: 'TKT-58291: Cannot access my VM', performedBy: 'customer@worldposta.com', status: 'Information' },
    { id: 'sup2', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), action: 'Support Staff Replied', resource: 'TKT-58291', performedBy: 'Support Staff', status: 'Information' },
    { id: 'sup3', timestamp: new Date(Date.now() - 100 * 3600000).toISOString(), action: 'Ticket Resolved', resource: 'TKT-58275: Invoice Discrepancy', performedBy: 'Support Staff', status: 'Success' },
  ];

const mockInvoiceLogs: LogEntry[] = [
    { id: 'inv1', timestamp: new Date().toISOString(), action: 'Invoice Downloaded', resource: 'INV-2024-003', performedBy: 'customer@worldposta.com', status: 'Information' },
    { id: 'inv2', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), action: 'Payment Succeeded', resource: 'Invoice INV-2024-002', performedBy: 'System', status: 'Success' },
];

const logSources = {
  cloudEdge: { title: "CloudEdge Action Logs", logs: mockCloudEdgeLogs, type: 'product', name: 'CloudEdge' },
  posta: { title: "Posta Action Logs", logs: mockPostaLogs, type: 'product', name: 'Posta Email' },
  subscriptions: { title: "Subscription Action Logs", logs: mockSubscriptionLogs, type: 'application', name: 'Subscriptions' },
  userManagement: { title: "User Management Action Logs", logs: mockUserManagementLogs, type: 'application', name: 'User Management' },
  support: { title: "Support Action Logs", logs: mockSupportLogs, type: 'application', name: 'Support' },
  invoices: { title: "Invoice Action Logs", logs: mockInvoiceLogs, type: 'application', name: 'Invoices' },
};

interface ActionLogsSearchPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (filters: any) => void;
    onClear: () => void;
}

const ActionLogsSearchPanel: React.FC<ActionLogsSearchPanelProps> = ({ isOpen, onClose, onSearch, onClear }) => {
    const [localFilters, setLocalFilters] = useState({
        objectName: '',
        action: '',
        performedBy: '',
        product: '',
        application: '',
        status: '',
        dateFrom: '',
        dateTo: '',
    });

    const allLogs = useMemo(() => Object.values(logSources).flatMap(source => source.logs), []);
    
    const actionOptions = useMemo(() => 
        [...new Set(allLogs.map(log => log.action))]
            .sort()
            .map(action => ({ value: action, label: action })), 
    [allLogs]);
    
    const userOptions = useMemo(() => 
        Object.values(MOCK_USERS).map(user => ({
            value: user.email,
            label: `${user.fullName} (${user.email})`,
        })), 
    []);
    
    const productOptions = useMemo(() =>
        Object.values(logSources)
            .filter(s => s.type === 'product')
            .map(s => ({ value: s.name, label: s.title })),
    []);

    const applicationOptions = useMemo(() =>
        Object.values(logSources)
            .filter(s => s.type === 'application')
            .map(s => ({ value: s.name, label: s.title })),
    []);

    const statusOptions: LogEntry['status'][] = ['Success', 'Failed', 'Pending User Action', 'Pending System Action', 'Information', 'Warning'];

    const handleFieldChange = (name: string, value: string) => {
        setLocalFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            if (name === 'product' && value) {
                newFilters.application = '';
            }
            if (name === 'application' && value) {
                newFilters.product = '';
            }
            return newFilters;
        });
    };

    const handleSearch = () => {
        onSearch(localFilters);
    };

    const handleClear = () => {
        const clearedFilters = {
            objectName: '', action: '', performedBy: '', product: '',
            application: '', status: '', dateFrom: '', dateTo: '',
        };
        setLocalFilters(clearedFilters);
        onClear();
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-[59]" onClick={onClose} aria-hidden="true" />}

            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#f8f8f8] dark:bg-slate-800 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="advanced-search-title"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <h2 id="advanced-search-title" className="text-lg font-semibold text-[#293c51] dark:text-gray-100 flex items-center">
                        <Icon name="fas fa-search-plus" className="mr-2" />
                        Advanced Log Search
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close search">
                        <Icon name="fas fa-times" className="text-xl" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <FormField id="objectName" name="objectName" label="Object Name" placeholder="e.g., prod-web-01" value={localFilters.objectName} onChange={e => handleFieldChange('objectName', e.target.value)} />
                    
                    <SearchableSelect id="action" label="Action" options={actionOptions} value={localFilters.action} onChange={value => handleFieldChange('action', value)} placeholder="Select an action..." />
                    <SearchableSelect id="performedBy" label="User" options={userOptions} value={localFilters.performedBy} onChange={value => handleFieldChange('performedBy', value)} placeholder="Select a user..." />
                    
                    <FormField as="select" id="product" name="product" label="Product" value={localFilters.product} onChange={e => handleFieldChange('product', e.target.value)}>
                        <option value="">All Products</option>
                        {productOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </FormField>

                    <FormField as="select" id="application" name="application" label="Application" value={localFilters.application} onChange={e => handleFieldChange('application', e.target.value)}>
                        <option value="">All Applications</option>
                        {applicationOptions.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </FormField>
                    
                    <FormField as="select" id="status" name="status" label="Status" value={localFilters.status} onChange={e => handleFieldChange('status', e.target.value)}>
                        <option value="">All Statuses</option>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </FormField>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <FormField id="dateFrom" name="dateFrom" label="From Date" type="date" value={localFilters.dateFrom} onChange={e => handleFieldChange('dateFrom', e.target.value)} />
                         <FormField id="dateTo" name="dateTo" label="To Date" type="date" value={localFilters.dateTo} onChange={e => handleFieldChange('dateTo', e.target.value)} />
                    </div>
                </div>
                
                 <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-x-2 flex justify-end">
                    <Button variant="outline" onClick={handleClear}>Clear</Button>
                    <Button onClick={handleSearch}>Search</Button>
                </div>
            </div>
        </>
    );
};

export const ActionLogsPage: React.FC = () => {
    const { setSearchPanelOpen } = useAppLayout();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('source') || 'product');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdvancedSearchPanelOpen, setIsAdvancedSearchPanelOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<Partial<LogEntry & { dateFrom?: string, dateTo?: string, objectName?: string, product?: string, application?: string }>>({});

    const handleTabClick = useCallback((tabId: string) => {
        setActiveTab(tabId);
        setSearchParams({ source: tabId }, { replace: true });

        if (tabId === 'advanced') {
            setIsAdvancedSearchPanelOpen(true);
            setSearchPanelOpen(true); // Hides FloatingAppLauncher
        } else {
            setIsAdvancedSearchPanelOpen(false);
            setSearchPanelOpen(false); // Shows FloatingAppLauncher
        }
    }, [setSearchPanelOpen, setSearchParams]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isAdvancedSearchPanelOpen) {
                handleTabClick('product'); 
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isAdvancedSearchPanelOpen, handleTabClick]);
    
    useEffect(() => {
        return () => {
            setSearchPanelOpen(false);
        }
    }, [setSearchPanelOpen]);

    const handleSearch = (filters: any) => {
        setAdvancedFilters(filters);
    };

    const handleClear = () => {
        setAdvancedFilters({});
    };

    const productLogSources = useMemo(() => Object.values(logSources).filter(source => source.type === 'product'), []);
    const applicationLogSources = useMemo(() => Object.values(logSources).filter(source => source.type === 'application'), []);
    const allLogs = useMemo(() => Object.values(logSources).flatMap(source => source.logs), []);
    
    const filterBySearchTerm = useCallback((logs: LogEntry[], term: string): LogEntry[] => {
        if (!term) return logs;
        const lowerCaseTerm = term.toLowerCase();
        return logs.filter(log =>
            log.action.toLowerCase().includes(lowerCaseTerm) ||
            log.resource.toLowerCase().includes(lowerCaseTerm) ||
            log.performedBy.toLowerCase().includes(lowerCaseTerm) ||
            log.status.toLowerCase().includes(lowerCaseTerm)
        ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, []);

    const advancedFilteredLogs = useMemo(() => {
        let logsToFilter: LogEntry[] = allLogs;
        
        const { product, application, dateFrom, dateTo, performedBy, action, objectName, status } = advancedFilters;

        if (product) {
            const productSourceKey = Object.keys(logSources).find(key => logSources[key].name === product);
            logsToFilter = productSourceKey ? logSources[productSourceKey].logs : [];
        } else if (application) {
            const appSourceKey = Object.keys(logSources).find(key => logSources[key].name === application);
            logsToFilter = appSourceKey ? logSources[appSourceKey].logs : [];
        }

        const filtered = logsToFilter.filter(log => {
            const logDate = new Date(log.timestamp);
            if (dateFrom && logDate < new Date(dateFrom)) return false;
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (logDate > toDate) return false;
            }
            if (performedBy && log.performedBy.toLowerCase() !== performedBy.toLowerCase()) return false;
            if (action && log.action !== action) return false;
            if (objectName && !log.resource.toLowerCase().includes(objectName.toLowerCase())) return false;
            if (status && log.status !== status) return false;
            return true;
        });
        return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [allLogs, advancedFilters]);


    const tabItems = [
        { id: 'product', name: 'Product' },
        { id: 'applications', name: 'Applications' },
        { id: 'advanced', name: 'Advanced Search' },
    ];

    return (
        <>
            <Card title="Action Logs">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div className="flex items-center border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                        {tabItems.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? 'border-b-2 border-[#679a41] text-[#679a41] dark:border-emerald-400 dark:text-emerald-400'
                                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                    {activeTab !== 'advanced' && (
                        <div className="w-full md:w-auto md:max-w-xs">
                            <FormField 
                                id="log-search"
                                label=""
                                placeholder="Search current view..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="mt-4 space-y-8">
                    {activeTab === 'product' && productLogSources.map(source => (
                        <LogTable key={source.name} title={source.title} logs={filterBySearchTerm(source.logs, searchTerm)} />
                    ))}
                    
                    {activeTab === 'applications' && applicationLogSources.map(source => (
                        <LogTable key={source.name} title={source.title} logs={filterBySearchTerm(source.logs, searchTerm)} />
                    ))}
                    
                    {activeTab === 'advanced' && (
                        <div>
                             <LogTable title="Advanced Search Results" logs={advancedFilteredLogs} />
                        </div>
                    )}
                </div>
            </Card>
            <ActionLogsSearchPanel
                isOpen={isAdvancedSearchPanelOpen}
                onClose={() => handleTabClick('product')} // Revert to default
                onSearch={handleSearch}
                onClear={handleClear}
            />
        </>
    );
};

export const CustomerTeamManagementPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [teamUsers, setTeamUsers] = useState<User[]>([]);
    const [teamGroups, setTeamGroups] = useState<UserGroup[]>([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'groups'

    useEffect(() => {
        if (user) {
            setTeamUsers(getUsersForTeam(user.id));
            setTeamGroups(getGroupsForTeam(user.id));
        }
    }, [user]);

    const getStatusChip = (status: User['status']) => {
        const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize';
        switch (status) {
            case 'active':
                return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Active</span>;
            case 'suspended':
                return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>Suspended</span>;
            case 'blocked':
                return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>Blocked</span>;
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>Unknown</span>;
        }
    };

    const tabItems = [
        { id: 'users', name: 'Team Users' },
        { id: 'groups', name: 'User Groups & Permissions' },
    ];

    return (
        <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabItems.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.id
                                    ? 'border-[#679a41] text-[#679a41] dark:border-emerald-400 dark:text-emerald-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeTab === 'users' && (
                    <Card title="Team Users" titleActions={<Button leftIconName="fas fa-user-plus" onClick={() => navigate('/app/team-management/add')}>Add User</Button>}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white dark:bg-slate-800">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Full Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Group</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {teamUsers.map(u => (
                                        <tr key={u.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{u.fullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{teamGroups.find(g => g.id === u.assignedGroupId)?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getStatusChip(u.status)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Button size="sm" variant="outline">Manage</Button>
                                            </td>
                                        </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {activeTab === 'groups' && (
                    <Card title="User Groups" titleActions={<Button leftIconName="fas fa-plus-circle">Create Group</Button>}>
                        <div className="space-y-4">
                            {teamGroups.map(group => (
                                <div key={group.id} className="p-4 border rounded-lg dark:border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-semibold text-[#293c51] dark:text-gray-200">{group.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
                                        </div>
                                        <Button size="sm" variant="outline">Edit Group</Button>
                                    </div>
                                    <div className="mt-2 pt-2 border-t dark:border-gray-600">
                                        <h5 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Permissions</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {group.permissions.map(perm => (
                                                <span key={perm} className="px-2 py-1 text-xs bg-gray-200 dark:bg-slate-600 rounded-full capitalize">{perm.replace(/_/g, ' ')}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

// Mock data for the new "Add Resources" modal
const mockPostaPackages = [
    { id: 'posta-basic', name: 'Posta Basic Plan' },
    { id: 'posta-standard', name: 'Posta Standard Plan' },
    { id: 'posta-premium', name: 'Posta Premium Plan' },
];
const mockCloudEdgePackages = [
    { id: 'cloudedge-s1', name: 'CloudEdge Small Instance' },
    { id: 'cloudedge-m1', name: 'CloudEdge Medium Instance' },
    { id: 'cloudedge-l1', name: 'CloudEdge Large Instance' },
];
const mockOrganizations = [
    { id: 'org-alpha', name: 'Alpha Inc.' },
    { id: 'org-beta', name: 'Beta Division' },
];
const mockDomains = [
    { id: 'dom-alpha', name: 'alpha-inc.com' },
    { id: 'dom-beta', name: 'betadivision.net' },
    { id: 'dom-gamma', name: 'gamma-corp.io' },
];

interface AddedResource {
    id: string; // Unique ID for the table row
    productId: 'posta' | 'cloudedge' | string;
    packageId: string;
    organizationId: string;
    domainIds: string[];
}

export const AddTeamUserPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [teamGroups, setTeamGroups] = useState<UserGroup[]>([]);
    
    const allPackages = useMemo(() => [...mockPostaPackages, ...mockCloudEdgePackages], []);

    interface NewTeamMemberForm {
      fullName: string;
      email: string;
      password: string;
      displayName: string;
      assignedGroupId: string;
      phoneNumber: string;
      requirePasswordChange: boolean;
      enableMfa: boolean;
    }

    const initialNewUserFormState: NewTeamMemberForm = {
      fullName: '',
      email: '',
      password: '',
      displayName: '',
      assignedGroupId: '',
      phoneNumber: '',
      requirePasswordChange: true,
      enableMfa: false,
    };

    const [newUserForm, setNewUserForm] = useState<NewTeamMemberForm>(initialNewUserFormState);
    const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
    const [addedResources, setAddedResources] = useState<AddedResource[]>([]);
    
    const initialResourceFormState = { productId: 'posta', packageId: '', organizationId: '', domainIds: [] as string[] };
    const [resourceForm, setResourceForm] = useState(initialResourceFormState);

    useEffect(() => {
        if (user) {
            const groups = getGroupsForTeam(user.id);
            setTeamGroups(groups);
            // Pre-select first group if available
            if (groups.length > 0 && !newUserForm.assignedGroupId) {
                setNewUserForm(prev => ({ ...prev, assignedGroupId: groups[0].id }));
            }
        }
    }, [user, newUserForm.assignedGroupId]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setNewUserForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleResourceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setResourceForm(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'productId') {
                // Reset dependent fields when product changes
                newState.packageId = '';
                newState.organizationId = '';
                newState.domainIds = [];
            }
            return newState;
        });
    };

    const handleDomainChange = (domainId: string, isChecked: boolean) => {
        setResourceForm(prev => {
            const newDomainIds = isChecked
                ? [...prev.domainIds, domainId]
                : prev.domainIds.filter(id => id !== domainId);
            return { ...prev, domainIds: newDomainIds };
        });
    };
    
    const handleAddResource = () => {
        if (!resourceForm.productId || !resourceForm.packageId) {
            alert("Please select a product and a package.");
            return;
        }
        setAddedResources(prev => [...prev, { id: uuidv4(), ...resourceForm }]);
        setResourceForm(initialResourceFormState);
        setIsResourcesModalOpen(false);
    };

    const handleRemoveResource = (id: string) => {
        setAddedResources(prev => prev.filter(res => res.id !== id));
    };
    
    const handleAddUser = () => {
        if (!user) return;
        // Validation handled by button's disabled state

        // Create new user
        const newId = uuidv4();
        const newUser: User = {
            id: newId,
            fullName: newUserForm.fullName,
            email: newUserForm.email,
            displayName: newUserForm.displayName,
            phoneNumber: newUserForm.phoneNumber,
            assignedGroupId: newUserForm.assignedGroupId,
            companyName: user.companyName,
            role: 'customer',
            status: 'active',
            teamManagerId: user.id,
            avatarUrl: `https://picsum.photos/seed/${newId}/100/100`,
        };
        
        // Mock persistence
        MOCK_USERS[newUser.email.toLowerCase()] = { ...newUser, passwordHash: `hashed${newUserForm.password}` };
        
        // Log conceptual actions
        console.log(`New user created for team ${user.id}.`);
        console.log("Assigned resources:", addedResources);
        if (newUserForm.requirePasswordChange) {
            console.log(`User ${newUser.email} is required to change password on next login.`);
        }
        if (newUserForm.enableMfa) {
            console.log(`MFA will be enforced for ${newUser.email} on first login.`);
        }

        // Reset and navigate back
        alert('User added successfully!');
        navigate('/app/team-management');
    };

    const isAddUserButtonDisabled = !newUserForm.fullName || !newUserForm.displayName || !newUserForm.email || !newUserForm.password || !newUserForm.assignedGroupId;
    const availablePackages = resourceForm.productId === 'posta' ? mockPostaPackages : mockCloudEdgePackages;

    return (
        <>
            <Card title="Add New Team User">
                <form className="space-y-4 max-w-2xl mx-auto" onSubmit={(e) => { e.preventDefault(); handleAddUser(); }}>
                    <FormField id="fullName" name="fullName" label="Name" value={newUserForm.fullName} onChange={handleFormChange} required placeholder="e.g. John Doe"/>
                    <FormField id="displayName" name="displayName" label="User Name" value={newUserForm.displayName} onChange={handleFormChange} required placeholder="e.g. johndoe"/>
                    <FormField id="email" name="email" label="Email" type="email" value={newUserForm.email} onChange={handleFormChange} required placeholder="e.g. user@company.com"/>
                    <FormField id="password" name="password" label="Password" type="password" value={newUserForm.password} onChange={handleFormChange} required showPasswordToggle/>
                    <FormField id="phoneNumber" name="phoneNumber" label="Phone Number" type="tel" value={newUserForm.phoneNumber} onChange={handleFormChange}/>
                    <FormField
                        id="assignedGroupId"
                        name="assignedGroupId"
                        label="Permissions Group"
                        as="select"
                        value={newUserForm.assignedGroupId}
                        onChange={handleFormChange}
                        required
                    >
                        <option value="">Select a group</option>
                        {teamGroups.map(group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                    </FormField>
                    
                    <div className="pt-2">
                        <FormField
                            type="checkbox"
                            id="requirePasswordChange"
                            name="requirePasswordChange"
                            label="Require user to change password on first login"
                            checked={newUserForm.requirePasswordChange}
                            onChange={handleFormChange}
                        />
                        <FormField
                            type="checkbox"
                            id="enableMfa"
                            name="enableMfa"
                            label="Enable Multi-Factor Authentication (MFA) for this user"
                            checked={newUserForm.enableMfa}
                            onChange={handleFormChange}
                        />
                    </div>
                    
                    <hr className="dark:border-gray-700"/>
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-md font-semibold text-[#293c51] dark:text-gray-200">Assigned Resources</h4>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsResourcesModalOpen(true)} leftIconName="fas fa-plus">
                                Add Resource
                            </Button>
                        </div>
                        
                        {addedResources.length > 0 ? (
                            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 dark:bg-slate-700">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Package</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Organization</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Domains</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {addedResources.map(res => (
                                            <tr key={res.id}>
                                                <td className="px-4 py-2 text-sm capitalize">{res.productId}</td>
                                                <td className="px-4 py-2 text-sm">{(allPackages.find(p => p.id === res.packageId)?.name) || 'N/A'}</td>
                                                <td className="px-4 py-2 text-sm">{(mockOrganizations.find(o => o.id === res.organizationId)?.name) || 'N/A'}</td>
                                                <td className="px-4 py-2 text-sm">
                                                    {res.domainIds.length > 0
                                                        ? res.domainIds.map(id => mockDomains.find(d => d.id === id)?.name).join(', ')
                                                        : 'N/A'
                                                    }
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveResource(res.id)} title="Remove Resource">
                                                        <Icon name="fas fa-trash-alt" className="text-red-500"/>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4 border-2 border-dashed rounded-lg dark:border-gray-600">
                                <p className="text-sm text-gray-500 dark:text-gray-400">No resources assigned to this user yet.</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t dark:border-gray-700">
                        <Button type="button" variant="ghost" onClick={() => navigate('/app/team-management')}>Cancel</Button>
                        <Button type="submit" disabled={isAddUserButtonDisabled}>Add User</Button>
                    </div>
                </form>
            </Card>

            <Modal
                isOpen={isResourcesModalOpen}
                onClose={() => setIsResourcesModalOpen(false)}
                title="Add Resources to User"
                size="lg"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsResourcesModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddResource} disabled={!resourceForm.packageId}>Add</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <FormField
                        id="productId"
                        name="productId"
                        label="Product"
                        as="select"
                        value={resourceForm.productId}
                        onChange={handleResourceFormChange}
                        required
                    >
                        <option value="posta">Posta</option>
                        <option value="cloudedge">CloudEdge</option>
                    </FormField>
                    <FormField
                        id="packageId"
                        name="packageId"
                        label="Package"
                        as="select"
                        value={resourceForm.packageId}
                        onChange={handleResourceFormChange}
                        required
                    >
                        <option value="">-- Select a package --</option>
                        {availablePackages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </FormField>
                    <FormField
                        id="organizationId"
                        name="organizationId"
                        label="Organization"
                        as="select"
                        value={resourceForm.organizationId}
                        onChange={handleResourceFormChange}
                    >
                        <option value="">-- Select an organization (optional) --</option>
                        {mockOrganizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </FormField>
                    {resourceForm.productId === 'posta' && (
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300">Domains (optional)</label>
                            <div className="p-3 border rounded-md max-h-40 overflow-y-auto dark:border-gray-600 space-y-2">
                                {mockDomains.map(domain => (
                                    <FormField
                                        key={domain.id}
                                        type="checkbox"
                                        id={`domain-${domain.id}`}
                                        name="domain"
                                        label={domain.name}
                                        checked={resourceForm.domainIds.includes(domain.id)}
                                        onChange={e => handleDomainChange(domain.id, (e.target as HTMLInputElement).checked)}
                                        wrapperClassName="mb-0"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export const ResellerProgramPage: React.FC = () => {
    return (
        <Card title="Reseller Program Overview">
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">Manage your reseller activities, track commissions, and access marketing materials.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <Card className="bg-green-50 dark:bg-green-900/40">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">15</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Customers</p>
                    </Card>
                    <Card className="bg-blue-50 dark:bg-blue-900/40">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">$1,250.30</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Commission This Month</p>
                    </Card>
                     <Card className="bg-yellow-50 dark:bg-yellow-900/40">
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">$7,830.00</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Commission (YTD)</p>
                    </Card>
                </div>

                <div className="space-y-2 pt-4">
                     <Button fullWidth variant="secondary" leftIconName="fas fa-users" onClick={() => alert("Navigate to manage customers")}>Manage My Customers</Button>
                     <Button fullWidth variant="outline" leftIconName="fas fa-file-invoice-dollar">View Commission Reports</Button>
                     <Button fullWidth variant="outline" leftIconName="fas fa-book">Marketing Materials & Branding</Button>
                </div>
            </div>
        </Card>
    );
};

const mockSupportTickets: SupportTicket[] = [
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

interface ViewTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: SupportTicket | null;
    onUpdateTicket: (updatedTicket: SupportTicket) => void;
    currentUser: User | null;
}

const ViewTicketModal: React.FC<ViewTicketModalProps> = ({ isOpen, onClose, ticket, onUpdateTicket, currentUser }) => {
    const [newComment, setNewComment] = useState('');
    const [newAttachments, setNewAttachments] = useState<TicketAttachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'internal'
    const [isInternal, setIsInternal] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setNewComment('');
            setNewAttachments([]);
            setActiveTab('customer');
            setIsInternal(false);
        }
    }, [isOpen]);

    if (!ticket) return null;

    const isUserAdminOrReseller = currentUser?.role === 'admin' || currentUser?.role === 'reseller';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (readEvt) => {
                    const newAttachment: TicketAttachment = {
                        name: file.name, type: file.type, size: file.size,
                        dataUrl: readEvt.target?.result as string,
                    };
                    setNewAttachments(prev => [...prev, newAttachment]);
                };
                reader.readAsDataURL(file);
            });
        }
    };
    
    const removeAttachment = (fileName: string) => {
        setNewAttachments(prev => prev.filter(att => att.name !== fileName));
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input to allow re-adding the same file
        }
    };

    const handleCommentSubmit = () => {
        if (!newComment.trim() && newAttachments.length === 0) return;

        const comment: SupportTicketComment = {
            author: currentUser?.role === 'admin' ? 'Support Staff' : currentUser?.fullName || 'User',
            timestamp: new Date().toISOString(),
            content: newComment,
            attachments: newAttachments,
        };

        const updatedTicket: SupportTicket = { ...ticket };

        if (isInternal && isUserAdminOrReseller) {
            updatedTicket.internalComments = [...(ticket.internalComments || []), comment];
        } else {
            updatedTicket.comments = [...(ticket.comments || []), comment];
        }

        updatedTicket.lastUpdate = new Date().toISOString();
        if (updatedTicket.status === 'Resolved' || updatedTicket.status === 'Closed') {
            updatedTicket.status = 'In Progress'; // Re-open ticket on new comment
        }
        
        onUpdateTicket(updatedTicket);
        onClose();
    };

    const getStatusChipClass = (status: SupportTicket['status']) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const AttachmentChip: React.FC<{ attachment: TicketAttachment, onRemove?: () => void }> = ({ attachment, onRemove }) => (
        <div className="flex items-center bg-gray-200 dark:bg-slate-600 rounded-full px-3 py-1 text-sm">
            <Icon name="fas fa-paperclip" className="mr-2 text-gray-500 dark:text-gray-400" />
            <a href={attachment.dataUrl} download={attachment.name} className="hover:underline">{attachment.name}</a>
            <span className="text-gray-500 dark:text-gray-400 mx-1">-</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{(attachment.size / 1024).toFixed(1)} KB</span>
            {onRemove && (
                <button onClick={onRemove} className="ml-2 text-red-500 hover:text-red-700">
                    <Icon name="fas fa-times-circle" />
                </button>
            )}
        </div>
    );
    
    const Comment: React.FC<{ comment: SupportTicketComment, isInternal?: boolean }> = ({ comment, isInternal }) => (
        <div className={`p-4 rounded-lg ${isInternal ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400' : 'bg-gray-50 dark:bg-slate-700/50'}`}>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <p className="font-semibold text-sm text-[#293c51] dark:text-gray-200">{comment.author}</p>
                <p>{new Date(comment.timestamp).toLocaleString()}</p>
            </div>
            <p className="text-sm mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
            {comment.attachments && comment.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {comment.attachments.map((att, i) => <AttachmentChip key={i} attachment={att} />)}
                </div>
            )}
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ticket: ${ticket.id}`} size="3xl">
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100">{ticket.subject}</h3>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChipClass(ticket.status)}`}>{ticket.status}</span>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Product/Service: <span className="font-medium text-[#293c51] dark:text-gray-300">{ticket.product}</span>
                </div>

                <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1 text-[#293c51] dark:text-gray-200">Initial Description</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{ticket.description}</p>
                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="mt-2 pt-2 border-t dark:border-gray-600 flex flex-wrap gap-2">
                            {ticket.attachments.map((att, i) => <AttachmentChip key={i} attachment={att} />)}
                        </div>
                    )}
                </div>

                {isUserAdminOrReseller && (
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button onClick={() => setActiveTab('customer')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'customer' ? 'border-[#679a41] text-[#679a41] dark:border-emerald-400 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                Customer Comments
                            </button>
                            <button onClick={() => setActiveTab('internal')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'internal' ? 'border-yellow-500 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                Internal Notes
                            </button>
                        </nav>
                    </div>
                )}
                
                {/* Comments Section */}
                <div className="space-y-3">
                    {activeTab === 'customer' && (
                        ticket.comments && ticket.comments.length > 0
                        ? ticket.comments.map((comment, i) => <Comment key={i} comment={comment} />)
                        : <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No customer comments yet.</p>
                    )}
                    {activeTab === 'internal' && isUserAdminOrReseller && (
                        ticket.internalComments && ticket.internalComments.length > 0
                        ? ticket.internalComments.map((comment, i) => <Comment key={i} comment={comment} isInternal />)
                        : <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No internal notes yet.</p>
                    )}
                </div>

                {/* Add Comment Form */}
                <div className="pt-4 border-t dark:border-gray-600">
                    <h4 className="font-semibold text-lg mb-2">Add Reply</h4>
                    <FormField
                        id="new-comment"
                        label=""
                        as="textarea"
                        rows={5}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type your reply here..."
                    />
                    
                    <div className="mt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            leftIconName="fas fa-paperclip"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Attach Files
                        </Button>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    {newAttachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {newAttachments.map((att, i) => (
                                <AttachmentChip key={i} attachment={att} onRemove={() => removeAttachment(att.name)} />
                            ))}
                        </div>
                    )}
                    
                    <div className="mt-4 flex justify-between items-center">
                        <div>
                             {isUserAdminOrReseller && (
                                <ToggleSwitch 
                                    id="internal-comment-toggle"
                                    checked={isInternal}
                                    onChange={setIsInternal}
                                    label="Internal Note"
                                />
                            )}
                        </div>
                        <div className="space-x-2">
                            <Button variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleCommentSubmit} disabled={!newComment.trim() && newAttachments.length === 0}>
                                Submit Reply
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </Modal>
    );
};

export const SupportPage: React.FC = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>(mockSupportTickets);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    const handleViewTicket = (ticketId: string) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
            setSelectedTicket(ticket);
            setIsViewModalOpen(true);
        }
    };
    
    const handleUpdateTicket = (updatedTicket: SupportTicket) => {
        setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    };

    const handleCreateTicket = () => {
        // This could open a different modal for creation, but for now we'll alert.
        alert('This would open a form to create a new support ticket.');
    };
    
    const getStatusChipClass = (status: SupportTicket['status']) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    
    return (
        <>
            <Card title="Support Center" titleActions={
                <Button onClick={handleCreateTicket} leftIconName="fas fa-plus-circle">
                    Create New Ticket
                </Button>
            }>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ticket ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Last Update</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{ticket.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ticket.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ticket.product}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChipClass(ticket.status)}`}>{ticket.status}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(ticket.lastUpdate).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button size="sm" onClick={() => handleViewTicket(ticket.id)}>View Ticket</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ViewTicketModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                ticket={selectedTicket}
                onUpdateTicket={handleUpdateTicket}
                currentUser={user}
            />
        </>
    );
};

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-4">
             <Icon name="fas fa-exclamation-triangle" className="text-6xl text-yellow-400 mb-4" />
            <h1 className="text-6xl font-bold text-[#293c51] dark:text-gray-100">404</h1>
            <p className="text-xl mt-4 mb-2 text-gray-700 dark:text-gray-300">Page Not Found</p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Sorry, the page you are looking for could not be found.</p>
            <Button onClick={() => navigate('/app/dashboard')}>Go to Dashboard</Button>
        </div>
    );
};

const mockAllNotifications: AppNotification[] = [
    { id: '1', type: NotificationType.SUCCESS, message: 'Your profile has been updated.', timestamp: new Date(Date.now() - 3600000 * 2) },
    { id: '2', type: NotificationType.SECURITY, message: 'A new device has logged into your account from London, UK.', timestamp: new Date(Date.now() - 3600000 * 5) },
    { id: '3', type: NotificationType.INFO, message: 'Welcome to WorldPosta! Explore our services.', timestamp: new Date(Date.now() - 3600000 * 26) },
    { id: '4', type: NotificationType.WARNING, message: 'Your subscription for "Posta Basic" is expiring in 7 days.', timestamp: new Date(Date.now() - 3600000 * 48) },
    { id: '5', type: NotificationType.ERROR, message: 'Failed to create snapshot for "db-main-vm".', timestamp: new Date(Date.now() - 3600000 * 72) },
    { id: '6', type: NotificationType.SUCCESS, message: 'Support ticket TKT-58275 has been resolved.', timestamp: new Date(Date.now() - 3600000 * 120) },
];

export const AllNotificationsPage: React.FC = () => {
    const getNotificationIconName = (type: NotificationType) => {
        switch (type) {
            case NotificationType.INFO: return 'fas fa-info-circle text-blue-500';
            case NotificationType.SUCCESS: return 'fas fa-check-circle text-green-500';
            case NotificationType.WARNING: return 'fas fa-exclamation-triangle text-yellow-500';
            case NotificationType.ERROR: return 'fas fa-times-circle text-red-500';
            case NotificationType.SECURITY: return 'fas fa-shield-halved text-purple-500';
            default: return 'fas fa-bell';
        }
    };
    
    return (
        <Card title="All Notifications" titleActions={<Button variant="outline" size="sm">Mark all as read</Button>}>
            <div className="space-y-3">
                {mockAllNotifications.length > 0 ? (
                    mockAllNotifications.map(notif => (
                        <div key={notif.id} className="flex items-start p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                             <Icon name={getNotificationIconName(notif.type)} className="mr-4 mt-1 text-xl" fixedWidth />
                             <div className="flex-grow">
                                <p className="font-medium text-[#293c51] dark:text-gray-200">{notif.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(notif.timestamp).toLocaleString()}</p>
                             </div>
                             <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                                <Icon name="fas fa-times" />
                             </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center py-6 text-gray-500 dark:text-gray-400">You have no notifications.</p>
                )}
            </div>
        </Card>
    );
};

// --- CloudEdge Dashboard Components ---

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


export const CloudEdgeDashboardPage: React.FC = () => {
    const [mfaEnabled, setMfaEnabled] = useState(false);
    
    const overviewStats = {
        virtualMachines: 2, organizations: 2, creationDate: "18/06/2023",
        gateways: 2, reservations: 1, users: 2,
    };
    
    const recentVMs = [
        { id: 1, logo: 'https://cdn.worldvectorlogo.com/logos/suse.svg', name: 'VM name', org: 'Worldposta', status: 'Active', memory: '64/GB', cores: '12/CPU', disk: '256/GB' },
        { id: 2, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Windows_logo_-_2012.svg/1024px-Windows_logo_-_2012.svg.png', name: 'VM name', org: 'Worldposta', status: 'Active', memory: '64/GB', cores: '12/CPU', disk: '256/GB' },
        { id: 3, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Logo-ubuntu_cof-orange-hex.svg/2048px-Logo-ubuntu_cof-orange-hex.svg.png', name: 'VM name', org: 'Worldposta', status: 'Deactivated', memory: '64/GB', cores: '12/CPU', disk: '256/GB' },
        { id: 4, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/1200px-Tux.svg.png', name: 'VM name', org: 'Worldposta', status: 'Deactivated', memory: '64/GB', cores: '12/CPU', disk: '256/GB' },
    ];
    
    const actionLogs = [
        { action: 'User login', initiator: 'mine', target: 'worldposta-admin', date: '09/02/2025 01:31 PM' },
        { action: 'User login', initiator: 'mine', target: 'worldposta-admin', date: '09/02/2025 01:30 PM' },
        { action: 'VM Create', initiator: 'mine', target: 'ubuntu-dev-clone', date: '09/02/2025 11:54 AM' },
        { action: 'VM Stop', initiator: 'mine', target: 'ubuntu-dev', date: '09/02/2025 11:52 AM' },
    ];

    const usageChartData = {
        bars: [50, 40, 60, 55, 75, 60, 85],
        linePath: "M 20 75 L 65 87 L 110 63 L 155 69 L 200 45 L 245 63 L 290 27"
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">Hello, Worldposta</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Virtual Machines: <span className="font-semibold text-[#293c51] dark:text-gray-200">{overviewStats.virtualMachines}</span></span>
                        <span>Gateways: <span className="font-semibold text-[#293c51] dark:text-gray-200">{overviewStats.gateways}</span></span>
                        <span>Organizations: <span className="font-semibold text-[#293c51] dark:text-gray-200">{overviewStats.organizations}</span></span>
                        <span>Reservations: <span className="font-semibold text-[#293c51] dark:text-gray-200">{overviewStats.reservations}</span></span>
                        <span>Creation Date: <span className="font-semibold text-[#293c51] dark:text-gray-200">{overviewStats.creationDate}</span></span>
                        <span>Users: <span className="font-semibold text-[#293c51] dark:text-gray-200">{overviewStats.users}</span></span>
                    </div>
                </Card>
                <Card title="CloudEdge Smart Actions" className="h-full">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-auto py-3"><Icon name="fas fa-desktop" className="text-green-500 mr-3 text-2xl" />New VM</Button>
                        <Button variant="outline" className="h-auto py-3"><Icon name="fas fa-user-plus" className="text-green-500 mr-3 text-2xl" />New User</Button>
                        <Button variant="outline" className="h-auto py-3"><Icon name="fas fa-cloud-download-alt" className="text-green-500 mr-3 text-2xl" />New Reservation</Button>
                        <div className="flex items-center justify-center border border-gray-200 dark:border-slate-700 rounded-md p-3">
                            <Icon name="fas fa-shield-alt" className="text-green-500 mr-3 text-2xl" />
                            <span className="font-semibold mr-4">MFA</span>
                            <ToggleSwitch id="mfa-toggle" checked={mfaEnabled} onChange={setMfaEnabled} />
                        </div>
                    </div>
                </Card>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card title="Resources" className="lg:col-span-3">
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                         <div>
                            <div className="flex justify-between items-center mb-2">
                                 <h4 className="font-semibold">Recent Virtual Machines</h4>
                                 <a href="#" className="text-sm text-[#679a41] dark:text-emerald-400 hover:underline">See More</a>
                            </div>
                            <div className="space-y-3">
                                {recentVMs.map(vm => (
                                    <div key={vm.id} className="p-3 border dark:border-slate-700 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <img src={vm.logo} alt={`${vm.name} logo`} className="h-8 w-8 mr-3 object-contain" />
                                                <div>
                                                    <p className="font-bold text-sm">{vm.name}</p>
                                                    <p className="text-xs text-gray-500">Org Name: {vm.org}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${vm.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>{vm.status}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2 text-gray-500 dark:text-gray-400">
                                            <span>Memory: {vm.memory}</span>
                                            <span>Cores: {vm.cores}</span>
                                            <span>Disk: {vm.disk}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>
                         <div>
                            <h4 className="font-semibold mb-2">Resources Usage</h4>
                            <div className="relative h-48 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 flex items-end justify-around overflow-hidden">
                                {/* Background dashed lines */}
                                {[25, 50, 75].map(top => (
                                    <div key={top} className="absolute left-0 right-0 border-t border-dashed border-gray-300 dark:border-slate-600" style={{bottom: `${top}%`}} />
                                ))}
                                {/* Bars */}
                                {usageChartData.bars.map((h, i) => (
                                    <div key={i} className={`w-3/5 rounded-t-md ${i === usageChartData.bars.length - 1 ? 'bg-slate-500 dark:bg-slate-400' : 'bg-gray-200 dark:bg-slate-600'}`} style={{height: `${h}%`}}></div>
                                ))}
                                {/* Line Chart Overlay */}
                                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 310 150">
                                    <path d={usageChartData.linePath} stroke="#679a41" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <p className="text-2xl font-bold mt-2">30%</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Your sales performance is 30% better compare to last month</p>
                         </div>
                     </div>
                </Card>
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <div className="grid grid-cols-2 gap-4 h-full">
                           <div className="flex flex-col items-center justify-start text-center">
                                <h4 className="font-semibold mb-1">RAM Usage</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total: 419GB, Used: 192GB</p>
                                <DoughnutChart percentage={45} color="#679a41" className="my-2" size={100} />
                           </div>
                           <div className="flex flex-col items-center justify-start text-center">
                                <h4 className="font-semibold mb-1">Cores Usage</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total: 100 Cores, Used: 76 Cores</p>
                                <DoughnutChart percentage={84} color="#f59e0b" className="my-2" size={100} />
                           </div>
                           <div className="flex flex-col items-center justify-start text-center">
                                <h4 className="font-semibold mb-1">Flash Disk</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total: 6000GB, Used: 5600GB</p>
                                <DoughnutChart percentage={96} color="#ef4444" className="my-2" size={100} />
                           </div>
                           <div className="flex flex-col items-center justify-start text-center">
                                <h4 className="font-semibold mb-1">Secure Access</h4>
                                <a href="#" className="text-xs text-blue-500 hover:underline">Upgrade Protection</a>
                                <DoughnutChart percentage={35} gradientId="secure-access-gradient" className="my-2" size={100} />
                           </div>
                        </div>
                    </Card>
                </div>
            </div>

            <Card title="Action Logs">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b dark:border-slate-700">
                            <tr>
                                <th className="text-left py-2 px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Action</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Initiator</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Target</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actionLogs.map((log, i) => (
                                <tr key={i} className="border-b dark:border-slate-700 last:border-0">
                                    <td className="py-3 px-3 text-sm">{log.action}</td>
                                    <td className="py-3 px-3 text-sm">{log.initiator}</td>
                                    <td className="py-3 px-3 text-sm">{log.target}</td>
                                    <td className="py-3 px-3 text-sm text-gray-500 dark:text-gray-400">{log.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
};
