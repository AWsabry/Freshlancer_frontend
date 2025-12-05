import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../../services/subscriptionService';
import couponService from '../../services/couponService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ArrowLeft, Lock, CheckCircle, CreditCard, Tag, X, DollarSign } from 'lucide-react';
import paypalImage from '../../assets/images/paypal.png';

const translations = {
  en: {
    noPaymentDetails: 'No payment details found',
    goToSubscription: 'Go to Subscription',
    backToSubscription: 'Back to Subscription',
    completePayment: 'Complete Payment',
    securePaymentWithPaypal: 'Secure Payment with PayPal',
    paypalRedirect: 'You will be redirected to PayPal to securely complete your payment. PayPal accepts credit/debit cards, bank accounts, and PayPal balance.',
    paypalIntegrationArea: 'PayPal Integration Area',
    paypalIntegrationDescription: 'This is where the PayPal SDK integration will be implemented. The PayPal button or checkout flow will appear here.',
    implementationSteps: 'Implementation Steps:',
    acceptedPaymentMethods: 'Accepted Payment Methods:',
    creditDebitCards: '💳 Credit/Debit Cards',
    cardsDescription: 'Visa, Mastercard',
    paypalBalance: '💰 PayPal Balance',
    paypalBalanceDescription: 'Pay with PayPal funds',
    yourPaymentIsSecure: 'Your payment is secure',
    secureDescription: 'All transactions are encrypted and processed securely through PayPal\'s payment gateway. Your card details are never stored on our servers. PayPal provides buyer protection and secure checkout.',
    paymentSummary: 'Payment Summary',
    plan: 'Plan',
    premium: 'Premium',
    billingCycle: 'Billing Cycle',
    monthly: 'Monthly',
    currency: 'Currency',
    havePromoCode: 'Have a promo code?',
    enterCode: 'Enter code',
    apply: 'Apply',
    discount: 'discount',
    subtotal: 'Subtotal',
    processingFee: 'Processing Fee',
    processingFeeNote: '(2.9% + $0.30)',
    total: 'Total',
    whatYoullGet: 'What you\'ll get:',
    jobApplicationsPerMonth: '100 job applications/month',
    priorityInSearch: 'Priority in search results',
    featuredProfileBadge: 'Featured profile badge',
    prioritySupport: 'Priority support',
    seeJobBudgets: 'See job budgets',
    paypalIntegrationPending: 'PayPal Integration Pending',
    paypalButtonWillAppear: 'PayPal button will appear here once integrated',
    securePaymentPoweredBy: 'Secure payment powered by PayPal',
    pleaseEnterCouponCode: 'Please enter a coupon code',
    invalidCouponCode: 'Invalid coupon code',
    paypalIntegrationComingSoon: 'PayPal integration coming soon! This is where PayPal payment flow will be implemented.',
    paymentProcessingError: 'Payment processing error. Please contact support.',
    paymentFailed: 'Payment failed. Please try again.',
  },
  it: {
    noPaymentDetails: 'Nessun dettaglio di pagamento trovato',
    goToSubscription: 'Vai all\'Abbonamento',
    backToSubscription: 'Torna all\'Abbonamento',
    completePayment: 'Completa Pagamento',
    securePaymentWithPaypal: 'Pagamento Sicuro con PayPal',
    paypalRedirect: 'Sarai reindirizzato a PayPal per completare in sicurezza il tuo pagamento. PayPal accetta carte di credito/debito, conti bancari e saldo PayPal.',
    paypalIntegrationArea: 'Area Integrazione PayPal',
    paypalIntegrationDescription: 'Qui verrà implementata l\'integrazione dell\'SDK PayPal. Il pulsante PayPal o il flusso di checkout apparirà qui.',
    implementationSteps: 'Passaggi di Implementazione:',
    acceptedPaymentMethods: 'Metodi di Pagamento Accettati:',
    creditDebitCards: '💳 Carte di Credito/Debito',
    cardsDescription: 'Visa, Mastercard',
    paypalBalance: '💰 Saldo PayPal',
    paypalBalanceDescription: 'Paga con fondi PayPal',
    yourPaymentIsSecure: 'Il tuo pagamento è sicuro',
    secureDescription: 'Tutte le transazioni sono crittografate ed elaborate in sicurezza tramite il gateway di pagamento di PayPal. I dettagli della tua carta non vengono mai memorizzati sui nostri server. PayPal fornisce protezione acquirenti e checkout sicuro.',
    paymentSummary: 'Riepilogo Pagamento',
    plan: 'Piano',
    premium: 'Premium',
    billingCycle: 'Ciclo di Fatturazione',
    monthly: 'Mensile',
    currency: 'Valuta',
    havePromoCode: 'Hai un codice promozionale?',
    enterCode: 'Inserisci codice',
    apply: 'Applica',
    discount: 'sconto',
    subtotal: 'Subtotale',
    processingFee: 'Commissione di Elaborazione',
    processingFeeNote: '(2,9% + $0,30)',
    total: 'Totale',
    whatYoullGet: 'Cosa otterrai:',
    jobApplicationsPerMonth: '100 candidature di lavoro/mese',
    priorityInSearch: 'Priorità nei risultati di ricerca',
    featuredProfileBadge: 'Badge profilo in evidenza',
    prioritySupport: 'Supporto prioritario',
    seeJobBudgets: 'Visualizza budget lavori',
    paypalIntegrationPending: 'Integrazione PayPal in Attesa',
    paypalButtonWillAppear: 'Il pulsante PayPal apparirà qui una volta integrato',
    securePaymentPoweredBy: 'Pagamento sicuro fornito da PayPal',
    pleaseEnterCouponCode: 'Inserisci un codice coupon',
    invalidCouponCode: 'Codice coupon non valido',
    paypalIntegrationComingSoon: 'Integrazione PayPal in arrivo! Qui verrà implementato il flusso di pagamento PayPal.',
    paymentProcessingError: 'Errore nell\'elaborazione del pagamento. Contatta il supporto.',
    paymentFailed: 'Pagamento fallito. Riprova.',
  },
};

const PaymentUSD = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
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

  // Get payment details from navigation state
  const { amount } = location.state || {};
  const currency = 'USD'; // USD for PayPal

  // Promocode state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Calculate fees and total
  const subtotal = amount || 0;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);
  const processingFee = subtotalAfterDiscount * 0.029 + 0.30; // PayPal standard fee: 2.9% + $0.30
  const total = subtotalAfterDiscount + processingFee;

  // Coupon validation mutation
  const couponMutation = useMutation({
    mutationFn: ({ code, amount, currency }) => couponService.validateCoupon(code, amount, currency),
    onSuccess: (response) => {
      setAppliedCoupon(response.data);
      setCouponError('');
      setCouponCode('');
    },
    onError: (error) => {
      setCouponError(error.response?.data?.message || t.invalidCouponCode);
      setAppliedCoupon(null);
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: (paymentData) => subscriptionService.upgradeToPremium(paymentData),
    onSuccess: async (response) => {
      try {
        console.log('PayPal payment response received:', response);
        console.log('Response data:', response?.data);

        // TODO: Integrate PayPal SDK here
        // For now, show placeholder
        alert(t.paypalIntegrationComingSoon);

        // After successful PayPal payment:
        // queryClient.invalidateQueries(['subscription']);
        // queryClient.invalidateQueries(['applicationLimit']);
        // navigate('/student/subscription');
      } catch (error) {
        console.error('Error processing PayPal payment:', error);
        alert(t.paymentProcessingError);
      }
    },
    onError: (error) => {
      console.error('Payment mutation error:', error);
      console.error('Error response:', error.response);
      alert(error.response?.data?.message || t.paymentFailed);
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError(t.pleaseEnterCouponCode);
      return;
    }
    setCouponError('');
    couponMutation.mutate({ code: couponCode, amount: subtotal, currency });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handlePayment = () => {
    // Store coupon info if applied
    if (appliedCoupon) {
      sessionStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    }

    // TODO: Implement PayPal payment flow
    // Process payment
    const paymentData = {
      amount: total,
      currency: currency,
      billingCycle: 'monthly',
      paymentMethod: 'paypal',
    };
    console.log('Processing PayPal payment with data:', paymentData);

    upgradeMutation.mutate(paymentData);
  };

  // Redirect back if no payment details
  if (!amount) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{t.noPaymentDetails}</p>
            <Button onClick={() => navigate('/student/subscription')}>
              {t.goToSubscription}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <button
        onClick={() => navigate('/student/subscription')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="w-5 h-5" />
        {t.backToSubscription}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Information */}
        <div className="lg:col-span-2">
          <Card title={t.completePayment}>
            <div className="space-y-6">
              {/* Payment Info */}
              <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-shrink-0">
                  <img
                    src={paypalImage}
                    alt="PayPal"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t.securePaymentWithPaypal}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t.paypalRedirect}
                  </p>
                </div>
              </div>

              {/* PayPal Integration Placeholder */}
              <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <CreditCard className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-900 mb-2">
                      {t.paypalIntegrationArea}
                    </p>
                    <p className="text-xs text-yellow-700 mb-3">
                      {t.paypalIntegrationDescription}
                    </p>
                    <div className="p-4 bg-white border border-yellow-300 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">{t.implementationSteps}</p>
                      <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Install PayPal SDK: <code className="bg-gray-100 px-1 rounded">npm install @paypal/react-paypal-js</code></li>
                        <li>Get PayPal Client ID from PayPal Developer Dashboard</li>
                        <li>Wrap app with PayPalScriptProvider in App.jsx</li>
                        <li>Add PayPalButtons component here</li>
                        <li>Handle onApprove and onError callbacks</li>
                        <li>Send payment confirmation to backend</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods Info */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">{t.acceptedPaymentMethods}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">{t.creditDebitCards}</p>
                    <p className="text-xs text-gray-500">{t.cardsDescription}</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">{t.paypalBalance}</p>
                    <p className="text-xs text-gray-500">{t.paypalBalanceDescription}</p>
                  </div>
         
          
                </div>
              </div>

              {/* Security Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {t.yourPaymentIsSecure}
                    </p>
                    <p className="text-xs text-gray-600">
                      {t.secureDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <Card title={t.paymentSummary}>
            <div className="space-y-4">
              {/* Plan Details */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{t.plan}</p>
                  <Badge variant="success">{t.premium}</Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{t.billingCycle}</p>
                  <p className="text-sm font-medium text-gray-900">{t.monthly}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{t.currency}</p>
                  <Badge variant="info">USD ($)</Badge>
                </div>
              </div>

              {/* Promocode Section */}
              <div className="pb-4 border-b border-gray-200">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t.havePromoCode}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder={t.enterCode}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        disabled={couponMutation.isPending}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyCoupon}
                        loading={couponMutation.isPending}
                        className="whitespace-nowrap"
                      >
                        {t.apply}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-600">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">{appliedCoupon.couponCode}</p>
                        <p className="text-xs text-green-600">
                          {appliedCoupon.discountType === 'percentage'
                            ? `${appliedCoupon.discountValue}% ${t.discount}`
                            : `${currency} ${appliedCoupon.discountValue} ${t.discount}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-green-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{t.subtotal}</p>
                  <p className="text-sm font-medium text-gray-900">
                    ${subtotal.toFixed(2)}
                  </p>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-600">{t.discount}</p>
                    <p className="text-sm font-medium text-green-600">
                      - ${discount.toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{t.processingFee}</p>
                  <p className="text-sm font-medium text-gray-900">
                    ${processingFee.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{t.processingFeeNote}</p>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-gray-900">{t.total}</p>
                    <p className="text-2xl font-bold text-primary-600">
                      ${total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">{t.whatYoullGet}</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{t.jobApplicationsPerMonth}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{t.priorityInSearch}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{t.featuredProfileBadge}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{t.prioritySupport}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{t.seeJobBudgets}</span>
                  </li>
                </ul>
              </div>

              {/* Pay Button - Placeholder */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full mt-6"
                  onClick={handlePayment}
                  loading={upgradeMutation.isPending}
                  disabled={true}
                >
                  <Lock className="w-5 h-5 mr-2" />
                  {t.paypalIntegrationPending}
                </Button>
                <p className="text-xs text-center text-gray-500">
                  {t.paypalButtonWillAppear}
                </p>
              </div>

              {/* Security Note */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                <Lock className="w-3 h-3" />
                <p>{t.securePaymentPoweredBy}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentUSD;
