import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Alert from '../components/common/Alert';

// Country to Currency mapping
const COUNTRY_CURRENCY_MAP = {
  'United States': 'USD', 'Canada': 'USD', 'Mexico': 'USD', 'Brazil': 'USD',
  'Argentina': 'USD', 'Chile': 'USD', 'Colombia': 'USD', 'Peru': 'USD',
  'Egypt': 'EGP', 'Saudi Arabia': 'SAR', 'United Arab Emirates': 'AED',
  'Kuwait': 'KWD', 'Qatar': 'QAR', 'Bahrain': 'BHD', 'Oman': 'OMR',
  'Jordan': 'JOD', 'Lebanon': 'LBP', 'Israel': 'ILS', 'Turkey': 'TRY',
  'South Africa': 'ZAR', 'Morocco': 'MAD', 'Tunisia': 'TND', 'Algeria': 'DZD',
  'Nigeria': 'NGN', 'Kenya': 'KES', 'Ghana': 'GHS', 'Uganda': 'UGX',
  'Tanzania': 'TZS', 'Ethiopia': 'ETB', 'United Kingdom': 'GBP',
  'Switzerland': 'CHF', 'Sweden': 'SEK', 'Norway': 'NOK', 'Denmark': 'DKK',
  'Poland': 'PLN', 'Czech Republic': 'CZK', 'Hungary': 'HUF',
  'Romania': 'RON', 'Bulgaria': 'BGN', 'Croatia': 'HRK',
  'Russia': 'RUB', 'Ukraine': 'UAH',
  'Germany': 'EUR', 'France': 'EUR', 'Italy': 'EUR', 'Spain': 'EUR',
  'Netherlands': 'EUR', 'Belgium': 'EUR', 'Austria': 'EUR', 'Greece': 'EUR',
  'Portugal': 'EUR', 'Ireland': 'EUR', 'Finland': 'EUR', 'Slovakia': 'EUR',
};

// Country to Phone Code mapping
const COUNTRY_PHONE_CODE_MAP = {
  'United States': '+1', 'Canada': '+1', 'Mexico': '+52', 'Brazil': '+55',
  'Argentina': '+54', 'Chile': '+56', 'Colombia': '+57', 'Peru': '+51',
  'Egypt': '+20', 'Saudi Arabia': '+966', 'United Arab Emirates': '+971',
  'Kuwait': '+965', 'Qatar': '+974', 'Bahrain': '+973', 'Oman': '+968',
  'Jordan': '+962', 'Lebanon': '+961', 'Israel': '+972', 'Palestine': '+970',
  'Turkey': '+90', 'South Africa': '+27', 'Morocco': '+212', 'Tunisia': '+216',
  'Algeria': '+213', 'Nigeria': '+234', 'Kenya': '+254', 'Ghana': '+233',
  'Uganda': '+256', 'Tanzania': '+255', 'Ethiopia': '+251',
  'United Kingdom': '+44', 'Switzerland': '+41', 'Sweden': '+46',
  'Norway': '+47', 'Denmark': '+45', 'Poland': '+48', 'Czech Republic': '+420',
  'Hungary': '+36', 'Romania': '+40', 'Bulgaria': '+359', 'Croatia': '+385',
  'Russia': '+7', 'Ukraine': '+380', 'Germany': '+49', 'France': '+33',
  'Italy': '+39', 'Spain': '+34', 'Netherlands': '+31', 'Belgium': '+32',
  'Austria': '+43', 'Greece': '+30', 'Portugal': '+351', 'Ireland': '+353',
  'Finland': '+358', 'Slovakia': '+421', 'China': '+86', 'Japan': '+81',
  'South Korea': '+82', 'India': '+91', 'Pakistan': '+92', 'Bangladesh': '+880',
  'Indonesia': '+62', 'Philippines': '+63', 'Vietnam': '+84', 'Thailand': '+66',
  'Malaysia': '+60', 'Singapore': '+65', 'Australia': '+61', 'New Zealand': '+64',
};

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [step, setStep] = useState(1); // Step 1: Basic info, Step 2: Role-specific info

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      role: ''
    }
  });
  const password = watch('password');
  const selectedRole = watch('role');
  const watchedCountry = watch('country');

  // Handle first step - basic info validation
  const handleContinue = (data) => {
    setError('');
    // Validate basic fields are filled
    if (!data.name || !data.email || !data.password || !data.passwordConfirm || !data.role) {
      setError('Please fill in all required fields');
      return;
    }

    // Check password match
    if (data.password !== data.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    // Move to step 2
    setRole(data.role);
    setStep(2);
  };

  // Handle final submission
  const onSubmit = async (data) => {
    // If on step 1, just continue to step 2
    if (step === 1) {
      handleContinue(data);
      return;
    }

    // Step 2: Create account
    try {
      setLoading(true);
      setError('');

      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        role: data.role,
      };

      // Add role-specific fields
      if (data.role === 'student') {
        userData.studentProfile = {
          university: data.university,
          major: data.major,
          graduationYear: parseInt(data.graduationYear),
        };
      } else if (data.role === 'client') {
        userData.clientProfile = {
          companyName: data.companyName || '',
          industry: data.industry || '',
          isStartup: data.isStartup || false,
        };
      }

      const response = await registerUser(userData);

      // Redirect to dashboard based on role
      const user = response.data.user;
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'client') {
        navigate('/client/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      // Extract user-friendly error message
      let errorMessage = 'Registration failed. Please try again.';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Handle network errors
      if (!err.response && err.message === 'Network Error') {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Student - Looking for work' },
    { value: 'client', label: 'Client - Hiring students' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1 ? 'Step 1 of 2: Basic Information' : 'Step 2 of 2: Complete Your Profile'}
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  error={errors.name?.message}
                  {...register('name', { required: 'Name is required' })}
                />
              </div>

              <div className="md:col-span-2">
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
              </div>

              <Input
                label="Password"
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
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.passwordConfirm?.message}
                {...register('passwordConfirm', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />

              <div className="md:col-span-2">
                <Select
                  label="I am a..."
                  options={roleOptions}
                  error={errors.role?.message}
                  {...register('role', { required: 'Please select your role' })}
                />
              </div>
            </div>
          )}

          {step === 2 && role === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="University"
                  placeholder="University of..."
                  error={errors.university?.message}
                  {...register('university', { required: 'University is required' })}
                />
              </div>

              <Input
                label="Major"
                placeholder="Computer Science"
                error={errors.major?.message}
                {...register('major', { required: 'Major is required' })}
              />

              <Input
                label="Expected Graduation Year"
                type="number"
                placeholder="2025"
                error={errors.graduationYear?.message}
                {...register('graduationYear', {
                  required: 'Graduation year is required',
                  min: {
                    value: new Date().getFullYear(),
                    message: 'Please enter a valid year',
                  },
                })}
              />
            </div>
          )}

          {step === 2 && role === 'client' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Company Name (Optional)"
                  placeholder="Acme Inc."
                  error={errors.companyName?.message}
                  {...register('companyName')}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Industry (Optional)"
                  placeholder="Technology"
                  error={errors.industry?.message}
                  {...register('industry')}
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isStartup')}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">I am a startup</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {step === 2 && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {step === 1 ? 'Continue' : 'Create Account'}
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
