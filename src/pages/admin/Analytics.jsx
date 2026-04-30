import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Select from '../../components/common/Select';
import DateRangePicker from '../../components/common/DateRangePicker';
import Button from '../../components/common/Button';
import { exportToCSV, formatDate, formatCurrency } from '../../utils/exportUtils';
import {
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  FileText,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  UserCheck,
  Clock,
  Crown,
  CreditCard,
  AlertCircle,
  Download,
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics', period, dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      analyticsService.getAnalytics({
        period,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  // Fetch dashboard stats for the summary
  const { data: statsData } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  // Fetch log statistics for error count
  const { data: logStatsData } = useQuery({
    queryKey: ['adminLogStats'],
    queryFn: () => adminService.getLogStats(),
  });

  if (isLoading) {
    return <Loading text="Loading analytics..." />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        message={`Failed to load analytics: ${error.response?.data?.message || error.message}`}
      />
    );
  }

  const analytics = analyticsData || {};

  // Export functions
  const handleExportStats = () => {
    const stats = statsData?.data?.stats || {};
    const logStats = logStatsData?.data || {};
    
    const statsDataForExport = [
      {
        metric: 'Total Users',
        value: stats.totalUsers || 0,
      },
      {
        metric: 'Total Students',
        value: stats.totalStudents || 0,
      },
      {
        metric: 'Total Clients',
        value: stats.totalClients || 0,
      },
      {
        metric: 'Total Applications',
        value: stats.totalApplications || 0,
      },
      {
        metric: 'Total Jobs',
        value: stats.totalJobs || 0,
      },
      {
        metric: 'Active Jobs',
        value: stats.activeJobs || 0,
      },
      {
        metric: 'Pending Applications',
        value: stats.pendingApplications || 0,
      },
      {
        metric: 'Current Premium Students',
        value: stats.currentPremiumStudents || 0,
      },
      {
        metric: 'Total Client Transactions',
        value: stats.totalClientTransactions || 0,
      },
      {
        metric: 'Total Active Subscriptions',
        value: stats.totalActiveSubscriptions || 0,
      },
      {
        metric: 'Audit Log Entries',
        value: logStats.totalEntries || 0,
      },
      {
        metric: 'Audit Log Files',
        value: logStats.totalFiles || 0,
      },
    ];

    const columns = [
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' },
    ];

    exportToCSV(statsDataForExport, columns, 'analytics_stats');
  };

  const handleExportUserGrowth = () => {
    const userGrowthData = analytics.userGrowth?.timeline || [];
    if (userGrowthData.length === 0) {
      alert('No user growth data to export');
      return;
    }

    const columns = [
      { key: 'date', label: 'Date', formatter: formatDate },
      { key: 'total', label: 'Total Users' },
      { key: 'students', label: 'Students' },
      { key: 'clients', label: 'Clients' },
    ];

    exportToCSV(userGrowthData, columns, 'user_growth');
  };

  const handleExportRevenue = () => {
    const revenueData = analytics.revenueAnalytics?.timeline || [];
    if (revenueData.length === 0) {
      alert('No revenue data to export');
      return;
    }

    const columns = [
      { key: 'date', label: 'Date', formatter: formatDate },
      { key: 'revenueUSD', label: 'Revenue (USD)', formatter: (val) => formatCurrency(val, 'USD') },
      { key: 'revenueEGP', label: 'Revenue (EGP)', formatter: (val) => formatCurrency(val, 'EGP') },
      { key: 'revenue', label: 'Total Revenue', formatter: (val) => formatCurrency(val, 'USD') },
      { key: 'transactions', label: 'Transactions' },
    ];

    exportToCSV(revenueData, columns, 'revenue_analytics');
  };

  const handleExportJobs = () => {
    const jobsData = analytics.jobAnalytics?.timeline || [];
    if (jobsData.length === 0) {
      alert('No job analytics data to export');
      return;
    }

    const columns = [
      { key: 'date', label: 'Date', formatter: formatDate },
      { key: 'total', label: 'Total Jobs' },
      { key: 'open', label: 'Open Jobs' },
      { key: 'inProgress', label: 'In Progress' },
      { key: 'completed', label: 'Completed' },
    ];

    exportToCSV(jobsData, columns, 'job_analytics');
  };

  const handleExportApplications = () => {
    const applicationsData = analytics.applicationAnalytics?.timeline || [];
    if (applicationsData.length === 0) {
      alert('No application analytics data to export');
      return;
    }

    const columns = [
      { key: 'date', label: 'Date', formatter: formatDate },
      { key: 'total', label: 'Total Applications' },
      { key: 'pending', label: 'Pending' },
      { key: 'accepted', label: 'Accepted' },
      { key: 'rejected', label: 'Rejected' },
    ];

    exportToCSV(applicationsData, columns, 'application_analytics');
  };

  const handleExportCategoryPerformance = () => {
    const categoryData = analytics.categoryPerformance || [];
    if (categoryData.length === 0) {
      alert('No category performance data to export');
      return;
    }

    const columns = [
      { key: 'category', label: 'Category' },
      { key: 'jobCount', label: 'Job Count' },
      { key: 'applicationCount', label: 'Application Count' },
    ];

    exportToCSV(categoryData, columns, 'category_performance');
  };

  const handleExportTopPerformers = () => {
    const topClients = analytics.topMetrics?.topClients || [];
    const topStudents = analytics.topMetrics?.topStudents || [];
    
    if (topClients.length === 0 && topStudents.length === 0) {
      alert('No top performers data to export');
      return;
    }

    // Export top clients
    if (topClients.length > 0) {
      const clientColumns = [
        { key: 'clientName', label: 'Client Name' },
        { key: 'clientEmail', label: 'Email' },
        { key: 'jobCount', label: 'Job Count' },
      ];
      exportToCSV(topClients, clientColumns, 'top_clients');
    }

    // Export top students
    if (topStudents.length > 0) {
      const studentColumns = [
        { key: 'studentName', label: 'Student Name' },
        { key: 'studentEmail', label: 'Email' },
        { key: 'applicationCount', label: 'Application Count' },
      ];
      exportToCSV(topStudents, studentColumns, 'top_students');
    }
  };

  const handleExportUserDemographics = () => {
    const topNationalities = analytics.userDemographics?.topNationalities || [];
    const roleDistribution = analytics.userDemographics?.roleDistribution || [];
    
    if (topNationalities.length === 0 && roleDistribution.length === 0) {
      alert('No user demographics data to export');
      return;
    }

    // Export top nationalities
    if (topNationalities.length > 0) {
      const nationalityColumns = [
        { key: 'nationality', label: 'Nationality' },
        { key: 'count', label: 'User Count' },
      ];
      exportToCSV(topNationalities, nationalityColumns, 'top_nationalities');
    }

    // Export role distribution
    if (roleDistribution.length > 0) {
      const roleColumns = [
        { key: 'role', label: 'Role' },
        { key: 'count', label: 'Count' },
      ];
      exportToCSV(roleDistribution, roleColumns, 'role_distribution');
    }
  };

  const handleExportClientTransactions = async () => {
    try {
      const exportData = await adminService.getAllTransactions({
        limit: 10000,
        role: 'client',
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });

      const allTransactions = exportData?.data?.data?.transactions || exportData?.data?.transactions || [];
      
      if (allTransactions.length === 0) {
        alert('No client transactions to export');
        return;
      }

      const columns = [
        { key: 'user.name', label: 'Client Name' },
        { key: 'user.email', label: 'Client Email' },
        { key: 'description', label: 'Description' },
        { 
          key: 'amount', 
          label: 'Amount',
          formatter: (value, item) => formatCurrency(value, item.currency)
        },
        { key: 'currency', label: 'Currency' },
        { key: 'status', label: 'Status' },
        { key: 'type', label: 'Transaction Type' },
        { key: 'points', label: 'Points' },
        { key: 'packageType', label: 'Package Type' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'gatewayTransactionId', label: 'Transaction ID' },
        { 
          key: 'createdAt', 
          label: 'Transaction Date',
          formatter: formatDate
        },
      ];

      exportToCSV(allTransactions, columns, 'client_transactions');
    } catch (error) {
      alert('Failed to export client transactions: ' + (error.message || 'Unknown error'));
    }
  };

  const handleExportStudentTransactions = async () => {
    try {
      const exportData = await adminService.getAllTransactions({
        limit: 10000,
        role: 'student',
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });

      const allTransactions = exportData?.data?.data?.transactions || exportData?.data?.transactions || [];
      
      if (allTransactions.length === 0) {
        alert('No student transactions to export');
        return;
      }

      const columns = [
        { key: 'user.name', label: 'Student Name' },
        { key: 'user.email', label: 'Student Email' },
        { key: 'description', label: 'Description' },
        { 
          key: 'amount', 
          label: 'Amount',
          formatter: (value, item) => formatCurrency(value, item.currency)
        },
        { key: 'currency', label: 'Currency' },
        { key: 'status', label: 'Status' },
        { key: 'type', label: 'Transaction Type' },
        { key: 'plan', label: 'Subscription Plan' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'gatewayTransactionId', label: 'Transaction ID' },
        { 
          key: 'createdAt', 
          label: 'Transaction Date',
          formatter: formatDate
        },
      ];

      exportToCSV(allTransactions, columns, 'student_transactions');
    } catch (error) {
      alert('Failed to export student transactions: ' + (error.message || 'Unknown error'));
    }
  };

  const handleExportAll = () => {
    try {
      handleExportStats();
      setTimeout(() => handleExportUserGrowth(), 500);
      setTimeout(() => handleExportRevenue(), 1000);
      setTimeout(() => handleExportJobs(), 1500);
      setTimeout(() => handleExportApplications(), 2000);
      setTimeout(() => handleExportCategoryPerformance(), 2500);
      setTimeout(() => handleExportTopPerformers(), 3000);
      setTimeout(() => handleExportUserDemographics(), 3500);
      setTimeout(() => handleExportClientTransactions(), 4000);
      setTimeout(() => handleExportStudentTransactions(), 4500);
    } catch (error) {
      alert('Failed to export all data: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive insights and data visualization</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportAll}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Time Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: 'day', label: 'Daily' },
              { value: 'week', label: 'Weekly' },
              { value: 'month', label: 'Monthly' },
              { value: 'year', label: 'Yearly' },
            ]}
          />
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
            label="Date Range (Optional)"
            placeholder="All time"
          />
        </div>
      </Card>

      {/* Stats Summary - Moved from Dashboard */}
      {statsData && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Platform Statistics</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportStats}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Stats
            </Button>
          </div>
          <StatsSummary 
            stats={statsData?.data?.stats || {}} 
            logStatsData={logStatsData}
            navigate={navigate}
          />
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

        <MetricCard
          title="USD Revenue"
          value={`$${formatNumber(analytics.revenueAnalytics?.totals?.totalRevenueUSD || 0)}`}
          icon={DollarSign}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <MetricCard
          title="EGP Revenue"
          value={`EGP ${formatNumber(analytics.revenueAnalytics?.totals?.totalRevenueEGP || 0)}`}
          icon={DollarSign}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <MetricCard
          title="Total Users"
          value={formatNumber(analytics.userGrowth?.totals?.total || 0)}
          icon={Users}
          color="text-indigo-600"
          bgColor="bg-indigo-100"
        />
        <MetricCard
          title="Total Jobs"
          value={formatNumber(analytics.jobAnalytics?.totals?.total || 0)}
          icon={Briefcase}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Applications"
          value={formatNumber(analytics.applicationAnalytics?.totals?.total || 0)}
          icon={FileText}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* User Growth Chart */}
      <Card>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              User Growth
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Students: {formatNumber(analytics.userGrowth?.totals?.students || 0)} | Clients:{' '}
              {formatNumber(analytics.userGrowth?.totals?.clients || 0)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportUserGrowth}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analytics.userGrowth?.timeline || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              name="Total Users"
            />
            <Area
              type="monotone"
              dataKey="students"
              stackId="2"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
              name="Students"
            />
            <Area
              type="monotone"
              dataKey="clients"
              stackId="3"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.6}
              name="Clients"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue Trend by Currency
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Avg Transaction: ${formatNumber(analytics.revenueAnalytics?.totals?.avgTransaction || 0)} | 
                USD: ${formatNumber(analytics.revenueAnalytics?.totals?.totalRevenueUSD || 0)} | 
                EGP: {formatNumber(analytics.revenueAnalytics?.totals?.totalRevenueEGP || 0)}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportRevenue}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Trends
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportClientTransactions}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Client Transactions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportStudentTransactions}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Student Transactions
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.revenueAnalytics?.timeline || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'revenueUSD') return `$${formatNumber(value)}`;
                  if (name === 'revenueEGP') return `EGP ${formatNumber(value)}`;
                  return `$${formatNumber(value)}`;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenueUSD"
                stroke="#3b82f6"
                strokeWidth={2}
                name="USD Revenue"
              />
              <Line
                type="monotone"
                dataKey="revenueEGP"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="EGP Revenue"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Total Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Transactions
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {formatNumber(analytics.revenueAnalytics?.totals?.totalTransactions || 0)}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportRevenue}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Trends
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportClientTransactions}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Client Transactions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportStudentTransactions}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Student Transactions
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.revenueAnalytics?.timeline || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="transactions" fill="#3b82f6" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Job Analytics */}
      <Card>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Job Posting Trends
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Open: {formatNumber(analytics.jobAnalytics?.totals?.open || 0)} | In Progress:{' '}
              {formatNumber(analytics.jobAnalytics?.totals?.inProgress || 0)} | Completed:{' '}
              {formatNumber(analytics.jobAnalytics?.totals?.completed || 0)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJobs}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analytics.jobAnalytics?.timeline || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              name="Total"
            />
            <Area
              type="monotone"
              dataKey="open"
              stackId="2"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
              name="Open"
            />
            <Area
              type="monotone"
              dataKey="inProgress"
              stackId="3"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.6}
              name="In Progress"
            />
            <Area
              type="monotone"
              dataKey="completed"
              stackId="4"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
              name="Completed"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Application Analytics */}
      <Card>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Application Trends
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Pending: {formatNumber(analytics.applicationAnalytics?.totals?.pending || 0)} | Accepted:{' '}
              {formatNumber(analytics.applicationAnalytics?.totals?.accepted || 0)} | Rejected:{' '}
              {formatNumber(analytics.applicationAnalytics?.totals?.rejected || 0)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportApplications}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.applicationAnalytics?.timeline || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#3b82f6" name="Total" />
            <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
            <Bar dataKey="accepted" fill="#10b981" name="Accepted" />
            <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Category Performance & Conversion Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Category Performance
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCategoryPerformance}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={analytics.categoryPerformance || []}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="jobCount" fill="#3b82f6" name="Jobs" />
              <Bar dataKey="applicationCount" fill="#10b981" name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Conversion Rates
            </h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Job to Application Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.conversionRates?.jobToApplicationRate || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.conversionRates?.jobsWithApplications || 0} of{' '}
                {analytics.conversionRates?.totalJobs || 0} jobs received applications
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Application to Acceptance Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.conversionRates?.applicationToAcceptanceRate || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.conversionRates?.acceptedApplications || 0} of{' '}
                {analytics.conversionRates?.totalApplications || 0} applications accepted
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* User Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Nationalities
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportUserDemographics}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.userDemographics?.topNationalities || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nationality" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Role Distribution
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportUserDemographics}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.userDemographics?.roleDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {(analytics.userDemographics?.roleDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Top Clients by Job Posts</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTopPerformers}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
          <div className="space-y-3">
            {(analytics.topMetrics?.topClients || []).map((client, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{client.clientName}</p>
                  <p className="text-sm text-gray-500">{client.clientEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">{client.jobCount}</p>
                  <p className="text-xs text-gray-500">jobs</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Top Students by Applications</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTopPerformers}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
          <div className="space-y-3">
            {(analytics.topMetrics?.topStudents || []).map((student, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{student.studentName}</p>
                  <p className="text-sm text-gray-500">{student.studentEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{student.applicationCount}</p>
                  <p className="text-xs text-gray-500">applications</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <Card>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      </div>
      <div className={`${bgColor} p-3 rounded-lg`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </Card>
);

// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

// Stats Summary Component - Moved from Dashboard
const StatsSummary = ({ stats, logStatsData, navigate }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'Students',
      value: stats.totalStudents || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      onClick: () => navigate('/admin/users?role=student'),
    },
    {
      title: 'Clients',
      value: stats.totalClients || 0,
      icon: Briefcase,
      color: 'bg-purple-500',
      onClick: () => navigate('/admin/users?role=client'),
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications || 0,
      icon: FileText,
      color: 'bg-orange-500',
      onClick: () => navigate('/admin/applications'),
    },
    {
      title: 'Total Jobs',
      value: stats.totalJobs || 0,
      icon: Briefcase,
      color: 'bg-indigo-500',
      onClick: () => navigate('/admin/jobs'),
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs || 0,
      icon: TrendingUp,
      color: 'bg-teal-500',
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      onClick: () => navigate('/admin/applications?status=pending'),
    },
    {
      title: 'Current Premium Students',
      value: stats.currentPremiumStudents || 0,
      icon: Crown,
      color: 'bg-amber-500',
      onClick: () => navigate('/admin/student-packages?plan=premium'),
    },
    {
      title: 'Total Client Transactions',
      value: stats.totalClientTransactions || 0,
      icon: CreditCard,
      color: 'bg-cyan-500',
      onClick: () => navigate('/admin/transactions?role=client'),
    },
    {
      title: 'Total Active Subscriptions',
      value: stats.totalActiveSubscriptions || 0,
      icon: Users,
      color: 'bg-gray-500',
      onClick: () => navigate('/admin/student-packages'),
    },
    {
      title: 'Audit Logs',
      value: logStatsData?.data?.totalEntries || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
      onClick: () => navigate('/admin/logs'),
      subtitle: `${logStatsData?.data?.totalFiles || 0} log file(s)`,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className={`${stat.onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Analytics;

