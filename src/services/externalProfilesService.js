import api from './api';

export const externalProfilesService = {
  getMe: async () => {
    return api.get('/external-profiles/me');
  },

  syncAll: async ({ force = false } = {}) => {
    return api.post('/external-profiles/sync', { force });
  },

  syncOne: async (provider, { force = false } = {}) => {
    return api.post(`/external-profiles/sync/${provider}`, { force });
  },
};

