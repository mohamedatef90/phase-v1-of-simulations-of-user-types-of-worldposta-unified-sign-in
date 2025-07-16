import React, { useState, useMemo } from 'react';
import { FormField, Button, Card } from '@/components/ui';
import { getAllMockInternalUsers } from '@/data';

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
