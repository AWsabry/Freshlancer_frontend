import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2, TrendingUp, Gift, Heart } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import paymobService from '../services/paymobService';
import { packageService } from '../services/packageService';
import couponService from '../services/couponService';
import { logger } from '../utils/logger';

const translations = {
  en: {
    processingPayment: 'Processing Payment...',
    paymentError: 'Payment Error',
    paymentSuccessful: 'Payment Successful!',
    waitActivateSubscription: 'Please wait while we activate your subscription...',
    premiumSubscriptionActivated: 'Your premium subscription has been activated successfully.',
    pointsPackageAdded: 'Your points package has been added to your account.',
    pointsAddedSuccessfully: 'Points Added Successfully!',
    packageActivated: 'has been activated',
    yourPackage: 'Your package',
    newBalance: 'New Balance',
    points: 'points',
    availableForJobPostings: 'Available for job postings and profile views',
    loadingBalance: 'Loading your balance...',
    whatYouCanDoNow: 'What you can do now:',
    postNewJobs: 'Post new jobs and find talented freelancers',
    viewFreelancerProfiles: 'View freelancer profiles and portfolios',
    pointsNeverExpire: 'Your points never expire',
    trackUsage: 'Track your usage in the packages dashboard',
    whatHappensNext: 'What happens next?',
    accountUpgradedPremium: 'Your account has been upgraded to Premium',
    apply100JobsMonth: 'You can now apply to up to 100 jobs per month',
    profilePriority: 'Your profile will get priority in search results',
    confirmationNotification: 'You\'ll receive a confirmation notification',
    goToSubscription: 'Go to Subscription',
    goToPackages: 'Go to Packages',
    redirectingAutomatically: 'Redirecting automatically in 5 seconds...',
    failedToCompletePayment: 'Failed to complete payment',
    // Donation/Support messages
    donationSuccessful: 'Thank You for Your Support!',
    donationConfirmed: 'Your donation has been confirmed successfully.',
    thankYouMessage: 'Thank you for supporting Freshlancer! Your contribution helps us support students and make a difference.',
    donationImpact: 'Your Impact:',
    supportingStudents: 'Supporting talented students worldwide',
    helpingPlatform: 'Helping us maintain and improve the platform',
    makingDifference: 'Making a real difference in students\' lives',
    youWillReceive: 'You\'ll receive:',
    confirmationEmail: 'A confirmation email with your donation receipt',
    thankYouNotification: 'A thank you notification in your account',
    goToDashboard: 'Go to Dashboard',
    goToHome: 'Go to Home',
  },
  it: {
    processingPayment: 'Elaborazione Pagamento...',
    paymentError: 'Errore Pagamento',
    paymentSuccessful: 'Pagamento Riuscito!',
    waitActivateSubscription: 'Attendi mentre attiviamo il tuo abbonamento...',
    premiumSubscriptionActivated: 'Il tuo abbonamento premium è stato attivato con successo.',
    pointsPackageAdded: 'Il tuo pacchetto punti è stato aggiunto al tuo account.',
    pointsAddedSuccessfully: 'Punti Aggiunti con Successo!',
    packageActivated: 'è stato attivato',
    yourPackage: 'Il tuo pacchetto',
    newBalance: 'Nuovo Saldo',
    points: 'punti',
    availableForJobPostings: 'Disponibili per annunci di lavoro e visualizzazioni profilo',
    loadingBalance: 'Caricamento del tuo saldo...',
    whatYouCanDoNow: 'Cosa puoi fare ora:',
    postNewJobs: 'Pubblica nuovi lavori e trova freelancer talentuosi',
    viewFreelancerProfiles: 'Visualizza profili e portfolio di freelancer',
    pointsNeverExpire: 'I tuoi punti non scadono mai',
    trackUsage: 'Monitora il tuo utilizzo nella dashboard pacchetti',
    whatHappensNext: 'Cosa succede dopo?',
    accountUpgradedPremium: 'Il tuo account è stato aggiornato a Premium',
    apply100JobsMonth: 'Ora puoi candidarti fino a 100 lavori al mese',
    profilePriority: 'Il tuo profilo avrà priorità nei risultati di ricerca',
    confirmationNotification: 'Riceverai una notifica di conferma',
    goToSubscription: 'Vai all\'Abbonamento',
    goToPackages: 'Vai ai Pacchetti',
    redirectingAutomatically: 'Reindirizzamento automatico tra 5 secondi...',
    failedToCompletePayment: 'Impossibile completare il pagamento',
    // Donation/Support messages
    donationSuccessful: 'Grazie per il Tuo Supporto!',
    donationConfirmed: 'La tua donazione è stata confermata con successo.',
    thankYouMessage: 'Grazie per supportare Freshlancer! Il tuo contributo ci aiuta a supportare gli studenti e fare la differenza.',
    donationImpact: 'Il Tuo Impatto:',
    supportingStudents: 'Supportare studenti talentuosi in tutto il mondo',
    helpingPlatform: 'Aiutarci a mantenere e migliorare la piattaforma',
    makingDifference: 'Fare una vera differenza nella vita degli studenti',
    youWillReceive: 'Riceverai:',
    confirmationEmail: 'Un\'email di conferma con la ricevuta della tua donazione',
    thankYouNotification: 'Una notifica di ringraziamento nel tuo account',
    goToDashboard: 'Vai alla Dashboard',
    goToHome: 'Vai alla Home',
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
  const location = useLocation();
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

  // Get package info from navigation state or sessionStorage
  let packageInfo = location.state || {};

  // If not in location state, try to get from sessionStorage
  if (!packageInfo.points || !packageInfo.packageName) {
    try {
      const storedPackage = sessionStorage.getItem('pendingPackage');
      if (storedPackage) {
        packageInfo = JSON.parse(storedPackage);
      }
    } catch (error) {
      logger.error('Error parsing stored package info:', error);
    }
  }

  const { points: packagePoints, packageName } = packageInfo;

  logger.debug('PaymentSuccess - Intention ID resolution', {
    fromQuery: queryIntentionId || 'N/A',
    fromCookie: cookieIntentionId || 'N/A',
    fromSessionStorage: sessionIntentionId || 'N/A',
    using: intentionId || 'N/A',
    packagePoints: packagePoints || 'N/A',
    packageName: packageName || 'N/A',
  });

  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [pointsData, setPointsData] = useState(null);

  useEffect(() => {
    // If intention ID is present, complete the payment success
    if (intentionId) {
      completePaymentSuccess();
    } else {
      setIsProcessing(false);
      // Auto-redirect after 5 seconds
      const timer = setTimeout(() => {
        handleContinue();
      }, 5000);

      return () => clearTimeout(timer);
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

      // For clients, fetch updated points balance
      if (user?.role === 'client') {
        try {
          const pointsResponse = await packageService.getPointsBalance();
          logger.debug('Points balance fetched');
          setPointsData(pointsResponse.data);
        } catch (pointsErr) {
          logger.error('Error fetching points balance:', pointsErr);
          // Don't fail the whole flow if points fetch fails
        }
      }

      setIsProcessing(false);

      // Clear stored data from sessionStorage
      sessionStorage.removeItem('pendingPackage');
      sessionStorage.removeItem('paymob_intention_id');
      sessionStorage.removeItem('appliedCoupon');

      // Auto-redirect after 5 seconds
      const timer = setTimeout(() => {
        handleContinue();
      }, 5000);

      return () => clearTimeout(timer);
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
              {isProcessing 
                ? t.processingPayment 
                : error 
                ? t.paymentError 
                : paymentType === 'supporter'
                ? t.donationSuccessful
                : t.paymentSuccessful
              }
            </h1>
            <p className="text-gray-600">
              {isProcessing ? (
                paymentType === 'supporter' 
                  ? 'Processing your donation...'
                  : t.waitActivateSubscription
              ) : error ? (
                error
              ) : paymentType === 'supporter' ? (
                t.donationConfirmed
              ) : paymentType === 'subscription' ? (
                t.premiumSubscriptionActivated
              ) : paymentType === 'package' ? (
                t.pointsPackageAdded
              ) : (
                user?.role === 'student'
                  ? t.premiumSubscriptionActivated
                  : t.pointsPackageAdded
              )}
            </p>
          </div>

          {/* Details - Only show when not processing and no error */}
          {!isProcessing && !error && (
            <>
              {paymentType === 'supporter' ? (
                // Donation/Support Success Card
                <div className="space-y-4">
                  {/* Donation Success Alert */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 border-2 border-pink-300 rounded-xl p-6 shadow-lg">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200 rounded-full -mr-16 -mt-16 opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-200 rounded-full -ml-12 -mb-12 opacity-20"></div>

                    <div className="relative">
                      {/* Icon and Title */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {t.donationSuccessful}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {t.donationConfirmed}
                          </p>
                        </div>
                      </div>

                      {/* Thank You Message */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-pink-200/50 shadow-sm">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {t.thankYouMessage}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Impact Card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-left">
                        <p className="font-medium text-gray-900 mb-1">
                          {t.donationImpact}
                        </p>
                        <ul className="space-y-1 text-gray-600">
                          <li>• {t.supportingStudents}</li>
                          <li>• {t.helpingPlatform}</li>
                          <li>• {t.makingDifference}</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* What You'll Receive Card */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Gift className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-left">
                        <p className="font-medium text-gray-900 mb-1">
                          {t.youWillReceive}
                        </p>
                        <ul className="space-y-1 text-gray-600">
                          <li>• {t.confirmationEmail}</li>
                          <li>• {t.thankYouNotification}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : user?.role === 'client' ? (
                // Beautiful Points Alert for Clients
                <div className="space-y-4">
                  {/* Points Increase Alert */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-xl p-6 shadow-lg">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full -mr-16 -mt-16 opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200 rounded-full -ml-12 -mb-12 opacity-20"></div>

                    <div className="relative">
                      {/* Icon and Title */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {t.pointsAddedSuccessfully}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {packageName || t.yourPackage} {t.packageActivated}
                          </p>
                        </div>
                      </div>

                      {/* Points Display */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200/50 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-600">{t.newBalance}</span>
                          {packagePoints && (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                +{packagePoints} {t.points}
                              </span>
                            </div>
                          )}
                        </div>
                        {pointsData ? (
                          <>
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                                {pointsData.data?.pointsRemaining?.toLocaleString() || 0}
                              </span>
                              <span className="text-lg font-medium text-gray-600">{t.points}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {t.availableForJobPostings}
                            </p>
                          </>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                            <span className="text-sm text-gray-600">{t.loadingBalance}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* What's Next Card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-left">
                        <p className="font-medium text-gray-900 mb-1">
                          {t.whatYouCanDoNow}
                        </p>
                        <ul className="space-y-1 text-gray-600">
                          <li>• {t.postNewJobs}</li>
                          <li>• {t.viewFreelancerProfiles}</li>
                          <li>• {t.pointsNeverExpire}</li>
                          <li>• {t.trackUsage}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Standard Alert for Students
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-left">
                      <p className="font-medium text-gray-900 mb-1">
                        {t.whatHappensNext}
                      </p>
                      <ul className="space-y-1 text-gray-600">
                        <li>• {t.accountUpgradedPremium}</li>
                        <li>• {t.apply100JobsMonth}</li>
                        <li>• {t.profilePriority}</li>
                        <li>• {t.confirmationNotification}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Actions - Only show when not processing */}
          {!isProcessing && !error && (
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={handleContinue}
              >
                {paymentType === 'supporter' 
                  ? (user?.role ? t.goToDashboard : t.goToHome)
                  : paymentType === 'subscription'
                  ? t.goToSubscription
                  : paymentType === 'package'
                  ? t.goToPackages
                  : (user?.role === 'student' ? t.goToSubscription : t.goToPackages)
                }
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.redirectingAutomatically}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
