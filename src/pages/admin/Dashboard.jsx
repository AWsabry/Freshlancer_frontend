import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import {
  Users,
  Briefcase,
  FileText,
  UserCheck,
  Clock,
  TrendingUp,
  Crown,
  CreditCard,
} from 'lucide-react';
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

  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getDashboardStats(),
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
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of platform statistics and activity</p>
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
