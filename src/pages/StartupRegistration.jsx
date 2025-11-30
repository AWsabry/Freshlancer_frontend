import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Alert from '../components/common/Alert';
import api from '../services/api';

const StartupRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get user data from location state (passed from Register page)
  const userData = location.state?.userData;

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const industry = watch('industry');

  const createStartupMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/startups', data);
      return response;
    },
    onSuccess: async () => {
      // After creating startup, log the user in and redirect
      if (userData) {
        try {
          const loginResponse = await login(userData.email, userData.password);
          const user = loginResponse.data.user;
          
          // If email is not verified, redirect to verification page
          if (!user.emailVerified) {
            navigate('/verify-email-required');
            return;
          }
          
          if (user.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (user.role === 'client') {
            navigate('/client/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        } catch (err) {
          setError('Startup created but login failed. Please sign in manually.');
        }
      } else {
        navigate('/login');
      }
    },
    onError: (err) => {
      let errorMessage = 'Unable to create startup profile. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      // Handle industry - if "Other" is selected, use industryOther
      const startupData = {
        startupName: data.startupName,
        position: data.position,
        numberOfEmployees: data.numberOfEmployees,
        stage: data.stage,
      };

      if (data.industry === 'Other' && data.industryOther) {
        startupData.industry = data.industryOther.trim();
        startupData.industryOther = data.industryOther.trim();
      } else if (data.industry && data.industry !== 'Other') {
        startupData.industry = data.industry;
      }

      await createStartupMutation.mutateAsync(startupData);
    } catch (err) {
      // Error is handled by mutation onError
    } finally {
      setLoading(false);
    }
  };

  // If no userData, redirect to register
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Required</h2>
            <p className="text-gray-600 mb-6">Please complete your registration first.</p>
            <Button variant="primary" onClick={() => navigate('/register')}>
              Go to Registration
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Complete Your Startup Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tell us more about your startup
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Startup Name"
                placeholder="My Awesome Startup"
                error={errors.startupName?.message}
                {...register('startupName', {
                  required: 'Please enter your startup name',
                  maxLength: {
                    value: 100,
                    message: 'Startup name must be less than 100 characters',
                  },
                })}
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Your Position"
                placeholder="CEO, Founder, CTO, etc."
                error={errors.position?.message}
                {...register('position', {
                  required: 'Please enter your position',
                  maxLength: {
                    value: 100,
                    message: 'Position must be less than 100 characters',
                  },
                })}
              />
            </div>

            <div className="md:col-span-2">
              <Select
                label="Number of Employees"
                placeholder="Select number of employees"
                error={errors.numberOfEmployees?.message}
                {...register('numberOfEmployees', {
                  required: 'Please select the number of employees',
                })}
                options={[
                  { value: '1-5', label: '1-5 employees' },
                  { value: '6-10', label: '6-10 employees' },
                  { value: '11-20', label: '11-20 employees' },
                  { value: '21-50', label: '21-50 employees' },
                  { value: '51-100', label: '51-100 employees' },
                  { value: '100+', label: '100+ employees' },
                ]}
              />
            </div>

            <div className="md:col-span-2">
              <Select
                label="Startup Industry"
                placeholder="Select your industry"
                error={errors.industry?.message}
                {...register('industry', {
                  required: 'Please select your startup industry',
                })}
                options={[
                  { value: 'Technology', label: 'Technology' },
                  { value: 'E-commerce', label: 'E-commerce' },
                  { value: 'Healthcare', label: 'Healthcare' },
                  { value: 'Finance', label: 'Finance' },
                  { value: 'Education', label: 'Education' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Real Estate', label: 'Real Estate' },
                  { value: 'Manufacturing', label: 'Manufacturing' },
                  { value: 'Consulting', label: 'Consulting' },
                  { value: 'Non-profit', label: 'Non-profit' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </div>

            {industry === 'Other' && (
              <div className="md:col-span-2">
                <Input
                  label="Please specify your startup industry"
                  placeholder="Enter your industry"
                  error={errors.industryOther?.message}
                  {...register('industryOther', {
                    required: industry === 'Other' ? 'Please specify your startup industry' : false,
                  })}
                />
              </div>
            )}

            <div className="md:col-span-2">
              <Select
                label="Startup Stage"
                placeholder="Select your startup stage"
                error={errors.stage?.message}
                {...register('stage', {
                  required: 'Please select your startup stage',
                })}
                options={[
                  { value: 'Idea', label: 'Idea' },
                  { value: 'MVP', label: 'MVP' },
                  { value: 'Early Stage', label: 'Early Stage' },
                  { value: 'Growth', label: 'Growth' },
                  { value: 'Scale', label: 'Scale' },
                ]}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading || createStartupMutation.isPending}
            disabled={loading || createStartupMutation.isPending}
          >
            Complete Registration
          </Button>
        </form>
      </div>
    </div>
  );
};

export default StartupRegistration;

