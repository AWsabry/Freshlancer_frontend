import api from './api';

export const appealService = {
  createAppeal: async (contractId, reason, description) => {
    return api.post('/appeals', {
      contractId,
      reason,
      description,
    });
  },

  getMyAppeals: async () => {
    return api.get('/appeals/me');
  },

  getAppeal: async (appealId) => {
    return api.get(`/appeals/${appealId}`);
  },

  uploadDocument: async (appealId, file, description = '') => {
    const formData = new FormData();
    formData.append('document', file);
    if (description) {
      formData.append('description', description);
    }
    return api.post(`/appeals/${appealId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  sendMessage: async (appealId, content, attachments = []) => {
    return api.post(`/appeals/${appealId}/messages`, {
      content,
      attachments,
    });
  },

  closeAppeal: async (appealId) => {
    return api.post(`/appeals/${appealId}/close`);
  },

  cancelContract: async (appealId) => {
    return api.post(`/appeals/${appealId}/cancel-contract`);
  },
};

// Admin services
export const adminAppealService = {
  getAllAppeals: async (params = {}) => {
    return api.get('/admin/appeals', { params });
  },

  getAppeal: async (appealId) => {
    return api.get(`/appeals/${appealId}`);
  },

  updateAppealStatus: async (appealId, status) => {
    return api.patch(`/admin/appeals/${appealId}/status`, { status });
  },

  resolveAppeal: async (appealId, decision, adminNotes = '') => {
    return api.post(`/admin/appeals/${appealId}/resolve`, {
      decision,
      adminNotes,
    });
  },

  addAdminNote: async (appealId, note) => {
    return api.post(`/admin/appeals/${appealId}/admin-note`, { note });
  },
};
