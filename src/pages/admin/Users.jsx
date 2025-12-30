import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { verificationService } from '../../services/verificationService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import DateRangePicker from '../../components/common/DateRangePicker';
import {
  Users as UsersIcon,
  Search,
  Filter,
  Ban,
  Unlock,
  Trash2,
  Eye,
  Mail,
  Calendar,
  FileText,
  Download,
  ExternalLink,
  List,
  Grid,
} from 'lucide-react';
import { API_BASE_URL } from '../../config/env';
import { exportToCSV, formatDate } from '../../utils/exportUtils';

// Helper function to format date for display (more readable format)
const formatDisplayDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Actual search query
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
  const [showDeleted, setShowDeleted] = useState(false);
  const [showSuspended, setShowSuspended] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get('startDate') || null,
    endDate: searchParams.get('endDate') || null,
  });
  const [viewMode, setViewMode] = useState('detailed'); // 'detailed' or 'compact'

  const page = parseInt(searchParams.get('page') || '1');

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['adminUsers', page, roleFilter, searchTerm, showDeleted, dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      adminService.getAllUsers({
        page,
        limit: 20,
        role: roleFilter || undefined,
        search: searchTerm || undefined,
        includeDeleted: showDeleted ? 'true' : undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  // Suspend/unsuspend mutation
  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.toggleUserSuspension(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      setShowSuspendModal(false);
      setSelectedUser(null);
      setSuspensionReason('');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['adminUsers']);
      alert(response?.message || 'User deleted successfully');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete user');
    },
  });

  // Verify/unverify mutation
  const verifyMutation = useMutation({
    mutationFn: (id) => adminService.toggleUserVerification(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      setShowViewModal(false);
      setSelectedUser(null);
    },
  });

  const handleSearch = () => {
    // Update the actual search term (triggers query refetch)
    setSearchTerm(searchInput.trim());
    // Reset to page 1 when searching
    const params = { page: '1', role: roleFilter };
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    // Reset to page 1 when changing role filter
    const params = { page: '1', role };
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    // Update URL params
    const params = { page: '1', role: roleFilter };
    if (newDateRange.startDate) params.startDate = newDateRange.startDate;
    if (newDateRange.endDate) params.endDate = newDateRange.endDate;
    setSearchParams(params);
  };

  const handleSuspend = (user) => {
    setSelectedUser(user);
    setShowSuspendModal(true);
  };

  const handleConfirmSuspend = () => {
    if (selectedUser) {
      suspendMutation.mutate({
        id: selectedUser._id,
        reason: suspensionReason,
      });
    }
  };

  const handleDelete = (user) => {
    // Prevent deleting admin users
    if (user.role === 'admin') {
      alert('⛔ Cannot delete admin users');
      return;
    }

    const confirmMessage =
      `⚠️ Delete User: ${user.name}\n\n` +
      `Role: ${user.role}\n` +
      `Email: ${user.email}\n\n` +
      `This will deactivate the user account. They will no longer be able to log in.\n\n` +
      `Are you sure you want to proceed?`;

    if (window.confirm(confirmMessage)) {
      deleteMutation.mutate(user._id);
    }
  };

  const handleView = async (user) => {
    setLoadingUserDetails(true);
    setShowViewModal(true);
    try {
      // Fetch full user details
      const response = await adminService.getUserById(user._id);
      // Handle both response structures - API interceptor unwraps response.data
      const fullUser = response?.data?.data?.user || response?.data?.user || response?.user || user;
      setSelectedUser(fullUser);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      alert('Failed to load user details. Showing limited information.');
      // Fallback to the user data from the list
      setSelectedUser(user);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  // Fetch verifications for selected student
  const { data: verificationsData } = useQuery({
    queryKey: ['userVerifications', selectedUser?._id],
    queryFn: () => verificationService.getAllVerifications({ student: selectedUser._id }),
    enabled: !!selectedUser && selectedUser.role === 'student',
  });

  const handleVerify = () => {
    if (selectedUser) {
      verifyMutation.mutate(selectedUser._id);
    }
  };

  const handlePageChange = (newPage) => {
    const params = { page: newPage.toString(), role: roleFilter, search: searchTerm };
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const handleExport = async () => {
    try {
      // Fetch all users for export (without pagination)
      const exportData = await adminService.getAllUsers({
        limit: 10000, // Large limit to get all users
        role: roleFilter || undefined,
        search: searchTerm || undefined,
        includeDeleted: showDeleted ? 'true' : undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });

      const allUsers = exportData?.data?.data?.users || exportData?.data?.users || [];
      
      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'phone', label: 'Phone' },
        { key: 'nationality', label: 'Nationality' },
        { 
          key: 'location', 
          label: 'Location',
          formatter: (value) => {
            if (!value) return 'N/A';
            if (typeof value === 'string') return value;
            if (typeof value === 'object') {
              const parts = [];
              if (value.city) parts.push(value.city);
              if (value.timezone) parts.push(value.timezone);
              return parts.length > 0 ? parts.join(', ') : 'N/A';
            }
            return 'N/A';
          }
        },
        { 
          key: 'active', 
          label: 'Status',
          formatter: (value, item) => {
            if (value === false) return 'Deleted';
            if (item.suspended) return 'Suspended';
            return 'Active';
          }
        },
        { 
          key: 'emailVerified', 
          label: 'Email Verified',
          formatter: (value) => value ? 'Yes' : 'No'
        },
        { 
          key: 'studentProfile.isVerified', 
          label: 'Profile Verified',
          formatter: (value, item) => {
            if (item.role === 'student') {
              return item.studentProfile?.isVerified ? 'Yes' : 'No';
            }
            if (item.role === 'client') {
              return item.clientProfile?.isVerified ? 'Yes' : 'No';
            }
            return 'N/A';
          }
        },
        { 
          key: 'joinedAt', 
          label: 'Joined Date',
          formatter: formatDate
        },
        { 
          key: 'suspended', 
          label: 'Suspended',
          formatter: (value) => value ? 'Yes' : 'No'
        },
        { 
          key: 'suspensionReason', 
          label: 'Suspension Reason'
        },
      ];

      exportToCSV(allUsers, columns, 'users');
    } catch (error) {
      alert('Failed to export users: ' + (error.message || 'Unknown error'));
    }
  };

  if (isLoading) {
    return <Loading text="Loading users..." />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        message={`Failed to load users: ${error.response?.data?.message || error.message}`}
      />
    );
  }

  const allUsers = usersData?.data?.users || [];

  // Client-side filter for suspended users
  let users = allUsers;
  if (showSuspended) {
    users = allUsers.filter(user => user.suspended === true);
  }

  // Use backend pagination data when not filtering for suspended users
  // When filtering suspended, we show all results without pagination
  const totalPages = showSuspended ? 1 : (usersData?.totalPages || 1);
  const currentPage = showSuspended ? 1 : (usersData?.currentPage || 1);
  const totalCount = usersData?.totalCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon className="w-7 h-7" />
            Users Management
          </h1>
          <p className="text-gray-600 mt-1">
            {showSuspended
              ? `Showing: ${users.length} suspended user${users.length !== 1 ? 's' : ''}`
              : `Total: ${totalCount} users`
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'detailed'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Detailed View"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Detailed</span>
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'compact'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Compact View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Compact</span>
            </button>
          </div>
          <Button
            variant="primary"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Role Filter */}
            <div className="flex gap-2">
              <Button
                variant={roleFilter === '' ? 'primary' : 'outline'}
                onClick={() => handleRoleFilter('')}
              >
                All
              </Button>
              <Button
                variant={roleFilter === 'student' ? 'primary' : 'outline'}
                onClick={() => handleRoleFilter('student')}
              >
                Students
              </Button>
              <Button
                variant={roleFilter === 'client' ? 'primary' : 'outline'}
                onClick={() => handleRoleFilter('client')}
              >
                Clients
              </Button>
              <Button
                variant={roleFilter === 'admin' ? 'primary' : 'outline'}
                onClick={() => handleRoleFilter('admin')}
              >
                Admins
              </Button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="pt-2 border-t">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateRangeChange}
              label="Filter by Joined Date"
              placeholder="All dates"
            />
          </div>

          {/* Show Deleted and Suspended Toggles */}
          <div className="flex items-center gap-6 pt-2 border-t">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showDeleted"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="showDeleted" className="text-sm text-gray-700 cursor-pointer">
                Show deleted users
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showSuspended"
                checked={showSuspended}
                onChange={(e) => setShowSuspended(e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="showSuspended" className="text-sm text-gray-700 cursor-pointer">
                Show only suspended users
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {viewMode === 'compact' ? (
          /* Compact Table View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Joined</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-600 font-semibold text-xs">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          user.role === 'student'
                            ? 'success'
                            : user.role === 'client'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        {user.active === false ? (
                          <Badge variant="default" size="sm">Deleted</Badge>
                        ) : user.suspended ? (
                          <Badge variant="danger" size="sm">Suspended</Badge>
                        ) : (
                          <Badge variant="success" size="sm">Active</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-500">
                        {user.joinedAt ? formatDisplayDate(user.joinedAt) : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSuspend(user)}
                          className={`p-1.5 rounded transition-colors ${
                            user.suspended
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-yellow-600 hover:bg-yellow-50'
                          }`}
                          title={user.suspended ? 'Unsuspend' : 'Suspend'}
                        >
                          {user.suspended ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={user.role === 'admin'}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Detailed Table View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.photo}
                          alt={user.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          user.role === 'student'
                            ? 'success'
                            : user.role === 'client'
                            ? 'info'
                            : 'warning'
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {user.active === false ? (
                          <Badge variant="default">Deleted</Badge>
                        ) : user.suspended ? (
                          <Badge variant="danger">Suspended</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                        {user.emailVerified && (
                          <Badge variant="info" size="sm">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {user.joinedAt ? formatDisplayDate(user.joinedAt) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleView(user)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant={user.suspended ? 'success' : 'warning'}
                          size="sm"
                          onClick={() => handleSuspend(user)}
                        >
                          {user.suspended ? (
                            <><Unlock className="w-4 h-4 mr-1" />Unsuspend</>
                          ) : (
                            <><Ban className="w-4 h-4 mr-1" />Suspend</>
                          )}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          disabled={user.role === 'admin'}
                          title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination - Hidden when filtering suspended users */}
        {!showSuspended && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
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
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Suspend Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setSelectedUser(null);
          setSuspensionReason('');
        }}
        title={selectedUser?.suspended ? 'Unsuspend User' : 'Suspend User'}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {selectedUser?.suspended
              ? `Are you sure you want to unsuspend "${selectedUser?.name}"?`
              : `Are you sure you want to suspend "${selectedUser?.name}"?`}
          </p>

          {!selectedUser?.suspended && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for suspension
              </label>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="Enter the reason for suspension..."
              />
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuspendModal(false);
                setSelectedUser(null);
                setSuspensionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant={selectedUser?.suspended ? 'success' : 'warning'}
              onClick={handleConfirmSuspend}
              disabled={suspendMutation.isPending}
            >
              {suspendMutation.isPending
                ? 'Processing...'
                : selectedUser?.suspended
                ? 'Unsuspend'
                : 'Suspend'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View User Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedUser(null);
        }}
        title="User Details"
        size="xl"
      >
        {loadingUserDetails ? (
          <div className="text-center py-8">
            <Loading text="Loading user details..." />
          </div>
        ) : selectedUser ? (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* User Header */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <img
                src={selectedUser.photo}
                alt={selectedUser.name}
                className="w-20 h-20 rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                <p className="text-gray-600 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {selectedUser.email}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge
                    variant={
                      selectedUser.role === 'student'
                        ? 'success'
                        : selectedUser.role === 'client'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {selectedUser.role}
                  </Badge>
                  {selectedUser.suspended && <Badge variant="danger">Suspended</Badge>}
                  {selectedUser.emailVerified && <Badge variant="info">Email Verified</Badge>}
                  {selectedUser.role === 'student' && selectedUser.studentProfile?.isVerified && (
                    <Badge variant="success">Profile Verified</Badge>
                  )}
                  {selectedUser.role === 'client' && selectedUser.clientProfile?.isVerified && (
                    <Badge variant="success">Profile Verified</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{selectedUser.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Age</label>
                <p className="text-gray-900">{selectedUser.age || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900">{selectedUser.gender || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nationality</label>
                <p className="text-gray-900">{selectedUser.nationality || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-gray-900">
                  {selectedUser.location
                    ? typeof selectedUser.location === 'string'
                      ? selectedUser.location
                      : `${selectedUser.location.city || ''}${selectedUser.location.city && selectedUser.location.timezone ? ', ' : ''}${selectedUser.location.timezone || ''}`.trim() || 'N/A'
                    : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Joined Date</label>
                <p className="text-gray-900">
                  {selectedUser.joinedAt ? formatDisplayDate(selectedUser.joinedAt) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">
                  {selectedUser.updatedAt ? formatDisplayDate(selectedUser.updatedAt) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Bio */}
            {selectedUser.bio && (
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-500">Bio</label>
                <p className="text-gray-900 mt-1">{selectedUser.bio}</p>
              </div>
            )}

            {/* Student-specific information */}
            {selectedUser?.role === 'student' && selectedUser?.studentProfile && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Student Profile</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience Level</label>
                    <p className="text-gray-900">
                      {selectedUser?.studentProfile?.experienceLevel || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Availability</label>
                    <p className="text-gray-900">
                      {selectedUser?.studentProfile?.availability || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Skills</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedUser?.studentProfile?.skills?.length > 0 ? (
                        selectedUser.studentProfile.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {typeof skill === 'string' ? skill : skill?.name || skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No skills added</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Languages</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedUser?.studentProfile?.languages?.length > 0 ? (
                        selectedUser.studentProfile.languages.map((lang, index) => (
                          <Badge key={index} variant="info">
                            {lang?.language} ({lang?.proficiency})
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No languages added</p>
                      )}
                    </div>
                  </div>
                  {(selectedUser?.studentProfile?.university || selectedUser?.studentProfile?.graduationYear) && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Education</label>
                      <div className="space-y-2 mt-1">
                        <div className="bg-gray-50 p-2 rounded">
                          {selectedUser.studentProfile.university && (
                            <p className="font-medium text-gray-900">{selectedUser.studentProfile.university}</p>
                          )}
                          {selectedUser.studentProfile.major && (
                            <p className="text-sm text-gray-600">Major: {selectedUser.studentProfile.major}</p>
                          )}
                          {selectedUser.studentProfile.graduationYear && (
                            <p className="text-xs text-gray-500">
                              Expected Graduation: {selectedUser.studentProfile.graduationYear}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedUser?.studentProfile?.portfolio && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Portfolio</label>
                      <a
                        href={selectedUser.studentProfile.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 mt-1"
                      >
                        {selectedUser.studentProfile.portfolio}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Verification Status</label>
                    <p className="text-gray-900">
                      {selectedUser?.studentProfile?.verificationStatus || 'unverified'}
                    </p>
                  </div>
                  {selectedUser?.studentProfile?.cvUrl && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">CV/Resume</label>
                      <div className="mt-1">
                        <a
                          href={`${API_BASE_URL}${selectedUser.studentProfile.cvUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
                        >
                          <FileText className="w-4 h-4" />
                          View CV/Resume
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Verification Documents */}
                {verificationsData?.data?.data?.verifications && verificationsData.data.data.verifications.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-semibold text-gray-900 mb-3">Verification Documents</h5>
                    <div className="space-y-3">
                      {verificationsData.data.data.verifications.map((verification) => (
                        <div key={verification._id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <span className="font-medium text-gray-900 capitalize">
                                  {verification.documentType?.replace('_', ' ')}
                                </span>
                                <Badge
                                  variant={
                                    verification.status === 'approved'
                                      ? 'success'
                                      : verification.status === 'rejected'
                                      ? 'error'
                                      : 'warning'
                                  }
                                >
                                  {verification.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Institution:</strong> {verification.institutionName}</p>
                                <p><strong>Student ID:</strong> {verification.studentIdNumber}</p>
                                <p><strong>Enrollment Year:</strong> {verification.enrollmentYear}</p>
                                <p><strong>Expected Graduation:</strong> {verification.expectedGraduationYear}</p>
                                <p><strong>Submitted:</strong> {formatDisplayDate(verification.createdAt)}</p>
                                {verification.reviewedAt && (
                                  <p><strong>Reviewed:</strong> {formatDisplayDate(verification.reviewedAt)}</p>
                                )}
                                {verification.rejectionReason && (
                                  <p className="text-red-600"><strong>Rejection Reason:</strong> {verification.rejectionReason}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <a
                              href={`${API_BASE_URL}${verification.documentUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Document
                            </a>
                            <a
                              href={`${API_BASE_URL}${verification.documentUrl}`}
                              download={verification.fileName}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Client-specific information */}
            {selectedUser?.role === 'client' && selectedUser?.clientProfile && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Client Profile</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company Name</label>
                    <p className="text-gray-900">
                      {selectedUser?.clientProfile?.companyName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Industry</label>
                    <p className="text-gray-900">
                      {selectedUser?.clientProfile?.industry || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company Size</label>
                    <p className="text-gray-900">
                      {selectedUser?.clientProfile?.companySize || 'N/A'}
                    </p>
                  </div>
                  {selectedUser?.clientProfile?.website && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <a
                        href={selectedUser.clientProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 mt-1"
                      >
                        {selectedUser.clientProfile.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Points Remaining</label>
                    <p className="text-gray-900 font-semibold text-primary-600">
                      {selectedUser?.clientProfile?.pointsRemaining || 0} points
                    </p>
                  </div>
                  {selectedUser?.clientProfile?.companyDescription && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company Description</label>
                      <p className="text-gray-900 mt-1">
                        {selectedUser.clientProfile.companyDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedUser(null);
                }}
              >
                Close
              </Button>
              {(selectedUser.role === 'student' || selectedUser.role === 'client') && (
                <Button
                  variant={
                    (selectedUser.role === 'student' && selectedUser.studentProfile?.isVerified) ||
                    (selectedUser.role === 'client' && selectedUser.clientProfile?.isVerified)
                      ? 'warning'
                      : 'success'
                  }
                  onClick={handleVerify}
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending
                    ? 'Processing...'
                    : (selectedUser.role === 'student' && selectedUser.studentProfile?.isVerified) ||
                      (selectedUser.role === 'client' && selectedUser.clientProfile?.isVerified)
                    ? 'Unverify User'
                    : 'Verify User'}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No user data available</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
