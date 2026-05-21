import api from './api';

export const cvReviewService = {
  guestInit: async ({ file, targetFields = [] }) => {
    const fd = new FormData();
    fd.append('cv', file);
    targetFields.forEach((t) => fd.append('targetFields', t));
    return api.post('/cv-review/guest/init', fd);
  },

  attach: async (uploadId) => {
    return api.post('/cv-review/attach', { uploadId });
  },

  process: async (uploadId) => {
    return api.post('/cv-review/process', { uploadId });
  },

  get: async (uploadId) => {
    return api.get(`/cv-review/${uploadId}`);
  },
};

