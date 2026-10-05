import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getPipeline: (id) => apiClient.get(`/pipeline/${id}`),
  triggerPipeline: (data) => apiClient.post('/pipeline/trigger', data),
  getAgents: () => apiClient.get('/agents'),
  getDeployments: () => apiClient.get('/deployments'),
  getMonitoringMetrics: () => apiClient.get('/monitoring/metrics'),
  getAlerts: () => apiClient.get('/alerts'),
  getLogs: (params) => apiClient.get('/logs', { params }),
  getPipelineHistory: () => apiClient.get('/pipeline/history'),
  resolveAlert: (id) => apiClient.post(`/alerts/${id}/resolve`),
  sendChatMessage: (message) => apiClient.post('/chat', { message }),
};

// Error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
