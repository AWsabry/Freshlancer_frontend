import api from './api';
import { logger } from '../utils/logger';

export const paymobService = {
  /**
   * Check payment status by intention ID (read-only)
   * @param {string} intentionId - The payment intention ID from Paymob
   * @returns {Promise} Payment status data
   */
  
  
  
  checkPaymentStatus: async (intentionId) => {
    try {
      logger.debug('Checking payment status for intention ID:', intentionId);
      const response = await api.get(`/paymob/payment-status?id=${intentionId}`);
      logger.debug('Payment status checked');
      return response; // api.js interceptor already unwraps response.data
    } catch (error) {
      logger.error('Error checking payment status:', error);
      throw error;
    }
  },
};

export default paymobService;
