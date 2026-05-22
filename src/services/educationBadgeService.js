import api from './api';

export const educationBadgeService = {
  // Student
  getMyAwards: () => api.get('/education-badges/me'),
  getMyEntityAwards: (entityId) => api.get(`/education-badges/me/entities/${entityId}`),
  getCatalog: () => api.get('/education-badges/entities'),
  getMyRequests: () => api.get('/education-badges/requests/me'),
  createRequest: (data, proofFile) => {
    const formData = new FormData();
    formData.append('entityId', data.entityId);
    formData.append('certificateId', data.certificateId);
    if (data.studentNote) formData.append('studentNote', data.studentNote);
    if (proofFile) formData.append('proof', proofFile);
    return api.post('/education-badges/requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadAwardProof: (awardId, file) => {
    const formData = new FormData();
    formData.append('proof', file);
    return api.post(`/education-badges/me/awards/${awardId}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteAwardProof: (awardId) => api.delete(`/education-badges/me/awards/${awardId}/proof`),

  // Admin — entities
  getEntities: (params) => api.get('/admin/education-entities', { params }),
  getEntity: (id) => api.get(`/admin/education-entities/${id}`),
  createEntity: (formData) =>
    api.post('/admin/education-entities', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateEntity: (id, formData) =>
    api.patch(`/admin/education-entities/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteEntity: (id) => api.delete(`/admin/education-entities/${id}`),

  // Admin — certificates
  createCertificate: (entityId, formData) =>
    api.post(`/admin/education-entities/${entityId}/certificates`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateCertificate: (id, formData) =>
    api.patch(`/admin/education-certificates/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteCertificate: (id) => api.delete(`/admin/education-certificates/${id}`),

  // Admin — grants & requests
  grantBulk: (data) => api.post('/admin/education-badges/grant-bulk', data),
  searchStudents: (params) => api.get('/admin/education-badges/students/search', { params }),
  getAdminRequests: (params) => api.get('/admin/education-badges/requests', { params }),
  approveRequest: (id, data) => api.patch(`/admin/education-badges/requests/${id}/approve`, data),
  rejectRequest: (id, data) => api.patch(`/admin/education-badges/requests/${id}/reject`, data),
  getAdminAwards: (params) => api.get('/admin/education-badges/awards', { params }),
  deleteAdminAwardProof: (id) => api.delete(`/admin/education-badges/awards/${id}/proof`),
  revokeAward: (id) => api.delete(`/admin/education-badges/awards/${id}`),
};
