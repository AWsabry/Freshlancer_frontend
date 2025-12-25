import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';

const translations = {
  en: {
    welcomeToFreshlancer: 'Welcome to Freshlancer',
    signInToAccount: 'Sign in to your account',
    emailAddress: 'Email Address',
    emailPlaceholder: 'your@email.com',
    emailRequired: 'Email is required',
    invalidEmail: 'Invalid email address',
    password: 'Password',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 8 characters',
    forgotPassword: 'Forgot your password?',
    signIn: 'Sign in',
    dontHaveAccount: "Don't have an account?",
    signUp: 'Sign up',
    unableToSignIn: 'Unable to sign in. Please try again.',
    unableToConnect: 'Unable to connect to the server. Please check your internet connection and try again.',
    invalidCredentials: 'Invalid email or password. Please check your credentials and try again.',
  },
  it: {
    welcomeToFreshlancer: 'Benvenuto su Freshlancer',
    signInToAccount: 'Accedi al tuo account',
    emailAddress: 'Indirizzo Email',
    emailPlaceholder: 'tua@email.com',
    emailRequired: 'L\'email è obbligatoria',
    invalidEmail: 'Indirizzo email non valido',
    password: 'Password',
    passwordRequired: 'La password è obbligatoria',
    passwordMinLength: 'La password deve essere di almeno 8 caratteri',
    forgotPassword: 'Hai dimenticato la password?',
    signIn: 'Accedi',
    dontHaveAccount: 'Non hai un account?',
    signUp: 'Registrati',
    unableToSignIn: 'Impossibile accedere. Riprova.',
    unableToConnect: 'Impossibile connettersi al server. Controlla la tua connessione internet e riprova.',
    invalidCredentials: 'Email o password non valide. Controlla le tue credenziali e riprova.',
  },
};

const Login = () => {
  const navigate = useNavigate();
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

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      const response = await login(data.email, data.password);

      // Redirect based on role
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
      let errorMessage = t.unableToSignIn;

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Handle network errors
      if (!err.response && err.message === 'Network Error') {
        errorMessage = t.unableToConnect;
      }

      // Handle 401/403 errors with generic message
      if (err.response?.status === 401 || err.response?.status === 403) {
        if (!err.response.data?.message || err.response.data.message.includes('invalid') || err.response.data.message.includes('Invalid')) {
          errorMessage = t.invalidCredentials;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            {t.welcomeToFreshlancer}
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600">
            {t.signInToAccount}
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} />
        )}

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-3 sm:space-y-4">
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

            <Input
              label={t.password}
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
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs sm:text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                {t.forgotPassword}
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            {t.signIn}
          </Button>

          <div className="text-center text-xs sm:text-sm">
            <span className="text-gray-600">{t.dontHaveAccount} </span>
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              {t.signUp}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
