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
} from 'lucide-react';

const StudentPackages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Default to premium only
  const [filterPlan, setFilterPlan] = useState(searchParams.get('plan') || 'premium');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  // Fetch subscription stats
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['subscriptionStats'],
    queryFn: () => adminService.getSubscriptionStats(),
  });

  // Fetch subscriptions - default to premium only
  const { data: subscriptionsData, isLoading } = useQuery({
    queryKey: ['adminSubscriptions', filterPlan, page],
    queryFn: () =>
      adminService.getAllSubscriptions({
        plan: filterPlan === 'all' ? undefined : filterPlan, // Filter by plan (default: premium)
        status: 'active', // Only active subscriptions
        page,
        limit,
      }),
  });

  const handlePlanFilter = (plan) => {
    setFilterPlan(plan);
    setSearchParams({ plan: plan === 'all' ? '' : plan, page: '1' });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ plan: filterPlan, page: newPage.toString() });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <User className="w-8 h-8 text-primary-600" />
          Student Subscriptions Management
        </h1>
        <p className="text-gray-600 mt-2">View and manage active student subscription plans</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Filters */}
      <Card>
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
            </p>
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
      ) : (
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
                        <DollarSign className="w-3 h-3" />
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
