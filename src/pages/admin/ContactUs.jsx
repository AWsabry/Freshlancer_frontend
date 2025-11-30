import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { contactService } from '../../services/contactService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Mail,
  Search,
  Filter,
  Trash2,
  Eye,
  Calendar,
  User,
  MessageSquare,
  Reply,
  Archive,
  CheckCircle,
  Clock,
} from 'lucide-react';

const ContactUs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  const page = parseInt(searchParams.get('page') || '1');

  // Fetch contacts
  const { data: contactsData, isLoading, error } = useQuery({
    queryKey: ['adminContacts', page, statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await contactService.getAllContacts(params);
      return response;
    },
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['contactStats'],
    queryFn: async () => {
      const response = await contactService.getContactStats();
      return response;
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return contactService.updateContactStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminContacts']);
      queryClient.invalidateQueries(['contactStats']);
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ id, replyMessage }) => {
      return contactService.replyToContact(id, replyMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminContacts']);
      queryClient.invalidateQueries(['contactStats']);
      setShowReplyModal(false);
      setReplyMessage('');
      setSelectedContact(null);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to send reply');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return contactService.deleteContact(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminContacts']);
      queryClient.invalidateQueries(['contactStats']);
      setShowDeleteModal(false);
      setSelectedContact(null);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete contact');
    },
  });

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setSearchParams({ page: '1' });
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setSearchParams({ page: '1', ...(status && { status }) });
  };

  const handleView = (contact) => {
    setSelectedContact(contact);
    setShowViewModal(true);
    // Mark as read if it's new
    if (contact.status === 'new') {
      updateStatusMutation.mutate({ id: contact._id, status: 'read' });
    }
  };

  const handleReply = (contact) => {
    setSelectedContact(contact);
    setShowReplyModal(true);
  };

  const handleDelete = (contact) => {
    setSelectedContact(contact);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedContact) {
      deleteMutation.mutate(selectedContact._id);
    }
  };

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      alert('Please enter a reply message');
      return;
    }
    if (selectedContact) {
      replyMutation.mutate({ id: selectedContact._id, replyMessage });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { variant: 'primary', label: 'New', icon: Clock },
      read: { variant: 'info', label: 'Read', icon: Eye },
      replied: { variant: 'success', label: 'Replied', icon: CheckCircle },
      archived: { variant: 'secondary', label: 'Archived', icon: Archive },
    };

    const config = statusConfig[status] || statusConfig.new;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const contacts = contactsData?.data?.contacts || [];
  const pagination = contactsData?.data?.pagination || {};
  const stats = statsData?.data?.stats || {};

  if (isLoading) return <Loading />;
  if (error) return <Alert variant="error">Failed to load contacts</Alert>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-600 mt-1">Manage contact form submissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New</p>
              <p className="text-2xl font-bold text-primary-600">{stats.new || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-primary-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Read</p>
              <p className="text-2xl font-bold text-blue-600">{stats.read || 0}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Replied</p>
              <p className="text-2xl font-bold text-green-600">{stats.replied || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-gray-600">{stats.archived || 0}</p>
            </div>
            <Archive className="w-8 h-8 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Contacts Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No contacts found
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {contact.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">{contact.email}</td>
                    <td className="py-3 px-4">{contact.subject}</td>
                    <td className="py-3 px-4">{getStatusBadge(contact.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleView(contact)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        {contact.status !== 'replied' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleReply(contact)}
                            className="flex items-center gap-1"
                          >
                            <Reply className="w-4 h-4" />
                            Reply
                          </Button>
                        )}
                        <Button
                          variant="error"
                          size="sm"
                          onClick={() => handleDelete(contact)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} contacts
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setSearchParams({ page: (pagination.page - 1).toString() })}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setSearchParams({ page: (pagination.page + 1).toString() })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Modal */}
      {showViewModal && selectedContact && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedContact(null);
          }}
          title="Contact Details"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Name</label>
              <p className="mt-1 text-gray-900">{selectedContact.name}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{selectedContact.email}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Subject</label>
              <p className="mt-1 text-gray-900">{selectedContact.subject}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Message</label>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Submitted</label>
              <p className="mt-1 text-gray-900">
                {new Date(selectedContact.createdAt).toLocaleString()}
              </p>
            </div>
            {selectedContact.repliedAt && (
              <>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Replied At</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedContact.repliedAt).toLocaleString()}
                  </p>
                </div>
                {selectedContact.repliedBy && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Replied By</label>
                    <p className="mt-1 text-gray-900">
                      {selectedContact.repliedBy.name} ({selectedContact.repliedBy.email})
                    </p>
                  </div>
                )}
                {selectedContact.replyMessage && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Reply Message</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                      {selectedContact.replyMessage}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <Modal
          isOpen={showReplyModal}
          onClose={() => {
            setShowReplyModal(false);
            setReplyMessage('');
            setSelectedContact(null);
          }}
          title="Reply to Contact"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">From</label>
              <p className="mt-1 text-gray-900">{selectedContact.name} ({selectedContact.email})</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Subject</label>
              <p className="mt-1 text-gray-900">{selectedContact.subject}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Original Message</label>
              <p className="mt-1 text-gray-600 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
                {selectedContact.message}
              </p>
            </div>
            <div>
              <label htmlFor="replyMessage" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Reply
              </label>
              <textarea
                id="replyMessage"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Type your reply here..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyMessage('');
                  setSelectedContact(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSendReply}
                disabled={replyMutation.isLoading || !replyMessage.trim()}
              >
                {replyMutation.isLoading ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedContact && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedContact(null);
          }}
          title="Delete Contact"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this contact submission? This action cannot be undone.
            </p>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-semibold">{selectedContact.name}</p>
              <p className="text-sm text-gray-600">{selectedContact.email}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedContact.subject}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedContact(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="error"
                onClick={confirmDelete}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ContactUs;

