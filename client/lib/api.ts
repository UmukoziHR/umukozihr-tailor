import axios from 'axios';

// Create base API instance
export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1'
});

// Add auth interceptor to include token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
    api.post('/generate/generate', { profile, jobs, prefs: {} }),

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