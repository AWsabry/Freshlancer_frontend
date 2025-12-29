import api from './api';
import { logger } from '../utils/logger';

const couponService = {
  // Get all coupons (with optional filters)
  getAllCoupons: async (params = {}) => {
    const response = await api.get('/coupons', { params });
    return response;
  },

  // Get featured coupons
  getFeaturedCoupons: async () => {
    const response = await api.get('/coupons/featured');
    return response;
  },

  // Get single coupon by ID
  getCoupon: async (id) => {
    const response = await api.get(`/coupons/${id}`);
    return response;
  },

  // Get coupon by coupon code
  getCouponByCode: async (code) => {
    const url = `/coupons/code/${code}`;
    logger.debug('Calling coupon endpoint:', url);
    const response = await api.get(url);
    return response;
  },

  // Validate coupon code (for payment)
  validateCoupon: async (couponCode, amount, currency = 'EGP') => {
    const response = await api.post('/coupons/validate', {
      couponCode,
      amount,
      currency,
    });
    return response;
  },

  // Redeem a coupon
  redeemCoupon: async (couponId) => {
    const response = await api.post(`/coupons/${couponId}/redeem`);
    return response;
  },

  // Create coupon (admin only)
  createCoupon: async (data) => {
    const response = await api.post('/coupons', data);
    return response;
  },

  // Update coupon (admin only)
  updateCoupon: async (id, data) => {
    const response = await api.patch(`/coupons/${id}`, data);
    return response;
  },

  // Delete coupon (admin only)
  deleteCoupon: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response;
  },

  // Toggle coupon active status (admin only)
  toggleCouponActive: async (id) => {
    const response = await api.patch(`/coupons/${id}/toggle-active`);
    return response;
  },

  // Get coupon statistics (admin only)
  getCouponStats: async (id) => {
    const response = await api.get(`/coupons/${id}/stats`);
    return response;
  },

  // Record coupon usage after payment
  recordCouponUsage: async (couponId) => {
    const response = await api.post('/coupons/record-usage', { couponId });
    return response;
  },
};

export default couponService;

