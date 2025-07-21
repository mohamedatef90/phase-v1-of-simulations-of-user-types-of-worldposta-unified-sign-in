
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, FormField, Icon, ToggleSwitch } from '@/components/ui';
import { useAuth } from '@/context';
import type { SupportTicket, TicketAttachment, SupportTicketComment, User } from '@/types';
import { mockSupportTickets } from '@/data';

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
    const [activeTab, setActiveTab] = useState('customer');
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
            fileInputRef.current.value = '';
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
            updatedTicket.status = 'In Progress';
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
