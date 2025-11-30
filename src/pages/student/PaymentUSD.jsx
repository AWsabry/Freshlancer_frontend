import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../../services/subscriptionService';
import couponService from '../../services/couponService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ArrowLeft, Lock, CheckCircle, CreditCard, Tag, X, DollarSign } from 'lucide-react';
import paypalImage from '../../assets/images/paypal.png';

const PaymentUSD = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

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
      setCouponError(error.response?.data?.message || 'Invalid coupon code');
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
        alert('PayPal integration coming soon! This is where PayPal payment flow will be implemented.');

        // After successful PayPal payment:
        // queryClient.invalidateQueries(['subscription']);
        // queryClient.invalidateQueries(['applicationLimit']);
        // navigate('/student/subscription');
      } catch (error) {
        console.error('Error processing PayPal payment:', error);
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
            <p className="text-gray-600 mb-4">No payment details found</p>
            <Button onClick={() => navigate('/student/subscription')}>
              Go to Subscription
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
        Back to Subscription
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
                    src={paypalImage}
                    alt="PayPal"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Secure Payment with PayPal
                  </h3>
                  <p className="text-sm text-gray-600">
                    You will be redirected to PayPal to securely complete your payment.
                    PayPal accepts credit/debit cards, bank accounts, and PayPal balance.
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
                      PayPal Integration Area
                    </p>
                    <p className="text-xs text-yellow-700 mb-3">
                      This is where the PayPal SDK integration will be implemented. The PayPal button or checkout flow will appear here.
                    </p>
                    <div className="p-4 bg-white border border-yellow-300 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Implementation Steps:</p>
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
                <p className="text-sm font-medium text-gray-700">Accepted Payment Methods:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">💳 Credit/Debit Cards</p>
                    <p className="text-xs text-gray-500">Visa, Mastercard</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">💰 PayPal Balance</p>
                    <p className="text-xs text-gray-500">Pay with PayPal funds</p>
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
                      All transactions are encrypted and processed securely through PayPal's
                      payment gateway. Your card details are never stored on our servers.
                      PayPal provides buyer protection and secure checkout.
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
              {/* Plan Details */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Plan</p>
                  <Badge variant="success">Premium</Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Billing Cycle</p>
                  <p className="text-sm font-medium text-gray-900">Monthly</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Currency</p>
                  <Badge variant="info">USD ($)</Badge>
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
                    ${subtotal.toFixed(2)}
                  </p>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-600">Discount</p>
                    <p className="text-sm font-medium text-green-600">
                      - ${discount.toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Processing Fee</p>
                  <p className="text-sm font-medium text-gray-900">
                    ${processingFee.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">(2.9% + $0.30)</p>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-gray-900">Total</p>
                    <p className="text-2xl font-bold text-primary-600">
                      ${total.toFixed(2)}
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
                    <span className="text-sm text-gray-600">100 job applications/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Priority in search results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Featured profile badge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">See job budgets</span>
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
                  PayPal Integration Pending
                </Button>
                <p className="text-xs text-center text-gray-500">
                  PayPal button will appear here once integrated
                </p>
              </div>

              {/* Security Note */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                <Lock className="w-3 h-3" />
                <p>Secure payment powered by PayPal</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentUSD;
