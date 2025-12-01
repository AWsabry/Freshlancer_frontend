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
  // Americas
  'United States': 'USD', 'Canada': 'USD', 'Mexico': 'USD', 'Brazil': 'USD',
  'Argentina': 'USD', 'Chile': 'USD', 'Colombia': 'USD', 'Peru': 'USD',
  // Middle East
  'Egypt': 'EGP', 'Saudi Arabia': 'SAR', 'United Arab Emirates': 'AED',
  'Kuwait': 'KWD', 'Qatar': 'QAR', 'Bahrain': 'BHD', 'Oman': 'OMR',
  'Jordan': 'JOD', 'Lebanon': 'LBP', 'Palestine': 'USD', 'Turkey': 'TRY',
  // Africa
  'South Africa': 'ZAR', 'Morocco': 'MAD', 'Tunisia': 'TND', 'Algeria': 'DZD',
  'Nigeria': 'NGN', 'Kenya': 'KES', 'Ghana': 'GHS', 'Uganda': 'UGX',
  'Tanzania': 'TZS', 'Ethiopia': 'ETB',
  // Europe
  'United Kingdom': 'GBP', 'Switzerland': 'CHF', 'Sweden': 'SEK', 'Norway': 'NOK', 
  'Denmark': 'DKK', 'Poland': 'PLN', 'Czech Republic': 'CZK', 'Hungary': 'HUF',
  'Romania': 'RON', 'Bulgaria': 'BGN', 'Croatia': 'HRK', 'Russia': 'RUB', 
  'Ukraine': 'UAH', 'Germany': 'EUR', 'France': 'EUR', 'Italy': 'EUR', 
  'Spain': 'EUR', 'Netherlands': 'EUR', 'Belgium': 'EUR', 'Austria': 'EUR', 
  'Greece': 'EUR', 'Portugal': 'EUR', 'Ireland': 'EUR', 'Finland': 'EUR', 
  'Slovakia': 'EUR',
  // Asia
  'China': 'USD', 'Japan': 'USD', 'South Korea': 'USD', 'India': 'USD',
  'Pakistan': 'USD', 'Bangladesh': 'USD', 'Indonesia': 'USD', 'Philippines': 'USD',
  'Vietnam': 'USD', 'Thailand': 'USD', 'Malaysia': 'USD', 'Singapore': 'USD',
  // Oceania
  'Australia': 'USD', 'New Zealand': 'USD',
};

// Country to Phone Code mapping
const COUNTRY_PHONE_CODE_MAP = {
  'United States': '+1', 'Canada': '+1', 'Mexico': '+52', 'Brazil': '+55',
  'Argentina': '+54', 'Chile': '+56', 'Colombia': '+57', 'Peru': '+51',
  'Venezuela': '+58', 'Ecuador': '+593', 'Bolivia': '+591', 'Paraguay': '+595',
  'Uruguay': '+598', 'Costa Rica': '+506', 'Panama': '+507', 'Guatemala': '+502',
  'Egypt': '+20', 'Saudi Arabia': '+966', 'United Arab Emirates': '+971',
  'Kuwait': '+965', 'Qatar': '+974', 'Bahrain': '+973', 'Oman': '+968',
  'Jordan': '+962', 'Lebanon': '+961', 'Palestine': '+970', 'Turkey': '+90',
  'Israel': '+972', 'Syria': '+963', 'Iraq': '+964', 'Iran': '+98', 'Yemen': '+967',
  'South Africa': '+27', 'Morocco': '+212', 'Tunisia': '+216',
  'Algeria': '+213', 'Nigeria': '+234', 'Kenya': '+254', 'Ghana': '+233',
  'Uganda': '+256', 'Tanzania': '+255', 'Ethiopia': '+251', 'Rwanda': '+250',
  'United Kingdom': '+44', 'Switzerland': '+41', 'Sweden': '+46',
  'Norway': '+47', 'Denmark': '+45', 'Poland': '+48', 'Czech Republic': '+420',
  'Hungary': '+36', 'Romania': '+40', 'Bulgaria': '+359', 'Croatia': '+385',
  'Russia': '+7', 'Ukraine': '+380', 'Germany': '+49', 'France': '+33',
  'Italy': '+39', 'Spain': '+34', 'Netherlands': '+31', 'Belgium': '+32',
  'Austria': '+43', 'Greece': '+30', 'Portugal': '+351', 'Ireland': '+353',
  'Finland': '+358', 'Slovakia': '+421', 'Slovenia': '+386', 'Lithuania': '+370',
  'Latvia': '+371', 'Estonia': '+372', 'Serbia': '+381', 'Albania': '+355',
  'China': '+86', 'Japan': '+81', 'South Korea': '+82', 'India': '+91',
  'Pakistan': '+92', 'Bangladesh': '+880', 'Indonesia': '+62', 'Philippines': '+63',
  'Vietnam': '+84', 'Thailand': '+66', 'Malaysia': '+60', 'Singapore': '+65',
  'Australia': '+61', 'New Zealand': '+64',
};

// Country options for dropdown
const COUNTRY_OPTIONS = [
  { value: 'Afghanistan', label: 'Afghanistan' },
  { value: 'Albania', label: 'Albania' },
  { value: 'Algeria', label: 'Algeria' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Austria', label: 'Austria' },
  { value: 'Bahrain', label: 'Bahrain' },
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'Belgium', label: 'Belgium' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Bulgaria', label: 'Bulgaria' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Chile', label: 'Chile' },
  { value: 'China', label: 'China' },
  { value: 'Colombia', label: 'Colombia' },
  { value: 'Croatia', label: 'Croatia' },
  { value: 'Czech Republic', label: 'Czech Republic' },
  { value: 'Denmark', label: 'Denmark' },
  { value: 'Egypt', label: 'Egypt' },
  { value: 'Ethiopia', label: 'Ethiopia' },
  { value: 'Finland', label: 'Finland' },
  { value: 'France', label: 'France' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Greece', label: 'Greece' },
  { value: 'Hungary', label: 'Hungary' },
  { value: 'India', label: 'India' },
  { value: 'Indonesia', label: 'Indonesia' },
  { value: 'Ireland', label: 'Ireland' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Jordan', label: 'Jordan' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Lebanon', label: 'Lebanon' },
  { value: 'Malaysia', label: 'Malaysia' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'Morocco', label: 'Morocco' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'New Zealand', label: 'New Zealand' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Norway', label: 'Norway' },
  { value: 'Oman', label: 'Oman' },
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'Palestine', label: 'Palestine' },
  { value: 'Peru', label: 'Peru' },
  { value: 'Philippines', label: 'Philippines' },
  { value: 'Poland', label: 'Poland' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Romania', label: 'Romania' },
  { value: 'Russia', label: 'Russia' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Slovakia', label: 'Slovakia' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Sweden', label: 'Sweden' },
  { value: 'Switzerland', label: 'Switzerland' },
  { value: 'Tanzania', label: 'Tanzania' },
  { value: 'Thailand', label: 'Thailand' },
  { value: 'Tunisia', label: 'Tunisia' },
  { value: 'Turkey', label: 'Turkey' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Ukraine', label: 'Ukraine' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'United States', label: 'United States' },
  { value: 'Vietnam', label: 'Vietnam' },
];

// Nationality options for dropdown
const NATIONALITY_OPTIONS = [
  { value: 'Egyptian', label: 'Egyptian' },
  { value: 'Saudi Arabian', label: 'Saudi Arabian' },
  { value: 'Emirati', label: 'Emirati' },
  { value: 'Kuwaiti', label: 'Kuwaiti' },
  { value: 'Qatari', label: 'Qatari' },
  { value: 'Bahraini', label: 'Bahraini' },
  { value: 'Omani', label: 'Omani' },
  { value: 'Jordanian', label: 'Jordanian' },
  { value: 'Lebanese', label: 'Lebanese' },
  { value: 'Palestinian', label: 'Palestinian' },
  { value: 'Syrian', label: 'Syrian' },
  { value: 'Iraqi', label: 'Iraqi' },
  { value: 'Yemeni', label: 'Yemeni' },
  { value: 'Libyan', label: 'Libyan' },
  { value: 'Tunisian', label: 'Tunisian' },
  { value: 'Algerian', label: 'Algerian' },
  { value: 'Moroccan', label: 'Moroccan' },
  { value: 'Sudanese', label: 'Sudanese' },
  { value: 'American', label: 'American' },
  { value: 'British', label: 'British' },
  { value: 'Canadian', label: 'Canadian' },
  { value: 'Australian', label: 'Australian' },
  { value: 'German', label: 'German' },
  { value: 'French', label: 'French' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'Belgian', label: 'Belgian' },
  { value: 'Swiss', label: 'Swiss' },
  { value: 'Austrian', label: 'Austrian' },
  { value: 'Swedish', label: 'Swedish' },
  { value: 'Norwegian', label: 'Norwegian' },
  { value: 'Danish', label: 'Danish' },
  { value: 'Finnish', label: 'Finnish' },
  { value: 'Polish', label: 'Polish' },
  { value: 'Czech', label: 'Czech' },
  { value: 'Hungarian', label: 'Hungarian' },
  { value: 'Romanian', label: 'Romanian' },
  { value: 'Bulgarian', label: 'Bulgarian' },
  { value: 'Greek', label: 'Greek' },
  { value: 'Turkish', label: 'Turkish' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Ukrainian', label: 'Ukrainian' },
  { value: 'Indian', label: 'Indian' },
  { value: 'Pakistani', label: 'Pakistani' },
  { value: 'Bangladeshi', label: 'Bangladeshi' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'South Korean', label: 'South Korean' },
  { value: 'Filipino', label: 'Filipino' },
  { value: 'Indonesian', label: 'Indonesian' },
  { value: 'Malaysian', label: 'Malaysian' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Vietnamese', label: 'Vietnamese' },
  { value: 'Singaporean', label: 'Singaporean' },
  { value: 'Brazilian', label: 'Brazilian' },
  { value: 'Mexican', label: 'Mexican' },
  { value: 'Argentine', label: 'Argentine' },
  { value: 'Chilean', label: 'Chilean' },
  { value: 'Colombian', label: 'Colombian' },
  { value: 'Peruvian', label: 'Peruvian' },
  { value: 'Venezuelan', label: 'Venezuelan' },
  { value: 'South African', label: 'South African' },
  { value: 'Nigerian', label: 'Nigerian' },
  { value: 'Kenyan', label: 'Kenyan' },
  { value: 'Ghanaian', label: 'Ghanaian' },
  { value: 'Ethiopian', label: 'Ethiopian' },
  { value: 'Tanzanian', label: 'Tanzanian' },
  { value: 'Ugandan', label: 'Ugandan' },
  { value: 'Other', label: 'Other' },
];

// Country code options for phone number
const COUNTRY_CODE_OPTIONS = [
  { value: '+1', label: '+1 (US/Canada)' },
  { value: '+20', label: '+20 (Egypt)' },
  { value: '+27', label: '+27 (South Africa)' },
  { value: '+30', label: '+30 (Greece)' },
  { value: '+31', label: '+31 (Netherlands)' },
  { value: '+32', label: '+32 (Belgium)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+34', label: '+34 (Spain)' },
  { value: '+36', label: '+36 (Hungary)' },
  { value: '+39', label: '+39 (Italy)' },
  { value: '+40', label: '+40 (Romania)' },
  { value: '+41', label: '+41 (Switzerland)' },
  { value: '+43', label: '+43 (Austria)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+45', label: '+45 (Denmark)' },
  { value: '+46', label: '+46 (Sweden)' },
  { value: '+47', label: '+47 (Norway)' },
  { value: '+48', label: '+48 (Poland)' },
  { value: '+49', label: '+49 (Germany)' },
  { value: '+51', label: '+51 (Peru)' },
  { value: '+52', label: '+52 (Mexico)' },
  { value: '+54', label: '+54 (Argentina)' },
  { value: '+55', label: '+55 (Brazil)' },
  { value: '+56', label: '+56 (Chile)' },
  { value: '+57', label: '+57 (Colombia)' },
  { value: '+60', label: '+60 (Malaysia)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+62', label: '+62 (Indonesia)' },
  { value: '+63', label: '+63 (Philippines)' },
  { value: '+64', label: '+64 (New Zealand)' },
  { value: '+65', label: '+65 (Singapore)' },
  { value: '+66', label: '+66 (Thailand)' },
  { value: '+81', label: '+81 (Japan)' },
  { value: '+82', label: '+82 (South Korea)' },
  { value: '+84', label: '+84 (Vietnam)' },
  { value: '+86', label: '+86 (China)' },
  { value: '+90', label: '+90 (Turkey)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+92', label: '+92 (Pakistan)' },
  { value: '+212', label: '+212 (Morocco)' },
  { value: '+213', label: '+213 (Algeria)' },
  { value: '+216', label: '+216 (Tunisia)' },
  { value: '+233', label: '+233 (Ghana)' },
  { value: '+234', label: '+234 (Nigeria)' },
  { value: '+251', label: '+251 (Ethiopia)' },
  { value: '+254', label: '+254 (Kenya)' },
  { value: '+255', label: '+255 (Tanzania)' },
  { value: '+256', label: '+256 (Uganda)' },
  { value: '+351', label: '+351 (Portugal)' },
  { value: '+353', label: '+353 (Ireland)' },
  { value: '+358', label: '+358 (Finland)' },
  { value: '+359', label: '+359 (Bulgaria)' },
  { value: '+385', label: '+385 (Croatia)' },
  { value: '+420', label: '+420 (Czech Republic)' },
  { value: '+421', label: '+421 (Slovakia)' },
  { value: '+880', label: '+880 (Bangladesh)' },
  { value: '+961', label: '+961 (Lebanon)' },
  { value: '+962', label: '+962 (Jordan)' },
  { value: '+965', label: '+965 (Kuwait)' },
  { value: '+966', label: '+966 (Saudi Arabia)' },
  { value: '+970', label: '+970 (Palestine)' },
  { value: '+971', label: '+971 (UAE)' },
  { value: '+973', label: '+973 (Bahrain)' },
  { value: '+974', label: '+974 (Qatar)' },
  { value: '+968', label: '+968 (Oman)' },
];

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
  const countryOfStudy = watch('countryOfStudy');
  const phoneCountryCode = watch('phoneCountryCode');
  const phoneNumber = watch('phoneNumber');
  const industry = watch('industry');
  const howDidYouHear = watch('howDidYouHear');
  const isStartup = watch('isStartup');
  const startupIndustry = watch('startupIndustry');

  // Auto-detect currency when country of study changes
  useEffect(() => {
    if (countryOfStudy && COUNTRY_CURRENCY_MAP[countryOfStudy]) {
      const currency = COUNTRY_CURRENCY_MAP[countryOfStudy];
      setValue('currency', currency);
    } else if (countryOfStudy) {
      // Default to USD if country not in map
      setValue('currency', 'USD');
    }
  }, [countryOfStudy, setValue]);

  // Auto-detect phone country code when country of study changes
  useEffect(() => {
    if (countryOfStudy && COUNTRY_PHONE_CODE_MAP[countryOfStudy]) {
      const phoneCode = COUNTRY_PHONE_CODE_MAP[countryOfStudy];
      setValue('phoneCountryCode', phoneCode);
    } else if (countryOfStudy) {
      // Default to +1 if country not in map
      setValue('phoneCountryCode', '+1');
    }
  }, [countryOfStudy, setValue]);

  // Handle first step - basic info validation
  const handleContinue = (data) => {
    setError('');
    // Validate basic fields are filled
    if (!data.name || !data.email || !data.password || !data.passwordConfirm || !data.role) {
      setError('Please complete all required fields to continue');
      return;
    }

    // Check password match
    if (data.password !== data.passwordConfirm) {
      setError('The passwords you entered do not match. Please try again.');
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
        // Phone and nationality are required for students
        // Combine country code and phone number
        const fullPhoneNumber = data.phoneCountryCode && data.phoneNumber 
          ? `${data.phoneCountryCode}${data.phoneNumber}` 
          : data.phone || data.phoneNumber;
        userData.phone = fullPhoneNumber;
        userData.nationality = data.nationality;
        
        // Store country of study in location.country
        if (data.countryOfStudy) {
          userData.location = {
            country: data.countryOfStudy,
          };
        }
        
        // Determine currency based on country of study
        const currency = data.countryOfStudy && COUNTRY_CURRENCY_MAP[data.countryOfStudy] 
          ? COUNTRY_CURRENCY_MAP[data.countryOfStudy] 
          : 'USD'; // Default to USD if country not found
        
        userData.studentProfile = {
          university: data.university?.trim() || '',
          major: data.major?.trim() || '',
          graduationYear: data.graduationYear ? parseInt(data.graduationYear) : undefined,
          experienceLevel: data.experienceLevel || '',
          hourlyRate: {
            currency: currency,
          },
        };
        
        // Remove graduationYear if it's invalid
        if (isNaN(userData.studentProfile.graduationYear) || userData.studentProfile.graduationYear < 1900 || userData.studentProfile.graduationYear > 2100) {
          delete userData.studentProfile.graduationYear;
        }
      } else if (data.role === 'client') {
        userData.clientProfile = {
          isStartup: data.isStartup || false,
        };
        
        // Handle industry - if "Other" is selected, use industryOther, otherwise use industry
        if (data.industry === 'Other' && data.industryOther) {
          userData.clientProfile.industry = data.industryOther.trim();
        } else if (data.industry && data.industry !== 'Other') {
          userData.clientProfile.industry = data.industry;
        }
        
        // Add years of experience if provided
        if (data.yearsOfExperience) {
          userData.clientProfile.yearsOfExperience = parseInt(data.yearsOfExperience);
        }
        
        // Add age if provided
        if (data.age) {
          userData.age = parseInt(data.age);
        }
        
        // Handle howDidYouHear - if "Other" is selected, use howDidYouHearOther
        if (data.howDidYouHear === 'Other' && data.howDidYouHearOther) {
          userData.clientProfile.howDidYouHear = data.howDidYouHearOther.trim();
        } else if (data.howDidYouHear && data.howDidYouHear !== 'Other') {
          userData.clientProfile.howDidYouHear = data.howDidYouHear;
        }

        // If client is a startup, add startup data to be created after registration
        if (data.isStartup) {
          userData.startup = {
            startupName: data.startupName,
            position: data.startupPosition,
            numberOfEmployees: data.startupNumberOfEmployees,
            industry: data.startupIndustry === 'Other' && data.startupIndustryOther 
              ? data.startupIndustryOther.trim() 
              : data.startupIndustry,
            industryOther: data.startupIndustry === 'Other' ? data.startupIndustryOther?.trim() : undefined,
            stage: data.startupStage,
          };
        }
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
      let errorMessage = 'We couldn\'t create your account. Please check your information and try again.';

      if (err.response?.data?.message) {
        // Make backend error messages more user-friendly
        const backendMessage = err.response.data.message;
        
        // Convert technical messages to user-friendly ones
        if (backendMessage.includes('already registered') || backendMessage.includes('already exists')) {
          errorMessage = 'This email address is already registered. Please sign in or use a different email.';
        } else if (backendMessage.includes('Phone number is required')) {
          errorMessage = 'Please enter your phone number to continue.';
        } else if (backendMessage.includes('Nationality is required')) {
          errorMessage = 'Please select your nationality to continue.';
        } else if (backendMessage.includes('password')) {
          errorMessage = 'There was an issue with your password. Please make sure it\'s at least 8 characters long.';
        } else if (backendMessage.includes('email')) {
          errorMessage = 'Please enter a valid email address.';
        } else {
          errorMessage = backendMessage;
        }
      } else if (err.message && err.message !== 'Network Error') {
        errorMessage = err.message;
      }

      // Handle network errors
      if (!err.response && err.message === 'Network Error') {
        errorMessage = 'Unable to connect to our servers. Please check your internet connection and try again.';
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
                  {...register('name', { required: 'Please enter your full name' })}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Please enter your email address',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address (e.g., name@example.com)',
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
                    required: 'Please create a password',
                    minLength: {
                      value: 8,
                      message: 'Your password must be at least 8 characters long',
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
                    validate: (value) => value === password || 'The passwords you entered do not match. Please try again.',
                  })}
              />

              <div className="md:col-span-2">
                <Select
                  label="I am a..."
                  options={roleOptions}
                  error={errors.role?.message}
                  {...register('role', { required: 'Please select whether you\'re a student or client' })}
                />
              </div>
            </div>
          )}

          {step === 2 && role === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Select
                  label="Country of Study"
                  placeholder="Select country of study"
                  error={errors.countryOfStudy?.message}
                  {...register('countryOfStudy', {
                    required: 'Please select the country where you study',
                  })}
                  options={COUNTRY_OPTIONS}
                />
                {countryOfStudy && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Auto-configured based on your country:</strong>
                    </p>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• Phone Code: {COUNTRY_PHONE_CODE_MAP[countryOfStudy] || '+1'}</li>
                      <li>• Currency: {COUNTRY_CURRENCY_MAP[countryOfStudy] || 'USD'}</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Select
                  label="Nationality"
                  placeholder="Select your nationality"
                  error={errors.nationality?.message}
                  {...register('nationality', {
                    required: 'Please select your nationality',
                  })}
                  options={NATIONALITY_OPTIONS}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="flex gap-2">
                  <div className="w-1/3">
                    <Input
                      placeholder="Code"
                      {...register('phoneCountryCode', {
                        required: 'Please select your country code',
                      })}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="w-2/3">
                    <Input
                      type="tel"
                      placeholder="1234567890"
                      error={errors.phoneNumber?.message}
                      {...register('phoneNumber', {
                        required: 'Please enter your phone number',
                        pattern: {
                          value: /^[0-9]{7,15}$/,
                          message: 'Please enter a valid phone number with 7 to 15 digits',
                        },
                      })}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Country code is automatically set based on your country of study
                </p>
              </div>

              <div className="md:col-span-2">
                <Input
                  label="University"
                  placeholder="University of..."
                  error={errors.university?.message}
                  {...register('university', { required: 'Please enter your university name' })}
                />
              </div>

              <Input
                label="Major"
                placeholder="Computer Science"
                error={errors.major?.message}
                  {...register('major', { required: 'Please enter your field of study or major' })}
              />

              <Input
                label="Expected Graduation Year"
                type="number"
                placeholder="2025"
                error={errors.graduationYear?.message}
                  {...register('graduationYear', {
                    required: 'Please enter your expected graduation year',
                    min: {
                      value: new Date().getFullYear(),
                      message: 'Please enter a valid graduation year',
                    },
                  })}
              />

              <Select
                label="Experience Level"
                placeholder="Select your experience level"
                error={errors.experienceLevel?.message}
                {...register('experienceLevel', {
                  required: 'Please select your experience level',
                })}
                options={[
                  { value: 'Beginner', label: 'Beginner' },
                  { value: 'Intermediate', label: 'Intermediate' },
                  { value: 'Advanced', label: 'Advanced' },
                  { value: 'Expert', label: 'Expert' },
                ]}
              />
            </div>
          )}

          {step === 2 && role === 'client' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Select
                  label="Industry"
                  placeholder="Select your industry"
                  error={errors.industry?.message}
                  {...register('industry')}
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
                    label="Please specify your industry"
                    placeholder="Enter your industry"
                    error={errors.industryOther?.message}
                    {...register('industryOther', {
                      required: industry === 'Other' ? 'Please specify your industry' : false,
                    })}
                  />
                </div>
              )}

              <Input
                label="Years of Experience"
                type="number"
                placeholder="5"
                error={errors.yearsOfExperience?.message}
                {...register('yearsOfExperience', {
                  min: {
                    value: 0,
                    message: 'Years of experience must be 0 or greater',
                  },
                  max: {
                    value: 50,
                    message: 'Years of experience must be 50 or less',
                  },
                })}
              />

              <Input
                label="Age"
                type="number"
                placeholder="25"
                error={errors.age?.message}
                {...register('age', {
                  required: 'Please enter your age',
                  min: {
                    value: 18,
                    message: 'You must be at least 18 years old',
                  },
                  max: {
                    value: 100,
                    message: 'Please enter a valid age',
                  },
                })}
              />

              <div className="md:col-span-2">
                <Select
                  label="How did you hear about us?"
                  placeholder="Select an option"
                  error={errors.howDidYouHear?.message}
                  {...register('howDidYouHear', {
                    required: 'Please select how you heard about us',
                  })}
                  options={[
                    { value: 'Google Search', label: 'Google Search' },
                    { value: 'Social Media', label: 'Social Media' },
                    { value: 'Friend/Colleague', label: 'Friend/Colleague' },
                    { value: 'University/College', label: 'University/College' },
                    { value: 'Advertisement', label: 'Advertisement' },
                    { value: 'Blog/Article', label: 'Blog/Article' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
              </div>

              {howDidYouHear === 'Other' && (
                <div className="md:col-span-2">
                  <Input
                    label="Please specify how you heard about us"
                    placeholder="Enter details"
                    error={errors.howDidYouHearOther?.message}
                    {...register('howDidYouHearOther', {
                      required: howDidYouHear === 'Other' ? 'Please specify how you heard about us' : false,
                    })}
                  />
                </div>
              )}

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

              {isStartup && (
                <>
                  <div className="md:col-span-2 border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Startup Information</h3>
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Startup Name"
                      placeholder="My Awesome Startup"
                      error={errors.startupName?.message}
                      {...register('startupName', {
                        required: isStartup ? 'Startup name is required' : false,
                      })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Your Position"
                      placeholder="CEO, Founder, CTO, etc."
                      error={errors.startupPosition?.message}
                      {...register('startupPosition', {
                        required: isStartup ? 'Your position is required' : false,
                      })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Select
                      label="Number of Employees"
                      placeholder="Select number of employees"
                      error={errors.startupNumberOfEmployees?.message}
                      {...register('startupNumberOfEmployees', {
                        required: isStartup ? 'Number of employees is required' : false,
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
                      placeholder="Select your startup industry"
                      error={errors.startupIndustry?.message}
                      {...register('startupIndustry', {
                        required: isStartup ? 'Startup industry is required' : false,
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

                  {startupIndustry === 'Other' && (
                    <div className="md:col-span-2">
                      <Input
                        label="Please specify your startup industry"
                        placeholder="Enter your industry"
                        error={errors.startupIndustryOther?.message}
                        {...register('startupIndustryOther', {
                          required: startupIndustry === 'Other' && isStartup ? 'Please specify your startup industry' : false,
                        })}
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <Select
                      label="Startup Stage"
                      placeholder="Select your startup stage"
                      error={errors.startupStage?.message}
                      {...register('startupStage', {
                        required: isStartup ? 'Startup stage is required' : false,
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
                </>
              )}
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
