import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const forgotPasswordMutation = useMutation({
    mutationFn: (email) => authService.forgotPassword(email),
    onSuccess: () => {
      setSuccess(true);
      setError('');
    },
    onError: (err) => {
      let errorMessage = 'Unable to send password reset email. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 404) {
        errorMessage = 'No account found with this email address.';
      }

      setError(errorMessage);
      setSuccess(false);
    },
  });

  const onSubmit = async (data) => {
    setError('');
    forgotPasswordMutation.mutate(data.email);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              If you don't see the email, please check your spam folder.
            </p>
            <div className="space-y-3">
              <Link to="/login">
                <Button variant="primary" className="w-full">
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
            <Mail className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Forgot Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={forgotPasswordMutation.isPending}
            disabled={forgotPasswordMutation.isPending}
          >
            Send Reset Link
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

export default ForgotPassword;

