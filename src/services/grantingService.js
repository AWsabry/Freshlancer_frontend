import api from './api';

export const grantingService = {
  // Create a new granting/donation
  createGranting: async (grantingData) => {
    return api.post('/grantings', grantingData);
  },

  // Get user's granting history
  getMyGrantings: async () => {
    return api.get('/grantings/me');
  },

  // Get all grantings (admin only)
  getAllGrantings: async (params) => {
    return api.get('/grantings', { params });
  },

  // Get granting statistics (admin only)
  getGrantingStats: async () => {
    return api.get('/grantings/stats');
  },
};

