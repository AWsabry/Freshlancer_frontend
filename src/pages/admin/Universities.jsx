import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { universityService } from '../../services/universityService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  GraduationCap,
  Clock,
  Globe,
} from 'lucide-react';

const Universities = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountryCode, setFilterCountryCode] = useState('');
  const [page, setPage] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    countryCode: '',
    website: '',
  });

  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch universities with pagination
  const { data: universitiesData, isLoading } = useQuery({
    queryKey: ['adminUniversities', filterStatus, searchTerm, filterCountryCode, page],
    queryFn: async () => {
      const params = { page, limit: 20 };
      if (filterStatus && filterStatus.trim() !== '') {
        params.status = filterStatus;
      }
      if (searchTerm && searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }
      if (filterCountryCode && filterCountryCode.trim() !== '') {
        params.countryCode = filterCountryCode;
      }
      return universityService.getAllUniversitiesAdmin(params);
    },
  });

  const universities = universitiesData?.data?.universities || [];
  const total = universitiesData?.total || 0;
  const pages = universitiesData?.pages || 1;
  
  // Get status counts from entire database (not just paginated results)
  const totalAll = universitiesData?.counts?.total || 0;
  const totalApproved = universitiesData?.counts?.approved || 0;
  const totalPending = universitiesData?.counts?.pending || 0;
  const totalRejected = universitiesData?.counts?.rejected || 0;

  // Create university mutation
  const createMutation = useMutation({
    mutationFn: (data) => universityService.createUniversity(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUniversities']);
      setShowCreateModal(false);
      resetForm();
    },
  });

  // Update university mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => universityService.updateUniversity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUniversities']);
      setShowEditModal(false);
      setSelectedUniversity(null);
      resetForm();
    },
  });

  // Approve university mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, data }) => universityService.approveUniversity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUniversities']);
      setShowApproveModal(false);
      setSelectedUniversity(null);
    },
  });

  // Reject university mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => universityService.rejectUniversity(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUniversities']);
      setShowRejectModal(false);
      setSelectedUniversity(null);
      setRejectionReason('');
    },
  });

  // Delete university mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => universityService.deleteUniversity(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUniversities']);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      countryCode: '',
      website: '',
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      alert('University name is required');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (university) => {
    setSelectedUniversity(university);
    setFormData({
      name: university.name || '',
      countryCode: university.countryCode || '',
      website: university.website || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!formData.name.trim()) {
      alert('University name is required');
      return;
    }
    if (!formData.countryCode || formData.countryCode.trim().length !== 2) {
      alert('Country code is required and must be 2 characters (e.g., US, EG, SA)');
      return;
    }
    updateMutation.mutate({
      id: selectedUniversity._id,
      data: formData,
    });
  };

  const handleApprove = (university) => {
    setSelectedUniversity(university);
    setShowApproveModal(true);
  };

  const handleApproveConfirm = () => {
    if (!formData.countryCode || formData.countryCode.trim().length !== 2) {
      alert('Country code is required and must be 2 characters (e.g., US, EG, SA)');
      return;
    }
    approveMutation.mutate({
      id: selectedUniversity._id,
      data: {
        countryCode: formData.countryCode,
        website: formData.website || undefined,
      },
    });
  };

  const handleReject = (university) => {
    setSelectedUniversity(university);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    rejectMutation.mutate({
      id: selectedUniversity._id,
      reason: rejectionReason || 'Rejected by admin',
    });
  };

  const handleDelete = (university) => {
    setSelectedUniversity(university);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedUniversity) {
      deleteMutation.mutate(selectedUniversity._id);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Universities</h1>
          <p className="text-gray-600 mt-1">Manage universities and review pending submissions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add University
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Universities</p>
              <p className="text-2xl font-bold text-gray-900">{totalAll}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-primary-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{totalPending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{totalApproved}</p>
            </div>
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
              options={[
                { value: '', label: 'All Status' },
                { value: 'approved', label: 'Approved' },
                { value: 'pending', label: 'Pending' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
            <Input
              placeholder="e.g., US, EG, SA"
              value={filterCountryCode}
              onChange={(e) => {
                setFilterCountryCode(e.target.value.toUpperCase());
                setPage(1); // Reset to first page on filter change
              }}
              maxLength={2}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilterStatus('');
                setSearchTerm('');
                setFilterCountryCode('');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Universities List */}
      {isLoading ? (
        <Loading />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-700">Name</th>
                  <th className="text-left p-3 font-medium text-gray-700">Country</th>
                  <th className="text-left p-3 font-medium text-gray-700">Status</th>
                  <th className="text-left p-3 font-medium text-gray-700">Added By</th>
                  <th className="text-left p-3 font-medium text-gray-700">Date</th>
                  <th className="text-right p-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {universities.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-500">
                      No universities found
                    </td>
                  </tr>
                ) : (
                  universities.map((university) => (
                    <tr key={university._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{university.name}</div>
                        {university.website && (
                          <a
                            href={university.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            <Globe className="w-3 h-3" />
                            Website
                          </a>
                        )}
                      </td>
                      <td className="p-3 text-gray-600">
                        {university.countryCode || 'N/A'}
                      </td>
                      <td className="p-3">{getStatusBadge(university.status)}</td>
                      <td className="p-3 text-gray-600">
                        {university.addedBy ? (
                          <div>
                            <div className="text-sm">{university.addedBy.name}</div>
                            <div className="text-xs text-gray-500">{university.addedBy.email}</div>
                          </div>
                        ) : (
                          'System'
                        )}
                      </td>
                      <td className="p-3 text-gray-600 text-sm">
                        {new Date(university.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          {university.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(university)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(university)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(university)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(university)}
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
          {pages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} universities
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Page {page} of {pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Add University"
      >
        <div className="space-y-4">
          <Input
            label="University Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter university name"
            required
          />
          <Input
            label="Country Code *"
            value={formData.countryCode}
            onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
            placeholder="e.g., US, EG, SA"
            maxLength={2}
            required
          />
          <Input
            label="Website (Optional)"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://university.edu"
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUniversity(null);
          resetForm();
        }}
        title="Edit University"
      >
        <div className="space-y-4">
          <Input
            label="University Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter university name"
            required
          />
          <Input
            label="Country Code *"
            value={formData.countryCode}
            onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
            placeholder="e.g., US, EG, SA"
            maxLength={2}
            required
          />
          <Input
            label="Website (Optional)"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://university.edu"
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedUniversity(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} loading={updateMutation.isPending}>
              Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedUniversity(null);
          resetForm();
        }}
        title="Approve University"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Approve <strong>{selectedUniversity?.name}</strong>?
          </p>
          <Input
            label="Country Code *"
            value={formData.countryCode}
            onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
            placeholder="e.g., US, EG, SA"
            maxLength={2}
            required
          />
          <Input
            label="Website (Optional)"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://university.edu"
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveModal(false);
                setSelectedUniversity(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApproveConfirm} loading={approveMutation.isPending}>
              Approve
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedUniversity(null);
          setRejectionReason('');
        }}
        title="Reject University"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Reject <strong>{selectedUniversity?.name}</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedUniversity(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={handleRejectConfirm}
              loading={rejectMutation.isPending}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUniversity(null);
        }}
        title="Delete University"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to permanently delete <strong>{selectedUniversity?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedUniversity(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={handleDeleteConfirm}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Universities;

