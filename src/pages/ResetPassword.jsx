import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import { Lock, CheckCircle, ArrowLeft, XCircle } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const password = watch('password');

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }) => authService.resetPassword(token, password),
    onSuccess: async (response) => {
      setSuccess(true);
      setError('');
      
      // Auto-login the user after successful password reset
      if (response.token && response.data?.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect based on role
        const user = response.data.user;
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (user.role === 'client') {
            navigate('/client/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        }, 2000);
      }
    },
    onError: (err) => {
      let errorMessage = 'Unable to reset password. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        if (errorMessage.includes('invalid') || errorMessage.includes('expires')) {
          setTokenValid(false);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    setError('');
    resetPasswordMutation.mutate({ token, password: data.password });
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Invalid or Expired Link
            </h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new password reset link.
            </p>
            <div className="space-y-3">
              <Link to="/forgot-password">
                <Button variant="primary" className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2 inline" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You will be redirected to your dashboard shortly.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
            <Lock className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={errors.passwordConfirm?.message}
              {...register('passwordConfirm', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={resetPasswordMutation.isPending}
            disabled={resetPasswordMutation.isPending}
          >
            Reset Password
          </Button>

          <div className="text-center">
            <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

