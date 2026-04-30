import api from './api';

export const contractService = {
  getMyContracts: async () => {
    return api.get('/contracts/me');
  },

  getContract: async (id) => {
    return api.get(`/contracts/${id}`);
  },

  createFromApplication: async (applicationId, payload = {}) => {
    return api.post(`/contracts/from-application/${applicationId}`, payload);
  },

  updateContract: async (id, payload) => {
    return api.patch(`/contracts/${id}`, payload);
  },

  signContract: async (id, payload) => {
    return api.post(`/contracts/${id}/sign`, payload);
  },

  confirmChanges: async (id) => {
    return api.post(`/contracts/${id}/confirm-changes`);
  },

  fundMilestone: async (id, milestoneId, body = {}) => {
    return api.post(`/contracts/${id}/milestones/${milestoneId}/fund`, body);
  },

  submitMilestone: async (id, milestoneId) => {
    return api.post(`/contracts/${id}/milestones/${milestoneId}/submit`);
  },

  approveMilestone: async (id, milestoneId) => {
    return api.post(`/contracts/${id}/milestones/${milestoneId}/approve`);
  },

  completeContractAfterAppeal: async (id) => {
    return api.post(`/contracts/${id}/complete-after-appeal`);
  },

  cancelContractAfterAppeal: async (id) => {
    return api.post(`/contracts/${id}/cancel-after-appeal`);
  },
};

