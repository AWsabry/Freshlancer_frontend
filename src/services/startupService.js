import api from './api';

const startupService = {
  // Get all startups for the current client
  getMyStartups: async () => {
    const response = await api.get('/startups/me');
    return response;
  },

  // Create a new startup
  createStartup: async (startupData) => {
    const response = await api.post('/startups', startupData);
    return response;
  },

  // Update a startup
  updateStartup: async (id, startupData) => {
    const response = await api.patch(`/startups/${id}`, startupData);
    return response;
  },

  // Delete a startup
  deleteStartup: async (id) => {
    const response = await api.delete(`/startups/${id}`);
    return response;
  },

  // Upload startup logo
  uploadLogo: async (id, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post(`/startups/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Delete startup logo
  deleteLogo: async (id) => {
    const response = await api.delete(`/startups/${id}/logo`);
    return response;
  },
};

export default startupService;

