import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { packageService } from '../../services/packageService';
import couponService from '../../services/couponService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ArrowLeft, Lock, CheckCircle, Tag, X, DollarSign } from 'lucide-react';
import paypalImage from '../../assets/images/paypal.png';

const translations = {
  en: {
    noPaymentDetails: 'No payment details found',
    goToPackages: 'Go to Packages',
    backToPackages: 'Back to Packages',
    completePayment: 'Complete Payment',
    securePaymentPaypal: 'Secure Payment with PayPal',
    paypalRedirect: 'You will be redirected to PayPal to securely complete your payment. PayPal accepts credit/debit cards, bank accounts, and PayPal balance.',
    paypalIntegrationArea: 'PayPal Integration Area',
    paypalIntegrationDesc: 'This is where the PayPal SDK integration will be implemented. The PayPal button or checkout flow will appear here.',
    implementationSteps: 'Implementation Steps:',
    acceptedPaymentMethods: 'Accepted Payment Methods:',
    creditDebitCards: 'Credit/Debit Cards',
    cardsList: 'Visa, Mastercard',
    paypalBalance: 'PayPal Balance',
    paypalBalanceDesc: 'Pay with PayPal funds',
    paymentSecure: 'Your payment is secure',
    paymentSecureDesc: 'All transactions are encrypted and processed securely through PayPal\'s payment gateway. Your card details are never stored on our servers. PayPal provides buyer protection and secure checkout.',
    paymentSummary: 'Payment Summary',
    package: 'Package',
    points: 'points',
    currency: 'Currency',
    havePromoCode: 'Have a promo code?',
    enterCode: 'Enter code',
    apply: 'Apply',
    invalidCoupon: 'Invalid coupon code',
    enterCouponCode: 'Please enter a coupon code',
    discount: 'discount',
    subtotal: 'Subtotal',
    processingFee: 'Processing Fee',
    processingFeeNote: '(2.9% + $0.30)',
    total: 'Total',
    whatYouGet: 'What you\'ll get:',
    pointsAdded: 'points added to balance',
    unlockProfiles: 'Unlock student profiles',
    accessContact: 'Access contact information',
    pointsPerUnlock: '10 points per profile unlock',
    paypalIntegrationPending: 'PayPal Integration Pending',
    paypalButtonNote: 'PayPal button will appear here once integrated',
    securePaymentPowered: 'Secure payment powered by PayPal',
    paymentProcessingError: 'Payment processing error. Please contact support.',
    paymentFailed: 'Payment failed. Please try again.',
    paypalComingSoon: 'PayPal integration coming soon! This is where PayPal payment flow will be implemented.',
  },
  it: {
    noPaymentDetails: 'Nessun dettaglio di pagamento trovato',
    goToPackages: 'Vai ai Pacchetti',
    backToPackages: 'Torna ai Pacchetti',
    completePayment: 'Completa Pagamento',
    securePaymentPaypal: 'Pagamento Sicuro con PayPal',
    paypalRedirect: 'Sarai reindirizzato a PayPal per completare in sicurezza il tuo pagamento. PayPal accetta carte di credito/debito, conti bancari e saldo PayPal.',
    paypalIntegrationArea: 'Area Integrazione PayPal',
    paypalIntegrationDesc: 'Qui verrà implementata l\'integrazione dell\'SDK PayPal. Il pulsante PayPal o il flusso di checkout appariranno qui.',
    implementationSteps: 'Passaggi di Implementazione:',
    acceptedPaymentMethods: 'Metodi di Pagamento Accettati:',
    creditDebitCards: 'Carte di Credito/Debito',
    cardsList: 'Visa, Mastercard',
    paypalBalance: 'Saldo PayPal',
    paypalBalanceDesc: 'Paga con fondi PayPal',
    paymentSecure: 'Il tuo pagamento è sicuro',
    paymentSecureDesc: 'Tutte le transazioni sono crittografate ed elaborate in sicurezza tramite il gateway di pagamento di PayPal. I dettagli della tua carta non vengono mai memorizzati sui nostri server. PayPal fornisce protezione per gli acquirenti e checkout sicuro.',
    paymentSummary: 'Riepilogo Pagamento',
    package: 'Pacchetto',
    points: 'punti',
    currency: 'Valuta',
    havePromoCode: 'Hai un codice promozionale?',
    enterCode: 'Inserisci codice',
    apply: 'Applica',
    invalidCoupon: 'Codice coupon non valido',
    enterCouponCode: 'Inserisci un codice coupon',
    discount: 'sconto',
    subtotal: 'Subtotale',
    processingFee: 'Commissione di Elaborazione',
    processingFeeNote: '(2.9% + $0.30)',
    total: 'Totale',
    whatYouGet: 'Cosa otterrai:',
    pointsAdded: 'punti aggiunti al saldo',
    unlockProfiles: 'Sblocca profili studenti',
    accessContact: 'Accedi alle informazioni di contatto',
    pointsPerUnlock: '10 punti per sblocco profilo',
    paypalIntegrationPending: 'Integrazione PayPal in Attesa',
    paypalButtonNote: 'Il pulsante PayPal apparirà qui una volta integrato',
    securePaymentPowered: 'Pagamento sicuro fornito da PayPal',
    paymentProcessingError: 'Errore nell\'elaborazione del pagamento. Si prega di contattare il supporto.',
    paymentFailed: 'Pagamento fallito. Si prega di riprovare.',
    paypalComingSoon: 'Integrazione PayPal in arrivo! Qui verrà implementato il flusso di pagamento PayPal.',
  },
};

const PaymentUSD = () => {
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
  const { amount, packageType, packageId, packageName, points } = location.state || {};
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
      setCouponError(error.response?.data?.message || t.invalidCoupon);
      setAppliedCoupon(null);
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: (paymentData) => packageService.purchasePackage(packageType, paymentData),
    onSuccess: async (response) => {
      // API interceptor returns response.data, so response = { status, data }
      const data = response?.data;
      if (data?.gateway === 'paypal' && data?.approvalUrl) {
        window.location.href = data.approvalUrl;
        return;
      }
      alert(t.paymentProcessingError);
    },
    onError: (error) => {
      // Interceptor may reject with error.response.data (e.g. { message, status, errorCode })
      const message = error?.message || error?.response?.data?.message || t.paymentFailed;
      const isPayPalConfig = error?.errorCode === 'PAYPAL_NOT_CONFIGURED' || (error?.response?.status === 503 && String(message).toLowerCase().includes('paypal'));
      if (isPayPalConfig) {
        alert(t.paymentProcessingError + ' (PayPal is not configured on the server. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to the API .env.)');
      } else {
        alert(message);
      }
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
    const paymentData = {
      amount: total,
      currency,
      packageId,
      packageType,
      redirectBaseUrl: window.location.origin,
      ...(appliedCoupon?.code && { couponCode: appliedCoupon.code }),
    };
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
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <button
        onClick={() => navigate('/client/packages')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm sm:text-base"
      >
        <ArrowLeft className="w-5 h-5" />
        {t.backToPackages}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
                    {t.securePaymentPaypal}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t.paypalRedirect}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Click &quot;Pay with PayPal&quot; below to complete your purchase. You will be redirected to PayPal to pay securely.
              </p>

              {/* Payment Methods Info */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">{t.acceptedPaymentMethods}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">💳 {t.creditDebitCards}</p>
                    <p className="text-xs text-gray-500">{t.cardsList}</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">💰 {t.paypalBalance}</p>
                    <p className="text-xs text-gray-500">{t.paypalBalanceDesc}</p>
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
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{t.points}</p>
                  <p className="text-sm font-medium text-gray-900">{points} {t.points}</p>
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

              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full mt-6"
                  onClick={handlePayment}
                  loading={purchaseMutation.isPending}
                  disabled={purchaseMutation.isPending}
                >
                  <Lock className="w-5 h-5 mr-2" />
                  {t.completePayment}
                </Button>
                <p className="text-xs text-center text-gray-500">
                  {t.securePaymentPowered}
                </p>
              </div>

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

export default PaymentUSD;

