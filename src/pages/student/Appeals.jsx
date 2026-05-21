import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import { useToast } from '../../contexts/ToastContext';
import { appealService } from '../../services/appealService';
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
import { useAuthStore } from '../../stores/authStore';
import { FileText, Upload, Send, AlertCircle, Download } from 'lucide-react';
import { useDashboardLanguage } from '../../hooks/useDashboardLanguage';
import { getStudentAppealsT } from '../../locales/studentAppealsLocales';

const APPEAL_STATUS_VARIANTS = {
  open: 'warning',
  in_review: 'info',
  resolved: 'success',
  closed_by_opener: 'secondary',
  cancelled: 'danger',
};

const Appeals = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToast();
  const { language } = useDashboardLanguage();
  const t = useMemo(() => getStudentAppealsT(language), [language]);
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('appealId');

  const [selectedAppealId, setSelectedAppealId] = useState(selectedId || null);
  const [messageContent, setMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data: appealsResp, isLoading: loadingList } = useQuery({
    queryKey: ['appeals', 'me'],
    queryFn: () => appealService.getMyAppeals(),
  });

  const appeals = appealsResp?.data?.appeals || [];

  const { data: appealResp, isLoading: loadingDetail } = useQuery({
    queryKey: ['appeal', selectedAppealId],
    queryFn: () => appealService.getAppeal(selectedAppealId),
    enabled: !!selectedAppealId,
    refetchInterval: 5000, // Refetch every 5 seconds to get new messages
  });

  const appeal = appealResp?.data?.appeal || null;
  const isOpener = appeal && String(appeal.opener._id || appeal.opener) === String(user?._id);

  const getReasonLabel = (r) => (r ? t[`reason_${r}`] || r : '');
  const getStatusLabel = (s) => (s ? t[`st_${s}`] || s : '');

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
        queryClient.setQueryData(['appeal', selectedAppealId], (oldData) => {
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
        showError(error.message || tRef.current.wsError);
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
      await queryClient.cancelQueries({ queryKey: ['appeal', appealId] });
      
      // Snapshot previous value
      const previousAppeal = queryClient.getQueryData(['appeal', appealId]);
      
      // Optimistically update with temporary message
      queryClient.setQueryData(['appeal', appealId], (oldData) => {
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
      queryClient.invalidateQueries({ queryKey: ['appeal', selectedAppealId] });
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAppeal) {
        queryClient.setQueryData(['appeal', selectedAppealId], context.previousAppeal);
      }
      showError(err?.message || tRef.current.sendFail);
    },
  });

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedAppealId) return;

    sendMessageMutation.mutate({
      appealId: selectedAppealId,
      content: messageContent,
    });

    // Also send via WebSocket for real-time
    sendAppealMessage(selectedAppealId, messageContent);
  };

  const handleTyping = (typing) => {
    if (typing !== isTyping && selectedAppealId) {
      setIsTyping(typing);
      sendTypingIndicator(selectedAppealId, typing);
    }
  };

  const closeAppealMutation = useMutation({
    mutationFn: (appealId) => appealService.closeAppeal(appealId),
    onSuccess: () => {
      showSuccess(tRef.current.appealClosed);
      queryClient.invalidateQueries({ queryKey: ['appeals', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['appeal', selectedAppealId] });
    },
    onError: (err) => showError(err?.message || tRef.current.closeFail),
  });


  const uploadDocMutation = useMutation({
    mutationFn: ({ appealId, file, description }) => appealService.uploadDocument(appealId, file, description),
    onSuccess: () => {
      showSuccess(tRef.current.docUploaded);
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['appeal', selectedAppealId] });
    },
    onError: (err) => {
      showError(err?.message || tRef.current.docUploadFail);
      setUploadingDoc(false);
    },
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAppealId) return;

    if (file.size > 10 * 1024 * 1024) {
      showError(tRef.current.fileTooBig);
      return;
    }

    setUploadingDoc(true);
    uploadDocMutation.mutate({
      appealId: selectedAppealId,
      file,
      description: '',
    });
  };

  const getStatusBadge = (status) => {
    const variant = APPEAL_STATUS_VARIANTS[status] || 'secondary';
    return <Badge variant={variant}>{getStatusLabel(status)}</Badge>;
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
      showError(`${tRef.current.downloadFail}: ${error.message || 'Unknown error'}`);
    }
  };

  if (loadingList) {
    return <Loading text={t.loadingList} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertCircle className="w-7 h-7" />
          {t.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appeals List */}
        <div className="lg:col-span-1">
          <Card title={t.myAppeals}>
            {appeals.length === 0 ? (
              <p className="text-sm text-gray-600 py-4">{t.noAppeals}</p>
            ) : (
              <div className="space-y-2">
                {appeals.map((a) => {
                  const isSelected = selectedAppealId === a._id;
                  const isMyAppeal = String(a.opener._id || a.opener) === String(user?._id);
                  return (
                    <button
                      key={a._id}
                      onClick={() => {
                        setSelectedAppealId(a._id);
                        setSearchParams({ appealId: a._id });
                      }}
                      className={`w-full text-start p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {isMyAppeal ? t.you : a.opener?.name || t.user} {t.vs} {isMyAppeal ? a.respondent?.name || t.user : t.you}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getReasonLabel(a.reason)}
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
          </Card>
        </div>

        {/* Appeal Detail */}
        <div className="lg:col-span-2">
          {!selectedAppealId ? (
            <Card>
              <p className="text-gray-600 text-center py-8">{t.selectAppeal}</p>
            </Card>
          ) : loadingDetail ? (
            <Loading text={t.loadingDetail} />
          ) : !appeal ? (
            <Alert type="error" message={t.notFound} />
          ) : (
            <div className="space-y-6">
              {/* Appeal Info */}
              <Card
                title={t.detailsTitle}
                actions={
                  isOpener && appeal.status === 'open' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => closeAppealMutation.mutate(appeal._id)}
                      loading={closeAppealMutation.isPending}
                    >
                      {t.closeAppeal}
                    </Button>
                  ) : null
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">{t.status}</p>
                      <div className="mt-1">{getStatusBadge(appeal.status)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t.reason}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {getReasonLabel(appeal.reason)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t.opener}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {appeal.opener?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t.respondent}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {appeal.respondent?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t.description}</p>
                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{appeal.description}</p>
                  </div>
                  {appeal.adminDecision && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-900">{t.adminDecision}</p>
                      <p className="text-sm text-blue-800 mt-1">
                        {appeal.adminDecision === 'favor_opener'
                          ? t.decFavorOpener
                          : appeal.adminDecision === 'favor_respondent'
                          ? t.decFavorRespondent
                          : appeal.adminDecision === 'partial'
                          ? t.decPartial
                          : t.decDismissed}
                      </p>
                      {appeal.adminNotes && (
                        <p className="text-xs text-blue-700 mt-2">{appeal.adminNotes}</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Documents */}
              <Card title={t.documents}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {t.docCount.replace('{n}', String(appeal.documents?.length || 0))}
                    </p>
                    {(appeal.status === 'open' || appeal.status === 'in_review') && appeal.documents?.length < 10 && (
                      <label className="cursor-pointer">
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          disabled={uploadingDoc}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          loading={uploadingDoc}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {t.uploadDocument}
                        </Button>
                      </label>
                    )}
                    {(appeal.status === 'cancelled' || !['open', 'in_review'].includes(appeal.status)) && (
                      <p className="text-sm text-gray-500">
                        {t.uploadDisabled.replace('{status}', getStatusLabel(appeal.status))}
                      </p>
                    )}
                  </div>
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
                                {t.uploadedBy
                                  .replace('{name}', doc.uploadedBy?.name || t.user)
                                  .replace('{date}', new Date(doc.uploadedAt).toLocaleDateString())}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="text-primary-600 hover:text-primary-700 cursor-pointer"
                            title={t.downloadTitle}
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 py-4">{t.noDocuments}</p>
                  )}
                </div>
              </Card>

              {/* Chat */}
              <Card title={t.messages}>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
                    {appeal.messages && appeal.messages.length > 0 ? (
                      <div className="space-y-3">
                        {appeal.messages.map((msg, idx) => {
                          const isMyMessage = String(msg.sender._id || msg.sender) === String(user?._id);
                          return (
                            <div
                              key={idx}
                              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  isMyMessage
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-900'
                                }`}
                                style={isMyMessage ? { backgroundColor: '#2563eb', color: '#ffffff' } : {}}
                              >
                                <p className={`text-xs font-medium mb-1 ${isMyMessage ? 'text-white opacity-90' : 'text-gray-700 opacity-80'}`}>
                                  {msg.sender?.name || t.user}
                                </p>
                                <p className={`text-sm whitespace-pre-wrap ${isMyMessage ? 'text-white' : 'text-gray-900'}`}>
                                  {msg.content}
                                </p>
                                <p className={`text-xs mt-1 ${isMyMessage ? 'text-white opacity-80' : 'text-gray-600 opacity-70'}`}>
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
                            {Object.keys(typingUsers).length === 1 ? t.isTyping : t.areTyping} {t.typing}
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 text-center py-8">{t.noMessages}</p>
                    )}
                  </div>
                  {appeal.status === 'open' || appeal.status === 'in_review' ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageContent}
                        onChange={(e) => {
                          setMessageContent(e.target.value);
                          handleTyping(true);
                        }}
                        onBlur={() => handleTyping(false)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                            handleTyping(false);
                          }
                        }}
                        placeholder={t.typeMessage}
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
                        {t.send}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                      {t.messagingDisabled.replace('{status}', getStatusLabel(appeal.status))}
                    </p>
                  )}
                </div>
              </Card>

            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Appeals;
