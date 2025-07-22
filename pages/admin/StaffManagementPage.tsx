
import React, { useState, useMemo } from 'react';
import { Button, Card } from '@/components/ui';
import { getAllMockInternalUsers, getAllMockStaffGroups } from '@/data';
import type { User, StaffGroup } from '@/types';

export const StaffManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('members');
    const internalUsers = useMemo(() => getAllMockInternalUsers(), []);
    const staffGroups = useMemo(() => getAllMockStaffGroups(), []);

    const tabItems = [
        { id: 'members', name: 'Staff Members' },
        { id: 'groups', name: 'Staff Groups & Permissions' },
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
                {activeTab === 'members' && (
                    <Card title="Staff Members" titleActions={<Button leftIconName="fas fa-plus">Add Staff Member</Button>}>
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
                                    {internalUsers.length > 0 ? internalUsers.map(user => (
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
                )}
                {activeTab === 'groups' && (
                    <Card title="Staff Groups" titleActions={<Button leftIconName="fas fa-plus-circle">Create Group</Button>}>
                        <div className="space-y-4">
                            {staffGroups.length > 0 ? staffGroups.map(group => (
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
                            )) : (
                                <div className="text-center py-6 border-2 border-dashed rounded-lg dark:border-gray-600">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No staff permission groups have been created.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};
