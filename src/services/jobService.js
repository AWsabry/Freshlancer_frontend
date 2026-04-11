import api from './api';
import { logger } from '../utils/logger';

export const jobService = {
  // Get all jobs
  getAllJobs: async (params) => {
    return api.get('/jobs', { params });
  },

  // Get single job
  getJob: async (id) => {
    return api.get(`/jobs/${id}`);
  },

  // Create job (client only)
  createJob: async (jobData) => {
    logger.debug('Creating Job');
    return api.post('/jobs', jobData);
  },

  // Update job
  updateJob: async (id, jobData) => {
    return api.patch(`/jobs/${id}`, jobData);
  },

  // Delete job
  deleteJob: async (id) => {
    return api.delete(`/jobs/${id}`);
  },

  // Get my jobs
  getMyJobs: async () => {
    return api.get('/jobs/me');
  },

  // Close job
  closeJob: async (id, data) => {
    return api.patch(`/jobs/${id}/close`, data);
  },

  // Search jobs
  searchJobs: async (query, params) => {
    return api.get('/jobs/search', { params: { q: query, ...params } });
  },
};
