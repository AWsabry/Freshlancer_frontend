import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import Card from '../components/common/Card';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import paymobService from '../services/paymobService';
import couponService from '../services/couponService';
import { logger } from '../utils/logger';

const translations = {
  en: {
    paymentSuccessful: 'Payment Successful!',
    paymentConfirmed: 'Your payment has been confirmed successfully.',
    redirectingIn: 'Redirecting in',
    seconds: 'seconds',
    redirecting: 'Redirecting...',
    failedToCompletePayment: 'Failed to complete payment',
  },
  it: {
    paymentSuccessful: 'Pagamento Riuscito!',
    paymentConfirmed: 'Il tuo pagamento è stato confermato con successo.',
    redirectingIn: 'Reindirizzamento tra',
    seconds: 'secondi',
    redirecting: 'Reindirizzamento...',
    failedToCompletePayment: 'Impossibile completare il pagamento',
  },
};

// Helper function to get cookie value by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop().split(';').shift();
    logger.debug(`Cookie '${name}' found`);
    return cookieValue;
  }
  logger.debug(`Cookie '${name}' not found`);
  return null;
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
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

  // Get payment type from query parameter
  const paymentType = searchParams.get('type'); // 'supporter', 'subscription', or 'package'

  // Try to get intentionId from multiple sources
  const queryIntentionId = searchParams.get('id');
  const cookieIntentionId = getCookie('paymob_intention_id');
  const sessionIntentionId = sessionStorage.getItem('paymob_intention_id');
  const intentionId = queryIntentionId || cookieIntentionId || sessionIntentionId;

  logger.debug('PaymentSuccess - Intention ID resolution', {
    fromQuery: queryIntentionId || 'N/A',
    fromCookie: cookieIntentionId || 'N/A',
    fromSessionStorage: sessionIntentionId || 'N/A',
    using: intentionId || 'N/A',
  });

  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);

  const handleContinue = () => {
    // Handle redirect based on payment type
    if (paymentType === 'supporter') {
      // For donations, redirect to dashboard or home
      if (user?.role === 'student') {
        navigate('/student/dashboard');
      } else if (user?.role === 'client') {
        navigate('/client/dashboard');
      } else {
        navigate('/');
      }
    } else if (paymentType === 'subscription') {
      // For subscriptions, redirect to subscription page
      navigate('/student/subscription');
    } else if (paymentType === 'package') {
      // For packages, redirect to packages page
      navigate('/client/packages');
    } else {
      // Fallback to role-based redirect
      if (user?.role === 'student') {
        navigate('/student/subscription');
      } else if (user?.role === 'client') {
        navigate('/client/packages');
      } else {
        navigate('/');
      }
    }
  };

  useEffect(() => {
    // If intention ID is present, complete the payment success
    if (intentionId) {
      completePaymentSuccess();
    } else {
      setIsProcessing(false);
      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleContinue();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [intentionId]);

  const completePaymentSuccess = async () => {
    logger.debug('Starting payment completion for intention ID:', intentionId);
    const payMobResponse = await paymobService.checkPaymentStatus(intentionId);
    logger.debug('Payment status checked');
    try {
      setIsProcessing(true);
      logger.debug('Completing payment success for intention:', intentionId);
      // Call the complete-success endpoint to upgrade subscription
      const response = await api.get(`/paymob/complete-success?id=${intentionId}`);

      logger.debug('Payment completed successfully');

      // Record coupon usage if a coupon was applied
      try {
        const appliedCouponStr = sessionStorage.getItem('appliedCoupon');
        if (appliedCouponStr) {
          const appliedCoupon = JSON.parse(appliedCouponStr);
          if (appliedCoupon.couponId) {
            logger.debug('Recording coupon usage for coupon:', appliedCoupon.couponId);
            await couponService.recordCouponUsage(appliedCoupon.couponId);
            logger.debug('Coupon usage recorded successfully');
          }
        }
      } catch (couponErr) {
        logger.error('Error recording coupon usage:', couponErr);
        // Don't fail the whole flow if coupon recording fails
      }

      setIsProcessing(false);

      // Clear stored data from sessionStorage
      sessionStorage.removeItem('pendingPackage');
      sessionStorage.removeItem('paymob_intention_id');
      sessionStorage.removeItem('appliedCoupon');

      // Reset and start countdown
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleContinue();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error completing payment:', err);
      setError(err.response?.data?.message || t.failedToCompletePayment);
      setIsProcessing(false);

      // Redirect to failed page after 3 seconds
      setTimeout(() => {
        navigate('/payment/failed?error=completion_failed');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <div className="text-center space-y-6 py-8">
          {/* Icon - Loading or Success */}
          <div className="flex justify-center">
            {isProcessing ? (
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            ) : error ? (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-red-600" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {isProcessing ? t.redirecting : error ? t.failedToCompletePayment : t.paymentSuccessful}
            </h1>
            <p className="text-gray-600">
              {isProcessing ? t.redirecting : error ? error : t.paymentConfirmed}
            </p>
          </div>

          {/* Countdown */}
          {!isProcessing && !error && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {t.redirectingIn} <span className="font-semibold text-gray-900">{countdown}</span> {t.seconds}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
