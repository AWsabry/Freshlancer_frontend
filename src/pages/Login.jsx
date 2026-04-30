import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import logo from '../assets/logos/01.png';
import { Briefcase, Users, Shield, Zap, CheckCircle, Globe } from 'lucide-react';

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
    tagline: 'Connect talented students with innovative projects',
    featuresTitle: 'Why Choose Freshlancer?',
    feature1: 'Find Quality Projects',
    feature1Desc: 'Access verified job opportunities from startups and businesses',
    feature2: 'Build Your Portfolio',
    feature2Desc: 'Showcase your skills and grow your professional network',
    feature3: 'Secure Platform',
    feature3Desc: 'Your data and payments are protected with enterprise-grade security',
    feature4: 'Fast & Easy',
    feature4Desc: 'Streamlined process to connect students with clients quickly',
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
    tagline: 'Collega studenti talentuosi con progetti innovativi',
    featuresTitle: 'Perché Scegliere Freshlancer?',
    feature1: 'Trova Progetti di Qualità',
    feature1Desc: 'Accedi a opportunità di lavoro verificate da startup e aziende',
    feature2: 'Costruisci il Tuo Portfolio',
    feature2Desc: 'Mostra le tue competenze e fai crescere la tua rete professionale',
    feature3: 'Piattaforma Sicura',
    feature3Desc: 'I tuoi dati e pagamenti sono protetti con sicurezza di livello enterprise',
    feature4: 'Veloce e Facile',
    feature4Desc: 'Processo semplificato per collegare studenti e clienti rapidamente',
  },
  ar: {
    welcomeToFreshlancer: 'مرحباً بك في Freshlancer',
    signInToAccount: 'سجّل الدخول إلى حسابك',
    emailAddress: 'البريد الإلكتروني',
    emailPlaceholder: 'بريدك@email.com',
    emailRequired: 'البريد الإلكتروني مطلوب',
    invalidEmail: 'عنوان بريد غير صالح',
    password: 'كلمة المرور',
    passwordRequired: 'كلمة المرور مطلوبة',
    passwordMinLength: 'يجب أن تكون كلمة المرور ٨ أحرف على الأقل',
    forgotPassword: 'نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    dontHaveAccount: 'ليس لديك حساب؟',
    signUp: 'إنشاء حساب',
    unableToSignIn: 'تعذّر تسجيل الدخول. حاول مرة أخرى.',
    unableToConnect: 'تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.',
    invalidCredentials: 'بريد أو كلمة مرور غير صحيحة.',
    accountDeleted: 'تم حذف هذا الحساب. تواصل مع الدعم إن كان ذلك خطأ.',
    accountSuspended: 'تم تعليق حسابك. تواصل مع الدعم.',
    emailNotVerified: 'يرجى التحقق من بريدك قبل تسجيل الدخول. راجع صندوق الوارد أو اطلب رسالة جديدة.',
    invalidEmailFormat: 'أدخل بريداً إلكترونياً صالحاً. يجب استخدام البريد وليس الاسم.',
    missingCredentials: 'يرجى إدخال البريد وكلمة المرور.',
    tagline: 'ربط الطلاب الموهوبين بالمشاريع المبتكرة',
    featuresTitle: 'لماذا Freshlancer؟',
    feature1: 'مشاريع بجودة عالية',
    feature1Desc: 'فرص عمل موثّقة من الشركات والناشئين',
    feature2: 'ابنِ سمعتك المهنية',
    feature2Desc: 'اعرض مهاراتك ووسّع شبكتك',
    feature3: 'منصة آمنة',
    feature3Desc: 'تشفير وحماية بمستوى عالٍ',
    feature4: 'سريع وسهل',
    feature4Desc: 'ربط مبسّط بين الطلاب والعملاء',
  },
};

const Login = () => {
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

  // Save language preference to localStorage and set HTML lang / dir
  useEffect(() => {
    localStorage.setItem('dashboardLanguage', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
  }, [language]);

  const t = translations[language] || translations.en;

  const nextPath = useMemo(() => {
    const sp = new URLSearchParams(location.search || '');
    return sp.get('next') || '';
  }, [location.search]);

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

      // Redirect based on role and email verification status (or `next` param)
      const user = response.data.user;
      
      // Check if email is verified (except for admin)
      if (user.role !== 'admin' && !user.emailVerified) {
        // Redirect to email verification page if not verified
        const next =
          nextPath ||
          (localStorage.getItem('pendingCvReviewUploadId')
            ? `/cv-review/continue?uploadId=${encodeURIComponent(
                localStorage.getItem('pendingCvReviewUploadId') || ''
              )}`
            : '');
        navigate(`/verify-email-required${next ? `?next=${encodeURIComponent(next)}` : ''}`);
      } else {
        if (nextPath) {
          navigate(nextPath);
        } else if (localStorage.getItem('pendingCvReviewUploadId')) {
          navigate(`/cv-review/continue?uploadId=${encodeURIComponent(localStorage.getItem('pendingCvReviewUploadId') || '')}`);
        } else {
          // Redirect to dashboard based on role
          if (user.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (user.role === 'client') {
            navigate('/client/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        }
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
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      lang={language}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8"
      style={
        language === 'ar'
          ? {
              fontFamily:
                'system-ui, "Segoe UI", Tahoma, "Noto Sans Arabic", "Helvetica Neue", sans-serif',
            }
          : undefined
      }
    >
      <div className="fixed top-4 end-4 z-50">
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2">
          <Globe className="w-4 h-4 text-gray-600" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border-0 bg-transparent text-sm text-gray-700 focus:outline-none focus:ring-0 cursor-pointer"
            aria-label="Select language"
          >
            <option value="en">EN</option>
            <option value="it">IT</option>
            <option value="ar">AR</option>
          </select>
        </div>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Features */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <img src={logo} alt="Freshlancer" className="h-40 w-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              {t.welcomeToFreshlancer}
            </h1>
            <p className="text-lg text-gray-600">
              {t.tagline}
            </p>
          </div>
          
          <div className="space-y-6 pt-4">
            <h3 className="text-xl font-semibold text-gray-900">{t.featuresTitle}</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t.feature1}</h4>
                  <p className="text-sm text-gray-600">{t.feature1Desc}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t.feature2}</h4>
                  <p className="text-sm text-gray-600">{t.feature2Desc}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t.feature3}</h4>
                  <p className="text-sm text-gray-600">{t.feature3Desc}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t.feature4}</h4>
                  <p className="text-sm text-gray-600">{t.feature4Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full">
          <div className="max-w-md mx-auto space-y-6 sm:space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="lg:hidden text-center mb-6">
              <img src={logo} alt="Freshlancer" className="h-16 w-auto mx-auto mb-4" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {t.welcomeToFreshlancer}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
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
      </div>
    </div>
  );
};

export default Login;
