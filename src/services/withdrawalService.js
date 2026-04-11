import api from './api';

export const withdrawalService = {
  // Get withdrawal minimum amounts
  getMinimums: async () => {
    return api.get('/users/withdrawal-minimums');
  },

  // Get my withdrawals
  getMyWithdrawals: async () => {
    return api.get('/users/withdrawals');
  },

  // Request withdrawal
  requestWithdrawal: async (payload) => {
    return api.post('/users/withdrawal-request', payload);
  },
};
