import api from './api';

export const couponService = {
  // Validate a coupon code
  validateCoupon: async (code, amount, currency = 'EGP') => {
    const response = await api.post('/coupons/validate', {
      couponCode: code, // Backend expects couponCode
      amount,
      currency,
    });
    return response.data;
  },

  // Record coupon usage after successful payment
  recordUsage: async (offerId) => {
    const response = await api.post('/coupons/record-usage', {
      offerId,
    });
    return response.data;
  },
};
