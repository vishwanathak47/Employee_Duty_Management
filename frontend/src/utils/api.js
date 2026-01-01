import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  googleLogin: (token) => api.post('/auth/google-login', { token }),
};

// Employees API
export const employeesAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (employeeData) => api.post('/employees', employeeData),
  update: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Duties API
export const dutiesAPI = {
  getAll: (params) => api.get('/duties', { params }),
  schedule: (dutiesData) => api.post('/duties/schedule', { duties: dutiesData }),
  complete: (id) => api.put(`/duties/complete/${id}`),
  getStatus: (date) => api.get(`/duties/status/${date}`),
};

// Reports API
export const reportsAPI = {
  downloadExcel: (monthYear) => api.get(`/reports/excel/${monthYear}`, {
    responseType: 'blob',
    headers: {
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  }),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;