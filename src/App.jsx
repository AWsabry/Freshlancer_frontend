import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import Landing from './pages/Landing';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmailRequired from './pages/VerifyEmailRequired';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StartupRegistration from './pages/StartupRegistration';

// Payment pages
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PaymentProcessing from './pages/PaymentProcessing';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentVerification from './pages/student/Verification';
import StudentJobs from './pages/student/Jobs';
import StudentJobDetails from './pages/student/JobDetails';
import StudentApplications from './pages/student/Applications';
import StudentApplicationDetails from './pages/student/ApplicationDetails';
import StudentSubscription from './pages/student/Subscription';
import StudentPayment from './pages/student/Payment';
import StudentPaymentUSD from './pages/student/PaymentUSD';
import StudentNotifications from './pages/student/Notifications';
import StudentProfile from './pages/student/Profile';
import StudentReviews from './pages/student/Reviews';
import StudentTransactions from './pages/student/Transactions';

// Client pages
import ClientDashboard from './pages/client/Dashboard';
import ClientJobs from './pages/client/Jobs';
import ClientJobForm from './pages/client/JobForm';
import ClientJobDetails from './pages/client/JobDetails';
import ClientApplications from './pages/client/Applications';
import JobApplicationsDetail from './pages/client/JobApplicationsDetail';
import ClientPackages from './pages/client/Packages';
import ClientPayment from './pages/client/Payment';
import ClientPaymentUSD from './pages/client/PaymentUSD';
import ClientNotifications from './pages/client/Notifications';
import ClientProfile from './pages/client/Profile';
import ClientStartupProfile from './pages/client/StartupProfile';
import ClientReviews from './pages/client/Reviews';
import ClientTransactions from './pages/client/Transactions';
import StudentProfileView from './pages/client/StudentProfileView';
import UnlockedStudents from './pages/client/UnlockedStudents';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminAnalytics from './pages/admin/Analytics';
import AdminUsers from './pages/admin/Users';
import AdminStudents from './pages/admin/Students';
import AdminStartups from './pages/admin/Startups';
import AdminApplications from './pages/admin/Applications';
import AdminJobs from './pages/admin/Jobs';
import AdminClientPackages from './pages/admin/ClientPackages';
import AdminStudentPackages from './pages/admin/StudentPackages';
import AdminCoupons from './pages/admin/Coupons';
import AdminCategories from './pages/admin/Categories';
import AdminContactUs from './pages/admin/ContactUs';
import AdminTransactions from './pages/admin/Transactions';
import AdminClientTransactions from './pages/admin/ClientTransactions';
import AdminReviews from './pages/admin/Reviews';
import AdminNotifications from './pages/admin/Notifications';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Determine dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'student':
        return '/student/dashboard';
      case 'client':
        return '/client/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Landing Page - Accessible to everyone */}
      <Route path="/" element={<Landing />} />

      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getDashboardPath()} />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={getDashboardPath()} />} />
      
      {/* Email Verification Routes */}
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/verify-email-required" element={<VerifyEmailRequired />} />
      
      {/* Password Reset Routes */}
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to={getDashboardPath()} />} />
      <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to={getDashboardPath()} />} />
      
      {/* Startup Registration Route */}
      <Route path="/startup-registration" element={!isAuthenticated ? <StartupRegistration /> : <Navigate to={getDashboardPath()} />} />

      {/* Payment callback routes - public but require authentication to function properly */}
      <Route path="/payment/processing" element={<PaymentProcessing />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failed" element={<PaymentFailed />} />

      {/* Student routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="verification" element={<StudentVerification />} />
        <Route path="jobs" element={<StudentJobs />} />
        <Route path="jobs/:id" element={<StudentJobDetails />} />
        <Route path="applications" element={<StudentApplications />} />
        <Route path="applications/:id" element={<StudentApplicationDetails />} />
        <Route path="subscription" element={<StudentSubscription />} />
        <Route path="payment" element={<StudentPayment />} />
        <Route path="payment-usd" element={<StudentPaymentUSD />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="reviews" element={<StudentReviews />} />
        <Route path="transactions" element={<StudentTransactions />} />
      </Route>

      {/* Client routes */}
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="jobs" element={<ClientJobs />} />
        <Route path="jobs/new" element={<ClientJobForm />} />
        <Route path="jobs/:id" element={<ClientJobDetails />} />
        <Route path="jobs/:id/edit" element={<ClientJobForm />} />
        <Route path="applications" element={<ClientApplications />} />
        <Route path="jobs/:jobId/applications" element={<JobApplicationsDetail />} />
        <Route path="students/:studentId" element={<StudentProfileView />} />
        <Route path="packages" element={<ClientPackages />} />
        <Route path="payment" element={<ClientPayment />} />
        <Route path="payment-usd" element={<ClientPaymentUSD />} />
        <Route path="notifications" element={<ClientNotifications />} />
        <Route path="profile" element={<ClientProfile />} />
        <Route path="startup-profile" element={<ClientStartupProfile />} />
        <Route path="unlocked-students" element={<UnlockedStudents />} />
        <Route path="reviews" element={<ClientReviews />} />
        <Route path="transactions" element={<ClientTransactions />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="startups" element={<AdminStartups />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="client-packages" element={<AdminClientPackages />} />
        <Route path="student-packages" element={<AdminStudentPackages />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="contact-us" element={<AdminContactUs />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="client-transactions" element={<AdminClientTransactions />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
