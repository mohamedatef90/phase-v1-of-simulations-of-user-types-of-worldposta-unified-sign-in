
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/context';
import { getUsersForTeam, getGroupsForTeam } from '@/data';
import type { User, UserGroup } from '@/types';

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
