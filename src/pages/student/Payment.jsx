import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../../services/subscriptionService';
import couponService from '../../services/couponService';
import { useAuthStore } from '../../stores/authStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ArrowLeft, Lock, CheckCircle, CreditCard, Tag, X } from 'lucide-react';
import paymobImage from '../../assets/images/paymob.png';

const translations = {
  en: {
    noPaymentDetails: 'No payment details found',
    goToSubscription: 'Go to Subscription',
    backToSubscription: 'Back to Subscription',
    completePayment: 'Complete Payment',
    securePaymentWithPaymob: 'Secure Payment with Paymob',
    paymobRedirect: 'You will be redirected to Paymob to securely complete your payment. Paymob accepts credit/debit cards, mobile wallets, and other payment methods.',
    acceptedPaymentMethods: 'Accepted Payment Methods:',
    creditDebitCards: '💳 Credit/Debit Cards',
    cardsDescription: 'Visa, Mastercard, Meeza',
    mobileWallets: '📱 Mobile Wallets',
    walletsDescription: 'Vodafone, Etisalat, Orange',
    yourPaymentIsSecure: 'Your payment is secure',
    secureDescription: 'All transactions are encrypted and processed securely through Paymob\'s payment gateway. Your card details are never stored on our servers.',
    paymentSummary: 'Payment Summary',
    plan: 'Plan',
    premium: 'Premium',
    billingCycle: 'Billing Cycle',
    monthly: 'Monthly',
    havePromoCode: 'Have a promo code?',
    enterCode: 'Enter code',
    apply: 'Apply',
    discount: 'discount',
    subtotal: 'Subtotal',
    processingFee: 'Processing Fee',
    total: 'Total',
    whatYoullGet: 'What you\'ll get:',
    jobApplicationsPerMonth: '100 job applications/month',
    priorityInSearch: 'Priority in search results',
    featuredProfileBadge: 'Featured profile badge',
    prioritySupport: 'Priority support',
    proceedToPayment: 'Proceed to Payment',
    securePaymentPoweredBy: 'Secure payment powered by Paymob',
    pleaseEnterCouponCode: 'Please enter a coupon code',
    invalidCouponCode: 'Invalid coupon code',
    paymentSuccessful: 'Payment successful! Your Premium subscription is now active.',
    paymentProcessingError: 'Payment processing error. Please contact support.',
    paymentFailed: 'Payment failed. Please try again.',
  },
  it: {
    noPaymentDetails: 'Nessun dettaglio di pagamento trovato',
    goToSubscription: 'Vai all\'Abbonamento',
    backToSubscription: 'Torna all\'Abbonamento',
    completePayment: 'Completa Pagamento',
    securePaymentWithPaymob: 'Pagamento Sicuro con Paymob',
    paymobRedirect: 'Sarai reindirizzato a Paymob per completare in sicurezza il tuo pagamento. Paymob accetta carte di credito/debito, portafogli mobili e altri metodi di pagamento.',
    acceptedPaymentMethods: 'Metodi di Pagamento Accettati:',
    creditDebitCards: '💳 Carte di Credito/Debito',
    cardsDescription: 'Visa, Mastercard, Meeza',
    mobileWallets: '📱 Portafogli Mobili',
    walletsDescription: 'Vodafone, Etisalat, Orange',
    yourPaymentIsSecure: 'Il tuo pagamento è sicuro',
    secureDescription: 'Tutte le transazioni sono crittografate ed elaborate in sicurezza tramite il gateway di pagamento di Paymob. I dettagli della tua carta non vengono mai memorizzati sui nostri server.',
    paymentSummary: 'Riepilogo Pagamento',
    plan: 'Piano',
    premium: 'Premium',
    billingCycle: 'Ciclo di Fatturazione',
    monthly: 'Mensile',
    havePromoCode: 'Hai un codice promozionale?',
    enterCode: 'Inserisci codice',
    apply: 'Applica',
    discount: 'sconto',
    subtotal: 'Subtotale',
    processingFee: 'Commissione di Elaborazione',
    total: 'Totale',
    whatYoullGet: 'Cosa otterrai:',
    jobApplicationsPerMonth: '100 candidature di lavoro/mese',
    priorityInSearch: 'Priorità nei risultati di ricerca',
    featuredProfileBadge: 'Badge profilo in evidenza',
    prioritySupport: 'Supporto prioritario',
    proceedToPayment: 'Procedi al Pagamento',
    securePaymentPoweredBy: 'Pagamento sicuro fornito da Paymob',
    pleaseEnterCouponCode: 'Inserisci un codice coupon',
    invalidCouponCode: 'Codice coupon non valido',
    paymentSuccessful: 'Pagamento completato con successo! Il tuo abbonamento Premium è ora attivo.',
    paymentProcessingError: 'Errore nell\'elaborazione del pagamento. Contatta il supporto.',
    paymentFailed: 'Pagamento fallito. Riprova.',
  },
};

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
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
  // Force EGP currency as it's the only supported currency for Paymob
  const { amount } = location.state || {};
  const currency = 'EGP'; // Always use EGP - Paymob only supports EGP

  // Promocode state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Calculate fees and total
  const subtotal = amount || 0;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);
  const processingFee = subtotalAfterDiscount * 0.03; // 3% processing fee
  const total = subtotalAfterDiscount + processingFee;

  // Coupon validation mutation - using Coupon model with couponCode filtered by targetAudience
  const couponMutation = useMutation({
    mutationFn: async ({ code, amount, currency }) => {
      try {
        // Get coupon by coupon code from Coupon model (backend validates targetAudience matches user role)
        const response = await couponService.getCouponByCode(code);
        
        if (!response || !response.data || !response.data.coupon) {
          throw new Error('Invalid response from server');
        }

        const coupon = response.data.coupon;

        // Validate coupon has required fields
        if (!coupon.couponCode) {
          throw new Error('Invalid coupon data received');
        }

        // Calculate discount from coupon
        let discountAmount = 0;
        if (coupon.discountPercentage) {
          discountAmount = (amount * coupon.discountPercentage) / 100;
        } else if (coupon.discountAmount) {
          discountAmount = coupon.discountAmount;
        }

        // Ensure discount doesn't exceed the total amount
        if (discountAmount > amount) {
          discountAmount = amount;
        }

        const finalAmount = Math.max(0, amount - discountAmount);

        return {
          data: {
            couponCode: coupon.couponCode,
            discountType: coupon.discountPercentage ? 'percentage' : 'fixed',
            discountValue: coupon.discountPercentage || coupon.discountAmount || 0,
            discountAmount: Math.round(discountAmount * 100) / 100,
            originalAmount: amount,
            finalAmount: Math.round(finalAmount * 100) / 100,
            currency,
            couponId: coupon._id || coupon.id,
            couponTitle: coupon.title || 'Discount',
          },
        };
      } catch (error) {
        console.error('Coupon validation error:', error);
        throw error;
      }
    },
    onSuccess: (response) => {
      setAppliedCoupon(response.data);
      setCouponError('');
      setCouponCode('');
    },
    onError: (error) => {
      setCouponError(error.response?.data?.message || error.message || t.invalidCouponCode);
      setAppliedCoupon(null);
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: (paymentData) => subscriptionService.upgradeToPremium(paymentData),
    onSuccess: async (response) => {
      try {
        console.log('Payment response received:', response);
        console.log('Response data:', response?.data);

        // After decryption, the response is the decrypted object itself
        // Check both response.data.clientSecret and response.data.data.clientSecret for backwards compatibility
        const clientSecret = response?.data?.clientSecret || response?.data?.data?.clientSecret;

        // Check if response contains Paymob client secret (for EGP payments)
        if (clientSecret) {
          const publicKey = 'egy_pk_test_xgfkuiZo2us0viNDmSCVU1OvNnJQOUwv';
          const paymobUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;

          console.log('Client Secret received:', clientSecret);
          console.log('Redirecting to Paymob:', paymobUrl);

          // Add small delay to ensure state is updated
          await new Promise(resolve => setTimeout(resolve, 100));

          // Redirect to Paymob payment page
          window.location.href = paymobUrl;
        } else {
          console.warn('No clientSecret in response. Response structure:', response);
          // For non-EGP currencies or fallback
          queryClient.invalidateQueries(['subscription']);
          queryClient.invalidateQueries(['applicationLimit']);
          alert(t.paymentSuccessful);
          navigate('/student/subscription');
        }
      } catch (error) {
        console.error('Error processing payment response:', error);
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

    // Process payment - include coupon code if applied
    const paymentData = {
      amount: total, // This is the discounted total from frontend calculation
      currency: currency,
      billingCycle: 'monthly',
      couponCode: appliedCoupon ? appliedCoupon.couponCode : undefined, // Send coupon code to backend
    };
    console.log('Processing payment with data:', paymentData);
    console.log('Applied coupon:', appliedCoupon);

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
                    src={paymobImage}
                    alt="Paymob"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t.securePaymentWithPaymob}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t.paymobRedirect}
                  </p>
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
                    <p className="text-sm text-gray-600">{t.mobileWallets}</p>
                    <p className="text-xs text-gray-500">{t.walletsDescription}</p>
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
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{t.billingCycle}</p>
                  <p className="text-sm font-medium text-gray-900">{t.monthly}</p>
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
                    {currency} {subtotal.toFixed(2)}
                  </p>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-600">{t.discount}</p>
                    <p className="text-sm font-medium text-green-600">
                      - {currency} {discount.toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{t.processingFee}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currency} {processingFee.toFixed(2)}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-gray-900">{t.total}</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {currency} {total.toFixed(2)}
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
                </ul>
              </div>

              {/* Pay Button */}
              <Button
                variant="primary"
                className="w-full mt-6"
                onClick={handlePayment}
                loading={upgradeMutation.isPending}
              >
                <Lock className="w-5 h-5 mr-2" />
                {t.proceedToPayment}
              </Button>

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

export default Payment;
