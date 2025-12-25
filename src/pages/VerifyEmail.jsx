import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import { CheckCircle, XCircle, Mail } from 'lucide-react';

const translations = {
  en: {
    verifying: 'Verifying your email...',
    success: 'Email Verified Successfully!',
    successMessage: 'Your email has been verified. You can now log in to your account.',
    error: 'Verification Failed',
    errorMessage: 'The verification link is invalid or has expired. Please request a new verification email.',
    goToLogin: 'Go to Login',
    requestNewLink: 'Request New Verification Email',
  },
  it: {
    verifying: 'Verifica della tua email...',
    success: 'Email Verificata con Successo!',
    successMessage: 'La tua email è stata verificata. Ora puoi accedere al tuo account.',
    error: 'Verifica Fallita',
    errorMessage: 'Il link di verifica non è valido o è scaduto. Richiedi una nuova email di verifica.',
    goToLogin: 'Vai al Login',
    requestNewLink: 'Richiedi Nuovo Link di Verifica',
  },
};

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
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

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage(t.errorMessage);
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        
        // API interceptor returns response.data, so response is already unwrapped
        // Response structure after interceptor: { status: 'success', message: '...', data: { user: {...} } }
        // Check both possible response structures
        const userData = response?.data?.user || response?.user;
        const responseStatus = response?.status || response?.data?.status;
        const responseMessage = response?.message || response?.data?.message;
        
        // Debug logging (remove in production)
        console.log('Verification response:', { response, userData, responseStatus, responseMessage });
        
        // Check if response indicates success
        if (responseStatus === 'success' || userData) {
          if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else if (user) {
            // Update existing user's emailVerified status
            const updatedUser = { ...user, emailVerified: true };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }

          setStatus('success');
          setMessage(responseMessage || t.successMessage);
        } else {
          // Response doesn't indicate success - but check if it's actually an error response
          // Sometimes the backend might return success in a different format
          if (response && typeof response === 'object' && !response.status) {
            // Response might be the data itself
            setStatus('success');
            setMessage(responseMessage || t.successMessage);
          } else {
            setStatus('error');
            setMessage(responseMessage || t.errorMessage);
          }
        }
      } catch (error) {
        // Debug logging (remove in production)
        console.log('Verification error:', error);
        
        // Check if error message indicates email is already verified (which is actually a success)
        const errorMessage = error?.message || error?.response?.data?.message || '';
        const isAlreadyVerified = errorMessage.toLowerCase().includes('already verified') || 
                                  errorMessage.toLowerCase().includes('already be verified') ||
                                  errorMessage.toLowerCase().includes('may already be verified');
        
        if (isAlreadyVerified) {
          // Email is already verified - treat as success
          if (user) {
            const updatedUser = { ...user, emailVerified: true };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          setStatus('success');
          setMessage('Your email is already verified. You can now log in to your account.');
        } else {
          setStatus('error');
          setMessage(errorMessage || t.errorMessage);
        }
      }
    };

    verifyEmailToken();
  }, [token]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleRequestNewLink = () => {
    navigate('/verify-email-required');
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <div className="text-center py-8">
            <Loading text={t.verifying} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <div className="text-center py-8">
          {status === 'success' ? (
            <>
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.success}</h1>
              <p className="text-gray-600 mb-6">{message || t.successMessage}</p>
              <Button onClick={handleGoToLogin} className="w-full">
                {t.goToLogin}
              </Button>
            </>
          ) : (
            <>
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.error}</h1>
              <Alert variant="error" className="mb-6">
                {message || t.errorMessage}
              </Alert>
              <div className="flex flex-col gap-3">
                <Button onClick={handleRequestNewLink} variant="primary" className="w-full">
                  <Mail className="w-4 h-4 mr-2 inline" />
                  {t.requestNewLink}
                </Button>
                <Button onClick={handleGoToLogin} variant="outline" className="w-full">
                  {t.goToLogin}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;

