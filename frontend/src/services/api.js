import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vcs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vcs_token');
      localStorage.removeItem('vcs_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getProfileFromToken: () => api.get('/auth/profile'),
  getUserProfile: (id) => api.get(`/auth/userProfile/${id}`),
  updateProfile: (id, data) => api.put(`/auth/updateProfile/${id}`, data),
  deleteProfile: (id) => api.delete(`/auth/deleteProfile/${id}`),
  getAllUsers: () => api.get('/auth/allUsers'),
};

export const repoAPI = {
  create: (data) => api.post('/repo/create', data),
  getAll: () => api.get('/repo/all'),
  getById: (id) => api.get(`/repo/${id}`),
  getByName: (name) => api.get(`/repo/name/${name}`),
  getByUser: (userID) => api.get(`/repo/user/${userID}`),
  update: (id, data) => api.put(`/repo/update/${id}`, data),
  toggleVisibility: (id) => api.patch(`/repo/toggle/${id}`),
  delete: (id) => api.delete(`/repo/delete/${id}`),
};

export const issueAPI = {
  create: (repoId, data) => api.post('/issue/create', { ...data, repository: repoId }),
  getAll: (repoId) => api.get(`/issue/all?repoId=${repoId}`),
  getById: (id) => api.get(`/issue/${id}`),
  update: (id, data) => api.put(`/issue/update/${id}`, data),
  delete: (id) => api.delete(`/issue/delete/${id}`),
};

export default api;