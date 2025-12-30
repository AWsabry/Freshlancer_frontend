import api from './api';

export const universityService = {
  // Get all universities (public) - fetches all without pagination
  // Fetches from: /api/v1/universities
  // countryCode is required
  getAllUniversities: async (params = {}) => {
    console.log('[universityService] getAllUniversities called', { params });
    console.log('[universityService] Fetching from endpoint: /api/v1/universities');
    
    // Validate that countryCode is provided
    if (!params.countryCode || params.countryCode.trim() === '') {
      throw new Error('Country code is required');
    }
    
    try {
      // Build query params - countryCode is required, search is optional
      const queryParams = {
        countryCode: params.countryCode,
      };
      if (params.search) {
        queryParams.search = params.search;
      }
      const response = await api.get('/universities', { params: queryParams });
      console.log('[universityService] API Response (full):', response);
      console.log('[universityService] Universities count:', Array.isArray(response) ? response.length : 0);

      // API interceptor already extracts response.data, so response is the array directly
      return response;
    } catch (error) {
      console.error('[universityService] Error in getAllUniversities:', error);
      console.error('[universityService] Error response:', error.response);
      console.error('[universityService] Error data:', error.response?.data);
      throw error;
    }
  },

  // Get single university (public)
  getUniversity: async (id) => {
    const response = await api.get(`/universities/${id}`);
    return response.data;
  },

  // Submit pending university (requires authentication)
  createPendingUniversity: async (universityData) => {
    console.log('[universityService] createPendingUniversity called with:', universityData);
    const response = await api.post('/universities/pending', universityData);
    // API interceptor already unwraps response.data, so response is the data object directly
    console.log('[universityService] createPendingUniversity response:', response);
    return response;
  },

  // Admin: Get all universities (including pending/rejected)
  // Returns universities with pagination metadata
  getAllUniversitiesAdmin: async (params = {}) => {
    const response = await api.get('/admin/universities', { params });
    // API interceptor already extracts response.data, so response contains the data object
    return response;
  },

  // Admin: Create university (automatically approved)
  createUniversity: async (universityData) => {
    const response = await api.post('/admin/universities', universityData);
    return response.data;
  },

  // Admin: Approve pending university
  approveUniversity: async (id, data = {}) => {
    const response = await api.patch(`/admin/universities/${id}/approve`, data);
    return response.data;
  },

  // Admin: Reject pending university
  rejectUniversity: async (id, rejectionReason) => {
    const response = await api.patch(`/admin/universities/${id}/reject`, { rejectionReason });
    return response.data;
  },

  // Admin: Update university
  updateUniversity: async (id, universityData) => {
    const response = await api.patch(`/admin/universities/${id}`, universityData);
    return response.data;
  },

  // Admin: Delete university (soft delete)
  deleteUniversity: async (id) => {
    const response = await api.delete(`/admin/universities/${id}`);
    return response.data;
  },
};

