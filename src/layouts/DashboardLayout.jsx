import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { authService } from '../services/authService';
import {
  Home,
  Briefcase,
  FileText,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  Star,
  DollarSign,
  Shield,
  Users,
  Tag,
  Rocket,
  Mail,
  Folder,
  BarChart3,
} from 'lucide-react';
import logo from '../assets/logos/01.png';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get unread notification count
  const { data: unreadCount } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get user data (including points for clients and applications for students)
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getMe(),
    enabled: user?.role === 'client' || user?.role === 'student',
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const handleLogout = async () => {
    try {
      // Cancel all ongoing queries first
      queryClient.cancelQueries();
      
      // Clear all React Query cache and queries
      queryClient.clear();
      queryClient.removeQueries();
      
      // Clear all storage and call backend logout
      await logout();
      
      // Navigate to login and force reload to ensure complete state reset
      navigate('/login', { replace: true });
      window.location.reload();
    } catch (error) {
      // Even if there's an error, clear everything and redirect
      queryClient.clear();
      queryClient.removeQueries();
      await logout();
      navigate('/login', { replace: true });
      window.location.reload();
    }
  };

  const themeClass =
    user?.role === 'student'
      ? 'student-theme'
      : user?.role === 'client'
        ? 'client-theme'
        : '';

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', icon: Home, path: `/${user?.role}/dashboard` },
      // { name: 'Notifications', icon: Bell, path: `/${user?.role}/notifications`, badge: unreadCount?.data?.unreadCount },
      // { name: 'Messages', icon: MessageSquare, path: `/${user?.role}/messages` },
    
      // { name: 'Settings', icon: Settings, path: `/${user?.role}/settings` },
    ];

    if (user?.role === 'student') {
      return [
        ...baseItems.slice(0, 1),
        { name: 'Browse Jobs', icon: Briefcase, path: '/student/jobs' },
        { name: 'My Applications', icon: FileText, path: '/student/applications' },
        { name: 'Subscription', icon: CreditCard, path: '/student/subscription' },
        { name: 'Transactions', icon: DollarSign, path: '/student/transactions' },
        { name: 'Profile', icon: User, path: `/${user?.role}/profile` },
        // { name: 'Reviews', icon: Star, path: '/student/reviews' },
        ...baseItems.slice(1),
      ];
    }

    if (user?.role === 'client') {
      const items = [
        ...baseItems.slice(0, 1),
        { name: 'My Jobs', icon: Briefcase, path: '/client/jobs' },
        { name: 'Applications', icon: FileText, path: '/client/applications' },
        { name: 'Packages', icon: CreditCard, path: '/client/packages' },
        { name: 'Transactions', icon: DollarSign, path: '/client/transactions' },
        { name: 'Profile', icon: User, path: `/${user?.role}/profile` },
        ...baseItems.slice(1),
      ];
      
      // Add Startup Profile menu item if user is a startup
      if (user?.clientProfile?.isStartup || userData?.data?.user?.clientProfile?.isStartup) {
        // Insert after Packages
        items.splice(4, 0, { name: 'Startup Profile', icon: Rocket, path: '/client/startup-profile' });
      }
      
      return items;
    }

    if (user?.role === 'admin') {
      return [
        ...baseItems.slice(0, 1),
        { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
        { name: 'Users', icon: Users, path: '/admin/users' },
        { name: 'Verifications', icon: Shield, path: '/admin/students' },
        { name: 'Applications', icon: FileText, path: '/admin/applications' },
        { name: 'Jobs', icon: Briefcase, path: '/admin/jobs' },
        { name: 'Categories', icon: Folder, path: '/admin/categories' },
        { name: 'Client Packages', icon: CreditCard, path: '/admin/client-packages' },
        { name: 'Client Transactions', icon: DollarSign, path: '/admin/client-transactions' },
        { name: 'Student Subscriptions', icon: User, path: '/admin/student-packages' },
        { name: 'Coupons', icon: Tag, path: '/admin/coupons' },
        { name: 'Startups', icon: Star, path: '/admin/startups' },
        { name: 'Contact Us', icon: Mail, path: '/admin/contact-us' },
        ...baseItems.slice(1),
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className={`flex min-h-screen bg-gray-50 ${themeClass}`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link to="/" className="flex items-center gap-2">
              <span 
                className="text-xl font-bold"
                style={{fontWeight: 900, fontFamily: "'Lama Sans', sans-serif" }}
              >
                <span style={{ color: '#25aaad' }}>Fresh</span>
                <span style={{ color: '#065084' }}>lancer</span>
              </span>
            </Link>
     
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between flex-shrink-0 h-16 px-4 bg-white border-b lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-4 text-gray-600 hover:text-gray-900 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Bell Icon */}
            <Link
              to={`/${user?.role}/notifications`}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadCount?.data?.unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount.data.unreadCount > 99 ? '99+' : unreadCount.data.unreadCount}
                </span>
              )}
            </Link>

            {/* Points Display for Clients */}
            {user?.role === 'client' && userData?.data?.user?.clientProfile?.pointsRemaining !== undefined && (
              <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-lg px-4 py-2">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-primary-600 font-medium">Points</p>
                  <p className="text-lg font-bold text-[#8904aa]">
                    {userData.data.user.clientProfile.pointsRemaining}
                  </p>
                </div>
              </div>
            )}

            {/* Applications Display for Students */}
            {user?.role === 'student' && userData?.data?.user?.studentProfile && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <Briefcase className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-green-600 font-medium">Applications</p>
                  <p className="text-lg font-bold text-green-700">
                    {userData.data.user.studentProfile.applicationsUsedThisMonth || 0} / {
                      userData.data.user.studentProfile.subscriptionTier === 'premium' ? 100 : 10
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
