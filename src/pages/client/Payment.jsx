import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { packageService } from '../../services/packageService';
import couponService from '../../services/couponService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ArrowLeft, Lock, CheckCircle, CreditCard, Tag, X } from 'lucide-react';
import paymobImage from '../../assets/images/paymob.png';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

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
      setCouponError(error.response?.data?.message || 'Invalid coupon code');
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
          alert(`Payment successful! ${points} points have been added to your account.`);
          navigate('/client/packages');
        }
      } catch (error) {
        console.error('Error processing payment response:', error);
        alert('Payment processing error. Please contact support.');
      }
    },
    onError: (error) => {
      console.error('Payment mutation error:', error);
      console.error('Error response:', error.response);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
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
            <p className="text-gray-600 mb-4">No payment details found</p>
            <Button onClick={() => navigate('/client/packages')}>
              Go to Packages
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
        Back to Packages
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Information */}
        <div className="lg:col-span-2">
          <Card title="Complete Payment">
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
                    Secure Payment with Paymob
                  </h3>
                  <p className="text-sm text-gray-600">
                    You will be redirected to Paymob to securely complete your payment.
                    Paymob accepts credit/debit cards, mobile wallets, and other payment methods.
                  </p>
                </div>
              </div>

              {/* Payment Methods Info */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Accepted Payment Methods:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">💳 Credit/Debit Cards</p>
                    <p className="text-xs text-gray-500">Visa, Mastercard, Meeza</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">📱 Mobile Wallets</p>
                    <p className="text-xs text-gray-500">Vodafone, Etisalat, Orange</p>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Your payment is secure
                    </p>
                    <p className="text-xs text-gray-600">
                      All transactions are encrypted and processed securely through Paymob's
                      payment gateway. Your card details are never stored on our servers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <Card title="Payment Summary">
            <div className="space-y-4">
              {/* Package Details */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Package</p>
                  <Badge variant="primary">{packageName}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Points</p>
                  <p className="text-sm font-medium text-gray-900">{points} points</p>
                </div>
              </div>

              {/* Promocode Section */}
              <div className="pb-4 border-b border-gray-200">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Have a promo code?</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
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
                        Apply
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
                            ? `${appliedCoupon.discountValue}% discount`
                            : `${currency} ${appliedCoupon.discountValue} discount`}
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
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currency} {subtotal.toFixed(2)}
                  </p>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-600">Discount</p>
                    <p className="text-sm font-medium text-green-600">
                      - {currency} {discount.toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Processing Fee (3%)</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currency} {processingFee.toFixed(2)}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-gray-900">Total</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {currency} {total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">What you'll get:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{points} points added to balance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Unlock student profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Access contact information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">10 points per profile unlock</span>
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
                Proceed to Payment
              </Button>

              {/* Security Note */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                <Lock className="w-3 h-3" />
                <p>Secure payment powered by Paymob</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
