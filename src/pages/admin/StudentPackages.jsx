import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import {
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Crown,
  Users,
  TrendingUp,
  Download,
  Search,
  List,
  Grid,
} from 'lucide-react';
import { exportToCSV, formatDate, formatCurrency } from '../../utils/exportUtils';
import DateRangePicker from '../../components/common/DateRangePicker';

const StudentPackages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Default to premium only
  const [filterPlan, setFilterPlan] = useState(searchParams.get('plan') || 'premium');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get('startDate') || null,
    endDate: searchParams.get('endDate') || null,
  });
  const [viewMode, setViewMode] = useState('detailed'); // 'detailed' or 'compact'

  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  // Fetch subscription stats
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['subscriptionStats'],
    queryFn: () => adminService.getSubscriptionStats(),
  });

  // Fetch subscriptions - default to premium only
  const { data: subscriptionsData, isLoading } = useQuery({
    queryKey: ['adminSubscriptions', filterPlan, page, dateRange.startDate, dateRange.endDate, searchTerm],
    queryFn: () =>
      adminService.getAllSubscriptions({
        plan: filterPlan === 'all' ? undefined : filterPlan, // Filter by plan (default: premium)
        status: 'active', // Only active subscriptions
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        dateField: 'createdAt', // Filter by subscription creation date
        search: searchTerm || undefined,
        page,
        limit,
      }),
  });

  // Fetch subscription payment transactions for revenue calculation
  const { data: transactionsData } = useQuery({
    queryKey: ['subscriptionTransactions', dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      adminService.getAllTransactions({
        type: 'subscription_payment',
        status: 'completed',
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        limit: 10000, // Get all transactions for accurate totals
      }),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    const params = { plan: filterPlan === 'all' ? '' : filterPlan, page: '1' };
    if (searchInput.trim()) params.search = searchInput.trim();
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const handlePlanFilter = (plan) => {
    setFilterPlan(plan);
    const params = { plan: plan === 'all' ? '' : plan, page: '1' };
    if (searchTerm) params.search = searchTerm;
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    const params = { plan: filterPlan === 'all' ? '' : filterPlan, page: '1' };
    if (searchTerm) params.search = searchTerm;
    if (newDateRange.startDate) params.startDate = newDateRange.startDate;
    if (newDateRange.endDate) params.endDate = newDateRange.endDate;
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = { plan: filterPlan === 'all' ? '' : filterPlan, page: newPage.toString() };
    if (searchTerm) params.search = searchTerm;
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  if (isLoading || loadingStats) {
    return <Loading text="Loading subscriptions..." />;
  }

  const subscriptions = subscriptionsData?.data?.subscriptions || [];
  const totalCount = subscriptionsData?.totalCount || 0;
  const totalPages = subscriptionsData?.totalPages || 1;
  const currentPage = subscriptionsData?.currentPage || 1;

  const stats = statsData?.data || {};
  const totalSubscriptions = stats.total || 0;
  const premiumCount = stats.stats?.find(s => s._id === 'premium')?.count || 0;
  const freeCount = stats.stats?.find(s => s._id === 'free')?.count || 0;

  // Calculate revenue by currency from subscription payment transactions
  const subscriptionTransactions = transactionsData?.data?.data?.transactions || 
                                   transactionsData?.data?.transactions || 
                                   [];
  
  const revenueUSD = subscriptionTransactions
    .filter(t => (t.currency || 'USD').toUpperCase() === 'USD')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const revenueEGP = subscriptionTransactions
    .filter(t => (t.currency || 'USD').toUpperCase() === 'EGP')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      cancelled: 'error',
      expired: 'error',
      pending: 'warning',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  const getPlanBadge = (plan) => {
    return (
      <Badge variant={plan === 'premium' ? 'success' : 'info'}>
        {plan === 'premium' ? (
          <>
            <Crown className="w-3 h-3 inline mr-1" />
            Premium
          </>
        ) : (
          'Free'
        )}
      </Badge>
    );
  };

  const handleExport = async () => {
    try {
      // Fetch all subscriptions for export (without pagination)
      const exportData = await adminService.getAllSubscriptions({
        limit: 10000, // Large limit to get all subscriptions
        plan: filterPlan === 'all' ? undefined : filterPlan,
        status: 'active',
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        dateField: 'createdAt',
      });

      const allSubscriptions = exportData?.data?.data?.subscriptions || exportData?.data?.subscriptions || [];
      
      const columns = [
        { key: 'student.name', label: 'Student Name' },
        { key: 'student.email', label: 'Student Email' },
        { key: 'plan', label: 'Plan' },
        { key: 'status', label: 'Status' },
        { 
          key: 'startDate', 
          label: 'Start Date',
          formatter: formatDate
        },
        { 
          key: 'endDate', 
          label: 'End Date',
          formatter: formatDate
        },
        { 
          key: 'applicationsUsedThisMonth', 
          label: 'Applications Used This Month'
        },
        { key: 'monthlyLimit', label: 'Monthly Limit' },
        { 
          key: 'createdAt', 
          label: 'Subscription Date',
          formatter: formatDate
        },
      ];

      exportToCSV(allSubscriptions, columns, 'student_subscriptions');
    } catch (error) {
      alert('Failed to export subscriptions: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <User className="w-8 h-8 text-primary-600" />
            Student Subscriptions Management
          </h1>
          <p className="text-gray-600 mt-2">View and manage active student subscription plans</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Subscribed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalSubscriptions}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Premium Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{premiumCount}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Free Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{freeCount}</p>
            </div>
            <div className="bg-gray-500 p-3 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">USD Revenue</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                ${revenueUSD.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">EGP Revenue</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                EGP {revenueEGP.toFixed(2)}
              </p>
            </div>
            <div className="bg-primary-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
            {searchTerm && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput('');
                  setSearchTerm('');
                  const params = { plan: filterPlan === 'all' ? '' : filterPlan, page: '1' };
                  if (dateRange.startDate) params.startDate = dateRange.startDate;
                  if (dateRange.endDate) params.endDate = dateRange.endDate;
                  setSearchParams(params);
                }}
              >
                Clear
              </Button>
            )}
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Plan Filter"
              value={filterPlan}
              onChange={(e) => handlePlanFilter(e.target.value)}
              options={[
                { value: 'premium', label: 'Premium Only' },
                { value: 'free', label: 'Free Only' },
                { value: 'all', label: 'All Plans' },
              ]}
            />
            <div className="flex items-end">
              <p className="text-sm text-gray-600">
                Showing {subscriptions.length} of {totalCount} subscriptions
                {searchTerm && ` (filtered by "${searchTerm}")`}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateRangeChange}
              label="Filter by Subscription Date"
              placeholder="All dates"
            />
          </div>
        </div>
      </Card>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active subscriptions found.</p>
          </div>
        </Card>
      ) : viewMode === 'compact' ? (
        /* Compact Table View */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Applications</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Start Date</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription, idx) => (
                  <tr
                    key={subscription._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-600 font-semibold text-xs">
                            {subscription.student?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm truncate max-w-[150px]">
                            {subscription.student?.name || 'Unknown Student'}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">
                            {subscription.student?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getPlanBadge(subscription.plan)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(subscription.status)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-600">
                        {subscription.applicationsUsedThisMonth || 0}/{subscription.applicationLimitPerMonth || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-600">
                        {subscription.price?.amount > 0
                          ? `${subscription.price.amount} ${subscription.price.currency || 'USD'}`
                          : 'Free'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-500">
                        {new Date(subscription.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Detailed Card View */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription._id} className="hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {subscription.student?.name || 'Unknown Student'}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">{subscription.student?.email}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {getPlanBadge(subscription.plan)}
                    {getStatusBadge(subscription.status)}
                  </div>

                  {/* Compact Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span className="truncate">
                        {new Date(subscription.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <CheckCircle className="w-3 h-3" />
                      <span>
                        {subscription.applicationsUsedThisMonth || 0}/{subscription.applicationLimitPerMonth || 0}
                      </span>
                    </div>
                    {subscription.price?.amount > 0 && (
                      <div className="flex items-center gap-1 text-gray-600 col-span-2">
                        <span>
                          {subscription.price.amount} {subscription.price.currency || 'USD'}
                        </span>
                        {subscription.billingCycle && (
                          <span className="text-gray-400">/{subscription.billingCycle}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <div className="flex items-center justify-between">
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
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default StudentPackages;
