import api from './api';

export const contactService = {
  // Create a contact submission (public - no auth required)
  createContact: async (contactData) => {
    return api.post('/contacts', contactData);
  },

  // Get all contacts (admin only)
  getAllContacts: async (params) => {
    return api.get('/contacts', { params });
  },

  // Get single contact (admin only)
  getContact: async (id) => {
    return api.get(`/contacts/${id}`);
  },

  // Update contact status (admin only)
  updateContactStatus: async (id, status) => {
    return api.patch(`/contacts/${id}/status`, { status });
  },

  // Reply to contact (admin only)
  replyToContact: async (id, replyMessage) => {
    return api.post(`/contacts/${id}/reply`, { replyMessage });
  },

  // Delete contact (admin only)
  deleteContact: async (id) => {
    return api.delete(`/contacts/${id}`);
  },

  // Get contact statistics (admin only)
  getContactStats: async () => {
    return api.get('/contacts/stats');
  },
};

