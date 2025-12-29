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
    accountDeleted: 'This account has been deleted. Please contact support if you believe this is an error.',
    accountSuspended: 'Your account has been suspended. Please contact support for assistance.',
    emailNotVerified: 'Please verify your email address before logging in. Check your inbox for the verification email or request a new one.',
    invalidEmailFormat: 'Please provide a valid email address. Login must be done using your email, not your name.',
    missingCredentials: 'Please provide both email and password.',
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
    accountDeleted: 'Questo account è stato eliminato. Contatta il supporto se ritieni che sia un errore.',
    accountSuspended: 'Il tuo account è stato sospeso. Contatta il supporto per assistenza.',
    emailNotVerified: 'Verifica il tuo indirizzo email prima di accedere. Controlla la tua casella di posta per l\'email di verifica o richiedine una nuova.',
    invalidEmailFormat: 'Fornisci un indirizzo email valido. L\'accesso deve essere effettuato utilizzando la tua email, non il tuo nome.',
    missingCredentials: 'Fornisci sia email che password.',
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

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    // Keep form values after submission failure
    shouldUnregister: false,
  });

  // Don't clear error when user starts typing - let it persist
  // Removed handleInputChange to keep error visible

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      const response = await login(data.email, data.password);

      // Clear error on successful login
      setError('');
      
      // Small delay to ensure error state is cleared before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect based on role
      const user = response.data.user;
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'client') {
        navigate('/client/dashboard');
      } else {
        navigate('/student/dashboard');
      }
      
      // Only reset form on successful login
      reset();
    } catch (err) {
      // Extract user-friendly error message
      let errorMessage = t.unableToSignIn;

      // Handle network errors first
      if (!err.response && err.message === 'Network Error') {
        errorMessage = t.unableToConnect;
      } else if (err.response?.data?.message) {
        const backendMessage = err.response.data.message.toLowerCase();
        
        // Map backend error messages to user-friendly translations
        if (backendMessage.includes('deleted')) {
          errorMessage = t.accountDeleted;
        } else if (backendMessage.includes('suspended')) {
          errorMessage = t.accountSuspended;
        } else if (backendMessage.includes('verify') || backendMessage.includes('verification')) {
          errorMessage = t.emailNotVerified;
        } else if (backendMessage.includes('valid email') || backendMessage.includes('email address')) {
          errorMessage = t.invalidEmailFormat;
        } else if (backendMessage.includes('provide both') || backendMessage.includes('email and password')) {
          errorMessage = t.missingCredentials;
        } else if (backendMessage.includes('invalid email') || backendMessage.includes('invalid password') || backendMessage.includes('invalid email or password')) {
          errorMessage = t.invalidCredentials;
        } else {
          // Use backend message if it's user-friendly
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Set error and ensure it stays visible
      // DO NOT reset form - keep email and password fields filled
      setError(errorMessage);
      setLoading(false);
      
      // Don't reset form - keep the email and password values
      // Auto-dismiss timer is handled in useEffect above
    }
  };

  // Handle auto-dismiss of error messages
  useEffect(() => {
    // If error exists, set up auto-dismiss after 10 seconds
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 10000);
      
      // Cleanup timer on unmount or if error changes
      return () => {
        clearTimeout(timer);
      };
    }
  }, [error]);

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
          <Alert 
            type="error" 
            message={error}
            onClose={() => setError('')}
          />
        )}

        <form 
          className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" 
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
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
                // Removed onChange handler - don't clear error on input change
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
                // Removed onChange handler - don't clear error on input change
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
