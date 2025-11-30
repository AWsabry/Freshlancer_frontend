import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import { Mail, CheckCircle, XCircle, RefreshCw, Rocket } from 'lucide-react';

const VerifyEmailRequired = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState(null);

  // Fetch current user to check verification status
  const { data: userData, isLoading, refetch } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getMe(),
    refetchInterval: 5000, // Check every 5 seconds if email is verified
  });

  const currentUser = userData?.data?.user || user;
  const isVerified = currentUser?.emailVerified;

  // Resend verification email mutation
  const resendMutation = useMutation({
    mutationFn: () => {
      // If user is authenticated, just call without email (backend will use current user)
      // Otherwise, send email in body
      if (currentUser?.email) {
        return authService.resendVerificationEmail({ email: currentUser.email });
      }
      return authService.resendVerificationEmail({ email: user?.email });
    },
    onSuccess: () => {
      setResendSuccess(true);
      setResendError(null);
      setTimeout(() => setResendSuccess(false), 5000);
    },
    onError: (error) => {
      setResendError(error.response?.data?.message || 'Failed to resend verification email');
      setResendSuccess(false);
    },
  });

  const handleResend = () => {
    if (!currentUser?.email && !user?.email) {
      setResendError('Email address not found');
      return;
    }
    resendMutation.mutate();
  };

  // If verified, redirect to dashboard
  if (isVerified) {
    const getDashboardPath = () => {
      if (!currentUser) return '/login';
      switch (currentUser.role) {
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
    navigate(getDashboardPath(), { replace: true });
    return null;
  }

  if (isLoading) {
    return <Loading text="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verification Required
            </h1>
            <p className="text-gray-600">
              Please verify your email address to access your dashboard
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <Alert
              type="warning"
              message="Your email address has not been verified yet. Please check your inbox and click the verification link to continue."
            />

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Verification email sent to:</p>
              <p className="font-semibold text-gray-900">{currentUser?.email}</p>
            </div>

            {resendSuccess && (
              <Alert
                type="success"
                message="Verification email has been resent! Please check your inbox."
              />
            )}

            {resendError && (
              <Alert
                type="error"
                message={resendError}
              />
            )}

            {/* Show startup profile link if user is a startup */}
            {currentUser?.role === 'client' && currentUser?.clientProfile?.isStartup && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-1 flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      My Startups
                    </h3>
                    <p className="text-sm text-purple-700">
                      You can manage your startups while waiting for email verification
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/client/startup-profile')}
                    size="sm"
                  >
                    Manage Startups
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Important Information:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Check your inbox (and spam folder) for the verification email</li>
                <li>The verification link expires in 10 minutes</li>
                <li>Click the link in the email to verify your account</li>
                <li>This page will automatically refresh when you verify your email</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={handleResend}
              loading={resendMutation.isPending}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend Verification Email
            </Button>

            <Button
              variant="outline"
              onClick={() => refetch()}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Check Verification Status
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                await authService.logout();
                useAuthStore.getState().logout();
                navigate('/login');
              }}
              className="w-full"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> The email service is currently using Ethereal Email (testing service).
              <br />
              Check the server console for the email preview URL, or configure a real SMTP service for production.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailRequired;

