import api from './api';

export const packageService = {
  // Get available packages
  getAvailablePackages: async () => {
    return api.get('/packages/available');
  },

  // Purchase package
  purchasePackage: async (packageType, paymentData) => {
    // Support both packageType (legacy) and packageId (new)
    const payload = { ...paymentData };
    if (packageType) {
      payload.packageType = packageType;
    }
    if (paymentData.packageId) {
      payload.packageId = paymentData.packageId;
    }
    return api.post('/packages/purchase', payload);
  },

  // Get my packages
  getMyPackages: async () => {
    return api.get('/packages/me');
  },

  // Get active package
  getActivePackage: async () => {
    return api.get('/packages/active');
  },

  // Get points balance
  getPointsBalance: async () => {
    return api.get('/packages/points-balance');
  },

  // Get package usage history
  getPackageUsage: async (packageId) => {
    return api.get(`/packages/${packageId}/usage`);
  },

  // Get package stats
  getPackageStats: async () => {
    return api.get('/packages/stats');
  },
};
