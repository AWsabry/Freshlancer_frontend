import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { educationBadgeService } from '../../services/educationBadgeService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import { API_BASE_URL } from '../../config/env';
import { ArrowLeft, CheckCircle, XCircle, Eye } from 'lucide-react';

const EducationBadgeRequests = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [action, setAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['educationBadgeRequests', statusFilter],
    queryFn: () =>
      educationBadgeService.getAdminRequests({
        status: statusFilter || undefined,
      }),
  });

  const requests = data?.data?.requests || [];

  const reviewMutation = useMutation({
    mutationFn: () => {
      if (action === 'approve') {
        return educationBadgeService.approveRequest(selectedRequest._id, { adminNotes });
      }
      return educationBadgeService.rejectRequest(selectedRequest._id, {
        rejectionReason,
        adminNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['educationBadgeRequests']);
      setSelectedRequest(null);
      setAction('');
      setRejectionReason('');
      setAdminNotes('');
    },
  });

  const statusVariant = (s) => {
    if (s === 'approved') return 'success';
    if (s === 'rejected') return 'error';
    return 'warning';
  };

  const proofUrl = (req) =>
    req?.proofDocument?.url ? `${API_BASE_URL}${req.proofDocument.url}` : null;

  if (isLoading) return <Loading text="Loading requests..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/education-partners">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Partners
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Badge requests</h1>
      </div>

      <Select
        label="Filter by status"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        options={[
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
          { value: '', label: 'All' },
        ]}
      />

      <Card title={`Requests (${requests.length})`}>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-sm">No requests.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req._id}
                className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium">
                    {req.student?.name} — {req.student?.email}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {req.entity?.name}: {req.certificate?.title} ({req.certificate?.track})
                  </div>
                  {req.studentNote && (
                    <p className="text-sm text-gray-500 mt-1 italic">{req.studentNote}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant={req.hasProof ? 'success' : 'warning'}>
                      {req.hasProof ? 'Proof uploaded' : 'No proof'}
                    </Badge>
                    {proofUrl(req) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(proofUrl(req), '_blank')}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview proof
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>
                <Badge variant={statusVariant(req.status)}>{req.status}</Badge>
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(req);
                        setAction('approve');
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setSelectedRequest(req);
                        setAction('reject');
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!selectedRequest && !!action}
        onClose={() => {
          setSelectedRequest(null);
          setAction('');
        }}
        title={action === 'approve' ? 'Approve request' : 'Reject request'}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {selectedRequest.student?.email} — {selectedRequest.certificate?.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={selectedRequest.hasProof ? 'success' : 'warning'}>
                {selectedRequest.hasProof ? 'Proof uploaded' : 'No proof attached'}
              </Badge>
              {proofUrl(selectedRequest) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(proofUrl(selectedRequest), '_blank')}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview proof
                </Button>
              )}
            </div>
            {action === 'reject' && (
              <div>
                <label className="block text-sm font-medium mb-1">Rejection reason *</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Admin notes</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null);
                  setAction('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant={action === 'reject' ? 'danger' : 'primary'}
                loading={reviewMutation.isPending}
                disabled={action === 'reject' && !rejectionReason.trim()}
                onClick={() => reviewMutation.mutate()}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EducationBadgeRequests;
