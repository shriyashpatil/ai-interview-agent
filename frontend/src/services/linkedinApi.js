import apiClient from './api';

export const linkedInAPI = {
  // Profile optimization
  getProfile: () => apiClient.get('/linkedin/profile'),
  optimizeProfile: (data) => apiClient.post('/linkedin/profile/optimize', data),

  // Stats
  getStats: () => apiClient.get('/linkedin/stats'),

  // Outreach messages
  getMessages: (status) => apiClient.get('/linkedin/messages', { params: status ? { status } : {} }),
  generateMessage: (data) => apiClient.post('/linkedin/messages/generate', data),
  updateMessageStatus: (id, data) => apiClient.patch(`/linkedin/messages/${id}`, data),
  generateFollowUp: (id) => apiClient.post(`/linkedin/messages/${id}/follow-up`),
  deleteMessage: (id) => apiClient.delete(`/linkedin/messages/${id}`),

  // Job applications
  getJobs: (status) => apiClient.get('/linkedin/jobs', { params: status ? { status } : {} }),
  addJob: (data) => apiClient.post('/linkedin/jobs', data),
  updateJob: (id, data) => apiClient.patch(`/linkedin/jobs/${id}`, data),
  generateCoverLetter: (id) => apiClient.post(`/linkedin/jobs/${id}/cover-letter`),
  deleteJob: (id) => apiClient.delete(`/linkedin/jobs/${id}`),
};
