import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2, TrendingUp, Gift } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import paymobService from '../services/paymobService';
import { packageService } from '../services/packageService';
import { couponService } from '../services/couponService';

// Helper function to get cookie value by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop().split(';').shift();
    console.log(`Cookie '${name}' found:`, cookieValue);
    console.log(`Cookie '${name}' value:`, cookieValue);
    return cookieValue;
  }
  console.log(`Cookie '${name}' not found`);
  return null;
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

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
      console.error('Error parsing stored package info:', error);
    }
  }

  const { points: packagePoints, packageName } = packageInfo;

  console.log('PaymentSuccess - Intention ID resolution:');
  console.log('- From query:', queryIntentionId || 'N/A');
  console.log('- From cookie:', cookieIntentionId || 'N/A');
  console.log('- From sessionStorage:', sessionIntentionId || 'N/A');
  console.log('- Using:', intentionId || 'N/A');
  console.log('- Package points:', packagePoints || 'N/A');
  console.log('- Package name:', packageName || 'N/A');

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
    console.log('Starting payment completion for intention ID:', intentionId);
    const payMobResponse = await paymobService.checkPaymentStatus(intentionId);
    console.log('Payment status checked:', payMobResponse);
    try {
      setIsProcessing(true);
      console.log('Completing payment success for intention:', intentionId);
      // Call the complete-success endpoint to upgrade subscription
      const response = await api.get(`/paymob/complete-success?id=${intentionId}`);

      console.log('Payment completed successfully:', response);

      // Record coupon usage if a coupon was applied
      try {
        const appliedCouponStr = sessionStorage.getItem('appliedCoupon');
        if (appliedCouponStr) {
          const appliedCoupon = JSON.parse(appliedCouponStr);
          if (appliedCoupon.offerId) {
            console.log('Recording coupon usage for offer:', appliedCoupon.offerId);
            await couponService.recordUsage(appliedCoupon.offerId);
            console.log('Coupon usage recorded successfully');
          }
        }
      } catch (couponErr) {
        console.error('Error recording coupon usage:', couponErr);
        // Don't fail the whole flow if coupon recording fails
      }

      // For clients, fetch updated points balance
      if (user?.role === 'client') {
        try {
          const pointsResponse = await packageService.getPointsBalance();
          console.log('Points balance fetched:', pointsResponse);
          setPointsData(pointsResponse.data);
        } catch (pointsErr) {
          console.error('Error fetching points balance:', pointsErr);
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
      setError(err.response?.data?.message || 'Failed to complete payment');
      setIsProcessing(false);

      // Redirect to failed page after 3 seconds
      setTimeout(() => {
        navigate('/payment/failed?error=completion_failed');
      }, 3000);
    }
  };

  const handleContinue = () => {
    if (user?.role === 'student') {
      navigate('/student/subscription');
    } else if (user?.role === 'client') {
      navigate('/client/packages');
    } else {
      navigate('/');
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
              {isProcessing ? 'Processing Payment...' : error ? 'Payment Error' : 'Payment Successful!'}
            </h1>
            <p className="text-gray-600">
              {isProcessing ? (
                'Please wait while we activate your subscription...'
              ) : error ? (
                error
              ) : (
                user?.role === 'student'
                  ? 'Your premium subscription has been activated successfully.'
                  : 'Your points package has been added to your account.'
              )}
            </p>
          </div>

          {/* Details - Only show when not processing and no error */}
          {!isProcessing && !error && (
            <>
              {user?.role === 'client' ? (
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
                            Points Added Successfully!
                          </h3>
                          <p className="text-sm text-gray-600">
                            {packageName || 'Your package'} has been activated
                          </p>
                        </div>
                      </div>

                      {/* Points Display */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200/50 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-600">New Balance</span>
                          {packagePoints && (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                +{packagePoints} points
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
                              <span className="text-lg font-medium text-gray-600">points</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Available for job postings and profile views
                            </p>
                          </>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                            <span className="text-sm text-gray-600">Loading your balance...</span>
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
                          What you can do now:
                        </p>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Post new jobs and find talented freelancers</li>
                          <li>• View freelancer profiles and portfolios</li>
                          <li>• Your points never expire</li>
                          <li>• Track your usage in the packages dashboard</li>
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
                        What happens next?
                      </p>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Your account has been upgraded to Premium</li>
                        <li>• You can now apply to up to 100 jobs per month</li>
                        <li>• Your profile will get priority in search results</li>
                        <li>• You'll receive a confirmation notification</li>
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
                {user?.role === 'student' ? 'Go to Subscription' : 'Go to Packages'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting automatically in 5 seconds...
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
