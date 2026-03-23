import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) =>
    apiClient.post('/auth/register', data),
  login: (data) =>
    apiClient.post('/auth/login', data),
};

// Interview endpoints
export const interviewAPI = {
  startInterview: (data) =>
    apiClient.post('/interviews/start', data),
  sendMessage: (sessionId, message) =>
    apiClient.post(`/interviews/${sessionId}/message`, { message }),
  endInterview: (sessionId) =>
    apiClient.post(`/interviews/${sessionId}/end`),
  getSessions: () =>
    apiClient.get('/interviews/sessions'),
  getMessages: (sessionId) =>
    apiClient.get(`/interviews/${sessionId}/messages`),
};

// Questions endpoints
export const questionsAPI = {
  getAll: () =>
    apiClient.get('/questions/public/all'),
  getByCategory: (category) =>
    apiClient.get(`/questions/public/category/${category}`),
  getHint: (questionId) =>
    apiClient.get(`/questions/${questionId}/hint`),
};

// Resume endpoints
export const resumeAPI = {
  analyze: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/resume/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Progress endpoints
export const progressAPI = {
  getStats: () =>
    apiClient.get('/progress/stats'),
  getAll: () =>
    apiClient.get('/progress'),
};

// Profile endpoints
export const profileAPI = {
  get: () =>
    apiClient.get('/profile'),
  save: (data) =>
    apiClient.post('/profile', data),
};

// Roadmap endpoints
export const roadmapAPI = {
  generate: () =>
    apiClient.post('/roadmap/generate'),
  getActive: () =>
    apiClient.get('/roadmap/active'),
  getAll: () =>
    apiClient.get('/roadmap'),
  updateMilestone: (milestoneId, status) =>
    apiClient.patch(`/roadmap/milestones/${milestoneId}`, { status }),
};

// Coach endpoints
export const coachAPI = {
  chat: (message) =>
    apiClient.post('/coach/chat', { message }),
};

export default apiClient;
