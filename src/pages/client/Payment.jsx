import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { packageService } from '../../services/packageService';
import couponService from '../../services/couponService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ArrowLeft, Lock, CheckCircle, CreditCard, Tag, X } from 'lucide-react';
import paymobImage from '../../assets/images/paymob.png';

const translations = {
  en: {
    noPaymentDetails: 'No payment details found',
    goToPackages: 'Go to Packages',
    backToPackages: 'Back to Packages',
    completePayment: 'Complete Payment',
    securePaymentPaymob: 'Secure Payment with Paymob',
    paymobRedirect: 'You will be redirected to Paymob to securely complete your payment. Paymob accepts credit/debit cards, mobile wallets, and other payment methods.',
    acceptedPaymentMethods: 'Accepted Payment Methods:',
    creditDebitCards: 'Credit/Debit Cards',
    cardsList: 'Visa, Mastercard, Meeza',
    mobileWallets: 'Mobile Wallets',
    walletsList: 'Vodafone, Etisalat, Orange',
    paymentSecure: 'Your payment is secure',
    paymentSecureDesc: 'All transactions are encrypted and processed securely through Paymob\'s payment gateway. Your card details are never stored on our servers.',
    paymentSummary: 'Payment Summary',
    package: 'Package',
    points: 'points',
    havePromoCode: 'Have a promo code?',
    enterCode: 'Enter code',
    apply: 'Apply',
    invalidCoupon: 'Invalid coupon code',
    enterCouponCode: 'Please enter a coupon code',
    discount: 'discount',
    subtotal: 'Subtotal',
    processingFee: 'Processing Fee (3%)',
    total: 'Total',
    whatYouGet: 'What you\'ll get:',
    pointsAdded: 'points added to balance',
    unlockProfiles: 'Unlock student profiles',
    accessContact: 'Access contact information',
    pointsPerUnlock: '10 points per profile unlock',
    proceedToPayment: 'Proceed to Payment',
    securePaymentPowered: 'Secure payment powered by Paymob',
    paymentSuccessful: 'Payment successful! {points} points have been added to your account.',
    paymentProcessingError: 'Payment processing error. Please contact support.',
    paymentFailed: 'Payment failed. Please try again.',
  },
  it: {
    noPaymentDetails: 'Nessun dettaglio di pagamento trovato',
    goToPackages: 'Vai ai Pacchetti',
    backToPackages: 'Torna ai Pacchetti',
    completePayment: 'Completa Pagamento',
    securePaymentPaymob: 'Pagamento Sicuro con Paymob',
    paymobRedirect: 'Sarai reindirizzato a Paymob per completare in sicurezza il tuo pagamento. Paymob accetta carte di credito/debito, portafogli mobili e altri metodi di pagamento.',
    acceptedPaymentMethods: 'Metodi di Pagamento Accettati:',
    creditDebitCards: 'Carte di Credito/Debito',
    cardsList: 'Visa, Mastercard, Meeza',
    mobileWallets: 'Portafogli Mobili',
    walletsList: 'Vodafone, Etisalat, Orange',
    paymentSecure: 'Il tuo pagamento è sicuro',
    paymentSecureDesc: 'Tutte le transazioni sono crittografate ed elaborate in sicurezza tramite il gateway di pagamento di Paymob. I dettagli della tua carta non vengono mai memorizzati sui nostri server.',
    paymentSummary: 'Riepilogo Pagamento',
    package: 'Pacchetto',
    points: 'punti',
    havePromoCode: 'Hai un codice promozionale?',
    enterCode: 'Inserisci codice',
    apply: 'Applica',
    invalidCoupon: 'Codice coupon non valido',
    enterCouponCode: 'Inserisci un codice coupon',
    discount: 'sconto',
    subtotal: 'Subtotale',
    processingFee: 'Commissione di Elaborazione (3%)',
    total: 'Totale',
    whatYouGet: 'Cosa otterrai:',
    pointsAdded: 'punti aggiunti al saldo',
    unlockProfiles: 'Sblocca profili studenti',
    accessContact: 'Accedi alle informazioni di contatto',
    pointsPerUnlock: '10 punti per sblocco profilo',
    proceedToPayment: 'Procedi al Pagamento',
    securePaymentPowered: 'Pagamento sicuro fornito da Paymob',
    paymentSuccessful: 'Pagamento riuscito! {points} punti sono stati aggiunti al tuo account.',
    paymentProcessingError: 'Errore nell\'elaborazione del pagamento. Si prega di contattare il supporto.',
    paymentFailed: 'Pagamento fallito. Si prega di riprovare.',
  },
};

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
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

  // Get payment details from navigation state
  // Force EGP currency as it's the only supported currency for Paymob
  const { amount, packageType, packageId, packageName, points } = location.state || {};
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

  // Coupon validation mutation
  const couponMutation = useMutation({
    mutationFn: ({ code, amount, currency }) => couponService.validateCoupon(code, amount, currency),
    onSuccess: (response) => {
      setAppliedCoupon(response.data);
      setCouponError('');
      setCouponCode('');
    },
    onError: (error) => {
      setCouponError(error.response?.data?.message || t.invalidCoupon);
      setAppliedCoupon(null);
    },
  });

  const purchaseMutation = useMutation({

    mutationFn: (paymentData) => packageService.purchasePackage(packageType, paymentData),
    
    onSuccess: async (response) => {
      try {
        console.log('Payment response received:', response);
        console.log('Response data:', response?.data);

        // After decryption, the response is the decrypted object itself
        // Check both response.data.clientSecret and response.data.data.clientSecret for backwards compatibility
        const clientSecret = response?.data?.clientSecret || response?.data?.data?.clientSecret;
        const intentionId = response?.data?.intentionId || response?.data?.data?.intentionId;


        // Check if response contains Paymob client secret (for EGP payments)
        if (clientSecret) {
          // Store intention ID in sessionStorage as backup
          if (intentionId) {
            sessionStorage.setItem('paymob_intention_id', intentionId);
            console.log('Stored intention ID in sessionStorage:', intentionId);
          }

          const publicKey = 'egy_pk_test_xgfkuiZo2us0viNDmSCVU1OvNnJQOUwv';
          const paymobUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;

          console.log('Client Secret received:', clientSecret);
          console.log('Intention ID received:', intentionId);
          console.log('Redirecting to Paymob:', paymobUrl);

          // Add small delay to ensure state is updated
          await new Promise(resolve => setTimeout(resolve, 100));

          // Redirect to Paymob payment page
          window.location.href = paymobUrl;
        } else {
          console.warn('No clientSecret in response. Response structure:', response);
          // For non-EGP currencies or fallback
          queryClient.invalidateQueries(['myPackages']);
          queryClient.invalidateQueries(['activePackage']);
          queryClient.invalidateQueries(['pointsBalance']);
          alert(t.paymentSuccessful.replace('{points}', points));
          navigate('/client/packages');
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
      setCouponError(t.enterCouponCode);
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
    // Store package info in sessionStorage for later retrieval after payment
    sessionStorage.setItem('pendingPackage', JSON.stringify({
      points,
      packageName,
      packageType,
      packageId,
    }));

    // Store coupon info if applied
    if (appliedCoupon) {
      sessionStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    }

    // Process payment - include coupon code if applied
    const paymentData = {
      amount: total, // This is the discounted total from frontend calculation
      currency: currency,
      packageId: packageId, // Include packageId if available
      couponCode: appliedCoupon ? appliedCoupon.couponCode : undefined, // Send coupon code to backend
    };
    console.log('Processing payment with data:', paymentData);
    console.log('Applied coupon:', appliedCoupon);

    purchaseMutation.mutate(paymentData);
  };

  // Redirect back if no payment details
  if (!amount || !packageType) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{t.noPaymentDetails}</p>
            <Button onClick={() => navigate('/client/packages')}>
              {t.goToPackages}
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
        onClick={() => navigate('/client/packages')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="w-5 h-5" />
        {t.backToPackages}
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
                    {t.securePaymentPaymob}
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
                    <p className="text-sm text-gray-600">💳 {t.creditDebitCards}</p>
                    <p className="text-xs text-gray-500">{t.cardsList}</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">📱 {t.mobileWallets}</p>
                    <p className="text-xs text-gray-500">{t.walletsList}</p>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {t.paymentSecure}
                    </p>
                    <p className="text-xs text-gray-600">
                      {t.paymentSecureDesc}
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
              {/* Package Details */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{t.package}</p>
                  <Badge variant="primary">{packageName}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{t.points}</p>
                  <p className="text-sm font-medium text-gray-900">{points} {t.points}</p>
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
                <p className="text-sm font-medium text-gray-700 mb-3">{t.whatYouGet}</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{points} {t.pointsAdded}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{t.unlockProfiles}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{t.accessContact}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{t.pointsPerUnlock}</span>
                  </li>
                </ul>
              </div>

              {/* Pay Button */}
              <Button
                variant="primary"
                className="w-full mt-6"
                onClick={handlePayment}
                loading={purchaseMutation.isPending}
              >
                <Lock className="w-5 h-5 mr-2" />
                {t.proceedToPayment}
              </Button>

              {/* Security Note */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                <Lock className="w-3 h-3" />
                <p>{t.securePaymentPowered}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
