import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Alert from '../components/common/Alert';
import api from '../services/api';

const translations = {
  en: {
    registrationRequired: 'Registration Required',
    completeRegistrationFirst: 'Please complete your registration first.',
    goToRegistration: 'Go to Registration',
    completeStartupProfile: 'Complete Your Startup Profile',
    tellUsAboutStartup: 'Tell us more about your startup',
    startupName: 'Startup Name',
    startupNamePlaceholder: 'My Awesome Startup',
    startupNameRequired: 'Please enter your startup name',
    startupNameMaxLength: 'Startup name must be less than 100 characters',
    yourPosition: 'Your Position',
    positionPlaceholder: 'CEO, Founder, CTO, etc.',
    positionRequired: 'Please enter your position',
    positionMaxLength: 'Position must be less than 100 characters',
    numberOfEmployees: 'Number of Employees',
    selectNumberOfEmployees: 'Select number of employees',
    numberOfEmployeesRequired: 'Please select the number of employees',
    employees1_5: '1-5 employees',
    employees6_10: '6-10 employees',
    employees11_20: '11-20 employees',
    employees21_50: '21-50 employees',
    employees51_100: '51-100 employees',
    employees100Plus: '100+ employees',
    startupIndustry: 'Startup Industry',
    selectIndustry: 'Select your industry',
    industryRequired: 'Please select your startup industry',
    technology: 'Technology',
    ecommerce: 'E-commerce',
    healthcare: 'Healthcare',
    finance: 'Finance',
    education: 'Education',
    marketing: 'Marketing',
    realEstate: 'Real Estate',
    manufacturing: 'Manufacturing',
    consulting: 'Consulting',
    nonProfit: 'Non-profit',
    other: 'Other',
    specifyIndustry: 'Please specify your startup industry',
    startupStage: 'Startup Stage',
    selectStage: 'Select your startup stage',
    stageRequired: 'Please select your startup stage',
    idea: 'Idea',
    mvp: 'MVP',
    earlyStage: 'Early Stage',
    growth: 'Growth',
    scale: 'Scale',
    completeRegistration: 'Complete Registration',
    unableToCreate: 'Unable to create startup profile. Please try again.',
    startupCreatedLoginFailed: 'Startup created but login failed. Please sign in manually.',
  },
  it: {
    registrationRequired: 'Registrazione Richiesta',
    completeRegistrationFirst: 'Completa prima la tua registrazione.',
    goToRegistration: 'Vai alla Registrazione',
    completeStartupProfile: 'Completa il Profilo della Tua Startup',
    tellUsAboutStartup: 'Raccontaci di più sulla tua startup',
    startupName: 'Nome Startup',
    startupNamePlaceholder: 'La Mia Fantastica Startup',
    startupNameRequired: 'Inserisci il nome della tua startup',
    startupNameMaxLength: 'Il nome della startup deve essere inferiore a 100 caratteri',
    yourPosition: 'La Tua Posizione',
    positionPlaceholder: 'CEO, Fondatore, CTO, ecc.',
    positionRequired: 'Inserisci la tua posizione',
    positionMaxLength: 'La posizione deve essere inferiore a 100 caratteri',
    numberOfEmployees: 'Numero di Dipendenti',
    selectNumberOfEmployees: 'Seleziona il numero di dipendenti',
    numberOfEmployeesRequired: 'Seleziona il numero di dipendenti',
    employees1_5: '1-5 dipendenti',
    employees6_10: '6-10 dipendenti',
    employees11_20: '11-20 dipendenti',
    employees21_50: '21-50 dipendenti',
    employees51_100: '51-100 dipendenti',
    employees100Plus: '100+ dipendenti',
    startupIndustry: 'Settore Startup',
    selectIndustry: 'Seleziona il tuo settore',
    industryRequired: 'Seleziona il settore della tua startup',
    technology: 'Tecnologia',
    ecommerce: 'E-commerce',
    healthcare: 'Sanità',
    finance: 'Finanza',
    education: 'Istruzione',
    marketing: 'Marketing',
    realEstate: 'Immobiliare',
    manufacturing: 'Manifatturiero',
    consulting: 'Consulenza',
    nonProfit: 'Non profit',
    other: 'Altro',
    specifyIndustry: 'Specifica il settore della tua startup',
    startupStage: 'Fase Startup',
    selectStage: 'Seleziona la fase della tua startup',
    stageRequired: 'Seleziona la fase della tua startup',
    idea: 'Idea',
    mvp: 'MVP',
    earlyStage: 'Fase Iniziale',
    growth: 'Crescita',
    scale: 'Scala',
    completeRegistration: 'Completa Registrazione',
    unableToCreate: 'Impossibile creare il profilo startup. Riprova.',
    startupCreatedLoginFailed: 'Startup creata ma l\'accesso è fallito. Accedi manualmente.',
  },
};

const StartupRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    const handleStorageChange = () => {
      setLanguage(localStorage.getItem('dashboardLanguage') || 'en');
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const t = translations[language] || translations.en;

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
          setError(t.startupCreatedLoginFailed);
        }
      } else {
        navigate('/login');
      }
    },
    onError: (err) => {
      let errorMessage = t.unableToCreate;
      
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.registrationRequired}</h2>
            <p className="text-gray-600 mb-6">{t.completeRegistrationFirst}</p>
            <Button variant="primary" onClick={() => navigate('/register')}>
              {t.goToRegistration}
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
            {t.completeStartupProfile}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t.tellUsAboutStartup}
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label={t.startupName}
                placeholder={t.startupNamePlaceholder}
                error={errors.startupName?.message}
                {...register('startupName', {
                  required: t.startupNameRequired,
                  maxLength: {
                    value: 100,
                    message: t.startupNameMaxLength,
                  },
                })}
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label={t.yourPosition}
                placeholder={t.positionPlaceholder}
                error={errors.position?.message}
                {...register('position', {
                  required: t.positionRequired,
                  maxLength: {
                    value: 100,
                    message: t.positionMaxLength,
                  },
                })}
              />
            </div>

            <div className="md:col-span-2">
              <Select
                label={t.numberOfEmployees}
                placeholder={t.selectNumberOfEmployees}
                error={errors.numberOfEmployees?.message}
                {...register('numberOfEmployees', {
                  required: t.numberOfEmployeesRequired,
                })}
                options={[
                  { value: '1-5', label: t.employees1_5 },
                  { value: '6-10', label: t.employees6_10 },
                  { value: '11-20', label: t.employees11_20 },
                  { value: '21-50', label: t.employees21_50 },
                  { value: '51-100', label: t.employees51_100 },
                  { value: '100+', label: t.employees100Plus },
                ]}
              />
            </div>

            <div className="md:col-span-2">
              <Select
                label={t.startupIndustry}
                placeholder={t.selectIndustry}
                error={errors.industry?.message}
                {...register('industry', {
                  required: t.industryRequired,
                })}
                options={[
                  { value: 'Technology', label: t.technology },
                  { value: 'E-commerce', label: t.ecommerce },
                  { value: 'Healthcare', label: t.healthcare },
                  { value: 'Finance', label: t.finance },
                  { value: 'Education', label: t.education },
                  { value: 'Marketing', label: t.marketing },
                  { value: 'Real Estate', label: t.realEstate },
                  { value: 'Manufacturing', label: t.manufacturing },
                  { value: 'Consulting', label: t.consulting },
                  { value: 'Non-profit', label: t.nonProfit },
                  { value: 'Other', label: t.other },
                ]}
              />
            </div>

            {industry === 'Other' && (
              <div className="md:col-span-2">
                <Input
                  label={t.specifyIndustry}
                  placeholder={t.selectIndustry}
                  error={errors.industryOther?.message}
                  {...register('industryOther', {
                    required: industry === 'Other' ? t.specifyIndustry : false,
                  })}
                />
              </div>
            )}

            <div className="md:col-span-2">
              <Select
                label={t.startupStage}
                placeholder={t.selectStage}
                error={errors.stage?.message}
                {...register('stage', {
                  required: t.stageRequired,
                })}
                options={[
                  { value: 'Idea', label: t.idea },
                  { value: 'MVP', label: t.mvp },
                  { value: 'Early Stage', label: t.earlyStage },
                  { value: 'Growth', label: t.growth },
                  { value: 'Scale', label: t.scale },
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
            {t.completeRegistration}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default StartupRegistration;

