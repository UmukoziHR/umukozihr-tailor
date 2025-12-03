import axios from 'axios';

// Create base API instance with environment variable support
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`
});

// Add request interceptor for auth and logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log outgoing request
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      params: config.params,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? '[REDACTED]' : undefined
      }
    });

    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('✅ API Response:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log error response
    console.error('❌ API Error Response:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorMessage: error.message,
      responseData: error.response?.data,
      requestData: error.config?.data
    });
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  signup: (email: string, password: string) =>
    api.post('/auth/signup', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password })
};

// Profile endpoints (v1.3)
export const profile = {
  // v1.3: Get saved profile from database
  get: () =>
    api.get('/profile'),

  // v1.3: Update profile with versioning
  update: (profileData: any) =>
    api.put('/profile', { profile: profileData }),

  // v1.3: Get completeness score
  getCompleteness: () =>
    api.get('/me/completeness'),

  // Legacy v1.2: Save profile to file (deprecated)
  save: (profileData: any) =>
    api.post('/profile/profile', profileData)
};

// Generation endpoints
export const generation = {
  // Generate documents (v1.3: uses database profile for authenticated users)
  generate: (profile: any, jobs: any[]) =>
    api.post('/generate/', { profile, jobs, prefs: {} }),

  // Get generation status
  getStatus: (runId: string) =>
    api.get(`/generate/status/${runId}`)
};

// Job Description endpoints (v1.3)
export const jd = {
  // Fetch JD from URL
  fetchFromUrl: (url: string) =>
    api.post('/jd/fetch', { url })
};

// History endpoints (v1.3)
export const history = {
  // Get past runs with pagination
  list: (page: number = 1, pageSize: number = 10) =>
    api.get('/history', { params: { page, page_size: pageSize } }),

  // Re-generate from a past run
  regenerate: (runId: string) =>
    api.post(`/history/${runId}/regenerate`)
};