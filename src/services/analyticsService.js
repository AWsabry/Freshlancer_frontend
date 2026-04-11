import api from './api';

export const analyticsService = {
  // Get comprehensive analytics data
  getAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics', { params });
    return response.data;
  },
};

