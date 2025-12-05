import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';
import { authService } from '../../services/authService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { CheckCircle, Star, Zap, CreditCard } from 'lucide-react';

const translations = {
  en: {
    loading: 'Loading subscription...',
    currentSubscription: 'Current Subscription',
    premiumPlan: 'Premium Plan',
    freePlan: 'Free Plan',
    active: 'Active',
    freeTier: 'Free Tier',
    applicationsRemaining: '{remaining} of {limit} applications remaining this month',
    nextBilling: 'Next billing: {date}',
    selectCurrency: 'Select Currency',
    payWithPayPal: 'Pay securely with PayPal in US Dollars',
    payWithPaymob: 'Pay securely with Paymob in Egyptian Pounds',
    currentPlan: 'Current Plan',
    free: 'Free',
    perMonth: '/month',
    jobApplicationsPerMonth: '{count} job applications per month',
    accessToAllListings: 'Access to all job listings',
    basicProfileVisibility: 'Basic profile visibility',
    emailSupport: 'Email support',
    recommended: 'Recommended',
    premium: 'Premium',
    priorityInSearch: 'Priority in search results',
    featuredProfileBadge: 'Featured profile badge',
    prioritySupport: 'Priority customer support',
    upgradeToPremium: 'Upgrade to Premium',
    upgradeSuccess: 'Successfully upgraded to Premium!',
    upgradeFailed: 'Upgrade failed',
    cancelSubscription: 'Cancel Subscription',
    cancelDescription: 'You can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.',
    cancelPlan: 'Cancel Plan',
    cancelReasonPrompt: 'Please tell us why you want to cancel (optional):',
    cancelSuccess: 'Subscription cancelled successfully',
    noReasonProvided: 'No reason provided',
  },
  it: {
    loading: 'Caricamento abbonamento...',
    currentSubscription: 'Abbonamento Attuale',
    premiumPlan: 'Piano Premium',
    freePlan: 'Piano Gratuito',
    active: 'Attivo',
    freeTier: 'Livello Gratuito',
    applicationsRemaining: '{remaining} di {limit} candidature rimanenti questo mese',
    nextBilling: 'Prossimo addebito: {date}',
    selectCurrency: 'Seleziona Valuta',
    payWithPayPal: 'Paga in sicurezza con PayPal in Dollari USA',
    payWithPaymob: 'Paga in sicurezza con Paymob in Sterline Egiziane',
    currentPlan: 'Piano Attuale',
    free: 'Gratuito',
    perMonth: '/mese',
    jobApplicationsPerMonth: '{count} candidature di lavoro al mese',
    accessToAllListings: 'Accesso a tutti gli annunci di lavoro',
    basicProfileVisibility: 'Visibilità profilo base',
    emailSupport: 'Supporto email',
    recommended: 'Consigliato',
    premium: 'Premium',
    priorityInSearch: 'Priorità nei risultati di ricerca',
    featuredProfileBadge: 'Badge profilo in evidenza',
    prioritySupport: 'Supporto clienti prioritario',
    upgradeToPremium: 'Passa a Premium',
    upgradeSuccess: 'Passaggio a Premium completato con successo!',
    upgradeFailed: 'Passaggio a Premium fallito',
    cancelSubscription: 'Annulla Abbonamento',
    cancelDescription: 'Puoi annullare il tuo abbonamento in qualsiasi momento. Continuerai ad avere accesso fino alla fine del periodo di fatturazione.',
    cancelPlan: 'Annulla Piano',
    cancelReasonPrompt: 'Per favore, dicci perché vuoi annullare (opzionale):',
    cancelSuccess: 'Abbonamento annullato con successo',
    noReasonProvided: 'Nessun motivo fornito',
  },
};

const Subscription = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = useState('EGP');
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

  // Listen for language changes from DashboardLayout
  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
    };
    
    // Listen for custom language change event
    window.addEventListener('languageChanged', handleLanguageChange);
    
    // Also listen for storage events (for cross-tab updates)
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

  const { data, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getMySubscription(),
  });

  // Fetch current user data (including application counts)
  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getMe(),
  });

  // Fetch pricing based on selected currency
  const { data: pricingData, isLoading: pricingLoading } = useQuery({
    queryKey: ['subscriptionPricing', selectedCurrency],
    queryFn: () => subscriptionService.getPricing(selectedCurrency),
  });

  const upgradeMutation = useMutation({
    mutationFn: (paymentData) => subscriptionService.upgradeToPremium(paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription']);
      alert(t.upgradeSuccess);
    },
    onError: (error) => {
      alert(error.message || t.upgradeFailed);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (reason) => subscriptionService.cancelSubscription(reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription']);
      alert(t.cancelSuccess);
    },
  });

  if (isLoading || pricingLoading || loadingUser) {
    return <Loading text={t.loading} />;
  }

  const subscription = data?.data?.subscription;
  const isPremium = subscription?.plan === 'premium';

  // Get application data from user profile
  const studentProfile = userData?.data?.user?.studentProfile;
  const applicationsUsed = studentProfile?.applicationsUsedThisMonth || 0;
  const subscriptionTier = studentProfile?.subscriptionTier || 'free';
  const applicationsLimit = subscriptionTier === 'premium' ? 100 : 10;
  const applicationsRemaining = applicationsLimit - applicationsUsed;

  // Get pricing data
  const pricing = pricingData?.data;
  const currency = pricing?.currency || selectedCurrency;
  const monthlyPrice = pricing?.plans?.premium?.billingCycles?.monthly?.price?.amount || 9.99;

  const handleUpgrade = () => {
    // Navigate to payment page based on selected currency
    if (selectedCurrency === 'USD') {
      // Navigate to PayPal payment page for USD
      navigate('/student/payment-usd', {
        state: {
          currency: 'USD',
          amount: monthlyPrice,
        },
      });
    } else {
      // Navigate to Paymob payment page for EGP
      navigate('/student/payment', {
        state: {
          currency: selectedCurrency,
          amount: monthlyPrice,
        },
      });
    }
  };

  const handleCancel = () => {
    const reason = prompt(t.cancelReasonPrompt);
    if (reason !== null) {
      cancelMutation.mutate(reason || t.noReasonProvided);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Current Plan */}
      <Card title={t.currentSubscription}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold">
                {isPremium ? t.premiumPlan : t.freePlan}
              </h3>
              <Badge variant={isPremium ? 'success' : 'info'}>
                {isPremium ? t.active : t.freeTier}
              </Badge>
            </div>
            <p className="text-gray-600">
              {t.applicationsRemaining.replace('{remaining}', applicationsRemaining).replace('{limit}', applicationsLimit)}
            </p>
            {subscription?.nextBillingDate && (
              <p className="text-sm text-gray-500 mt-2">
                {t.nextBilling.replace('{date}', new Date(subscription.nextBillingDate).toLocaleDateString())}
              </p>
            )}
          </div>
          {isPremium ? (
            <Star className="w-16 h-16 text-yellow-500" />
          ) : (
            <Zap className="w-16 h-16 text-gray-400" />
          )}
        </div>
      </Card>



      {/* Pricing Plans */}
      {!isPremium && (
        <>
          {/* Currency Selection */}
          <Card title={t.selectCurrency}>
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
                <button
                  onClick={() => setSelectedCurrency('USD')}
                  className={`px-6 py-2 rounded-md font-medium transition-all border ${
                    selectedCurrency === 'USD'
                      ? 'bg-primary-500 text-[#8904aa] border-primary-500 shadow-md'
                      : 'text-gray-700 border-transparent hover:bg-gray-100'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  onClick={() => setSelectedCurrency('EGP')}
                  className={`px-6 py-2 rounded-md font-medium transition-all border ${
                    selectedCurrency === 'EGP'
                      ? 'bg-primary-500 text-[#8904aa] border-primary-500 shadow-md'
                      : 'text-gray-700 border-transparent hover:bg-gray-100'
                  }`}
                >
                  EGP (E£)
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center mt-3">
              {selectedCurrency === 'USD'
                ? t.payWithPayPal
                : t.payWithPaymob}
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className="relative">
            <div className="absolute top-4 right-4">
              <Badge variant="info">{t.currentPlan}</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-2">{t.free}</h3>
            <p className="text-4xl font-bold mb-4">
              $0<span className="text-lg text-gray-500">{t.perMonth}</span>
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{t.jobApplicationsPerMonth.replace('{count}', '10')}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{t.accessToAllListings}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{t.basicProfileVisibility}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{t.emailSupport}</span>
              </li>
            </ul>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-primary-500 shadow-lg">
            <div className="absolute top-4 right-4">
              <Badge variant="success">{t.recommended}</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-primary-600">{t.premium}</h3>
            <p className="text-4xl font-bold mb-4">
              {currency} {monthlyPrice.toFixed(2)}
              <span className="text-lg text-gray-500">{t.perMonth}</span>
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 font-semibold">{t.jobApplicationsPerMonth.replace('{count}', '100')}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{t.priorityInSearch}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{t.featuredProfileBadge}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{t.prioritySupport}</span>
              </li>
              {/* <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Advanced analytics</span>
              </li> */}
            </ul>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleUpgrade}
              loading={upgradeMutation.isPending}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {t.upgradeToPremium}
            </Button>
          </Card>
        </div>
        </>
      )}

      {/* Cancel Subscription */}
      {isPremium && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">{t.cancelSubscription}</h3>
              <p className="text-sm text-gray-600">
                {t.cancelDescription}
              </p>
            </div>
            <Button
              variant="danger"
              onClick={handleCancel}
              loading={cancelMutation.isPending}
            >
              {t.cancelPlan}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Subscription;
