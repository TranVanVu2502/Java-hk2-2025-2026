import api from './axios';

// AUTH
export const authService = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  logout: () => api.post('/api/auth/logout'),
};

// ADMIN
export const adminService = {
  getStats: () => api.get('/api/admin/stats'),
  getAllUsers: () => api.get('/api/admin/users'),
  toggleLock: (userId) => api.put(`/api/admin/users/${userId}/lock`),
  getAllFarms: (status) => api.get('/api/admin/farms', { params: status ? { status } : {} }),
  approveFarm: (farmId) => api.put(`/api/admin/farms/${farmId}/approve`),
  rejectFarm: (farmId, reason) => api.put(`/api/admin/farms/${farmId}/reject`, { reason }),
};

// FARM
export const farmService = {
  create: (data) => api.post('/api/farms', data),
  getMyFarms: () => api.get('/api/farms/my'),
  getById: (id) => api.get(`/api/farms/${id}`),
  update: (id, data) => api.put(`/api/farms/${id}`, data),
  delete: (id) => api.delete(`/api/farms/${id}`),
};

// SEASON
export const seasonService = {
  create: (farmId, data) => api.post(`/api/farms/${farmId}/seasons`, data),
  getByFarm: (farmId) => api.get(`/api/farms/${farmId}/seasons`),
  getById: (id) => api.get(`/api/seasons/${id}`),
  update: (id, data) => api.put(`/api/seasons/${id}`, data),
  export: (id) => api.post(`/api/seasons/${id}/export`),
};