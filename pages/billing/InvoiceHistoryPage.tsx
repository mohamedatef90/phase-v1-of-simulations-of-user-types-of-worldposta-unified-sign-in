
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@/components/ui';
import type { Invoice } from '@/types';

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
