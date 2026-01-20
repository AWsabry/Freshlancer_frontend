import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import {
  FileText,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Eye,
  Download,
  List,
  Grid,
} from 'lucide-react';
import { exportToCSV, formatDate, formatCurrency } from '../../utils/exportUtils';
import DateRangePicker from '../../components/common/DateRangePicker';

const Applications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get('startDate') || null,
    endDate: searchParams.get('endDate') || null,
  });
  const [viewMode, setViewMode] = useState('detailed'); // 'detailed' or 'compact'
  const page = parseInt(searchParams.get('page') || '1');

  // Fetch applications
  const { data: applicationsData, isLoading, error } = useQuery({
    queryKey: ['adminApplications', page, statusFilter, dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      adminService.getAllApplications({
        page,
        limit: 20,
        status: statusFilter || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
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
    const variants = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'danger',
      withdrawn: 'secondary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const handleExport = async () => {
    try {
      // Fetch all applications for export (without pagination)
      const exportData = await adminService.getAllApplications({
        limit: 10000, // Large limit to get all applications
        status: statusFilter || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });

      const allApplications = exportData?.data?.data?.applications || exportData?.data?.applications || [];
      
      const columns = [
        { key: 'student.name', label: 'Student Name' },
        { key: 'student.email', label: 'Student Email' },
        { key: 'jobPost.title', label: 'Job Title' },
        { key: 'jobPost.category', label: 'Job Category' },
        {
          key: 'categorySpecAnswers',
          label: 'Category Spec Answers',
          formatter: (value, item) => {
            try {
              const answers = item.categorySpecAnswers || {};
              return JSON.stringify(answers);
            } catch (e) {
              return '';
            }
          },
        },
        { key: 'jobPost.client.name', label: 'Client Name' },
        { key: 'jobPost.client.email', label: 'Client Email' },
        { 
          key: 'proposedBudget.amount', 
          label: 'Proposed Budget',
          formatter: (value, item) => {
            if (item.proposedBudget) {
              return formatCurrency(item.proposedBudget.amount || 0, item.proposedBudget.currency || 'USD');
            }
            return 'N/A';
          }
        },
        { key: 'proposedBudget.currency', label: 'Currency' },
        { key: 'estimatedDuration', label: 'Estimated Duration' },
        { key: 'relevantExperienceLevel', label: 'Experience Level' },
        { key: 'proposalType', label: 'Proposal Type' },
        { key: 'availabilityCommitment', label: 'Availability' },
        { key: 'approachSelections.methodology', label: 'Methodology' },
        { key: 'approachSelections.communicationPreference', label: 'Communication Preference' },
        { key: 'status', label: 'Status' },
        { 
          key: 'createdAt', 
          label: 'Applied Date',
          formatter: formatDate
        },
        { 
          key: 'contactUnlockedByClient', 
          label: 'Contact Unlocked',
          formatter: (value) => value ? 'Yes' : 'No'
        },
        { 
          key: 'contactUnlockedAt', 
          label: 'Unlocked Date',
          formatter: formatDate
        },
      ];

      exportToCSV(allApplications, columns, 'applications');
    } catch (error) {
      alert('Failed to export applications: ' + (error.message || 'Unknown error'));
    }
  };

  if (isLoading) {
    return <Loading text="Loading applications..." />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        message={`Failed to load applications: ${error.response?.data?.message || error.message}`}
      />
    );
  }

  const applications = applicationsData?.data?.applications || [];
  const totalPages = applicationsData?.totalPages || 1;
  const currentPage = applicationsData?.currentPage || 1;
  const totalCount = applicationsData?.totalCount || 0;
  console.log('Applications Data:', applications);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7" />
            Applications Management
          </h1>
          <p className="text-gray-600 mt-1">
            Total: {totalCount} applications
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
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === '' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'accepted' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('accepted')}
            >
              Accepted
            </Button>
            <Button
              variant={statusFilter === 'rejected' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('rejected')}
            >
              Rejected
            </Button>
            <Button
              variant={statusFilter === 'withdrawn' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('withdrawn')}
            >
              Withdrawn
            </Button>
          </div>
          <div className="pt-2 border-t">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateRangeChange}
              label="Filter by Applied Date"
              placeholder="All dates"
            />
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      <Card>
        {viewMode === 'compact' ? (
          /* Compact Table View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Job</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Client</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Budget</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Applied</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application, idx) => (
                  <tr
                    key={application._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-600 font-semibold text-xs">
                            {application.student?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm truncate max-w-[150px]">
                            {application.student?.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">
                            {application.student?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {application.jobPost?.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {application.jobPost?.category}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600 truncate max-w-[150px]">
                        {application.jobPost?.client?.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-semibold text-green-600">
                        {application.proposedBudget?.currency || 'N/A'} {application.proposedBudget?.amount || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </span>
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
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Unlocked
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={application.student?.photo}
                          alt={application.student?.name}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.student?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {application.student?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {application.jobPost?.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {application.jobPost?.category}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.jobPost?.client?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {application.jobPost?.client?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                       {application.proposedBudget?.currency || 'Unknown Currency'} {application.proposedBudget?.amount || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {application.estimatedDuration}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {application.contactUnlockedByClient ? (
                        <Badge variant="success" size="sm">Yes</Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">No</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
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
    </div>
  );
};

export default Applications;
