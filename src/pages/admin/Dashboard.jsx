import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { logger } from '../../utils/logger';
import { useAuthStore } from '../../stores/authStore';
import {
  Users,
  Briefcase,
  FileText,
  UserCheck,
  Clock,
  TrendingUp,
  Crown,
  CreditCard,
  Download,
  AlertCircle,
} from 'lucide-react';
import { exportToCSV, formatDate } from '../../utils/exportUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Log dashboard view
  useEffect(() => {
    logger.info('Admin dashboard viewed', { action: 'dashboard_view', role: 'admin', userId: user?._id });
  }, []);

  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  // Fetch log statistics for error count
  const { data: logStatsData } = useQuery({
    queryKey: ['adminLogStats'],
    queryFn: () => adminService.getLogStats(),
  });

  if (isLoading) {
    return <Loading text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        message={`Failed to load dashboard: ${error.response?.data?.message || error.message}`}
      />
    );
  }

  const stats = statsData?.data?.stats || {};
  const recentUsers = statsData?.data?.recentUsers || [];
  const clientYearlyChartData = statsData?.data?.clientYearlyChartData || [];
  const studentYearlyChartData = statsData?.data?.studentYearlyChartData || [];

  const handleExportStats = () => {
    const statsData = [
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
    ];

    const columns = [
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' },
    ];

    exportToCSV(statsData, columns, 'dashboard_stats');
  };

  const handleExportRecentUsers = () => {
    if (recentUsers.length === 0) {
      alert('No recent users to export');
      return;
    }

    const columns = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { 
        key: 'createdAt', 
        label: 'Joined Date',
        formatter: formatDate
      },
    ];

    exportToCSV(recentUsers, columns, 'recent_users');
  };

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
      title: 'Total Current Premium Users',
      value: stats.currentPremiumStudents || 0,
      icon: Crown,
      color: 'bg-amber-600',
      onClick: () => navigate('/admin/student-packages?plan=premium'),
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of platform statistics and activity</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportStats}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Stats
          </Button>
          {recentUsers.length > 0 && (
            <Button
              variant="outline"
              onClick={handleExportRecentUsers}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Recent Users
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
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

      {/* Yearly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Transactions Chart */}
        {clientYearlyChartData.length > 0 && (
          <Card title={`Client Transactions - ${new Date().getFullYear()}`}>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clientYearlyChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="transactions" fill="#065084" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Student Transactions Chart */}
        {studentYearlyChartData.length > 0 && (
          <Card title={`Student Transactions - ${new Date().getFullYear()}`}>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={studentYearlyChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="transactions" fill="#25aaad" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* Recent Users */}
      <Card title="Recent Users">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
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
                    <div className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
