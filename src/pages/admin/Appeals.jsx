import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../contexts/ToastContext';
import { adminAppealService, appealService } from '../../services/appealService';
import { useAuthStore } from '../../stores/authStore';
import {
  connectWebSocket,
  joinAppealRoom,
  leaveAppealRoom,
  sendAppealMessage,
  onAppealMessage,
  onUserTyping,
  sendTypingIndicator,
  onError,
} from '../../services/websocketService';
import { FileText, Upload, Send, AlertCircle, CheckCircle, XCircle, Download, Eye } from 'lucide-react';
import DateRangePicker from '../../components/common/DateRangePicker';

const APPEAL_REASONS = {
  non_payment: 'Non-Payment',
  poor_quality: 'Poor Quality Work',
  contract_violation: 'Contract Violation',
  missed_deadline: 'Missed Deadline',
  other: 'Other',
};

const APPEAL_STATUSES = {
  open: { label: 'Open', variant: 'warning' },
  in_review: { label: 'In Review', variant: 'info' },
  resolved: { label: 'Resolved', variant: 'success' },
  closed_by_opener: { label: 'Closed by Opener', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
};

const ADMIN_DECISIONS = {
  favor_opener: 'Favor of Appeal Opener',
  favor_respondent: 'Favor of Respondent',
  partial: 'Partial Resolution',
  dismissed: 'Dismissed',
};

const Appeals = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToast();
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('appealId');

  const [selectedAppealId, setSelectedAppealId] = useState(selectedId || null);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get('startDate') || null,
    endDate: searchParams.get('endDate') || null,
  });
  const [messageContent, setMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveDecision, setResolveDecision] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const messagesEndRef = useRef(null);
  const page = parseInt(searchParams.get('page') || '1');

  const { data: appealsResp, isLoading: loadingList } = useQuery({
    queryKey: ['adminAppeals', page, statusFilter, dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      adminAppealService.getAllAppeals({
        page,
        limit: 20,
        status: statusFilter || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const appeals = appealsResp?.data?.appeals || [];
  const totalPages = appealsResp?.totalPages || 1;
  const currentPage = appealsResp?.currentPage || 1;
  const totalCount = appealsResp?.totalCount || 0;

  // Fetch selected appeal details
  const { data: selectedAppealResp, isLoading: loadingDetail } = useQuery({
    queryKey: ['adminAppeal', selectedAppealId],
    queryFn: () => adminAppealService.getAppeal(selectedAppealId),
    enabled: !!selectedAppealId,
    refetchInterval: 5000,
  });

  const appeal = selectedAppealResp?.data?.appeal;

  // WebSocket setup
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (selectedAppealId) {
        leaveAppealRoom(selectedAppealId);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedAppealId) {
      joinAppealRoom(selectedAppealId);

      const unsubscribeMessage = onAppealMessage((message) => {
        // Update the query cache immediately with the new message
        queryClient.setQueryData(['adminAppeal', selectedAppealId], (oldData) => {
          if (!oldData?.data?.appeal) return oldData;
          
          const appeal = oldData.data.appeal;
          const newMessage = {
            _id: message._id || `temp-${Date.now()}`,
            sender: {
              _id: message.sender?.id || message.sender?._id,
              name: message.sender?.name,
              email: message.sender?.email,
              role: message.sender?.role,
            },
            content: message.content,
            attachments: message.attachments || [],
            timestamp: message.timestamp || new Date(),
            isRead: message.isRead || false,
          };
          
          // Check if message already exists to avoid duplicates
          const messageExists = appeal.messages?.some(
            (m) => m._id === newMessage._id || 
            (m.content === newMessage.content && 
             String(m.sender?._id || m.sender) === String(newMessage.sender._id) &&
             Math.abs(new Date(m.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 1000)
          );
          
          if (messageExists) return oldData;
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              appeal: {
                ...appeal,
                messages: [...(appeal.messages || []), newMessage],
              },
            },
          };
        });
      });

      const unsubscribeTyping = onUserTyping((data) => {
        setTypingUsers((prev) => ({
          ...prev,
          [data.userId]: data.isTyping ? data.userName : null,
        }));
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[data.userId];
            return next;
          });
        }, 3000);
      });

      const unsubscribeError = onError((error) => {
        showError(error.message || 'WebSocket error occurred');
      });

      return () => {
        leaveAppealRoom(selectedAppealId);
        unsubscribeMessage();
        unsubscribeTyping();
        unsubscribeError();
      };
    }
  }, [selectedAppealId, queryClient, showError]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [appeal?.messages]);

  const sendMessageMutation = useMutation({
    mutationFn: ({ appealId, content }) => appealService.sendMessage(appealId, content),
    onMutate: async ({ appealId, content }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['adminAppeal', appealId] });
      
      // Snapshot previous value
      const previousAppeal = queryClient.getQueryData(['adminAppeal', appealId]);
      
      // Optimistically update with temporary message
      queryClient.setQueryData(['adminAppeal', appealId], (oldData) => {
        if (!oldData?.data?.appeal) return oldData;
        
        const appeal = oldData.data.appeal;
        const tempMessage = {
          _id: `temp-${Date.now()}`,
          sender: {
            _id: user?._id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
          },
          content: content,
          attachments: [],
          timestamp: new Date(),
          isRead: false,
        };
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            appeal: {
              ...appeal,
              messages: [...(appeal.messages || []), tempMessage],
            },
          },
        };
      });
      
      return { previousAppeal };
    },
    onSuccess: () => {
      setMessageContent('');
      // Refetch to get the real message from server (replaces temp message)
      queryClient.invalidateQueries({ queryKey: ['adminAppeal', selectedAppealId] });
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAppeal) {
        queryClient.setQueryData(['adminAppeal', selectedAppealId], context.previousAppeal);
      }
      showError(err?.message || 'Failed to send message');
    },
  });

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedAppealId) return;
    sendMessageMutation.mutate({
      appealId: selectedAppealId,
      content: messageContent,
    });
    sendAppealMessage(selectedAppealId, messageContent);
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ appealId, status }) => adminAppealService.updateAppealStatus(appealId, status),
    onSuccess: () => {
      showSuccess('Appeal status updated successfully');
      setShowStatusModal(false);
      queryClient.invalidateQueries({ queryKey: ['adminAppeals'] });
      queryClient.invalidateQueries({ queryKey: ['adminAppeal', selectedAppealId] });
    },
    onError: (err) => showError(err?.message || 'Failed to update status'),
  });

  const resolveAppealMutation = useMutation({
    mutationFn: ({ appealId, decision, adminNotes }) =>
      adminAppealService.resolveAppeal(appealId, decision, adminNotes),
    onSuccess: () => {
      showSuccess('Appeal resolved successfully');
      setShowResolveModal(false);
      setResolveDecision('');
      setResolveNotes('');
      queryClient.invalidateQueries({ queryKey: ['adminAppeals'] });
      queryClient.invalidateQueries({ queryKey: ['adminAppeal', selectedAppealId] });
    },
    onError: (err) => showError(err?.message || 'Failed to resolve appeal'),
  });

  const cancelContractMutation = useMutation({
    mutationFn: (appealId) => appealService.cancelContract(appealId),
    onSuccess: () => {
      showSuccess('Contract cancelled and escrow refunded');
      setShowCancelModal(false);
      queryClient.invalidateQueries({ queryKey: ['adminAppeals'] });
      queryClient.invalidateQueries({ queryKey: ['adminAppeal', selectedAppealId] });
    },
    onError: (err) => showError(err?.message || 'Failed to cancel contract'),
  });

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    const params = { page: '1', status };
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    const params = { page: '1', status: statusFilter };
    if (newDateRange.startDate) params.startDate = newDateRange.startDate;
    if (newDateRange.endDate) params.endDate = newDateRange.endDate;
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = { page: newPage.toString(), status: statusFilter };
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const getStatusBadge = (status) => {
    const statusInfo = APPEAL_STATUSES[status] || { label: status, variant: 'secondary' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  const handleDownload = async (doc) => {
    try {
      const url = `${API_BASE_URL}${doc.url}`;
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = doc.filename || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      showError('Failed to download document: ' + (error.message || 'Unknown error'));
    }
  };

  if (loadingList) {
    return <Loading text="Loading appeals..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertCircle className="w-7 h-7" />
          Appeals Management
        </h1>
        <p className="text-gray-600">Total: {totalCount} appeals</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            <Button variant={statusFilter === '' ? 'primary' : 'outline'} onClick={() => handleStatusFilter('')}>
              All
            </Button>
            <Button
              variant={statusFilter === 'open' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('open')}
            >
              Open
            </Button>
            <Button
              variant={statusFilter === 'in_review' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('in_review')}
            >
              In Review
            </Button>
            <Button
              variant={statusFilter === 'resolved' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('resolved')}
            >
              Resolved
            </Button>
            <Button
              variant={statusFilter === 'closed_by_opener' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('closed_by_opener')}
            >
              Closed
            </Button>
            <Button
              variant={statusFilter === 'cancelled' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('cancelled')}
            >
              Cancelled
            </Button>
          </div>
          <div className="pt-2 border-t">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateRangeChange}
              label="Filter by Created Date"
              placeholder="All dates"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appeals List */}
        <div className="lg:col-span-1">
          <Card title="All Appeals">
            {appeals.length === 0 ? (
              <p className="text-sm text-gray-600 py-4">No appeals found.</p>
            ) : (
              <div className="space-y-2">
                {appeals.map((a) => {
                  const isSelected = selectedAppealId === a._id;
                  return (
                    <button
                      key={a._id}
                      onClick={() => {
                        setSelectedAppealId(a._id);
                        setSearchParams({ appealId: a._id });
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {a.opener?.name || 'User'} vs {a.respondent?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {APPEAL_REASONS[a.reason] || a.reason}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(a.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">{getStatusBadge(a.status)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Appeal Detail */}
        <div className="lg:col-span-2">
          {!selectedAppealId ? (
            <Card>
              <p className="text-gray-600 text-center py-8">Select an appeal to view details</p>
            </Card>
          ) : loadingDetail ? (
            <Loading text="Loading appeal details..." />
          ) : !appeal ? (
            <Alert type="error" message="Appeal not found" />
          ) : (
            <div className="space-y-6">
              {/* Appeal Info */}
              <Card
                title="Appeal Details"
                actions={
                  <div className="flex gap-2">
                    {appeal.status !== 'resolved' && appeal.status !== 'cancelled' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setNewStatus(appeal.status === 'open' ? 'in_review' : 'open');
                            setShowStatusModal(true);
                          }}
                        >
                          {appeal.status === 'open' ? 'Mark In Review' : 'Mark Open'}
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setShowResolveModal(true)}
                        >
                          Resolve Appeal
                        </Button>
                      </>
                    )}
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <div className="mt-1">{getStatusBadge(appeal.status)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reason</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {APPEAL_REASONS[appeal.reason] || appeal.reason}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Opener</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {appeal.opener?.name || 'N/A'} ({appeal.opener?.email || 'N/A'})
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Respondent</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {appeal.respondent?.name || 'N/A'} ({appeal.respondent?.email || 'N/A'})
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Contract</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {appeal.contract?.projectDescription?.substring(0, 50) || 'N/A'}...
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {new Date(appeal.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{appeal.description}</p>
                  </div>
                  {appeal.adminDecision && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-900">Admin Decision</p>
                      <p className="text-sm text-blue-800 mt-1">
                        {ADMIN_DECISIONS[appeal.adminDecision] || appeal.adminDecision}
                      </p>
                      {appeal.adminNotes && (
                        <p className="text-xs text-blue-700 mt-2">{appeal.adminNotes}</p>
                      )}
                      {appeal.resolvedAt && (
                        <p className="text-xs text-blue-600 mt-2">
                          Resolved on {new Date(appeal.resolvedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Documents */}
              <Card title="Documents">
                {appeal.documents && appeal.documents.length > 0 ? (
                  <div className="space-y-2">
                    {appeal.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                            {doc.description && (
                              <p className="text-xs text-gray-500">{doc.description}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              Uploaded by {doc.uploadedBy?.name || 'User'} on{' '}
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-primary-600 hover:text-primary-700 cursor-pointer"
                          title="Download document"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 py-4">No documents uploaded yet.</p>
                )}
              </Card>

              {/* Chat */}
              <Card title="Messages">
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
                    {appeal.messages && appeal.messages.length > 0 ? (
                      <div className="space-y-3">
                        {appeal.messages.map((msg, idx) => {
                          return (
                            <div key={idx} className="flex justify-start">
                              <div className="max-w-[80%] rounded-lg p-3 bg-white border border-gray-200 text-gray-900">
                                <p className="text-xs font-medium mb-1 opacity-80">
                                  {msg.sender?.name || 'User'} ({msg.sender?.role || 'user'})
                                </p>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(msg.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        {Object.keys(typingUsers).length > 0 && (
                          <div className="text-xs text-gray-500 italic">
                            {Object.values(typingUsers)
                              .filter(Boolean)
                              .join(', ')}{' '}
                            {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 text-center py-8">No messages yet.</p>
                    )}
                  </div>
                  {(appeal.status === 'open' || appeal.status === 'in_review') && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        loading={sendMessageMutation.isPending}
                        disabled={!messageContent.trim()}
                        className="flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Cancel Contract */}
              {(appeal.status === 'open' || appeal.status === 'in_review') && (
                <Card>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-900 mb-2">Cancel Contract</p>
                    <p className="text-xs text-red-700 mb-3">
                      Cancel the contract and refund all escrow funds to the client's wallet.
                    </p>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setShowCancelModal(true)}
                    >
                      Cancel Contract
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Resolve Appeal Modal */}
      {showResolveModal && (
        <Modal
          isOpen={showResolveModal}
          onClose={() => {
            setShowResolveModal(false);
            setResolveDecision('');
            setResolveNotes('');
          }}
          title="Resolve Appeal"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decision *
              </label>
              <select
                value={resolveDecision}
                onChange={(e) => setResolveDecision(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select decision</option>
                <option value="favor_opener">Favor of Appeal Opener</option>
                <option value="favor_respondent">Favor of Respondent</option>
                <option value="partial">Partial Resolution</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Notes
              </label>
              <textarea
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Add notes about the resolution..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResolveModal(false);
                  setResolveDecision('');
                  setResolveNotes('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  resolveAppealMutation.mutate({
                    appealId: appeal._id,
                    decision: resolveDecision,
                    adminNotes: resolveNotes,
                  })
                }
                loading={resolveAppealMutation.isPending}
                disabled={!resolveDecision}
              >
                Resolve Appeal
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setNewStatus('');
          }}
          title="Update Appeal Status"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Change appeal status to <strong>{newStatus === 'in_review' ? 'In Review' : 'Open'}</strong>?
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  updateStatusMutation.mutate({
                    appealId: appeal._id,
                    status: newStatus,
                  })
                }
                loading={updateStatusMutation.isPending}
              >
                Update Status
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Contract Modal */}
      {showCancelModal && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Contract"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to cancel this contract? All escrow funds will be refunded to the client's wallet.
            </p>
            <p className="text-xs text-red-600">
              This action cannot be undone. The contract will be permanently cancelled.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => cancelContractMutation.mutate(appeal._id)}
                loading={cancelContractMutation.isPending}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Appeals;
