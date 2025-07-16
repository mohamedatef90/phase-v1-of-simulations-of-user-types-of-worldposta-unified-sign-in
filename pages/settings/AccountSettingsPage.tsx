
import React, { useState } from 'react';
import { useAuth } from '@/context';
import { Card, FormField, Button } from '@/components/ui';

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
