
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

const translations = {
  en: {
    invalidOrExpiredLink: 'Invalid or Expired Link',
    linkInvalidExpired: 'This password reset link is invalid or has expired. Please request a new password reset link.',
    requestNewResetLink: 'Request New Reset Link',
    backToLogin: 'Back to Login',
    passwordResetSuccessful: 'Password Reset Successful!',
    passwordResetSuccessMessage: 'Your password has been successfully reset. You will be redirected to your dashboard shortly.',
    resetYourPassword: 'Reset Your Password',
    enterNewPassword: 'Enter your new password below.',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 8 characters',
    confirmPasswordRequired: 'Please confirm your password',
    passwordsDoNotMatch: 'Passwords do not match',
    resetPassword: 'Reset Password',
    unableToReset: 'Unable to reset password. Please try again.',
  },
  it: {
    invalidOrExpiredLink: 'Link Non Valido o Scaduto',
    linkInvalidExpired: 'Questo link di reset password non è valido o è scaduto. Richiedi un nuovo link di reset password.',
    requestNewResetLink: 'Richiedi Nuovo Link di Reset',
    backToLogin: 'Torna al Login',
    passwordResetSuccessful: 'Password Reimpostata con Successo!',
    passwordResetSuccessMessage: 'La tua password è stata reimpostata con successo. Sarai reindirizzato alla tua dashboard a breve.',
    resetYourPassword: 'Reimposta la Tua Password',
    enterNewPassword: 'Inserisci la tua nuova password qui sotto.',
    newPassword: 'Nuova Password',
    confirmNewPassword: 'Conferma Nuova Password',
    passwordRequired: 'La password è obbligatoria',
    passwordMinLength: 'La password deve essere di almeno 8 caratteri',
    confirmPasswordRequired: 'Conferma la tua password',
    passwordsDoNotMatch: 'Le password non corrispondono',
    resetPassword: 'Reimposta Password',
    unableToReset: 'Impossibile reimpostare la password. Riprova.',
  },
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
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
      let errorMessage = t.unableToReset;
      
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
              {t.invalidOrExpiredLink}
            </h2>
            <p className="text-gray-600 mb-6">
              {t.linkInvalidExpired}
            </p>
            <div className="space-y-3">
              <Link to="/forgot-password">
                <Button variant="primary" className="w-full">
                  {t.requestNewResetLink}
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2 inline" />
                  {t.backToLogin}
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
              {t.passwordResetSuccessful}
            </h2>
            <p className="text-gray-600 mb-6">
              {t.passwordResetSuccessMessage}
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
            {t.resetYourPassword}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t.enterNewPassword}
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label={t.newPassword}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', {
                required: t.passwordRequired,
                minLength: {
                  value: 8,
                  message: t.passwordMinLength,
                },
              })}
            />

            <Input
              label={t.confirmNewPassword}
              type="password"
              placeholder="••••••••"
              error={errors.passwordConfirm?.message}
              {...register('passwordConfirm', {
                required: t.confirmPasswordRequired,
                validate: (value) =>
                  value === password || t.passwordsDoNotMatch,
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
            {t.resetPassword}
          </Button>

          <div className="text-center">
            <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t.backToLogin}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

