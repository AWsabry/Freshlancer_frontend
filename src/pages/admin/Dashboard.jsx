import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { logger } from '../../utils/logger';
import { useAuthStore } from '../../stores/authStore';
import {
  Briefcase,
  FileText,
  CreditCard,
  Download,
  AlertCircle,
  BarChart3,
  Shield,
  Folder,
  GraduationCap,
  DollarSign,
  User,
  Tag,
  Star,
  Mail,
  Heart,
  Users,
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

  const recentUsers = statsData?.data?.recentUsers || [];
  const clientYearlyChartData = statsData?.data?.clientYearlyChartData || [];
  const studentYearlyChartData = statsData?.data?.studentYearlyChartData || [];

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
        key: 'joinedAt', 
        label: 'Joined Date',
        formatter: formatDate
      },
    ];

    exportToCSV(recentUsers, columns, 'recent_users');
  };

  // Shortcut cards for all admin menu items
  const shortcutCards = [
    {
      title: 'Analytics',
      description: 'View platform analytics and statistics',
      icon: BarChart3,
      color: 'bg-blue-500',
      path: '/admin/analytics',
    },
    {
      title: 'Users',
      description: 'Manage all users',
      icon: Users,
      color: 'bg-indigo-500',
      path: '/admin/users',
    },
    {
      title: 'Verifications',
      description: 'Verify student accounts',
      icon: Shield,
      color: 'bg-green-500',
      path: '/admin/students',
    },
    {
      title: 'Applications',
      description: 'View and manage job applications',
      icon: FileText,
      color: 'bg-orange-500',
      path: '/admin/applications',
    },
    {
      title: 'Jobs',
      description: 'Manage job postings',
      icon: Briefcase,
      color: 'bg-purple-500',
      path: '/admin/jobs',
    },
    {
      title: 'Categories',
      description: 'Manage job categories',
      icon: Folder,
      color: 'bg-teal-500',
      path: '/admin/categories',
    },
    {
      title: 'Universities',
      description: 'Manage universities',
      icon: GraduationCap,
      color: 'bg-cyan-500',
      path: '/admin/universities',
    },
    {
      title: 'Client Packages',
      description: 'Manage client packages',
      icon: CreditCard,
      color: 'bg-pink-500',
      path: '/admin/client-packages',
    },
    {
      title: 'Client Transactions',
      description: 'View client transactions',
      icon: DollarSign,
      color: 'bg-yellow-500',
      path: '/admin/client-transactions',
    },
    {
      title: 'Student Subscriptions',
      description: 'Manage student subscriptions',
      icon: User,
      color: 'bg-amber-500',
      path: '/admin/student-packages',
    },
    {
      title: 'Coupons',
      description: 'Manage discount coupons',
      icon: Tag,
      color: 'bg-red-500',
      path: '/admin/coupons',
    },
    {
      title: 'Startups',
      description: 'Manage startup profiles',
      icon: Star,
      color: 'bg-violet-500',
      path: '/admin/startups',
    },
    {
      title: 'Contact Us',
      description: 'View contact messages',
      icon: Mail,
      color: 'bg-slate-500',
      path: '/admin/contact-us',
    },
    {
      title: 'Support & Donations',
      description: 'Manage support and donations',
      icon: Heart,
      color: 'bg-rose-500',
      path: '/admin/grantings',
    },
    {
      title: 'Audit Logs',
      description: 'View system audit logs',
      icon: AlertCircle,
      color: 'bg-gray-600',
      path: '/admin/logs',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Quick access to all admin features</p>
        </div>
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

      {/* Quick Access Shortcuts */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shortcutCards.map((shortcut, index) => (
            <Link
              key={index}
              to={shortcut.path}
              className="block"
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 h-full">
                <div className="flex flex-col items-center text-center p-4">
                  <div className={`${shortcut.color} p-4 rounded-lg mb-3`}>
                    <shortcut.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {shortcut.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {shortcut.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
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
                      {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
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
