import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const translations = {
  en: {
    checkYourEmail: 'Check Your Email',
    passwordResetSent: 'We\'ve sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.',
    checkSpamFolder: 'If you don\'t see the email, please check your spam folder.',
    backToLogin: 'Back to Login',
    forgotPassword: 'Forgot Password?',
    enterEmailReset: 'Enter your email address and we\'ll send you a link to reset your password.',
    emailAddress: 'Email Address',
    emailPlaceholder: 'your@email.com',
    emailRequired: 'Email is required',
    invalidEmail: 'Invalid email address',
    sendResetLink: 'Send Reset Link',
    unableToSend: 'Unable to send password reset email. Please try again.',
    noAccountFound: 'No account found with this email address.',
  },
  it: {
    checkYourEmail: 'Controlla la Tua Email',
    passwordResetSent: 'Abbiamo inviato un link per reimpostare la password al tuo indirizzo email. Controlla la tua casella di posta e segui le istruzioni per reimpostare la password.',
    checkSpamFolder: 'Se non vedi l\'email, controlla la cartella spam.',
    backToLogin: 'Torna al Login',
    forgotPassword: 'Password Dimenticata?',
    enterEmailReset: 'Inserisci il tuo indirizzo email e ti invieremo un link per reimpostare la password.',
    emailAddress: 'Indirizzo Email',
    emailPlaceholder: 'tua@email.com',
    emailRequired: 'L\'email è obbligatoria',
    invalidEmail: 'Indirizzo email non valido',
    sendResetLink: 'Invia Link di Reset',
    unableToSend: 'Impossibile inviare l\'email di reset password. Riprova.',
    noAccountFound: 'Nessun account trovato con questo indirizzo email.',
  },
};

const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
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

  const { register, handleSubmit, formState: { errors } } = useForm();

  const forgotPasswordMutation = useMutation({
    mutationFn: (email) => authService.forgotPassword(email),
    onSuccess: () => {
      setSuccess(true);
      setError('');
    },
    onError: (err) => {
      let errorMessage = t.unableToSend;
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 404) {
        errorMessage = t.noAccountFound;
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
              {t.checkYourEmail}
            </h2>
            <p className="text-gray-600 mb-6">
              {t.passwordResetSent}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {t.checkSpamFolder}
            </p>
            <div className="space-y-3">
              <Link to="/login">
                <Button variant="primary" className="w-full">
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
            <Mail className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {t.forgotPassword}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t.enterEmailReset}
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label={t.emailAddress}
            type="email"
            placeholder={t.emailPlaceholder}
            error={errors.email?.message}
            {...register('email', {
              required: t.emailRequired,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t.invalidEmail,
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
            {t.sendResetLink}
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

export default ForgotPassword;

